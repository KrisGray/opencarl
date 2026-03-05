# Dockerfile for OpenCode E2E Testing with CARL Plugin
FROM node:20

# Set working directory
WORKDIR /workspace

# Install OpenCode CLI globally (lock to v1.2.15 for reproducibility)
RUN npm install -g @opencode-ai/cli@1.2.15

# Copy plugin source
COPY . /workspace

# Install plugin dependencies
RUN npm ci

# Build plugin
RUN npm run build

# Create non-root user for security
RUN useradd -m -u 1000 testuser && chown -R testuser:testuser /workspace

# Switch to non-root user
USER testuser

# Default command
CMD ["bash"]
