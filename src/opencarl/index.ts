/**
 * OpenCARL - Dynamic Rule Injection for OpenCode
 *
 * @packageDocumentation
 */

// Re-export all modules for TypeDoc documentation generation
// This barrel file allows TypeDoc to merge all exports into a single module
// where @category tags can organize the navigation sidebar

export * from './types';
export * from './loader';
export * from './matcher';
export * from './injector';
export * from './signal-store';
export * from './errors';
export * from './command-parity';
export * from './context-brackets';
export * from './debug';
export * from './duplicate-detector';
export * from './help-text';
export * from './rule-cache';
export * from './session-overrides';
export * from './setup';
export * from './validate';
