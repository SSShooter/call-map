type Range = {
  line: number;
  character: number;
};

type Uri = {
  $mid: number;
  path: string;
  scheme: string;
};

type SelectionRange = [Range, Range];

type MessageFromWebview = {
  command: "selectNode";
  payload: {
    fromRanges: [Range, Range][];
    to: {
      kind: number;
      name: string;
      detail: string;
      uri: Uri;
      range: [Range, Range];
      selectionRange: SelectionRange;
      _sessionId: string;
      _itemId: string;
    };
  };
};
