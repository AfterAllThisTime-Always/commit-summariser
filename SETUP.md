# Setup Guide for Commit Summariser

## Quick Start

### Step 1: Install GitHub Copilot CLI

The old `gh copilot` extension is **deprecated**. Use the new standalone CLI:

```bash
npm install -g @githubnext/github-copilot-cli
github-copilot-cli auth
```

### Step 2: Install Git Graph Extension

In VS Code:
1. Press `Cmd+Shift+X` (or `Ctrl+Shift+X`)
2. Search for "Git Graph"
3. Install the extension by mhutchie

### Step 3: Test the Extension

1. Press `F5` to run this extension in debug mode
2. Open a Git repository in the new window
3. Open Git Graph view: `View → Git Graph`
4. Right-click any commit → "Summarize Commit"

## Troubleshooting

### Error: "command not found: github-copilot-cli"

**Fix:**
```bash
# Check if npm global bin is in PATH
npm config get prefix

# If not in PATH, add it to your shell profile:
# For zsh (macOS default):
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.zshrc
source ~/.zshrc

# For bash:
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
which github-copilot-cli
```

### Error: "GitHub Copilot CLI not found or deprecated"

This means the extension couldn't find the CLI. Options:

1. **Install the new CLI** (recommended):
   ```bash
   npm install -g @githubnext/github-copilot-cli
   github-copilot-cli auth
   ```

2. **Use a custom AI tool**:
   - Open VS Code Settings
   - Search for "commitSummariser.aiCommand"
   - Set to your preferred tool (e.g., `ollama run llama2`)

### Git Graph Integration Not Working

1. Make sure Git Graph is installed and enabled
2. Open Git Graph view manually first: `View → Git Graph`
3. Reload VS Code: `Cmd+Shift+P` → "Reload Window"
4. Check the "Commit Summariser Logs" output channel for details

## Alternative AI Backends

If you don't want to use GitHub Copilot CLI, you can use other AI tools:

### Using Ollama (Free, Local)

```bash
# Install Ollama
brew install ollama  # macOS
# or visit https://ollama.ai

# Pull a model
ollama pull llama2

# Configure in VS Code settings:
"commitSummariser.aiCommand": "ollama run llama2"
```

### Using OpenAI CLI

```bash
pip install openai-cli
export OPENAI_API_KEY="your-key-here"

# Configure in VS Code settings:
"commitSummariser.aiCommand": "openai api chat.completions.create -m gpt-4"
```

## Development

To work on this extension:

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run in debug mode
Press F5 in VS Code
```

## Support

For issues or questions:
- Check the output channel: `View → Output → Commit Summariser Logs`
- Review error messages in the generated summary files
- Open an issue on GitHub
