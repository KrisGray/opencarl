import type { ParsedManifest, ManifestDomainConfig } from '../../src/carl/validate';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Builder interface for constructing test manifests
 */
export interface ManifestBuilder {
  addDomain(name: string, config: Partial<ManifestDomainConfig>): ManifestBuilder;
  setDevmode(value: boolean): ManifestBuilder;
  setGlobalExclude(keywords: string[]): ManifestBuilder;
  build(): ParsedManifest;
  buildContent(): string;
  writeToFile(dir: string, filename?: string): string;
}

/**
 * Internal state for manifest builder
 */
class ManifestBuilderImpl implements ManifestBuilder {
  private domains: Record<string, ManifestDomainConfig> = {};
  private devmode: boolean = false;
  private globalExclude: string[] = [];
  private warnings: any[] = [];

  addDomain(name: string, config: Partial<ManifestDomainConfig>): ManifestBuilder {
    this.domains[name] = {
      name,
      state: config.state ?? false,
      recall: config.recall ?? [],
      exclude: config.exclude ?? [],
      alwaysOn: config.alwaysOn ?? false,
    };
    return this;
  }

  setDevmode(value: boolean): ManifestBuilder {
    this.devmode = value;
    return this;
  }

  setGlobalExclude(keywords: string[]): ManifestBuilder {
    this.globalExclude = keywords;
    return this;
  }

  build(): ParsedManifest {
    return {
      domains: this.domains,
      devmode: this.devmode,
      globalExclude: this.globalExclude,
      warnings: this.warnings,
      isValid: Object.keys(this.domains).length > 0,
    };
  }

  buildContent(): string {
    const lines: string[] = [];

    // Add domain entries
    for (const [domainName, config] of Object.entries(this.domains)) {
      lines.push(`${domainName}_STATE=${config.state ? 'active' : 'inactive'}`);
      lines.push(`${domainName}_RECALL=${config.recall.join(', ')}`);
      lines.push(`${domainName}_EXCLUDE=${config.exclude.join(', ')}`);
      lines.push(`${domainName}_ALWAYS_ON=${config.alwaysOn.toString()}`);
    }

    // Add global entries
    if (this.globalExclude.length > 0) {
      lines.push(`GLOBAL_EXCLUDE=${this.globalExclude.join(', ')}`);
    }

    lines.push(`DEVMODE=${this.devmode.toString()}`);

    return lines.join('\n') + '\n';
  }

  writeToFile(dir: string, filename: string = 'manifest'): string {
    const filePath = path.join(dir, filename);
    const content = this.buildContent();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
  }
}

/**
 * Create a manifest builder for constructing test manifests
 */
export function createManifestBuilder(): ManifestBuilder {
  return new ManifestBuilderImpl();
}

/**
 * Create a test manifest with optional overrides
 */
export function createTestManifest(overrides?: Partial<ParsedManifest>): ParsedManifest {
  const defaults: ParsedManifest = {
    domains: {
      DEVELOPMENT: {
        name: 'DEVELOPMENT',
        state: true,
        recall: ['code', 'debug'],
        exclude: [],
        alwaysOn: false,
      },
    },
    devmode: false,
    globalExclude: [],
    warnings: [],
    isValid: true,
  };

  return {
    ...defaults,
    ...overrides,
    domains: overrides?.domains ?? defaults.domains,
  };
}

/**
 * Create a temporary manifest file and return its path
 */
export function createTestManifestPath(content: string, tmpDir: string): string {
  const filePath = path.join(tmpDir, 'test.manifest');
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}
