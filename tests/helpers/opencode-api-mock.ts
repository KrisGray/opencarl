/**
 * OpenCode API mock helpers for integration tests.
 *
 * Provides simulation of the OpenCode plugin client API and hook I/O structures.
 */

/**
 * Mock OpenCode client with session messages and token telemetry.
 */
export interface MockOpenCodeClient {
  session?: {
    messages?: (input: { path: { id: string } }) => Promise<unknown>;
  };
}

/**
 * Mock hook input matching @opencode-ai/plugin hook input structure.
 */
export interface MockHooksInput {
  sessionID: string;
  message?: {
    role?: string;
    content?: string | Array<string | { type?: string; text?: string }>;
  };
  parts?: Array<{
    type?: string;
    text?: string;
    value?: string;
    content?: string;
  }>;
  tool?: string;
  callID?: string;
  args?: Record<string, unknown>;
  command?: string;
  model?: {
    providerID: string;
    modelID: string;
  };
  client?: MockOpenCodeClient;
}

/**
 * Mock hook output matching @opencode-ai/plugin hook output structure.
 */
export interface MockHooksOutput {
  system: string[];
  message?: {
    role?: string;
    content?: string | Array<string | { type?: string; text?: string }>;
  };
  parts?: Array<{
    type?: string;
    text?: string;
    value?: string;
    content?: string;
  }>;
  args?: Record<string, unknown>;
}

/**
 * Create a mock OpenCode client for integration tests.
 *
 * @param sessionId - The session ID to simulate
 * @param messages - Optional mock messages with token telemetry
 * @returns Mock client with session.messages method
 *
 * @example
 * ```ts
 * const client = createMockOpenCodeClient("test-session", [
 *   { info: { tokens: { input_tokens: 1000, cache_read_input_tokens: 500 } } }
 * ]);
 * ```
 */
export function createMockOpenCodeClient(
  sessionId: string,
  messages?: Array<{ info?: { tokens?: { input_tokens?: number; cache_read_input_tokens?: number; output_tokens?: number } } }>
): MockOpenCodeClient {
  const mockMessages = messages ?? [];

  return {
    session: {
      messages: jest.fn().mockResolvedValue({
        data: mockMessages,
      }),
    },
  };
}

/**
 * Create mock hook input for testing OpenCode hooks.
 *
 * @param overrides - Partial override of default input values
 * @returns Mock hook input structure
 *
 * @example
 * ```ts
 * const input = createMockHooksInput({
 *   sessionID: "test-session",
 *   message: { role: "user", content: "Write some code" }
 * });
 * ```
 */
export function createMockHooksInput(overrides?: Partial<MockHooksInput>): MockHooksInput {
  const defaults: MockHooksInput = {
    sessionID: "test-session-id",
    message: {
      role: "user",
      content: "Test message",
    },
    parts: [],
    tool: undefined,
    callID: undefined,
    args: undefined,
    command: undefined,
    model: {
      providerID: "test-provider",
      modelID: "test-model",
    },
    client: undefined,
  };

  const result = { ...defaults, ...overrides };

  // Ensure model is always defined
  if (!result.model) {
    result.model = defaults.model;
  }

  return result;
}

/**
 * Create mock hook output for testing OpenCode hooks.
 *
 * @param overrides - Partial override of default output values
 * @returns Mock hook output structure
 *
 * @example
 * ```ts
 * const output = createMockHooksOutput({
 *   system: [],
 *   message: { role: "user", content: "Test message" }
 * });
 * ```
 */
export function createMockHooksOutput(overrides?: Partial<MockHooksOutput>): MockHooksOutput {
  return {
    system: [],
    message: undefined,
    parts: undefined,
    args: undefined,
    ...overrides,
  };
}

/**
 * Create complete mock hook context with input and output.
 *
 * @param sessionId - Session ID for the test
 * @returns Object with input and output mock structures
 *
 * @example
 * ```ts
 * const { input, output } = createMockHookContext("test-session");
 * ```
 */
export function createMockHookContext(sessionId: string): {
  input: MockHooksInput;
  output: MockHooksOutput;
} {
  return {
    input: createMockHooksInput({ sessionID: sessionId }),
    output: createMockHooksOutput(),
  };
}
