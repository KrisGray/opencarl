function loadSignalStoreModule(): typeof import('../../../src/opencarl/signal-store') {
  let moduleExports: typeof import('../../../src/opencarl/signal-store');
  jest.isolateModules(() => {
    moduleExports = require('../../../src/opencarl/signal-store');
  });
  return moduleExports!;
}

describe('signal-store.ts', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('recordPromptSignals / getSessionPromptText', () => {
    it('recordPromptSignals stores last prompt and returns normalized tokens in getSessionSignals', () => {
      const store = loadSignalStoreModule();

      store.recordPromptSignals('session-a', 'Hello World');

      expect(store.getSessionPromptText('session-a')).toBe('Hello World');

      const signals = store.getSessionSignals('session-a');
      expect(signals.promptTokens).toEqual(['hello', 'world']);
      expect(signals.promptHistory).toEqual(
        expect.arrayContaining(['hello', 'world'])
      );
    });

    it('records last prompt even when token list is empty', () => {
      const store = loadSignalStoreModule();

      store.recordPromptSignals('session-a', '   ');

      expect(store.getSessionPromptText('session-a')).toBe('   ');

      const signals = store.getSessionSignals('session-a');
      expect(signals.promptTokens).toEqual([]);
      expect(signals.promptHistory).toEqual([]);
    });

    it('returns last prompt tokens while keeping prompt history across entries', () => {
      const store = loadSignalStoreModule();

      store.recordPromptSignals('session-a', 'first prompt');
      store.recordPromptSignals('session-a', 'second prompt');

      const signals = store.getSessionSignals('session-a');

      expect(signals.promptTokens).toEqual(['second', 'prompt']);
      expect(signals.promptHistory).toEqual(
        expect.arrayContaining(['first', 'second', 'prompt'])
      );
    });
  });

  describe('recordToolSignals / getSessionSignals', () => {
    it('recordToolSignals collects tool tokens and path tokens from nested args containing paths', () => {
      const store = loadSignalStoreModule();

      store.recordToolSignals('session-a', 'ReadFile', {
        filePath: '/Users/kris/Repos/opencarl/README.md',
        nested: {
          list: ['../foo/bar.txt', 'C:\\Temp\\notes.md'],
          deeper: { value: 'docs/guide.md' },
        },
        other: 123,
      });

      const signals = store.getSessionSignals('session-a');

      expect(signals.toolTokens).toContain('readfile');
      expect(signals.pathTokens).toEqual(
        expect.arrayContaining(['readme.md', 'bar.txt', 'notes.md', 'guide.md'])
      );
    });

    it('normalizes tool tokens and keeps unique entries across calls', () => {
      const store = loadSignalStoreModule();

      store.recordToolSignals('session-a', 'RunTask');
      store.recordToolSignals('session-a', 'run-task');

      const signals = store.getSessionSignals('session-a');

      expect(signals.toolTokens).toContain('runtask');
      expect(signals.toolTokens).toContain('run-task');
    });
  });

  describe('recordCommandSignals / consumeCommandSignals', () => {
    it('recordCommandSignals + consumeCommandSignals returns most recent entry and empties it', () => {
      const store = loadSignalStoreModule();

      store.recordCommandSignals('session-a', ['cmd-first']);
      store.recordCommandSignals('session-a', ['cmd-second', 'cmd-third']);

      expect(store.consumeCommandSignals('session-a')).toEqual([
        'cmd-second',
        'cmd-third',
      ]);
      expect(store.consumeCommandSignals('session-a')).toEqual(['cmd-first']);
      expect(store.consumeCommandSignals('session-a')).toEqual([]);
    });

    it('consumeCommandSignals returns empty array when no commands recorded', () => {
      const store = loadSignalStoreModule();

      expect(store.consumeCommandSignals('session-a')).toEqual([]);
    });
  });

  describe('empty session guard', () => {
    it('empty sessionId returns empty defaults without throwing', () => {
      const store = loadSignalStoreModule();

      store.recordPromptSignals('', 'Should not crash');
      store.recordToolSignals('', 'Read', { filePath: '/tmp/file.txt' });
      store.recordCommandSignals('', ['noop']);

      expect(store.getSessionPromptText('')).toBe('');
      expect(store.consumeCommandSignals('')).toEqual([]);
      expect(store.getSessionSignals('')).toEqual({
        promptTokens: [],
        promptHistory: [],
        toolTokens: [],
        pathTokens: [],
      });
    });
  });

  describe('path token extraction', () => {
    it('does not emit path tokens when tool args contain no paths', () => {
      const store = loadSignalStoreModule();

      store.recordToolSignals('session-a', 'Notify', {
        message: 'No path here',
        value: 42,
        nested: { flag: true },
      });

      const signals = store.getSessionSignals('session-a');

      expect(signals.toolTokens).toContain('notify');
      expect(signals.pathTokens).toEqual([]);
    });
  });

  describe('bounded history', () => {
    it('keeps only the last 20 prompt entries', () => {
      const store = loadSignalStoreModule();

      for (let index = 1; index <= 25; index += 1) {
        store.recordPromptSignals('session-a', `token-${index}`);
      }

      const signals = store.getSessionSignals('session-a');

      expect(signals.promptHistory).not.toContain('token-1');
      expect(signals.promptHistory).not.toContain('token-2');
      expect(signals.promptHistory).not.toContain('token-3');
      expect(signals.promptHistory).not.toContain('token-4');
      expect(signals.promptHistory).not.toContain('token-5');
      expect(signals.promptHistory).toContain('token-25');
    });

    it('keeps only the last 20 tool entries for token history', () => {
      const store = loadSignalStoreModule();

      for (let index = 1; index <= 25; index += 1) {
        store.recordToolSignals('session-a', `tool-${index}`);
      }

      const signals = store.getSessionSignals('session-a');

      expect(signals.toolTokens).not.toContain('tool-1');
      expect(signals.toolTokens).not.toContain('tool-2');
      expect(signals.toolTokens).not.toContain('tool-3');
      expect(signals.toolTokens).not.toContain('tool-4');
      expect(signals.toolTokens).not.toContain('tool-5');
      expect(signals.toolTokens).toContain('tool-25');
    });
  });
});
