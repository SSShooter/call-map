import * as vscode from 'vscode';
import { getCallsFactory } from './core';

export function activate(context: vscode.ExtensionContext) {
  const o = vscode.commands.registerCommand(
    'mind-elixir.outcall',
    getCallsFactory(context, 'out')
  );
  const i = vscode.commands.registerCommand(
    'mind-elixir.incall',
    getCallsFactory(context, 'in')
  );

  context.subscriptions.push(i, o);
}

// This method is called when your extension is deactivated
export function deactivate() {}
