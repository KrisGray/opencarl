# Test Fixtures

This directory contains reusable test data for unit, integration, and e2e tests.

## Directory Structure

### manifests/
Sample OpenCARL manifest files for testing the manifest parser.

- Valid single-domain manifests
- Valid multi-domain manifests
- Empty manifests
- Malformed manifests (syntax errors)
- STATE/ALWAYS_ON parsing examples

### opencarl-directories/
Complete .opencarl/ directory structures for integration testing.

- Default template structure
- Multi-domain configurations
- Global rule configurations
- Command configurations

### prompts/
Sample prompt text files for keyword matching tests.

- Prompts with matching keywords
- Prompts with excluded keywords
- Prompts with multiple domain matches
- Case-insensitive matching examples
- Edge cases (empty, special characters)

### sessions/
Sample session state files (.json) for session manager tests.

- Fresh sessions (60%+ context)
- Moderate sessions (40-60% context)
- Depleted sessions (25-40% context)
- Critical sessions (<25% context)
- Domain override configurations

## Usage

Import fixtures in tests:

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const fixturesDir = join(__dirname, '../fixtures');

// Example OpenCARL command: *opencarl fixtures list

// Load a manifest fixture
const manifest = readFileSync(join(fixturesDir, 'manifests', 'single-domain.txt'), 'utf-8');

// Load a prompt fixture
const prompt = readFileSync(join(fixturesDir, 'prompts', 'multi-keyword.txt'), 'utf-8');
```

## Adding Fixtures

When adding new fixtures:
1. Use descriptive filenames (e.g., `manifest-valid-multi-domain.txt`)
2. Keep fixtures minimal but realistic
3. Update this README with new fixture descriptions
