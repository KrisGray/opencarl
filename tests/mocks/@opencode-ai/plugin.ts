// Mock for @opencode-ai/plugin module to avoid ES module import issues
export type Hooks = {
  'chat.message'?: (input: any, output: any) => Promise<void>;
  'tool.execute.before'?: (input: any, output: any) => Promise<void>;
  'command.execute.before'?: (input: any, output: any) => Promise<void>;
  'experimental.chat.system.transform'?: (input: any, output: any) => Promise<void>;
};
