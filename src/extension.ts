// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { MindElixirPanel } from "./panel";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "mind-elixir" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "mind-elixir.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from mind-elixir!");
    }
  );

  vscode.commands.registerCommand("mind-elixir.outcall", async () => {
    const activeTextEditor = vscode.window.activeTextEditor!;
    const entry: vscode.CallHierarchyItem[] =
      await vscode.commands.executeCommand(
        "vscode.prepareCallHierarchy",
        activeTextEditor.document.uri,
        activeTextEditor.selection.active
      );
    if (!entry || !entry[0]) {
      const msg = "Can't resolve entry function";
      vscode.window.showErrorMessage(msg);
      throw new Error(msg);
    }
    const calls: vscode.CallHierarchyOutgoingCall[] =
      await vscode.commands.executeCommand(
        "vscode.provideOutgoingCalls",
        entry[0]
      );
    // const range = calls[1].fromRanges[0];
    // activeTextEditor.selection = new vscode.Selection(range.start, range.end);
    // activeTextEditor.revealRange(range, vscode.TextEditorRevealType.InCenter);

    const mindElixirPanel = new MindElixirPanel(context.extensionUri);
    mindElixirPanel.panel.webview.postMessage({
      command: "init",
      payload: { name: entry[0].name, children: calls },
    });
    mindElixirPanel.panel.webview.onDidReceiveMessage(
      (message: MessageFromWebview) => {
        console.log(message);
        if (message.command === "selectNode") {
          const call = message.payload;
          const rangeO = call.fromRanges[0];
          const range = new vscode.Range(
            rangeO[0].character,
            rangeO[0].line,
            rangeO[1].character,
            rangeO[1].line
          );
          activeTextEditor.selection = new vscode.Selection(
            range.start,
            range.end
          );
          activeTextEditor.revealRange(
            range,
            vscode.TextEditorRevealType.InCenter
          );
        }
      }
    );
    context.subscriptions.push(disposable, mindElixirPanel.panel);
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
