import MindElixir from "mind-elixir";
import type { MindElixirData, NodeObj, Options } from "mind-elixir";
import * as vscode from "vscode"; 

interface Window {
  acquireVsCodeApi(): any;
}
declare const window: Window & typeof globalThis;

const vsc = window.acquireVsCodeApi();
const E = MindElixir.E;
const options: Options = {
  el: "#map",
  newTopicName: "子节点",
  // direction: MindElixir.LEFT,
  direction: MindElixir.RIGHT,
  // data: MindElixir.new('new topic'),
  locale: "en",
  draggable: true,
  editable: true,
  contextMenu: true,
  contextMenuOption: {
    focus: true,
    link: true,
    extend: [
      {
        name: "Node edit",
        onclick: () => {
          alert("extend menu");
        },
      },
    ],
  },
  toolBar: true,
  nodeMenu: true,
  keypress: true,
  allowUndo: false,
  // mainBranchStyle: 2,
  theme: MindElixir.DARK_THEME,
};
 
const handleMessage = (event: MessageFromVSCode) => {
  if (event.data.command === "init") {
    const payload = event.data.payload;
    const data: MindElixirData = {
      nodeData: {
        topic: "root",
        id: "root",
        root: true,
        children: payload.children.map((call) => {
          return {
            topic: call.to.name,
            id: Math.random().toString(),
            call,
            children: [],
          };
        }),
      },
    };
    const mind = new MindElixir(options);
    mind.init(data);
    mind.bus.addListener(
      "selectNode",
      (nodeData: NodeObj & { call: vscode.CallHierarchyOutgoingCall }) => {
        console.log(nodeData);
        vsc.postMessage({
          command: "selectNode",
          payload: nodeData.call,
        });
      }
    );
  }
};
window.addEventListener("message", handleMessage);
