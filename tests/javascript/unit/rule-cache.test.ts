import type { CarlRuleDiscoveryResult } from '../../../src/carl/types';

type LoadCarlRulesFn = typeof import('../../../src/carl/loader').loadCarlRules;

jest.mock('../../../src/carl/loader', () => ({
  loadCarlRules: jest.fn(),
}));

let mockLoadCarlRules: jest.MockedFunction<LoadCarlRulesFn>;

function createResult(domains: string[] = []): CarlRuleDiscoveryResult {
  return {
    sources: [],
    domains,
    warnings: [],
    domainPayloads: {},
    globalExclude: [],
    devmode: false,
    projectStatus: 'none',
    projectWarnings: [],
  };
}

function getMockLoadCarlRules(): jest.MockedFunction<LoadCarlRulesFn> {
  return require('../../../src/carl/loader').loadCarlRules as jest.MockedFunction<LoadCarlRulesFn>;
}

function loadRuleCacheModule(): typeof import('../../../src/carl/rule-cache') {
  return require('../../../src/carl/rule-cache');
}

describe('rule-cache.ts', () => {
  beforeEach(() => {
    jest.resetModules();
    mockLoadCarlRules = getMockLoadCarlRules();
    mockLoadCarlRules.mockReset();
  });

  describe('cache state + dirty flag', () => {
    it('markRulesDirty toggles isCacheDirty and triggers reload on next getCachedRules', () => {
      const cache = loadRuleCacheModule();
      mockLoadCarlRules.mockReturnValueOnce(createResult(['alpha']));

      cache.getCachedRules({ sessionId: 'session-a' });
      expect(mockLoadCarlRules).toHaveBeenCalledTimes(1);

      cache.markRulesDirty();
      expect(cache.isCacheDirty()).toBe(true);

      mockLoadCarlRules.mockReturnValueOnce(createResult(['beta']));
      const result = cache.getCachedRules({ sessionId: 'session-a' });

      expect(mockLoadCarlRules).toHaveBeenCalledTimes(2);
      expect(result.domains).toEqual(['beta']);
      expect(cache.isCacheDirty()).toBe(false);
    });

    it('getCachedRules caches results and does not reload if options are unchanged', () => {
      const cache = loadRuleCacheModule();
      mockLoadCarlRules.mockReturnValueOnce(createResult(['cached']));

      const first = cache.getCachedRules({ sessionId: 'session-a' });
      const second = cache.getCachedRules({ sessionId: 'session-a' });

      expect(mockLoadCarlRules).toHaveBeenCalledTimes(1);
      expect(second).toBe(first);
    });

    it('getCachedRules reloads when sessionId changes', () => {
      const cache = loadRuleCacheModule();
      mockLoadCarlRules.mockReturnValueOnce(createResult(['alpha']));

      cache.getCachedRules({ sessionId: 'session-a' });

      mockLoadCarlRules.mockReturnValueOnce(createResult(['beta']));
      const result = cache.getCachedRules({ sessionId: 'session-b' });

      expect(mockLoadCarlRules).toHaveBeenCalledTimes(2);
      expect(result.domains).toEqual(['beta']);
    });

    it('getCachedRules reloads when project opt-in flag changes', () => {
      const cache = loadRuleCacheModule();
      mockLoadCarlRules.mockReturnValueOnce(createResult(['alpha']));

      cache.getCachedRules({ sessionId: 'session-a', projectOptIn: true });

      mockLoadCarlRules.mockReturnValueOnce(createResult(['beta']));
      const result = cache.getCachedRules({ sessionId: 'session-a', projectOptIn: false });

      expect(mockLoadCarlRules).toHaveBeenCalledTimes(2);
      expect(result.domains).toEqual(['beta']);
    });

    it('getCachedRules reloads when overrides change', () => {
      const cache = loadRuleCacheModule();
      mockLoadCarlRules.mockReturnValueOnce(createResult(['alpha']));

      cache.getCachedRules({
        overrides: { projectCarlDir: '/tmp/project-a' },
        sessionId: 'session-a',
      });

      mockLoadCarlRules.mockReturnValueOnce(createResult(['beta']));
      const result = cache.getCachedRules({
        overrides: { projectCarlDir: '/tmp/project-b' },
        sessionId: 'session-a',
      });

      expect(mockLoadCarlRules).toHaveBeenCalledTimes(2);
      expect(result.domains).toEqual(['beta']);
    });

    it('getCacheMeta reflects cache state after load', () => {
      const cache = loadRuleCacheModule();
      mockLoadCarlRules.mockReturnValueOnce(createResult(['alpha']));

      cache.getCachedRules({ sessionId: 'session-a' });
      const meta = cache.getCacheMeta();

      expect(meta.cached).toBe(true);
      expect(meta.dirty).toBe(false);
      expect(meta.lastLoadedAt).not.toBeNull();
    });

    it('resetRulesCache clears cache and dirty flag', () => {
      const cache = loadRuleCacheModule();
      mockLoadCarlRules.mockReturnValueOnce(createResult(['alpha']));

      cache.getCachedRules({ sessionId: 'session-a' });
      cache.markRulesDirty();

      cache.resetRulesCache();
      const meta = cache.getCacheMeta();

      expect(meta.cached).toBe(false);
      expect(meta.dirty).toBe(false);
      expect(meta.lastLoadedAt).toBeNull();
    });
  });

  describe('session opt-in + warning guard', () => {
    it('setSessionProjectOptIn/getSessionProjectOptIn default to true and update per session', () => {
      const cache = loadRuleCacheModule();

      expect(cache.getSessionProjectOptIn('session-a')).toBe(true);
      cache.setSessionProjectOptIn('session-a', false);
      cache.setSessionProjectOptIn('session-b', true);

      expect(cache.getSessionProjectOptIn('session-a')).toBe(false);
      expect(cache.getSessionProjectOptIn('session-b')).toBe(true);
    });

    it('hasSessionWarned/markSessionWarned/clearSessionWarning behave as session-scoped guard', () => {
      const cache = loadRuleCacheModule();

      expect(cache.hasSessionWarned('session-a')).toBe(false);

      cache.markSessionWarned('session-a');
      expect(cache.hasSessionWarned('session-a')).toBe(true);

      cache.clearSessionWarning('session-a');
      expect(cache.hasSessionWarned('session-a')).toBe(false);
    });
  });
});
