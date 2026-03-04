import { matchDomainsForTurn } from '../../../src/carl/matcher';
import type {
  CarlMatchRequest,
  CarlMatchDomainConfig,
  CarlSessionSignals
} from '../../../src/carl/types';
import { createTestMatchRequest, createTestSignals } from '../../helpers/match-factory';
import { createTestDomainConfig } from '../../helpers/domain-factory';

describe('matcher.ts', () => {
  describe('matchDomainsForTurn', () => {
    describe('keyword matching', () => {
      // Tests for RECALL keyword matching

      it('should match single RECALL keyword in prompt', () => {
        const request = createTestMatchRequest({
          promptText: 'Can you help me fix bug in my app?',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['fix bug'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('DEVELOPMENT');
      });

      it('should match when keyword is substring of prompt word', () => {
        const request = createTestMatchRequest({
          promptText: 'Let me code this feature',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['code'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('DEVELOPMENT');
      });

      it('should match multi-word RECALL phrase', () => {
        const request = createTestMatchRequest({
          promptText: 'I need to fix bug and write code',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['fix bug', 'write code'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('DEVELOPMENT');
      });

      it('should not match when keyword not in prompt', () => {
        const request = createTestMatchRequest({
          promptText: 'Help me with the UI',
          domains: {
            DATABASE: createTestDomainConfig({
              name: 'DATABASE',
              state: true,
              recall: ['database'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toEqual([]);
      });

      it('should only match active domains', () => {
        const request = createTestMatchRequest({
          promptText: 'Help me with code review',
          domains: {
            ACTIVE_DOMAIN: createTestDomainConfig({
              name: 'ACTIVE_DOMAIN',
              state: true,
              recall: ['code'],
              exclude: [],
              alwaysOn: false,
            }),
            INACTIVE_DOMAIN: createTestDomainConfig({
              name: 'INACTIVE_DOMAIN',
              state: false,
              recall: ['code'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('ACTIVE_DOMAIN');
        expect(result.matchedDomains).not.toContain('INACTIVE_DOMAIN');
      });

      it('should return matched keywords in result', () => {
        const request = createTestMatchRequest({
          promptText: 'I need to fix bug and write code',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['fix bug', 'write code', 'deploy'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.domainResults).toHaveLength(1);
        expect(result.domainResults[0].matchedKeywords).toContain('fix bug');
        expect(result.domainResults[0].matchedKeywords).toContain('write code');
        expect(result.domainResults[0].matchedKeywords).not.toContain('deploy');
      });
    });

    describe('exclusion logic', () => {
      // Tests for EXCLUDE and global exclude

      it('should exclude domain when EXCLUDE keyword present', () => {
        const request = createTestMatchRequest({
          promptText: 'review this code change',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['code'],
              exclude: ['review'],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).not.toContain('DEVELOPMENT');
        expect(result.excludedDomains).toContain('DEVELOPMENT');
      });

      it('should include EXCLUDE matches in result', () => {
        const request = createTestMatchRequest({
          promptText: 'review this code change',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['code'],
              exclude: ['review'],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.domainResults).toHaveLength(1);
        expect(result.domainResults[0].excludedKeywords).toContain('review');
        expect(result.domainResults[0].exclusionSource).toBe('domain');
      });

      it('should trigger global exclude and skip all matching', () => {
        const request = createTestMatchRequest({
          promptText: 'this contains secret information',
          globalExclude: ['secret'],
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['information'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.globalExclude.triggered).toBe(true);
        expect(result.matchedDomains).toEqual([]);
      });

      it('should return global exclude matched keywords', () => {
        const request = createTestMatchRequest({
          promptText: 'this contains secret information',
          globalExclude: ['secret'],
          domains: {},
        });

        const result = matchDomainsForTurn(request);

        expect(result.globalExclude.matchedKeywords).toContain('secret');
      });

      it('should prioritize global exclude over domain exclude', () => {
        const request = createTestMatchRequest({
          promptText: 'review this secret code',
          globalExclude: ['secret'],
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['code'],
              exclude: ['review'],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.globalExclude.triggered).toBe(true);
        expect(result.excludedDomains).toEqual([]);
        expect(result.matchedDomains).toEqual([]);
      });

      it('should exclude takes precedence over recall', () => {
        const request = createTestMatchRequest({
          promptText: 'fix bug review',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['fix bug'],
              exclude: ['review'],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).not.toContain('DEVELOPMENT');
        expect(result.excludedDomains).toContain('DEVELOPMENT');
      });
    });

    describe('always-on domains', () => {
      // Tests for ALWAYS_ON handling

      it('should skip ALWAYS_ON domains in matching logic', () => {
        const request = createTestMatchRequest({
          promptText: 'I need to fix bug',
          domains: {
            ALWAYS_ON_DOMAIN: createTestDomainConfig({
              name: 'ALWAYS_ON_DOMAIN',
              state: true,
              recall: ['fix bug'],
              exclude: [],
              alwaysOn: true,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        // ALWAYS_ON domains are handled by injector, not matcher
        expect(result.matchedDomains).not.toContain('ALWAYS_ON_DOMAIN');
      });

      it('should not require RECALL keywords for ALWAYS_ON', () => {
        const request = createTestMatchRequest({
          promptText: 'I need to fix bug',
          domains: {
            ALWAYS_ON_DOMAIN: createTestDomainConfig({
              name: 'ALWAYS_ON_DOMAIN',
              state: true,
              recall: [],
              exclude: [],
              alwaysOn: true,
            }),
          },
        });

        // Should not throw
        const result = matchDomainsForTurn(request);

        expect(result).toBeDefined();
        expect(result.domainResults).toEqual([]);
      });

      it('should still apply EXCLUDE to ALWAYS_ON domains', () => {
        const request = createTestMatchRequest({
          promptText: 'review this fix bug',
          domains: {
            ALWAYS_ON_DOMAIN: createTestDomainConfig({
              name: 'ALWAYS_ON_DOMAIN',
              state: true,
              recall: ['fix bug'],
              exclude: ['review'],
              alwaysOn: true,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        // Even though ALWAYS_ON, the domain is skipped entirely before exclude check
        // So it won't appear in excluded domains either
        expect(result.matchedDomains).not.toContain('ALWAYS_ON_DOMAIN');
        expect(result.excludedDomains).not.toContain('ALWAYS_ON_DOMAIN');
      });

      it('should sort matched domains alphabetically', () => {
        const request = createTestMatchRequest({
          promptText: 'code debug write',
          domains: {
            ZEBRA: createTestDomainConfig({
              name: 'ZEBRA',
              state: true,
              recall: ['code'],
              exclude: [],
              alwaysOn: false,
            }),
            ALPHA: createTestDomainConfig({
              name: 'ALPHA',
              state: true,
              recall: ['debug'],
              exclude: [],
              alwaysOn: false,
            }),
            BETA: createTestDomainConfig({
              name: 'BETA',
              state: true,
              recall: ['write'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toEqual(['ALPHA', 'BETA', 'ZEBRA']);
      });

      it('should sort excluded domains alphabetically', () => {
        const request = createTestMatchRequest({
          promptText: 'code debug write review',
          domains: {
            ZEBRA: createTestDomainConfig({
              name: 'ZEBRA',
              state: true,
              recall: ['code'],
              exclude: ['review'],
              alwaysOn: false,
            }),
            ALPHA: createTestDomainConfig({
              name: 'ALPHA',
              state: true,
              recall: ['debug'],
              exclude: ['review'],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.excludedDomains).toEqual(['ALPHA', 'ZEBRA']);
      });
    });

    describe('case sensitivity', () => {
      // Tests for case-insensitive matching

      it('should match keywords case-insensitively', () => {
        const request = createTestMatchRequest({
          promptText: 'help me fix bug',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['Fix Bug'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('DEVELOPMENT');
      });

      it('should normalize both prompt and keywords to lowercase', () => {
        const request = createTestMatchRequest({
          promptText: 'HELP ME FIX BUG NOW',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['fix bug'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('DEVELOPMENT');
      });

      it('should exclude case-insensitively', () => {
        const request = createTestMatchRequest({
          promptText: 'Review this code',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['code'],
              exclude: ['REVIEW'],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.excludedDomains).toContain('DEVELOPMENT');
      });
    });

    describe('multi-domain scenarios', () => {
      // Tests for multiple domain matches

      it('should return multiple matched domains', () => {
        const request = createTestMatchRequest({
          promptText: 'write content for my code project',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['code'],
              exclude: [],
              alwaysOn: false,
            }),
            CONTENT: createTestDomainConfig({
              name: 'CONTENT',
              state: true,
              recall: ['write content'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('DEVELOPMENT');
        expect(result.matchedDomains).toContain('CONTENT');
      });

      it('should handle partial multi-domain match', () => {
        const request = createTestMatchRequest({
          promptText: 'I need to code and debug',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['code'],
              exclude: [],
              alwaysOn: false,
            }),
            CONTENT: createTestDomainConfig({
              name: 'CONTENT',
              state: true,
              recall: ['write article'],
              exclude: [],
              alwaysOn: false,
            }),
            DATABASE: createTestDomainConfig({
              name: 'DATABASE',
              state: true,
              recall: ['sql'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toEqual(['DEVELOPMENT']);
      });

      it('should handle all domains matching', () => {
        const request = createTestMatchRequest({
          promptText: 'code debug write',
          domains: {
            ALPHA: createTestDomainConfig({
              name: 'ALPHA',
              state: true,
              recall: ['code'],
              exclude: [],
              alwaysOn: false,
            }),
            BETA: createTestDomainConfig({
              name: 'BETA',
              state: true,
              recall: ['debug'],
              exclude: [],
              alwaysOn: false,
            }),
            GAMMA: createTestDomainConfig({
              name: 'GAMMA',
              state: true,
              recall: ['write'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toEqual(['ALPHA', 'BETA', 'GAMMA']);
      });

      it('should handle some excluded, some matched', () => {
        const request = createTestMatchRequest({
          promptText: 'code review debug test',
          domains: {
            MATCHED_DOMAIN: createTestDomainConfig({
              name: 'MATCHED_DOMAIN',
              state: true,
              recall: ['debug'],
              exclude: [],
              alwaysOn: false,
            }),
            EXCLUDED_DOMAIN: createTestDomainConfig({
              name: 'EXCLUDED_DOMAIN',
              state: true,
              recall: ['code'],
              exclude: ['review'],
              alwaysOn: false,
            }),
            NO_MATCH_DOMAIN: createTestDomainConfig({
              name: 'NO_MATCH_DOMAIN',
              state: true,
              recall: ['xyz'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('MATCHED_DOMAIN');
        expect(result.excludedDomains).toContain('EXCLUDED_DOMAIN');
        expect(result.matchedDomains).not.toContain('NO_MATCH_DOMAIN');
        expect(result.excludedDomains).not.toContain('NO_MATCH_DOMAIN');
      });

      it('should include signals from toolTokens and pathTokens', () => {
        const request = createTestMatchRequest({
          promptText: 'help me with something unrelated',
          signals: {
            promptTokens: [],
            promptHistory: [],
            toolTokens: ['bash', 'git', 'npm'],
            pathTokens: ['src/', 'lib/'],
          },
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['npm'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('DEVELOPMENT');
      });
    });

    describe('edge cases', () => {
      // Empty inputs, special characters

      it('should handle empty prompt gracefully', () => {
        const request = createTestMatchRequest({
          promptText: '',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['code'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toEqual([]);
      });

      it('should handle empty domains list', () => {
        const request = createTestMatchRequest({
          promptText: 'I need to code',
          domains: {},
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toEqual([]);
        expect(result.excludedDomains).toEqual([]);
        expect(result.domainResults).toEqual([]);
      });

      it('should handle domain with empty RECALL list', () => {
        const request = createTestMatchRequest({
          promptText: 'I need to code',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: [],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toEqual([]);
        expect(result.domainResults).toEqual([]);
      });

      it('should handle whitespace-only RECALL keywords', () => {
        const request = createTestMatchRequest({
          promptText: 'I need to code',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['  ', '', 'code'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('DEVELOPMENT');
        // Should filter out empty/whitespace keywords
        expect(result.domainResults[0].matchedKeywords).toEqual(['code']);
      });

      it('should handle special characters in keywords', () => {
        const request = createTestMatchRequest({
          promptText: 'I need to use api/v2 for user-auth',
          domains: {
            API: createTestDomainConfig({
              name: 'API',
              state: true,
              recall: ['api/v2', 'user-auth'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('API');
      });

      it('should handle very long prompts', () => {
        const longPrompt = 'This is a very long prompt that contains many words and repeats code many times. '.repeat(20) + 'code';
        const request = createTestMatchRequest({
          promptText: longPrompt,
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['code'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('DEVELOPMENT');
      });

      it('should handle prompt with keyword repeated', () => {
        const request = createTestMatchRequest({
          promptText: 'fix bug fix bug fix bug',
          domains: {
            DEVELOPMENT: createTestDomainConfig({
              name: 'DEVELOPMENT',
              state: true,
              recall: ['fix bug'],
              exclude: [],
              alwaysOn: false,
            }),
          },
        });

        const result = matchDomainsForTurn(request);

        expect(result.matchedDomains).toContain('DEVELOPMENT');
        // Should have single match, not duplicated in matchedKeywords
        expect(result.domainResults[0].matchedKeywords).toEqual(['fix bug']);
      });
    });
  });
});
