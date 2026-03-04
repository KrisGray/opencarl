# OpenCARL — Comprehensive Test Plan

**Project:** `@krisgray/opencarl` — Dynamic rule injection plugin for OpenCode  
**Repository:** <https://github.com/KrisGray/opencarl>  
**Languages:** TypeScript (30.2%), JavaScript (69.8%)  
**Test Frameworks:** Jest (JavaScript/TypeScript), pytest (Python — for any auxiliary tooling)  
**Date:** 2026-03-03  

---

## 1. Project Overview & Testable Components

OpenCARL is an OpenCode plugin that provides context-aware, keyword-based rule injection. Based on the repository structure and README, the following functional areas have been identified for testing.

### 1.1 Repository Structure (Observed)

```
opencarl/
├── src/                        # TypeScript/JavaScript source
├── dist/plugin.js              # Compiled plugin entrypoint
├── bin/                        # CLI / binary scripts
├── scripts/                    # Build and utility scripts
├── resources/
│   ├── commands/carl/          # /carl slash-command handlers
│   └── skills/                 # Domain management helpers
├── .carl-template/
│   ├── manifest                # Default domain registry template
│   ├── global                  # Default universal rules template
│   ├── commands                # Default star-command definitions
│   └── context                 # Default context bracket rules
├── .opencode/                  # OpenCode integration config
├── assets/                     # Static assets
├── node_modules/               # Dependencies (checked-in)
├── package.json
├── package-lock.json
├── tsconfig.build.json
├── INSTALL.md
├── README.md
└── LICENSE
```

### 1.2 Identified Functional Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Manifest Parser** | Parses `.carl/manifest` KEY=VALUE files into domain configurations |
| 2 | **Keyword Scanner** | Scans user prompts against domain RECALL keywords |
| 3 | **Domain Manager** | Loads, unloads, toggles, and lists domains |
| 4 | **Rule Composer** | Assembles matched rules for injection into context |
| 5 | **Star-Command Parser** | Parses `*commandname` syntax from user input |
| 6 | **Context Manager** | Manages context brackets (fresh/moderate/depleted) |
| 7 | **Session Manager** | Handles session state files in `.carl/sessions/` |
| 8 | **Setup / Initialiser** | `/carl setup` scaffolding and template copying |
| 9 | **AGENTS.md Integrator** | Optional AGENTS.md documentation injection |
| 10 | **Plugin Entrypoint** | OpenCode plugin hook registration and lifecycle |
| 11 | **CLI Commands** | `/carl`, `/carl list`, `/carl view`, `/carl toggle` handlers |
| 12 | **Global vs Local Resolution** | Rule precedence when `~/.carl/` and `./.carl/` both exist |

---

## 2. Test Directory Structure

```
tests/
├── javascript/
│   ├── unit/
│   │   ├── manifest-parser.test.ts
│   │   ├── keyword-scanner.test.ts
│   │   ├── domain-manager.test.ts
│   │   ├── rule-composer.test.ts
│   │   ├── star-command-parser.test.ts
│   │   ├── context-manager.test.ts
│   │   ├── session-manager.test.ts
│   │   ├── setup-initialiser.test.ts
│   │   ├── agents-md-integrator.test.ts
│   │   ├── plugin-entrypoint.test.ts
│   │   ├── cli-commands.test.ts
│   │   └── global-local-resolution.test.ts
│   ├── integration/
│   │   ├── plugin-lifecycle.test.ts
│   │   ├── rule-injection-pipeline.test.ts
│   │   ├── setup-and-domain-workflow.test.ts
│   │   └── file-system-operations.test.ts
│   └── e2e/
│       ├── carl-setup.test.ts
│       ├── keyword-matching-flow.test.ts
│       ├── star-command-flow.test.ts
│       └── domain-management-flow.test.ts
├── python/
│   ├── unit/
│   │   ├── test_manifest_file_format.py
│   │   └── test_template_validation.py
│   ├── integration/
│   │   └── test_npm_package_structure.py
│   └── e2e/
│       └── test_install_and_setup.py
├── fixtures/
│   ├── manifests/
│   │   ├── valid-single-domain.manifest
│   │   ├── valid-multi-domain.manifest
│   │   ├── empty.manifest
│   │   ├── malformed-keys.manifest
│   │   ├── missing-state.manifest
│   │   └── always-on-domain.manifest
│   ├── carl-directories/
│   │   ├── minimal/           # Minimal valid .carl/ directory
│   │   ├── full/              # Full .carl/ with all features
│   │   ├── global-and-local/  # Both ~/.carl/ and ./.carl/ present
│   │   └── broken/            # Invalid/corrupt .carl/ directory
│   ├── prompts/
│   │   ├── development-keywords.txt
│   │   ├── content-keywords.txt
│   │   ├── star-commands.txt
│   │   ├── no-match.txt
│   │   └── multi-domain-match.txt
│   └── sessions/
│       ├── fresh-session.json
│       ├── moderate-session.json
│       └── depleted-session.json
└── jest.config.ts
```

---

## 3. Jest Configuration

```typescript
// tests/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/javascript'],
  testMatch: [
    '**/unit/**/*.test.ts',
    '**/integration/**/*.test.ts',
    '**/e2e/**/*.test.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    '../../src/**/*.{ts,js}',
    '!../../src/**/*.d.ts',
  ],
  coverageDirectory: '../coverage',
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterSetup: ['./javascript/setup.ts'],
};

export default config;
```

---

## 4. Unit Tests — JavaScript/TypeScript (Jest)

### 4.1 Manifest Parser (`manifest-parser.test.ts`)

The manifest is the core configuration file using a `KEY=VALUE` format with fields like `DOMAIN_STATE`, `DOMAIN_RECALL`, `DOMAIN_EXCLUDE`, and `DOMAIN_ALWAYS_ON`.

```typescript
/**
 * @file manifest-parser.test.ts
 * @description Unit tests for the OpenCARL manifest parser.
 *
 * The manifest parser is responsible for reading `.carl/manifest` files
 * and converting KEY=VALUE entries into structured domain configuration
 * objects. This suite validates parsing correctness, edge cases, and
 * error handling.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
// import { parseManifest, ManifestEntry } from '../../src/manifest-parser';
// Adjust the above import path to match the actual module location.

describe('ManifestParser', () => {

  describe('parseManifest()', () => {

    /**
     * Verifies that a well-formed single-domain manifest
     * produces the expected configuration object.
     */
    it('should parse a valid single-domain manifest', () => {
      const input = [
        'DEVELOPMENT_STATE=active',
        'DEVELOPMENT_RECALL=fix bug, write code, implement',
        'DEVELOPMENT_EXCLUDE=',
        'DEVELOPMENT_ALWAYS_ON=false',
      ].join('\n');

      // const result = parseManifest(input);
      // expect(result).toHaveLength(1);
      // expect(result[0]).toEqual({
      //   domain: 'DEVELOPMENT',
      //   state: 'active',
      //   recall: ['fix bug', 'write code', 'implement'],
      //   exclude: [],
      //   alwaysOn: false,
      // });
    });

    /**
     * Verifies that multiple domains within a single manifest
     * are all correctly parsed and returned.
     */
    it('should parse a manifest containing multiple domains', () => {
      const input = [
        'DEVELOPMENT_STATE=active',
        'DEVELOPMENT_RECALL=fix bug, write code',
        'DEVELOPMENT_EXCLUDE=',
        'DEVELOPMENT_ALWAYS_ON=false',
        'CONTENT_STATE=active',
        'CONTENT_RECALL=write script, youtube',
        'CONTENT_EXCLUDE=',
        'CONTENT_ALWAYS_ON=false',
      ].join('\n');

      // const result = parseManifest(input);
      // expect(result).toHaveLength(2);
      // expect(result.map(d => d.domain)).toEqual(['DEVELOPMENT', 'CONTENT']);
    });

    /**
     * Verifies that an empty manifest string produces
     * an empty array of domain configurations.
     */
    it('should return an empty array for an empty manifest', () => {
      // const result = parseManifest('');
      // expect(result).toEqual([]);
    });

    /**
     * Verifies that blank lines and comment lines (if supported)
     * are silently ignored during parsing.
     */
    it('should ignore blank lines and whitespace-only lines', () => {
      const input = [
        '',
        'DEVELOPMENT_STATE=active',
        '   ',
        'DEVELOPMENT_RECALL=fix bug',
        '',
      ].join('\n');

      // const result = parseManifest(input);
      // expect(result).toHaveLength(1);
    });

    /**
     * Verifies that the ALWAYS_ON field is correctly interpreted
     * as a boolean true.
     */
    it('should parse ALWAYS_ON=true correctly', () => {
      const input = [
        'GLOBAL_STATE=active',
        'GLOBAL_RECALL=',
        'GLOBAL_EXCLUDE=',
        'GLOBAL_ALWAYS_ON=true',
      ].join('\n');

      // const result = parseManifest(input);
      // expect(result[0].alwaysOn).toBe(true);
    });

    /**
     * Verifies that the STATE field correctly maps "inactive"
     * string values to the inactive state.
     */
    it('should parse STATE=inactive correctly', () => {
      const input = 'DISABLED_STATE=inactive\nDISABLED_RECALL=\nDISABLED_EXCLUDE=\nDISABLED_ALWAYS_ON=false';

      // const result = parseManifest(input);
      // expect(result[0].state).toBe('inactive');
    });

    /**
     * Verifies that RECALL keywords with varied whitespace
     * around commas are trimmed correctly.
     */
    it('should trim whitespace from RECALL keyword entries', () => {
      const input = 'DEV_STATE=active\nDEV_RECALL= fix bug , write code ,  implement \nDEV_EXCLUDE=\nDEV_ALWAYS_ON=false';

      // const result = parseManifest(input);
      // expect(result[0].recall).toEqual(['fix bug', 'write code', 'implement']);
    });

    /**
     * Verifies that EXCLUDE keywords are parsed in the same
     * comma-separated fashion as RECALL.
     */
    it('should parse EXCLUDE keywords as a comma-separated list', () => {
      const input = 'DEV_STATE=active\nDEV_RECALL=code\nDEV_EXCLUDE=testing, review\nDEV_ALWAYS_ON=false';

      // const result = parseManifest(input);
      // expect(result[0].exclude).toEqual(['testing', 'review']);
    });

    /**
     * Verifies that lines with unrecognised suffixes or malformed
     * keys are handled gracefully (ignored or reported).
     */
    it('should handle lines with unrecognised key suffixes gracefully', () => {
      const input = 'DEV_STATE=active\nDEV_RECALL=code\nDEV_UNKNOWN=something\nDEV_EXCLUDE=\nDEV_ALWAYS_ON=false';

      // const result = parseManifest(input);
      // Expect it to either ignore the unknown key or store it
      // expect(result[0].domain).toBe('DEV');
    });

    /**
     * Verifies that a manifest line with no value after the equals
     * sign is treated as an empty value (empty string or empty array).
     */
    it('should handle KEY= with no value as an empty value', () => {
      const input = 'DEV_STATE=active\nDEV_RECALL=\nDEV_EXCLUDE=\nDEV_ALWAYS_ON=false';

      // const result = parseManifest(input);
      // expect(result[0].recall).toEqual([]);
    });

    /**
     * Verifies robustness when encountering lines that do not
     * contain an equals sign at all.
     */
    it('should skip lines without an equals sign', () => {
      const input = 'DEV_STATE=active\nthis is not a valid line\nDEV_RECALL=code\nDEV_EXCLUDE=\nDEV_ALWAYS_ON=false';

      // Should not throw
      // const result = parseManifest(input);
      // expect(result[0].domain).toBe('DEV');
    });
  });
});
```

### 4.2 Keyword Scanner (`keyword-scanner.test.ts`)

```typescript
/**
 * @file keyword-scanner.test.ts
 * @description Unit tests for the keyword scanner module.
 *
 * The keyword scanner examines user prompt text and determines which
 * domains should be activated based on RECALL keyword matches, while
 * respecting EXCLUDE keywords that suppress activation.
 */

import { describe, it, expect } from '@jest/globals';
// import { scanForKeywords } from '../../src/keyword-scanner';

describe('KeywordScanner', () => {

  describe('scanForKeywords()', () => {

    /**
     * Verifies that a prompt containing a domain's recall keyword
     * returns that domain as a match.
     */
    it('should match a single recall keyword in a prompt', () => {
      const domains = [
        { domain: 'DEVELOPMENT', recall: ['fix bug', 'write code'], exclude: [], state: 'active', alwaysOn: false },
      ];
      const prompt = 'Can you help me fix bug in my app?';

      // const matches = scanForKeywords(prompt, domains);
      // expect(matches).toContain('DEVELOPMENT');
    });

    /**
     * Verifies that keyword matching is case-insensitive, so
     * "Fix Bug" matches the recall keyword "fix bug".
     */
    it('should match keywords case-insensitively', () => {
      const domains = [
        { domain: 'DEVELOPMENT', recall: ['fix bug'], exclude: [], state: 'active', alwaysOn: false },
      ];
      const prompt = 'Please Fix Bug in the login module';

      // const matches = scanForKeywords(prompt, domains);
      // expect(matches).toContain('DEVELOPMENT');
    });

    /**
     * Verifies that a prompt containing keywords from multiple
     * domains returns all matched domains.
     */
    it('should return multiple domains when prompt matches several', () => {
      const domains = [
        { domain: 'DEVELOPMENT', recall: ['fix bug'], exclude: [], state: 'active', alwaysOn: false },
        { domain: 'CONTENT', recall: ['write script'], exclude: [], state: 'active', alwaysOn: false },
      ];
      const prompt = 'fix bug and write script for the video';

      // const matches = scanForKeywords(prompt, domains);
      // expect(matches).toEqual(expect.arrayContaining(['DEVELOPMENT', 'CONTENT']));
    });

    /**
     * Verifies that a prompt containing no recall keywords
     * produces an empty match list.
     */
    it('should return an empty array when no keywords match', () => {
      const domains = [
        { domain: 'DEVELOPMENT', recall: ['fix bug'], exclude: [], state: 'active', alwaysOn: false },
      ];
      const prompt = 'What is the weather today?';

      // const matches = scanForKeywords(prompt, domains);
      // expect(matches).toEqual([]);
    });

    /**
     * Verifies that inactive domains are not returned as matches
     * even when their keywords appear in the prompt.
     */
    it('should not match inactive domains', () => {
      const domains = [
        { domain: 'DEVELOPMENT', recall: ['fix bug'], exclude: [], state: 'inactive', alwaysOn: false },
      ];
      const prompt = 'fix bug in the parser';

      // const matches = scanForKeywords(prompt, domains);
      // expect(matches).toEqual([]);
    });

    /**
     * Verifies that an EXCLUDE keyword suppresses a domain match
     * even when RECALL keywords are present.
     */
    it('should exclude a domain when an EXCLUDE keyword is found', () => {
      const domains = [
        { domain: 'DEVELOPMENT', recall: ['code'], exclude: ['review'], state: 'active', alwaysOn: false },
      ];
      const prompt = 'review this code change';

      // const matches = scanForKeywords(prompt, domains);
      // expect(matches).not.toContain('DEVELOPMENT');
    });

    /**
     * Verifies that ALWAYS_ON domains are always included in
     * the match results regardless of keyword presence.
     */
    it('should always include ALWAYS_ON domains', () => {
      const domains = [
        { domain: 'GLOBAL', recall: [], exclude: [], state: 'active', alwaysOn: true },
      ];
      const prompt = 'something completely unrelated';

      // const matches = scanForKeywords(prompt, domains);
      // expect(matches).toContain('GLOBAL');
    });

    /**
     * Verifies that multi-word recall phrases like "fix bug"
     * only match when the entire phrase appears, not individual words.
     */
    it('should match multi-word keywords as phrases, not individual words', () => {
      const domains = [
        { domain: 'DEVELOPMENT', recall: ['fix bug'], exclude: [], state: 'active', alwaysOn: false },
      ];
      const prompt = 'I found a bug but cannot fix it';

      // Depending on implementation: phrase-based matching may or may not match here.
      // This test documents the expected behaviour.
      // const matches = scanForKeywords(prompt, domains);
      // Adjust assertion based on actual implementation behaviour.
    });

    /**
     * Verifies that the scanner handles an empty prompt string
     * without errors (returning only ALWAYS_ON domains).
     */
    it('should handle an empty prompt gracefully', () => {
      const domains = [
        { domain: 'DEVELOPMENT', recall: ['fix bug'], exclude: [], state: 'active', alwaysOn: false },
        { domain: 'GLOBAL', recall: [], exclude: [], state: 'active', alwaysOn: true },
      ];

      // const matches = scanForKeywords('', domains);
      // expect(matches).toEqual(['GLOBAL']);
    });

    /**
     * Verifies that the scanner handles an empty domain list
     * without errors.
     */
    it('should return an empty array when there are no domains', () => {
      // const matches = scanForKeywords('fix bug', []);
      // expect(matches).toEqual([]);
    });
  });
});
```

### 4.3 Star-Command Parser (`star-command-parser.test.ts`)

```typescript
/**
 * @file star-command-parser.test.ts
 * @description Unit tests for the star-command parser.
 *
 * Star-commands use the `*commandname` syntax for explicit rule triggers.
 * This suite validates parsing of star-command names and their arguments
 * from user prompt text.
 */

import { describe, it, expect } from '@jest/globals';
// import { parseStarCommand } from '../../src/star-command-parser';

describe('StarCommandParser', () => {

  describe('parseStarCommand()', () => {

    /**
     * Verifies that a simple *carl command at the start
     * of a prompt is correctly identified.
     */
    it('should parse *carl as the carl command', () => {
      // const result = parseStarCommand('*carl');
      // expect(result).toEqual({ command: 'carl', args: '' });
    });

    /**
     * Verifies that a star-command followed by arguments
     * correctly separates the command name from the argument text.
     */
    it('should parse *brief with trailing argument text', () => {
      // const result = parseStarCommand('*brief explain recursion');
      // expect(result).toEqual({ command: 'brief', args: 'explain recursion' });
    });

    /**
     * Verifies that *carl docs is parsed with "docs" as the argument.
     */
    it('should parse *carl docs correctly', () => {
      // const result = parseStarCommand('*carl docs');
      // expect(result).toEqual({ command: 'carl', args: 'docs' });
    });

    /**
     * Verifies that a prompt without a star-command returns null
     * or an appropriate "no command" indicator.
     */
    it('should return null for prompts without star-commands', () => {
      // const result = parseStarCommand('just a regular prompt');
      // expect(result).toBeNull();
    });

    /**
     * Verifies that an asterisk in the middle of text is not
     * misinterpreted as a star-command.
     */
    it('should not match asterisks mid-sentence', () => {
      // const result = parseStarCommand('this is 5*3 calculation');
      // expect(result).toBeNull();
    });

    /**
     * Verifies that a bare asterisk with no command name is not
     * treated as a valid star-command.
     */
    it('should not match a bare asterisk', () => {
      // const result = parseStarCommand('* something');
      // expect(result).toBeNull();
    });

    /**
     * Verifies that star-commands are matched case-insensitively
     * (e.g. *CARL and *carl are equivalent).
     */
    it('should handle star-commands case-insensitively', () => {
      // const result = parseStarCommand('*CARL');
      // expect(result?.command.toLowerCase()).toBe('carl');
    });

    /**
     * Verifies that leading whitespace before the star-command
     * does not prevent detection.
     */
    it('should handle leading whitespace before the star-command', () => {
      // const result = parseStarCommand('  *brief explain this');
      // expect(result).not.toBeNull();
      // expect(result?.command).toBe('brief');
    });
  });
});
```

### 4.4 Domain Manager (`domain-manager.test.ts`)

```typescript
/**
 * @file domain-manager.test.ts
 * @description Unit tests for the domain manager module.
 *
 * The domain manager handles loading domain rule files, toggling
 * domain active/inactive states, listing available domains, and
 * viewing rules within a specific domain.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
// import { DomainManager } from '../../src/domain-manager';

describe('DomainManager', () => {

  describe('loadDomain()', () => {

    /**
     * Verifies that a valid domain file is loaded and its rules
     * are parsed into an ordered array.
     */
    it('should load rules from a valid domain file', () => {
      // Arrange: mock file system with domain file content
      // Act: const rules = domainManager.loadDomain('DEVELOPMENT');
      // Assert: expect rules to be an ordered array of strings
    });

    /**
     * Verifies that rules are returned in RULE_N numeric order
     * even if the file has them out of order.
     */
    it('should return rules sorted by rule number', () => {
      // Rules defined as RULE_2, RULE_0, RULE_1 should return in 0,1,2 order
    });

    /**
     * Verifies that requesting a non-existent domain
     * returns an empty array or throws an appropriate error.
     */
    it('should handle a non-existent domain gracefully', () => {
      // const rules = domainManager.loadDomain('NONEXISTENT');
      // expect(rules).toEqual([]);  // or expect it to throw
    });
  });

  describe('toggleDomain()', () => {

    /**
     * Verifies that toggling a domain from active to inactive
     * updates the manifest STATE field correctly.
     */
    it('should toggle a domain from active to inactive', () => {
      // Act: domainManager.toggleDomain('DEVELOPMENT', 'inactive');
      // Assert: verify manifest entry is updated
    });

    /**
     * Verifies that toggling a domain from inactive to active
     * updates the manifest STATE field correctly.
     */
    it('should toggle a domain from inactive to active', () => {
      // Act: domainManager.toggleDomain('DEVELOPMENT', 'active');
      // Assert: verify manifest entry is updated
    });

    /**
     * Verifies that toggling a non-existent domain
     * produces an appropriate error or no-op.
     */
    it('should handle toggling a non-existent domain', () => {
      // expect(() => domainManager.toggleDomain('FAKE', 'active')).toThrow();
    });
  });

  describe('listDomains()', () => {

    /**
     * Verifies that all domains registered in the manifest
     * are returned by the list operation.
     */
    it('should list all domains from the manifest', () => {
      // const domains = domainManager.listDomains();
      // expect(domains).toContain('DEVELOPMENT');
    });

    /**
     * Verifies that listed domains include their current
     * active/inactive state.
     */
    it('should include state information for each domain', () => {
      // const domains = domainManager.listDomains();
      // expect(domains[0]).toHaveProperty('state');
    });
  });

  describe('viewDomain()', () => {

    /**
     * Verifies that viewing a domain returns its full set
     * of rules and metadata.
     */
    it('should return all rules for a valid domain', () => {
      // const view = domainManager.viewDomain('DEVELOPMENT');
      // expect(view.rules).toBeDefined();
      // expect(view.rules.length).toBeGreaterThan(0);
    });
  });
});
```

### 4.5 Rule Composer (`rule-composer.test.ts`)

```typescript
/**
 * @file rule-composer.test.ts
 * @description Unit tests for the rule composer module.
 *
 * The rule composer takes a set of matched domains and assembles
 * the final rule text that will be injected into the OpenCode
 * session context.
 */

import { describe, it, expect } from '@jest/globals';
// import { composeRules } from '../../src/rule-composer';

describe('RuleComposer', () => {

  describe('composeRules()', () => {

    /**
     * Verifies that rules from a single matched domain
     * are correctly assembled into injectable text.
     */
    it('should compose rules from a single domain', () => {
      // const rules = composeRules(['DEVELOPMENT'], mockDomainData);
      // expect(rules).toContain('Code over explanation');
    });

    /**
     * Verifies that global rules are always included in
     * the composed output.
     */
    it('should always include global rules', () => {
      // const rules = composeRules([], mockDomainData);
      // expect(rules).toContain(/* global rule text */);
    });

    /**
     * Verifies that rules from multiple matched domains
     * are all present in the composed output.
     */
    it('should combine rules from multiple matched domains', () => {
      // const rules = composeRules(['DEVELOPMENT', 'CONTENT'], mockDomainData);
      // expect(rules).toContain(/* DEVELOPMENT rule */);
      // expect(rules).toContain(/* CONTENT rule */);
    });

    /**
     * Verifies that context bracket rules (fresh/moderate/depleted)
     * are included when appropriate.
     */
    it('should include context bracket rules when context is provided', () => {
      // const rules = composeRules(['DEVELOPMENT'], mockDomainData, { bracket: 'fresh' });
      // expect(rules).toContain(/* fresh context rule */);
    });

    /**
     * Verifies that an empty domain match list only produces
     * global and context rules, not domain-specific ones.
     */
    it('should return only global rules when no domains match', () => {
      // const rules = composeRules([], mockDomainData);
      // Verify no domain-specific content
    });

    /**
     * Verifies that rules are deduplicated if the same rule
     * appears in both global and a specific domain.
     */
    it('should not include duplicate rules', () => {
      // Test that identical rules from different sources appear only once
    });
  });
});
```

### 4.6 Context Manager (`context-manager.test.ts`)

```typescript
/**
 * @file context-manager.test.ts
 * @description Unit tests for the context manager module.
 *
 * The context manager determines the current context bracket
 * (fresh, moderate, depleted) based on session state and adjusts
 * rule loading behaviour accordingly.
 */

import { describe, it, expect } from '@jest/globals';
// import { ContextManager } from '../../src/context-manager';

describe('ContextManager', () => {

  /**
   * Verifies that a new session is classified as "fresh".
   */
  it('should classify a new session as fresh', () => {
    // const bracket = contextManager.getBracket(newSession);
    // expect(bracket).toBe('fresh');
  });

  /**
   * Verifies that a session with moderate usage is classified
   * as "moderate".
   */
  it('should classify a moderately-used session as moderate', () => {
    // const bracket = contextManager.getBracket(moderateSession);
    // expect(bracket).toBe('moderate');
  });

  /**
   * Verifies that a session nearing context limits is classified
   * as "depleted".
   */
  it('should classify a near-limit session as depleted', () => {
    // const bracket = contextManager.getBracket(depletedSession);
    // expect(bracket).toBe('depleted');
  });

  /**
   * Verifies that the context bracket influences which rules
   * from the context file are selected.
   */
  it('should return bracket-appropriate rules from the context file', () => {
    // const rules = contextManager.getContextRules('fresh');
    // expect(rules).toBeDefined();
  });
});
```

### 4.7 Session Manager (`session-manager.test.ts`)

```typescript
/**
 * @file session-manager.test.ts
 * @description Unit tests for the session manager module.
 *
 * The session manager handles creation, reading, updating, and
 * cleanup of session state files within `.carl/sessions/`.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
// import { SessionManager } from '../../src/session-manager';

describe('SessionManager', () => {

  describe('createSession()', () => {

    /**
     * Verifies that a new session file is created with the
     * expected initial state.
     */
    it('should create a new session file with initial state', () => {
      // const session = sessionManager.createSession();
      // expect(session).toHaveProperty('id');
      // expect(session).toHaveProperty('createdAt');
    });
  });

  describe('getSession()', () => {

    /**
     * Verifies that an existing session can be retrieved by ID.
     */
    it('should retrieve an existing session by ID', () => {
      // const session = sessionManager.getSession(knownId);
      // expect(session).toBeDefined();
    });

    /**
     * Verifies that requesting a non-existent session
     * returns null or throws appropriately.
     */
    it('should return null for a non-existent session', () => {
      // const session = sessionManager.getSession('nonexistent');
      // expect(session).toBeNull();
    });
  });

  describe('updateSession()', () => {

    /**
     * Verifies that session state can be updated and persisted.
     */
    it('should update session state and persist changes', () => {
      // sessionManager.updateSession(id, { matchedDomains: ['DEV'] });
      // const session = sessionManager.getSession(id);
      // expect(session.matchedDomains).toContain('DEV');
    });
  });
});
```

### 4.8 Setup / Initialiser (`setup-initialiser.test.ts`)

```typescript
/**
 * @file setup-initialiser.test.ts
 * @description Unit tests for the /carl setup initialisation logic.
 *
 * The initialiser scaffolds the `.carl/` directory structure, copies
 * template files from `.carl-template/`, and optionally integrates
 * with AGENTS.md.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
// import { setupCarl } from '../../src/setup';
// import * as fs from 'fs';
// import * as path from 'path';

describe('SetupInitialiser', () => {

  describe('setupCarl()', () => {

    /**
     * Verifies that running setup creates the expected .carl/
     * directory structure including manifest, global, commands,
     * context, and sessions/ subdirectory.
     */
    it('should create the .carl/ directory structure', () => {
      // await setupCarl({ targetDir: tmpDir });
      // expect(fs.existsSync(path.join(tmpDir, '.carl'))).toBe(true);
      // expect(fs.existsSync(path.join(tmpDir, '.carl', 'manifest'))).toBe(true);
      // expect(fs.existsSync(path.join(tmpDir, '.carl', 'global'))).toBe(true);
      // expect(fs.existsSync(path.join(tmpDir, '.carl', 'commands'))).toBe(true);
      // expect(fs.existsSync(path.join(tmpDir, '.carl', 'context'))).toBe(true);
      // expect(fs.existsSync(path.join(tmpDir, '.carl', 'sessions'))).toBe(true);
    });

    /**
     * Verifies that template files from .carl-template/ are
     * correctly copied into the new .carl/ directory.
     */
    it('should copy template files into .carl/', () => {
      // await setupCarl({ targetDir: tmpDir });
      // const manifest = fs.readFileSync(path.join(tmpDir, '.carl', 'manifest'), 'utf8');
      // expect(manifest).toContain('STATE=');
    });

    /**
     * Verifies that running setup does not overwrite an existing
     * .carl/ directory unless explicitly forced.
     */
    it('should not overwrite an existing .carl/ directory', () => {
      // Create .carl/ first, then run setup
      // await setupCarl({ targetDir: tmpDir });
      // Expect warning or skip, not overwrite
    });

    /**
     * Verifies that the --integrate flag causes AGENTS.md
     * content to be appended or updated.
     */
    it('should integrate with AGENTS.md when --integrate flag is set', () => {
      // await setupCarl({ targetDir: tmpDir, integrate: true });
      // const agentsMd = fs.readFileSync(path.join(tmpDir, 'AGENTS.md'), 'utf8');
      // expect(agentsMd).toContain('OpenCARL');
    });
  });
});
```

### 4.9 Plugin Entrypoint (`plugin-entrypoint.test.ts`)

```typescript
/**
 * @file plugin-entrypoint.test.ts
 * @description Unit tests for the OpenCode plugin entrypoint.
 *
 * The plugin entrypoint registers hooks with the OpenCode plugin
 * system, including chat.message hooks for keyword scanning and
 * rule injection.
 */

import { describe, it, expect, jest } from '@jest/globals';
// import { plugin } from '../../src/plugin';

describe('PluginEntrypoint', () => {

  /**
   * Verifies that the plugin exports a valid Plugin function
   * as expected by the OpenCode plugin API.
   */
  it('should export a valid plugin function', () => {
    // expect(typeof plugin).toBe('function');
  });

  /**
   * Verifies that calling the plugin function with a mock context
   * returns an object containing the expected hooks.
   */
  it('should return hooks when initialised with a context', async () => {
    // const mockCtx = createMockContext();
    // const hooks = await plugin(mockCtx);
    // expect(hooks).toHaveProperty('chat.message');
  });

  /**
   * Verifies that the chat.message hook is invoked with the
   * user's message content.
   */
  it('should intercept chat messages via the chat.message hook', async () => {
    // const mockCtx = createMockContext();
    // const hooks = await plugin(mockCtx);
    // await hooks['chat.message']({}, { message: mockMessage, parts: mockParts });
    // Verify that keyword scanning was triggered
  });

  /**
   * Verifies that the plugin registers /carl slash commands
   * with the OpenCode command system.
   */
  it('should register /carl commands', async () => {
    // const mockCtx = createMockContext();
    // const hooks = await plugin(mockCtx);
    // expect(hooks).toHaveProperty('command'); // or appropriate hook name
  });
});
```

### 4.10 CLI Commands (`cli-commands.test.ts`)

```typescript
/**
 * @file cli-commands.test.ts
 * @description Unit tests for the /carl CLI command handlers.
 *
 * Tests cover /carl, /carl list, /carl view DOMAIN,
 * and /carl toggle DOMAIN active|inactive.
 */

import { describe, it, expect } from '@jest/globals';
// import { handleCarlCommand } from '../../src/commands/carl';

describe('CLI Commands', () => {

  describe('/carl (no subcommand)', () => {

    /**
     * Verifies that bare /carl activates help mode.
     */
    it('should activate help mode', () => {
      // const result = handleCarlCommand({ args: [] });
      // expect(result.mode).toBe('help');
    });
  });

  describe('/carl list', () => {

    /**
     * Verifies that /carl list returns all registered domains
     * with their state.
     */
    it('should return all registered domains with state info', () => {
      // const result = handleCarlCommand({ args: ['list'] });
      // expect(result.domains).toBeDefined();
      // expect(result.domains.length).toBeGreaterThan(0);
    });
  });

  describe('/carl view DOMAIN', () => {

    /**
     * Verifies that /carl view returns rules for the specified domain.
     */
    it('should return rules for a valid domain', () => {
      // const result = handleCarlCommand({ args: ['view', 'DEVELOPMENT'] });
      // expect(result.rules).toBeDefined();
    });

    /**
     * Verifies that /carl view with an unknown domain returns
     * an appropriate error message.
     */
    it('should return an error for an unknown domain', () => {
      // const result = handleCarlCommand({ args: ['view', 'NONEXISTENT'] });
      // expect(result.error).toBeDefined();
    });
  });

  describe('/carl toggle DOMAIN state', () => {

    /**
     * Verifies that /carl toggle updates the domain state correctly.
     */
    it('should toggle domain state to inactive', () => {
      // const result = handleCarlCommand({ args: ['toggle', 'DEVELOPMENT', 'inactive'] });
      // expect(result.success).toBe(true);
    });

    /**
     * Verifies that invalid state values are rejected.
     */
    it('should reject invalid state values', () => {
      // const result = handleCarlCommand({ args: ['toggle', 'DEVELOPMENT', 'broken'] });
      // expect(result.error).toBeDefined();
    });
  });
});
```

### 4.11 Global vs Local Resolution (`global-local-resolution.test.ts`)

```typescript
/**
 * @file global-local-resolution.test.ts
 * @description Unit tests for global (~/.carl/) vs local (./.carl/) resolution.
 *
 * When both global and local .carl/ directories exist, local rules
 * should override global ones. This suite verifies the precedence logic.
 */

import { describe, it, expect } from '@jest/globals';
// import { resolveRules } from '../../src/resolution';

describe('GlobalLocalResolution', () => {

  /**
   * Verifies that when only local .carl/ exists, its rules
   * are used exclusively.
   */
  it('should use local rules when only local .carl/ exists', () => {
    // Mock only local directory
    // const rules = resolveRules({ local: localPath, global: null });
    // expect(rules).toEqual(expectedLocalRules);
  });

  /**
   * Verifies that when only global ~/.carl/ exists, its rules
   * are used exclusively.
   */
  it('should use global rules when only global ~/.carl/ exists', () => {
    // Mock only global directory
    // const rules = resolveRules({ local: null, global: globalPath });
    // expect(rules).toEqual(expectedGlobalRules);
  });

  /**
   * Verifies that local rules override global rules for the
   * same domain when both directories exist.
   */
  it('should override global rules with local rules for the same domain', () => {
    // Both directories exist with conflicting DEVELOPMENT rules
    // const rules = resolveRules({ local: localPath, global: globalPath });
    // expect(rules.DEVELOPMENT).toEqual(expectedLocalDevRules);
  });

  /**
   * Verifies that global-only domains still load when local
   * .carl/ exists but doesn't define that domain.
   */
  it('should include global-only domains alongside local ones', () => {
    // Global has CONTENT, local has DEVELOPMENT
    // const rules = resolveRules({ local: localPath, global: globalPath });
    // expect(rules).toHaveProperty('DEVELOPMENT'); // from local
    // expect(rules).toHaveProperty('CONTENT');      // from global
  });

  /**
   * Verifies that the manifest from local .carl/ takes precedence
   * over the global manifest.
   */
  it('should prefer local manifest over global manifest', () => {
    // Both directories have manifest files
    // Verify local manifest is the one parsed
  });
});
```

### 4.12 AGENTS.md Integrator (`agents-md-integrator.test.ts`)

```typescript
/**
 * @file agents-md-integrator.test.ts
 * @description Unit tests for the AGENTS.md integration module.
 *
 * This module handles reading, updating, and injecting OpenCARL
 * documentation into an existing or new AGENTS.md file.
 */

import { describe, it, expect } from '@jest/globals';
// import { integrateAgentsMd } from '../../src/agents-md';

describe('AgentsMdIntegrator', () => {

  /**
   * Verifies that a new AGENTS.md is created when none exists.
   */
  it('should create AGENTS.md when it does not exist', () => {
    // await integrateAgentsMd(tmpDir);
    // expect(fs.existsSync(path.join(tmpDir, 'AGENTS.md'))).toBe(true);
  });

  /**
   * Verifies that existing AGENTS.md content is preserved
   * when OpenCARL documentation is appended.
   */
  it('should preserve existing AGENTS.md content', () => {
    // Write existing content, then integrate
    // const content = fs.readFileSync(agentsMdPath, 'utf8');
    // expect(content).toContain('existing content');
    // expect(content).toContain('OpenCARL');
  });

  /**
   * Verifies that running integration twice does not duplicate
   * the OpenCARL section.
   */
  it('should not duplicate OpenCARL section on repeated integration', () => {
    // Integrate twice
    // const content = fs.readFileSync(agentsMdPath, 'utf8');
    // const occurrences = content.split('OpenCARL').length - 1;
    // expect(occurrences).toBe(1); // or however many are expected
  });
});
```

---

## 5. Integration Tests — JavaScript/TypeScript (Jest)

### 5.1 Plugin Lifecycle (`plugin-lifecycle.test.ts`)

```typescript
/**
 * @file plugin-lifecycle.test.ts
 * @description Integration tests for the full plugin lifecycle.
 *
 * These tests verify the end-to-end flow from plugin initialisation
 * through message interception, keyword scanning, domain matching,
 * rule composition, and context injection.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Plugin Lifecycle Integration', () => {

  /**
   * Verifies that the plugin initialises successfully with
   * a valid .carl/ directory and registers all expected hooks.
   */
  it('should initialise and register hooks with a valid .carl/ setup', async () => {
    // Set up temp .carl/ directory with templates
    // Initialise plugin with mock OpenCode context
    // Verify hooks are registered
  });

  /**
   * Verifies the complete message → scan → match → compose → inject
   * pipeline produces correct injected rules.
   */
  it('should inject correct rules for a development-related message', async () => {
    // Send a mock message containing "fix bug"
    // Verify that DEVELOPMENT domain rules are injected into context
  });

  /**
   * Verifies that star-commands take precedence over keyword
   * matching and trigger the correct command-specific behaviour.
   */
  it('should handle star-commands within the message pipeline', async () => {
    // Send a mock message starting with "*brief explain X"
    // Verify brief mode rules are applied
  });

  /**
   * Verifies that the plugin handles a missing .carl/ directory
   * gracefully at initialisation time.
   */
  it('should handle missing .carl/ directory gracefully', async () => {
    // Initialise plugin with no .carl/ directory
    // Expect no crash, possibly a warning or setup prompt
  });
});
```

### 5.2 Rule Injection Pipeline (`rule-injection-pipeline.test.ts`)

```typescript
/**
 * @file rule-injection-pipeline.test.ts
 * @description Integration tests for the rule injection pipeline.
 *
 * Verifies that the manifest → scanner → domain loader → composer
 * pipeline works correctly as an integrated unit.
 */

import { describe, it, expect } from '@jest/globals';

describe('Rule Injection Pipeline', () => {

  /**
   * Verifies end-to-end: parsing a manifest, scanning a prompt,
   * loading matched domains, and composing final rules.
   */
  it('should produce correct rules from manifest → scan → compose', () => {
    // Create a manifest fixture, a prompt with matching keywords
    // Run the full pipeline
    // Verify the composed output contains the expected rules
  });

  /**
   * Verifies that excluded keywords properly prevent domain
   * injection through the full pipeline.
   */
  it('should respect EXCLUDE keywords through the full pipeline', () => {
    // Manifest with EXCLUDE, prompt matching both RECALL and EXCLUDE
    // Verify excluded domain's rules are absent
  });

  /**
   * Verifies that ALWAYS_ON domains are always present in
   * the composed output regardless of prompt content.
   */
  it('should always include ALWAYS_ON domain rules', () => {
    // Prompt with no keyword matches
    // Verify ALWAYS_ON rules are present
  });
});
```

### 5.3 Setup and Domain Workflow (`setup-and-domain-workflow.test.ts`)

```typescript
/**
 * @file setup-and-domain-workflow.test.ts
 * @description Integration tests for the setup → domain management workflow.
 *
 * Verifies that after running /carl setup, domains can be created,
 * toggled, listed, and viewed correctly.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Setup and Domain Workflow', () => {

  /**
   * Verifies the complete workflow: setup → list → toggle → verify state.
   */
  it('should support the full setup → list → toggle workflow', async () => {
    // 1. Run setup to create .carl/
    // 2. List domains - verify default domains
    // 3. Toggle a domain to inactive
    // 4. List again - verify state change
    // 5. Toggle back to active
    // 6. Verify state restored
  });

  /**
   * Verifies that adding a custom domain file and updating the
   * manifest makes the new domain available.
   */
  it('should support adding custom domains after setup', async () => {
    // 1. Run setup
    // 2. Create custom domain file
    // 3. Update manifest with new domain
    // 4. List domains - verify custom domain appears
    // 5. Send matching prompt - verify custom rules load
  });
});
```

### 5.4 File System Operations (`file-system-operations.test.ts`)

```typescript
/**
 * @file file-system-operations.test.ts
 * @description Integration tests for file system interactions.
 *
 * Verifies that reading, writing, and watching .carl/ files
 * works correctly across global and local directories.
 */

import { describe, it, expect } from '@jest/globals';

describe('File System Operations', () => {

  /**
   * Verifies that manifest changes on disk are reflected
   * when the next message is processed.
   */
  it('should pick up manifest changes between messages', () => {
    // Load plugin, modify manifest on disk, send new message
    // Verify new manifest state is used
  });

  /**
   * Verifies that session files are correctly written to
   * and read from .carl/sessions/.
   */
  it('should persist and retrieve session files', () => {
    // Create session, verify file exists, read it back
  });

  /**
   * Verifies that the global ~/.carl/ directory is correctly
   * located on the file system.
   */
  it('should correctly resolve the global .carl/ directory path', () => {
    // Verify HOME-based path resolution
  });
});
```

---

## 6. End-to-End Tests — JavaScript/TypeScript (Jest)

### 6.1 Carl Setup E2E (`carl-setup.test.ts`)

```typescript
/**
 * @file carl-setup.test.ts
 * @description End-to-end tests for the /carl setup command.
 *
 * These tests simulate the full user experience of running
 * /carl setup in a fresh project directory.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('E2E: /carl setup', () => {

  /**
   * Verifies that /carl setup creates a fully functional .carl/
   * directory from scratch in an empty project.
   */
  it('should scaffold a complete .carl/ directory in a fresh project', () => {
    // Use temp directory, run setup command
    // Verify all expected files and directories exist
    // Verify manifest is parseable
    // Verify default domains are valid
  });

  /**
   * Verifies that /carl setup --integrate creates both .carl/
   * and updates AGENTS.md.
   */
  it('should scaffold .carl/ and update AGENTS.md with --integrate', () => {
    // Run setup with integrate flag
    // Verify .carl/ exists
    // Verify AGENTS.md exists and contains OpenCARL section
  });
});
```

### 6.2 Keyword Matching Flow E2E (`keyword-matching-flow.test.ts`)

```typescript
/**
 * @file keyword-matching-flow.test.ts
 * @description End-to-end tests for the keyword matching flow.
 *
 * Simulates the full user experience: typing a prompt that triggers
 * keyword matching and receiving context-augmented responses.
 */

import { describe, it, expect } from '@jest/globals';

describe('E2E: Keyword Matching Flow', () => {

  /**
   * Verifies that a prompt matching DEVELOPMENT keywords
   * results in DEVELOPMENT rules being injected.
   */
  it('should inject DEVELOPMENT rules for "help me fix this bug"', () => {
    // Setup .carl/ with DEVELOPMENT domain
    // Simulate message "help me fix this bug"
    // Verify DEVELOPMENT rules appear in injected context
  });

  /**
   * Verifies that a prompt matching no keywords results in
   * only global rules being injected.
   */
  it('should inject only global rules for a non-matching prompt', () => {
    // Simulate message "what is the weather"
    // Verify only global rules appear
  });

  /**
   * Verifies that prompts matching multiple domains inject
   * rules from all matched domains.
   */
  it('should inject rules from multiple matched domains', () => {
    // Setup DEVELOPMENT and CONTENT domains
    // Simulate message matching both
    // Verify both domain rules appear
  });
});
```

### 6.3 Star-Command Flow E2E (`star-command-flow.test.ts`)

```typescript
/**
 * @file star-command-flow.test.ts
 * @description End-to-end tests for the star-command flow.
 *
 * Simulates the full user experience of issuing star-commands.
 */

import { describe, it, expect } from '@jest/globals';

describe('E2E: Star-Command Flow', () => {

  /**
   * Verifies that *carl activates help mode and returns
   * interactive guidance.
   */
  it('should activate help mode with *carl', () => {
    // Simulate message "*carl"
    // Verify help mode response
  });

  /**
   * Verifies that *carl docs returns documentation content.
   */
  it('should return documentation with *carl docs', () => {
    // Simulate message "*carl docs"
    // Verify documentation content is returned
  });

  /**
   * Verifies that custom star-commands defined in .carl/commands
   * are recognised and triggered correctly.
   */
  it('should trigger custom star-commands from .carl/commands', () => {
    // Define custom command in .carl/commands
    // Simulate message "*customcommand argument"
    // Verify custom command behaviour
  });
});
```

### 6.4 Domain Management Flow E2E (`domain-management-flow.test.ts`)

```typescript
/**
 * @file domain-management-flow.test.ts
 * @description End-to-end tests for domain management operations.
 *
 * Simulates the full user experience of managing domains via
 * /carl CLI commands.
 */

import { describe, it, expect } from '@jest/globals';

describe('E2E: Domain Management Flow', () => {

  /**
   * Verifies the full lifecycle: create → list → toggle → verify.
   */
  it('should support full domain lifecycle management', () => {
    // 1. Setup with defaults
    // 2. /carl list - verify defaults
    // 3. Add custom domain
    // 4. /carl list - verify new domain
    // 5. /carl toggle CUSTOM inactive
    // 6. Send matching prompt - verify CUSTOM rules NOT injected
    // 7. /carl toggle CUSTOM active
    // 8. Send matching prompt - verify CUSTOM rules ARE injected
  });
});
```

---

## 7. Python Tests (pytest)

While OpenCARL is primarily a TypeScript/JavaScript project, Python tests provide
cross-language validation of file formats, package structure, and installation workflows.

### 7.1 Manifest File Format Validation (`test_manifest_file_format.py`)

```python
"""
test_manifest_file_format.py
============================

Unit tests validating the .carl/manifest file format.

These tests verify the manifest file format independently of the
TypeScript parser, ensuring that template files and documentation
accurately describe the expected KEY=VALUE format. This is useful
for validating generated or user-edited manifest files.
"""

import pytest
import re
from pathlib import Path


# Expected suffixes for manifest keys
VALID_SUFFIXES = {"STATE", "RECALL", "EXCLUDE", "ALWAYS_ON"}


class TestManifestFileFormat:
    """Tests for the .carl/manifest KEY=VALUE file format."""

    def test_valid_manifest_lines_have_equals_sign(
        self, sample_manifest: str
    ) -> None:
        """
        Verify that every non-empty line in a manifest file
        contains exactly one equals sign separating key and value.

        Args:
            sample_manifest: Content of a sample manifest file.
        """
        for line_num, line in enumerate(sample_manifest.strip().splitlines(), 1):
            stripped = line.strip()
            if not stripped:
                continue
            assert "=" in stripped, (
                f"Line {line_num} missing '=' separator: {stripped!r}"
            )

    def test_manifest_keys_use_valid_suffixes(
        self, sample_manifest: str
    ) -> None:
        """
        Verify that all manifest keys end with a recognised suffix
        (STATE, RECALL, EXCLUDE, ALWAYS_ON).

        Args:
            sample_manifest: Content of a sample manifest file.
        """
        for line in sample_manifest.strip().splitlines():
            stripped = line.strip()
            if not stripped or "=" not in stripped:
                continue
            key = stripped.split("=", 1)[0].strip()
            suffix = key.rsplit("_", 1)[-1]
            assert suffix in VALID_SUFFIXES, (
                f"Unknown suffix '{suffix}' in key '{key}'. "
                f"Expected one of: {VALID_SUFFIXES}"
            )

    def test_state_values_are_active_or_inactive(
        self, sample_manifest: str
    ) -> None:
        """
        Verify that all STATE fields contain either 'active' or 'inactive'.

        Args:
            sample_manifest: Content of a sample manifest file.
        """
        for line in sample_manifest.strip().splitlines():
            stripped = line.strip()
            if not stripped or "=" not in stripped:
                continue
            key, value = stripped.split("=", 1)
            if key.strip().endswith("_STATE"):
                assert value.strip() in ("active", "inactive"), (
                    f"Invalid STATE value: {value.strip()!r}"
                )

    def test_always_on_values_are_boolean_strings(
        self, sample_manifest: str
    ) -> None:
        """
        Verify that ALWAYS_ON fields contain either 'true' or 'false'.

        Args:
            sample_manifest: Content of a sample manifest file.
        """
        for line in sample_manifest.strip().splitlines():
            stripped = line.strip()
            if not stripped or "=" not in stripped:
                continue
            key, value = stripped.split("=", 1)
            if key.strip().endswith("_ALWAYS_ON"):
                assert value.strip() in ("true", "false"), (
                    f"Invalid ALWAYS_ON value: {value.strip()!r}"
                )

    def test_domain_names_are_uppercase(
        self, sample_manifest: str
    ) -> None:
        """
        Verify that domain name prefixes (the part before the suffix)
        are uppercase, following the convention described in the docs.

        Args:
            sample_manifest: Content of a sample manifest file.
        """
        for line in sample_manifest.strip().splitlines():
            stripped = line.strip()
            if not stripped or "=" not in stripped:
                continue
            key = stripped.split("=", 1)[0].strip()
            # Extract domain prefix: everything before the last known suffix
            for suffix in VALID_SUFFIXES:
                if key.endswith(f"_{suffix}"):
                    domain = key[: -(len(suffix) + 1)]
                    assert domain == domain.upper(), (
                        f"Domain name '{domain}' should be uppercase"
                    )
                    break


@pytest.fixture
def sample_manifest() -> str:
    """Provide a sample valid manifest for testing."""
    return (
        "DEVELOPMENT_STATE=active\n"
        "DEVELOPMENT_RECALL=fix bug, write code, implement\n"
        "DEVELOPMENT_EXCLUDE=\n"
        "DEVELOPMENT_ALWAYS_ON=false\n"
        "CONTENT_STATE=active\n"
        "CONTENT_RECALL=write script, youtube\n"
        "CONTENT_EXCLUDE=\n"
        "CONTENT_ALWAYS_ON=false\n"
    )
```

### 7.2 Template Validation (`test_template_validation.py`)

```python
"""
test_template_validation.py
===========================

Unit tests for validating the .carl-template/ files that ship
with the OpenCARL npm package.

These tests verify that template files are well-formed and contain
the expected structure, ensuring that `/carl setup` will produce
a valid .carl/ directory.
"""

import pytest
from pathlib import Path


class TestTemplateValidation:
    """Tests for .carl-template/ files."""

    def test_template_directory_exists(
        self, template_dir: Path
    ) -> None:
        """
        Verify that the .carl-template/ directory exists in the
        package root.

        Args:
            template_dir: Path to the .carl-template/ directory.
        """
        assert template_dir.is_dir(), (
            f".carl-template/ directory not found at {template_dir}"
        )

    def test_manifest_template_exists(
        self, template_dir: Path
    ) -> None:
        """
        Verify that the manifest template file exists.

        Args:
            template_dir: Path to the .carl-template/ directory.
        """
        manifest = template_dir / "manifest"
        assert manifest.is_file(), "manifest template file not found"

    def test_global_template_exists(
        self, template_dir: Path
    ) -> None:
        """
        Verify that the global rules template file exists.

        Args:
            template_dir: Path to the .carl-template/ directory.
        """
        global_file = template_dir / "global"
        assert global_file.is_file(), "global template file not found"

    def test_commands_template_exists(
        self, template_dir: Path
    ) -> None:
        """
        Verify that the commands template file exists.

        Args:
            template_dir: Path to the .carl-template/ directory.
        """
        commands = template_dir / "commands"
        assert commands.is_file(), "commands template file not found"

    def test_context_template_exists(
        self, template_dir: Path
    ) -> None:
        """
        Verify that the context bracket template file exists.

        Args:
            template_dir: Path to the .carl-template/ directory.
        """
        context = template_dir / "context"
        assert context.is_file(), "context template file not found"

    def test_manifest_template_is_parseable(
        self, template_dir: Path
    ) -> None:
        """
        Verify that the manifest template contains valid KEY=VALUE
        lines that would be accepted by the manifest parser.

        Args:
            template_dir: Path to the .carl-template/ directory.
        """
        manifest = template_dir / "manifest"
        content = manifest.read_text()
        for line in content.strip().splitlines():
            stripped = line.strip()
            if not stripped:
                continue
            assert "=" in stripped, (
                f"Template manifest line missing '=': {stripped!r}"
            )


@pytest.fixture
def template_dir() -> Path:
    """
    Provide the path to the .carl-template/ directory.

    This should be adjusted to point to the actual package location,
    e.g. via an environment variable or relative path from the test root.
    """
    # Adjust this path to match your project layout
    return Path(__file__).resolve().parents[3] / ".carl-template"
```

### 7.3 NPM Package Structure (`test_npm_package_structure.py`)

```python
"""
test_npm_package_structure.py
=============================

Integration tests verifying the npm package structure of
@krisgray/opencarl.

These tests validate that the package contains all the expected
files and that package.json is well-formed.
"""

import json
import pytest
from pathlib import Path


class TestNpmPackageStructure:
    """Tests for the npm package structure."""

    def test_package_json_exists(self, project_root: Path) -> None:
        """Verify package.json exists at the project root."""
        assert (project_root / "package.json").is_file()

    def test_package_json_has_required_fields(
        self, package_json: dict
    ) -> None:
        """
        Verify package.json contains required npm fields.

        Args:
            package_json: Parsed package.json contents.
        """
        required_fields = ["name", "version", "description"]
        for field in required_fields:
            assert field in package_json, (
                f"package.json missing required field: {field}"
            )

    def test_package_name_is_correct(
        self, package_json: dict
    ) -> None:
        """
        Verify the package name matches @krisgray/opencarl.

        Args:
            package_json: Parsed package.json contents.
        """
        assert package_json.get("name") == "@krisgray/opencarl"

    def test_dist_directory_exists(self, project_root: Path) -> None:
        """Verify the dist/ directory exists with compiled output."""
        assert (project_root / "dist").is_dir()

    def test_plugin_entrypoint_exists(self, project_root: Path) -> None:
        """Verify dist/plugin.js exists as the plugin entrypoint."""
        assert (project_root / "dist" / "plugin.js").is_file()

    def test_carl_template_directory_exists(
        self, project_root: Path
    ) -> None:
        """Verify .carl-template/ directory is included in the package."""
        assert (project_root / ".carl-template").is_dir()


@pytest.fixture
def project_root() -> Path:
    """Provide the project root path."""
    return Path(__file__).resolve().parents[3]


@pytest.fixture
def package_json(project_root: Path) -> dict:
    """Provide parsed package.json contents."""
    with open(project_root / "package.json") as f:
        return json.load(f)
```

### 7.4 Install and Setup E2E (`test_install_and_setup.py`)

```python
"""
test_install_and_setup.py
=========================

End-to-end tests that verify the npm install and /carl setup
workflow from a clean environment.

These tests require Node.js and npm to be available on PATH.
They are marked as slow and may be skipped in CI fast-feedback loops.
"""

import subprocess
import pytest
import tempfile
from pathlib import Path


@pytest.mark.slow
class TestInstallAndSetup:
    """E2E tests for the install and setup workflow."""

    def test_npm_install_succeeds(self, tmp_path: Path) -> None:
        """
        Verify that npm install @krisgray/opencarl completes
        without errors.

        Args:
            tmp_path: Temporary directory provided by pytest.
        """
        result = subprocess.run(
            ["npm", "init", "-y"],
            cwd=str(tmp_path),
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, f"npm init failed: {result.stderr}"

        result = subprocess.run(
            ["npm", "install", "@krisgray/opencarl"],
            cwd=str(tmp_path),
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, (
            f"npm install failed: {result.stderr}"
        )

    def test_package_files_present_after_install(
        self, installed_package_path: Path
    ) -> None:
        """
        Verify that the expected files are present in
        node_modules/@krisgray/opencarl/ after installation.

        Args:
            installed_package_path: Path to the installed package.
        """
        assert (installed_package_path / "dist" / "plugin.js").is_file()
        assert (installed_package_path / ".carl-template").is_dir()
        assert (installed_package_path / "package.json").is_file()


@pytest.fixture
def installed_package_path(tmp_path: Path) -> Path:
    """
    Install the package and return the path to the installed package.

    This fixture is marked as slow because it runs npm install.
    """
    subprocess.run(["npm", "init", "-y"], cwd=str(tmp_path), check=True)
    subprocess.run(
        ["npm", "install", "@krisgray/opencarl"],
        cwd=str(tmp_path),
        check=True,
    )
    return tmp_path / "node_modules" / "@krisgray" / "opencarl"
```

---

## 8. pytest Configuration

```ini
# tests/python/pytest.ini
[pytest]
testpaths = .
python_files = test_*.py
python_classes = Test*
python_functions = test_*
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
addopts = -v --tb=short
```

---

## 9. Test Prioritisation & Implementation Order

Tests are prioritised by criticality and dependency order:

| Priority | Test Suite | Type | Rationale |
|----------|-----------|------|-----------|
| **P0** | `manifest-parser.test.ts` | Unit | Core data format — everything depends on it |
| **P0** | `keyword-scanner.test.ts` | Unit | Core matching logic — the heart of the plugin |
| **P0** | `star-command-parser.test.ts` | Unit | User-facing input parsing |
| **P1** | `domain-manager.test.ts` | Unit | Domain CRUD operations |
| **P1** | `rule-composer.test.ts` | Unit | Rule assembly for injection |
| **P1** | `global-local-resolution.test.ts` | Unit | Precedence logic |
| **P1** | `plugin-entrypoint.test.ts` | Unit | Plugin API contract |
| **P2** | `context-manager.test.ts` | Unit | Context bracket logic |
| **P2** | `session-manager.test.ts` | Unit | Session persistence |
| **P2** | `setup-initialiser.test.ts` | Unit | Scaffolding logic |
| **P2** | `cli-commands.test.ts` | Unit | Command routing |
| **P2** | `agents-md-integrator.test.ts` | Unit | Optional integration |
| **P3** | `rule-injection-pipeline.test.ts` | Integration | Full pipeline verification |
| **P3** | `plugin-lifecycle.test.ts` | Integration | Plugin init → inject flow |
| **P3** | `setup-and-domain-workflow.test.ts` | Integration | Setup → manage workflow |
| **P3** | `file-system-operations.test.ts` | Integration | I/O correctness |
| **P4** | `carl-setup.test.ts` | E2E | User-facing setup flow |
| **P4** | `keyword-matching-flow.test.ts` | E2E | User-facing matching flow |
| **P4** | `star-command-flow.test.ts` | E2E | User-facing command flow |
| **P4** | `domain-management-flow.test.ts` | E2E | User-facing management flow |
| **P4** | `test_manifest_file_format.py` | Unit (Python) | Cross-language format validation |
| **P4** | `test_template_validation.py` | Unit (Python) | Template file checks |
| **P5** | `test_npm_package_structure.py` | Integration (Python) | Package structure |
| **P5** | `test_install_and_setup.py` | E2E (Python) | Install workflow |

---

## 10. Notes & Caveats

### 10.1 Source Code Access

This test plan was developed based on the project's public README, directory structure, and documented behaviour. All test implementations use commented-out import/assertion lines because the actual module names, function signatures, and internal APIs need to be confirmed against the source code. Once confirmed, uncomment and adjust the imports and assertions to match the real implementation.

### 10.2 Mocking Strategy

For unit tests, the following should be mocked:

- **File system operations** — Use `jest.mock('fs')` or `memfs` for in-memory file system simulation
- **OpenCode plugin context** — Create a `createMockContext()` factory that returns a minimal OpenCode plugin context
- **Home directory** — Mock `os.homedir()` or `process.env.HOME` for global `.carl/` resolution tests

For integration and E2E tests, use temporary directories (`tmp` / `os.tmpdir()`) with real file system operations.

### 10.3 CI Configuration Considerations

- JavaScript unit tests should run on every PR and push
- Integration tests can run on PR merges to main
- E2E tests (especially Python install tests) are slow and should be gated behind a marker or separate CI job
- Coverage thresholds of 80% are recommended as a starting point

### 10.4 Missing Information

The following details would refine the test plan further if the source code were accessible:

- Exact function signatures and module export names
- Whether the plugin uses synchronous or asynchronous APIs
- Error types and error message conventions
- Whether there is a configuration schema beyond the manifest
- The exact OpenCode plugin API version and hook signatures
- How context bracket thresholds are determined (message count, token count, etc.)
