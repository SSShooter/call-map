import * as vscode from "vscode";

export class MindElixirPanel {
  panel: vscode.WebviewPanel;
  constructor(private readonly _extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
      "mindElixir",
      "Mind Elixir",
      vscode.ViewColumn.Two,
      {
        // Enable scripts in the webview
        enableScripts: true,
      }
    );
    panel.webview.html = this.getWebviewContent(panel.webview);
    this.panel = panel;
  }
  getWebviewContent = (webview: vscode.Webview) => {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview.js")
    );
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cat Coding</title>
            <style>
              /* test tailwind compatibility */
              *,
              ::before,
              ::after {
                box-sizing: border-box;
                border-width: 0;
                border-style: solid;
                border-color: #e5e7eb;
              }

              #map,
              #map2 {
                margin-top: 50px;
                height: 800px;
                width: 100%;
              }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script type="module" src="${scriptUri}"></script>
        </body>
        </html>`;
  };
}
