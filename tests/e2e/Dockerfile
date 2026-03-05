# Dockerfile for OpenCode E2E Testing with CARL Plugin
FROM node:20

# Set working directory
WORKDIR /workspace

# Install mock OpenCode CLI for E2E testing
# Note: @opencode-ai/cli is not a public npm package.
# This mock CLI simulates OpenCode behavior for testing CARL plugin.
COPY tests/e2e/mock-opencode-cli /usr/local/bin/carl
RUN chmod +x /usr/local/bin/carl

# Copy plugin source
COPY . /workspace

# Install plugin dependencies
RUN npm ci

# Build plugin
RUN npm run build

# Keep container running for testing
CMD ["tail", "-f", "/dev/null"]
