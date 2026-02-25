# Stack Research

**Domain:** OpenCode plugin development (prompt interception + instruction injection)
**Researched:** 2026-02-25
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| OpenCode Plugin API (`@opencode-ai/plugin`) | 1.2.14 | Type-safe plugin hooks (e.g., `tui.prompt.append`, message hooks) for intercepting prompts and injecting instructions | Official plugin surface; supports TypeScript and exposes the exact hook points OpenCode uses for prompt flow |
| OpenCode SDK (`@opencode-ai/sdk`) | 1.2.14 | Typed client for logging and session interactions inside plugins | First-party SDK used in plugin context; keeps API use stable and typed |
| TypeScript | 5.9.3 | Authoring plugins with types, IDE support, and safer hook contracts | OpenCode docs show TS-first plugin examples and types are published for the plugin API |
| Bun | 1.3.9 | Runtime + package manager OpenCode uses to install local plugin deps and expose `$` shell API | OpenCode installs plugin deps with Bun and provides Bun shell primitives in plugin context |
| Node.js (LTS) | 24.14.0 | External tooling compatibility (tsc, linting, CI checks) when running outside OpenCode | Aligns with current LTS for CI/dev scripts without diverging from OpenCode’s Bun runtime |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 4.1.8 | Schema validation for tool args and input guards | Needed when defining custom tools via `tool()` or validating plugin inputs |
| shescape | 2.1.0 | Shell escaping helper | Use in `tool.execute.before` or shell-related hooks to avoid injection issues |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `bun install` (Bun 1.3.9) | Install plugin dependencies for local plugins | OpenCode runs `bun install` in `.opencode/` at startup |
| `tsc` (TypeScript 5.9.3) | Typecheck plugins in CI | Keep `noEmit` for plugin dev since OpenCode loads TS directly |

## Installation

```bash
# Core
bun add @opencode-ai/plugin@1.2.14 @opencode-ai/sdk@1.2.14

# Supporting
bun add zod@4.1.8 shescape@2.1.0

# Dev dependencies
bun add -d typescript@5.9.3
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Local plugin files in `.opencode/plugins/` | Publish to npm and reference in `opencode.json` | If you need versioned distribution across many projects/teams |
| TypeScript plugins | JavaScript plugins | For quick prototyping or when avoiding a TS toolchain |
| Bun-based dependency install | npm/pnpm/yarn in repo | Only if OpenCode’s startup install is disabled and you manage deps externally |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Directly patching OpenCode core or binary | Fragile and breaks with updates; bypasses official hooks | Plugin hooks via `@opencode-ai/plugin` |
| CommonJS (`require`, `module.exports`) plugins | OpenCode plugin packages are ESM; CJS interop adds friction | ESM/TypeScript modules |
| Shell wrappers to prepend prompt text | Bypasses OpenCode’s prompt pipeline and is hard to scope | `tui.prompt.append` or message hooks in plugins |

## Stack Patterns by Variant

**If you only need local project behavior:**
- Use `.opencode/plugins/*.ts` with a `.opencode/package.json` for deps
- Because OpenCode loads local plugins directly at startup

**If you need cross-project distribution:**
- Publish an npm package and reference it in `opencode.json`
- Because OpenCode installs npm plugins automatically with Bun

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@opencode-ai/plugin@1.2.14` | `@opencode-ai/sdk@1.2.14` | Plugin package depends on the matching SDK version |
| `@opencode-ai/plugin@1.2.14` | `zod@4.1.8` | Zod is the schema engine used by `tool()` helper |
| `typescript@5.9.3` | `node>=14.17` | TS engine requirement; use Node 24 LTS for CI alignment |

## Sources

- https://opencode.ai/docs/plugins/ — plugin load paths, hooks, Bun usage, TS support
- https://registry.npmjs.org/@opencode-ai/plugin/latest — 1.2.14
- https://registry.npmjs.org/@opencode-ai/sdk/latest — 1.2.14
- https://registry.npmjs.org/typescript/latest — 5.9.3
- https://nodejs.org/en/download — Node.js 24.14.0 LTS
- https://bun.sh/ — Bun 1.3.9

---
*Stack research for: OpenCode plugin development (prompt interception + instruction injection)*
*Researched: 2026-02-25*
