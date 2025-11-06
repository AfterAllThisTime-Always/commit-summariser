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





// import * as vscode from "vscode";
// import { exec } from "child_process";
// import util from "util";

// const execPromise = util.promisify(exec);

// export async function activate(context: vscode.ExtensionContext) {
//   vscode.window.showInformationMessage('✅ Commit Summariser activated!');
//   console.log('✅ Commit Summariser activated');
//   const output = vscode.window.createOutputChannel("Commit Summariser");
//   output.appendLine("✅ Commit Summariser activated");
//   output.show(true); 

//   // -----------------------------------
//   // 1️⃣ Register your Summarize Commit command
//   // -----------------------------------
//   const disposable = vscode.commands.registerCommand(
//     "commit-summariser.summariseCommit",
//     async (args?: { commitHash?: string }) => {
//       const workspace = vscode.workspace.workspaceFolders?.[0];
//       if (!workspace) {
//         vscode.window.showErrorMessage("No workspace open. Please open a Git project first.");
//         return;
//       }

//       const cwd = workspace.uri.fsPath;
//       let commitHash = args?.commitHash;

//       try {
//         // Confirm repo
//         await execPromise("git rev-parse --is-inside-work-tree", { cwd });

//         // If no hash provided (manual trigger), show picker
//         if (!commitHash) {
//           const commits = await getRecentCommits(cwd);
//           const pick = await vscode.window.showQuickPick(
//             commits.map((c) => ({
//               label: `${c.hash} — ${c.message}`,
//               hash: c.hash,
//             })),
//             { placeHolder: "Select a commit to summarise" }
//           );
//           if (!pick) return;
//           commitHash = pick.hash;
//         }

//         const { stdout: commitDetails } = await execPromise(
//           `git show ${commitHash} --stat --pretty=medium`,
//           { cwd }
//         );

//         vscode.window.withProgress(
//           { location: vscode.ProgressLocation.Notification, title: `Summarising commit ${commitHash}…` },
//           async () => {
//             const summary = await getAISummary(commitDetails);
//             const doc = await vscode.workspace.openTextDocument({
//               content: summary,
//               language: "markdown",
//             });
//             vscode.window.showTextDocument(doc, { preview: false });
//           }
//         );
//       } catch (err: any) {
//         vscode.window.showErrorMessage(`Error summarising commit: ${err.message}`);
//       }
//     }
//   );

//   context.subscriptions.push(disposable);

//   // -----------------------------------
//   // 2️⃣ 🔗 THIS IS THE GIT GRAPH INTEGRATION PART
//   // -----------------------------------
//   try {
//   output.appendLine("🔍 Checking for Git Graph extension...");
//   const gitGraphExt = vscode.extensions.getExtension("mhutchie.git-graph");

//   if (gitGraphExt && gitGraphExt.packageJSON && gitGraphExt.packageJSON.isBuiltin !== false) {
//     output.appendLine("✅ Git Graph metadata found.");
//   } else {
//     output.appendLine("❌ Git Graph not truly installed (ghost reference).");
//   }
//   output.appendLine(gitGraphExt ? "✅ Git Graph extension found." : "❌ Git Graph extension NOT found.");

//   if (gitGraphExt) {
//     if (!gitGraphExt.isActive) {
//       output.appendLine("🔄 Activating Git Graph...");
//       await gitGraphExt.activate();
//       output.appendLine("✅ Git Graph activated.");
//     } else {
//       output.appendLine("✅ Git Graph already active.");
//     }

//     output.appendLine(JSON.stringify({
//     id: gitGraphExt?.id,
//     isActive: gitGraphExt?.isActive,
//     version: gitGraphExt?.packageJSON?.version,
//     hasExports: !!gitGraphExt?.exports
//   }, null, 2));

//     let gitGraphApi = gitGraphExt.exports;

//     if (!gitGraphApi) {
//       output.appendLine("⚠️ Git Graph API undefined after activation. Retrying...");
//       // Wait a moment, then try again
//       await new Promise((res) => setTimeout(res, 1000));
//       gitGraphApi = gitGraphExt.exports;
//     }


//     if (gitGraphApi) {
//       const keys = Object.keys(gitGraphApi);
//       output.appendLine(`🔍 Git Graph API keys: ${keys.join(", ")}`);

//       if (gitGraphApi.registerGlobalExternalAction) {
//         output.appendLine("⚙️ Registering 'Summarize Commit' action...");
//         gitGraphApi.registerGlobalExternalAction(
//           "Summarize Commit",
//           async (data: { commitHash: string }) => {
//             output.appendLine(`🧩 Summarising from Git Graph: ${data.commitHash}`);
//             vscode.commands.executeCommand("commit-summariser.summariseCommit", {
//               commitHash: data.commitHash,
//             });
//           }
//         );
//         vscode.window.showInformationMessage("✅ Commit Summariser registered with Git Graph");
//         output.appendLine("✅ Commit Summariser registered successfully with Git Graph.");
//       } else {
//         vscode.window.showWarningMessage("⚠️ Git Graph API missing 'registerGlobalExternalAction'. Update Git Graph to ≥ v1.30.0.");
//         output.appendLine("⚠️ Git Graph API missing 'registerGlobalExternalAction'.");
//       }
//     } else {
//       vscode.window.showWarningMessage("⚠️ Git Graph API exports are undefined.");
//       output.appendLine("⚠️ Git Graph API exports undefined.");
//     }
//   } else {
//     vscode.window.showWarningMessage("❌ Git Graph not installed in this window.");
//     output.appendLine("❌ Git Graph extension not found in this environment.");
//   }
// } catch (err: any) {
//   const message = `❌ Error integrating with Git Graph: ${err.message}`;
//   vscode.window.showErrorMessage(message);
//   output.appendLine(message);
// }
//   // -----------------------------------
//   // End of Git Graph integration part
//   // -----------------------------------
// }

// async function getRecentCommits(cwd: string) {
//   const { stdout } = await execPromise(`git log --pretty=format:"%h|%s" -n 20`, { cwd });
//   return stdout
//     .trim()
//     .split("\n")
//     .filter(Boolean)
//     .map((line) => {
//       const [hash, message] = line.split("|");
//       return { hash, message };
//     });
// }

// async function getAISummary(commitText: string): Promise<string> {
//   try {
//     const { stdout } = await execPromise(`gh copilot explain "${commitText.replace(/"/g, '\\"')}"`);
//     return stdout || "No summary returned.";
//   } catch (err: any) {
//     return `⚠️ Error generating summary: ${err.message}`;
//   }
// }

// export function deactivate() {}





import * as vscode from "vscode";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("Commit Summariser Logs");
  output.show(true);

  output.appendLine("✅ Commit Summariser activated");

  // ---------------------------------------------------------------------------
  // 1️⃣  Register the core "Summarize Commit" command
  // ---------------------------------------------------------------------------
  const disposable = vscode.commands.registerCommand(
    "commit-summariser.summariseCommit",
    async (args?: { commitHash?: string }) => {
      const workspace = vscode.workspace.workspaceFolders?.[0];
      if (!workspace) {
        vscode.window.showErrorMessage("❌ No workspace open. Please open a Git project first.");
        return;
      }

      const cwd = workspace.uri.fsPath;
      let commitHash = args?.commitHash;

      try {
        await execPromise("git rev-parse --is-inside-work-tree", { cwd });

        // If triggered manually (no hash), show recent commits to pick from
        if (!commitHash) {
          const commits = await getRecentCommits(cwd);
          const pick = await vscode.window.showQuickPick(
            commits.map((c) => ({ label: `${c.hash} — ${c.message}`, hash: c.hash })),
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
          {
            location: vscode.ProgressLocation.Notification,
            title: `Summarising commit ${commitHash}…`,
          },
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
        vscode.window.showErrorMessage(`❌ Error summarising commit: ${err.message}`);
        output.appendLine(`❌ Error summarising commit: ${err.message}`);
      }
    }
  );
  context.subscriptions.push(disposable);

  // ---------------------------------------------------------------------------
  // 2️⃣  Git Graph Integration  — waits until API exports are ready
  // ---------------------------------------------------------------------------
  async function registerWithGitGraph() {
    const gitGraphExt = vscode.extensions.getExtension("mhutchie.git-graph");

    if (!gitGraphExt) {
      vscode.window.showWarningMessage("⚠️ Git Graph not installed. Please install it from the Marketplace.");
      output.appendLine("❌ Git Graph extension not found.");
      return;
    }

    output.appendLine("🔍 Found Git Graph extension. Waiting for API…");

    // Wait up to 15 s for the exports object to appear
    for (let i = 0; i < 15; i++) {
      if (gitGraphExt.exports?.registerGlobalExternalAction) {
        output.appendLine("✅ Git Graph API available. Registering 'Summarize Commit'…");
        gitGraphExt.exports.registerGlobalExternalAction(
          "Summarize Commit",
          async (data: { commitHash: string }) => {
            output.appendLine(`🧩 Received commit from Git Graph: ${data.commitHash}`);
            vscode.commands.executeCommand("commit-summariser.summariseCommit", {
              commitHash: data.commitHash,
            });
          }
        );
        vscode.window.showInformationMessage("✅ Commit Summariser registered with Git Graph!");
        output.appendLine("✅ Commit Summariser registered successfully.");
        return;
      }

      await new Promise((res) => setTimeout(res, 1000)); // wait 1 s
    }

    output.appendLine("⚠️ Git Graph API never appeared after 15 s. Open Git Graph view manually and try again.");
  }

  registerWithGitGraph();
}

// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------
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

const COPILOT_PATH = "/Users/rohitsingh/.nvm/versions/node/v20.19.5/bin/copilot";

async function getAISummary(commitText: string): Promise<string> {
  try {
    const { stdout } = await execPromise(
      `${COPILOT_PATH} -p "Explain in detail ${commitText.replace(/"/g, '\\"')}"`,
    );
    return stdout || "No summary returned.";
  } catch (err: any) {
    return `⚠️ Error generating summary: ${err.message}`;
  }
}

// -----------------------------------------------------------------------------
export function deactivate() {}



