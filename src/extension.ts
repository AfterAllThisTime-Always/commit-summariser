// import * as vscode from 'vscode';
// import { exec } from 'child_process';
// import util from 'util';

// const execPromise = util.promisify(exec);

// export function activate(context: vscode.ExtensionContext) {
//   const disposable = vscode.commands.registerCommand('commit-summariser.summariseCommit', async () => {
//     try {
//       // Prompt user for commit hash
//       const commitHash = await vscode.window.showInputBox({
//         prompt: 'Enter commit hash (leave blank for latest)',
//       });

//       const hash = commitHash || 'HEAD';
//       const { stdout } = await execPromise(`git show ${hash} --stat --pretty=medium`);

//       vscode.window.withProgress(
//         {
//           location: vscode.ProgressLocation.Notification,
//           title: 'Summarizing commit...',
//           cancellable: false,
//         },
//         async () => {
//           const summary = await getAISummary(stdout);

//           const doc = await vscode.workspace.openTextDocument({
//             content: summary,
//             language: 'markdown',
//           });
//           vscode.window.showTextDocument(doc, { preview: false });
//         }
//       );
//     } catch (err: any) {
//       vscode.window.showErrorMessage(`Error: ${err.message}`);
//     }
//   });

//   context.subscriptions.push(disposable);
// }

// async function getAISummary(commitText: string): Promise<string> {
//   // Replace this with your Copilot or OpenAI call
//   const { stdout } = await execPromise(`gh copilot explain "${commitText}"`);
//   return stdout;
// }

// export function deactivate() {}








// import * as vscode from 'vscode';
// import { exec } from 'child_process';
// import util from 'util';

// const execPromise = util.promisify(exec);

// export function activate(context: vscode.ExtensionContext) {
//   const disposable = vscode.commands.registerCommand('commit-summariser.summariseCommit', async (args) => {
//     try {
//       // Attempt to get commit hash from args if passed by the menu
//       let commitHash: string | undefined;

//       if (args && typeof args === 'object' && (args as any).commitHash) {
//         commitHash = (args as any).commitHash;
//       }

//       if (!commitHash) {
//         // No hash passed — present QuickPick list of recent commits
//         const commits = await getRecentCommits();
//         const pick = await vscode.window.showQuickPick(
//           commits.map(c => ({ label: `${c.hash} — ${c.message}`, hash: c.hash })),
//           { placeHolder: 'Select a commit to summarise' }
//         );
//         if (!pick) {
//           return; // cancelled
//         }
//         commitHash = pick.hash;
//       }

//       // Retrieve commit details
//       const { stdout: commitDetails } = await execPromise(`git show ${commitHash} --stat --pretty=medium`);

//       // Summarise via your Copilot/AI API
//       vscode.window.withProgress(
//         { location: vscode.ProgressLocation.Notification, title: `Summarising commit ${commitHash}...` },
//         async () => {
//           const summary = await getAISummary(commitDetails);
//           const doc = await vscode.workspace.openTextDocument({ content: summary, language: 'markdown' });
//           vscode.window.showTextDocument(doc, { preview: false });
//         }
//       );
//     } catch (err: any) {
//       vscode.window.showErrorMessage(`Error summarising commit: ${err.message}`);
//     }
//   });

//   context.subscriptions.push(disposable);
// }

// async function getRecentCommits(): Promise<Array<{hash:string, message:string}>> {
//   const { stdout } = await execPromise(`git log --pretty=format:"%h|%s" -n 20`);
//   return stdout
//     .trim()
//     .split('\n')
//     .map(line => {
//       const [hash, ...rest] = line.split('|');
//       const message = rest.join('|');
//       return { hash, message };
//     });
// }

// async function getAISummary(commitText: string): Promise<string> {
//   // Replace this with your actual AI/Copilot command or API call.
//   // For example:
//   const { stdout } = await execPromise(`gh copilot explain "${commitText.replace(/"/g, '\\"')}"`);
//   return stdout;
// }

// export function deactivate() {}


import * as vscode from "vscode";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function activate(context: vscode.ExtensionContext) {
  console.log("✅ Commit Summariser activated");

  // -----------------------------------
  // 1️⃣ Register your Summarize Commit command
  // -----------------------------------
  const disposable = vscode.commands.registerCommand(
    "commit-summariser.summariseCommit",
    async (args?: { commitHash?: string }) => {
      const workspace = vscode.workspace.workspaceFolders?.[0];
      if (!workspace) {
        vscode.window.showErrorMessage("No workspace open. Please open a Git project first.");
        return;
      }

      const cwd = workspace.uri.fsPath;
      let commitHash = args?.commitHash;

      try {
        // Confirm repo
        await execPromise("git rev-parse --is-inside-work-tree", { cwd });

        // If no hash provided (manual trigger), show picker
        if (!commitHash) {
          const commits = await getRecentCommits(cwd);
          const pick = await vscode.window.showQuickPick(
            commits.map((c) => ({
              label: `${c.hash} — ${c.message}`,
              hash: c.hash,
            })),
            { placeHolder: "Select a commit to summarise" }
          );
          if (!pick) return;
          commitHash = pick.hash;
        }

        const { stdout: commitDetails } = await execPromise(
          `git show ${commitHash} --stat --pretty=medium`,
          { cwd }
        );

        vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: `Summarising commit ${commitHash}…` },
          async () => {
            const summary = await getAISummary(commitDetails);
            const doc = await vscode.workspace.openTextDocument({
              content: summary,
              language: "markdown",
            });
            vscode.window.showTextDocument(doc, { preview: false });
          }
        );
      } catch (err: any) {
        vscode.window.showErrorMessage(`Error summarising commit: ${err.message}`);
      }
    }
  );

  context.subscriptions.push(disposable);

  // -----------------------------------
  // 2️⃣ 🔗 THIS IS THE GIT GRAPH INTEGRATION PART
  // -----------------------------------
  try {
    const gitGraphExt = vscode.extensions.getExtension("mhutchie.git-graph");
    if (gitGraphExt) {
      if (!gitGraphExt.isActive) {
        console.log("🔄 Activating Git Graph extension...");
        await gitGraphExt.activate();
      }

      const gitGraphApi = gitGraphExt.exports;
      if (gitGraphApi?.registerGlobalExternalAction) {
        gitGraphApi.registerGlobalExternalAction(
          "Summarize Commit",
          async (data: { commitHash: string }) => {
            console.log(`🧩 Summarising from Git Graph: ${data.commitHash}`);
            vscode.commands.executeCommand("commit-summariser.summariseCommit", {
              commitHash: data.commitHash,
            });
          }
        );

        vscode.window.showInformationMessage("✅ Commit Summariser registered with Git Graph");
        console.log("✅ Commit Summariser registered with Git Graph");
      } else {
        vscode.window.showWarningMessage("⚠️ Git Graph API not found — update Git Graph to ≥ 1.30.0.");
        console.log("⚠️ Git Graph API not found");
      }
    } else {
      vscode.window.showWarningMessage("ℹ️ Git Graph not installed in this window.");
      console.log("ℹ️ Git Graph not installed in this Dev Host");
    }
  } catch (err: any) {
    console.error("❌ Error integrating with Git Graph:", err.message);
  }
  // -----------------------------------
  // End of Git Graph integration part
  // -----------------------------------
}

async function getRecentCommits(cwd: string) {
  const { stdout } = await execPromise(`git log --pretty=format:"%h|%s" -n 20`, { cwd });
  return stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, message] = line.split("|");
      return { hash, message };
    });
}

async function getAISummary(commitText: string): Promise<string> {
  try {
    const { stdout } = await execPromise(`gh copilot explain "${commitText.replace(/"/g, '\\"')}"`);
    return stdout || "No summary returned.";
  } catch (err: any) {
    return `⚠️ Error generating summary: ${err.message}`;
  }
}

export function deactivate() {}


