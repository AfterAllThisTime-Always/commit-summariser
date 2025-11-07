# Commit Summariser

AI-powered commit summarization for VS Code using GitHub Copilot CLI. Right-click any commit in Git Graph and get an instant AI-generated summary!

## 🚀 Features

- 🤖 **AI-Powered Summaries**: Automatically generate detailed explanations of git commits
- 🎯 **Git Graph Integration**: Right-click commits directly in the Git Graph view
- ⚡ **Quick Access**: Use Command Palette to summarize recent commits
- 🔧 **Configurable**: Use GitHub Copilot CLI or your preferred AI tool

## 📦 Prerequisites

### GitHub Copilot CLI (Recommended)

The new standalone GitHub Copilot CLI is the recommended option.

```bash
# Install globally via npm
npm install -g @githubnext/github-copilot-cli

# Authenticate with GitHub
github-copilot-cli auth
```

> **⚠️ Important**: The old `gh copilot` extension has been deprecated. Use the new standalone CLI instead.

### Alternative: Custom AI Tool

Configure any AI CLI tool in VS Code settings:
- **Ollama** (local): `ollama run llama2`
- **OpenAI CLI**: `openai api chat.completions.create -m gpt-4`
- **Claude CLI**: `claude`

## Usage

### Method 1: Git Graph (Right-click)
1. Open Git Graph view (`View → Git Graph`)
2. Right-click any commit → **"Summarize Commit"**
3. View AI summary in new tab

### Method 2: Command Palette
1. `Cmd+Shift+P` → "Summarize Commit"
2. Select a commit
3. View summary

## Configuration

**Settings**: `commitSummariser.aiCommand`

Leave empty to auto-detect GitHub Copilot CLI, or set a custom command:

```json
"commitSummariser.aiCommand": "ollama run llama2"
```

## Requirements

- Git installed
- Git Graph extension
- GitHub Copilot CLI or custom AI tool

