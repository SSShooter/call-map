import * as vscode from 'vscode';
import { MindElixirPanel } from './panel';

const revealSelection = (
  stringifyRange: Range[],
  editor: vscode.TextEditor
) => {
  const range = new vscode.Range(
    stringifyRange[0].line,
    stringifyRange[0].character,
    stringifyRange[1].line,
    stringifyRange[1].character
  );
  editor.selection = new vscode.Selection(range.start, range.end);
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
};

const openFileAndRevealSelection = async (uri: vscode.Uri, range: Range[]) => {
  const document = await vscode.workspace.openTextDocument(uri);
  const newEditor = await vscode.window.showTextDocument(document);
  revealSelection(range, newEditor);
};

interface MyOutgoingCall extends vscode.CallHierarchyOutgoingCall {
  children?: MyOutgoingCall[]
  target?: vscode.CallHierarchyItem
}

const getOutgoingCallsDeep = async (
  item: vscode.CallHierarchyItem,
  depth: number
) => {
  let calls: MyOutgoingCall[] = await vscode.commands.executeCommand(
    'vscode.provideOutgoingCalls',
    item
  );
  if (!calls) {
    return;
  }
  for (const call of calls) {
    const item = call.to;
    call.target = item;
    if (depth > 1) {
      call.children = await getOutgoingCallsDeep(item, depth - 1);
    }
  }
  return calls;
};

interface MyIncomingCall extends vscode.CallHierarchyIncomingCall {
  children?: MyIncomingCall[]
  target?: vscode.CallHierarchyItem
}

const getIncomingCallsDeep = async (
  item: vscode.CallHierarchyItem,
  depth: number
) => {
  let calls: MyIncomingCall[] = await vscode.commands.executeCommand(
    'vscode.provideIncomingCalls',
    item
  );
  if (!calls) {
    return;
  }
  for (const call of calls) {
    const item = call.from;
    call.target = item;
    if (depth > 1) {
      call.children = await getIncomingCallsDeep(item, depth - 1);
    }
  }
  return calls;
};

export const getCallsFactory = (
  context: vscode.ExtensionContext,
  type: 'out' | 'in'
) => {
  return async () => {
    const activeTextEditor = vscode.window.activeTextEditor!;
    const entries: vscode.CallHierarchyItem[] =
      await vscode.commands.executeCommand(
        'vscode.prepareCallHierarchy',
        activeTextEditor.document.uri,
        activeTextEditor.selection.active
      );
    const entry = entries[0];
    if (!entry) {
      return;
    }
    let calls: MyIncomingCall[] | MyOutgoingCall[] | undefined;
    const config = vscode.workspace.getConfiguration('mindElixirCallMap');
    const depth = config.get<number>('depth') || 1;

    if (type === 'in') {
      calls = await getIncomingCallsDeep(entry, depth);
    } else {
      calls = await getOutgoingCallsDeep(entry, depth);
    }
    if (!calls) {
      return;
    }
    const mindElixirPanel = new MindElixirPanel(
      context.extensionUri,
      type + ': ' + entry.name
    );
    mindElixirPanel.panel.webview.postMessage({
      command: 'init',
      payload: { name: entry.name, children: calls, type },
    });
    mindElixirPanel.panel.webview.onDidReceiveMessage(
      (message: MessageFromWebview) => {
        console.log(message);
        if (message.command === 'reveal') {
          const call = message.payload;
          const stringifyRange = call.fromRanges[0];
          revealSelection(stringifyRange, activeTextEditor);
        } else if (message.command === 'openAndReveal') {
          const call = message.payload;
          const uri = call.target.uri;
          const fileUri = vscode.Uri.file(uri.path);
          const stringifyRange = call.target.selectionRange;
          openFileAndRevealSelection(fileUri, stringifyRange);
        }
      }
    );
    context.subscriptions.push(mindElixirPanel.panel);
  };
};
