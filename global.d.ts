type Range = {
  line: number
  character: number
}

type Uri = {
  $mid: number
  path: string
  scheme: string
}

type SelectionRange = [Range, Range]

type Target = {
  kind: number
  name: string
  detail: string
  uri: Uri
  range: [Range, Range]
  selectionRange: SelectionRange
  _sessionId: string
  _itemId: string
}
type StringifyCommonCall = {
  name: string
  fromRanges: [Range, Range][]
  target: Target
  children?: StringifyCommonCall[]
}
type StringifyCallHierarchyOutgoingCall = {
  fromRanges: [Range, Range][]
  to: Target
}
type StringifyCallHierarchyIncomingCall = {
  fromRanges: [Range, Range][]
  from: Target
}

type MessageFromWebview = {
  command: 'reveal' | 'openAndReveal'
  payload: { call: StringifyCommonCall; pUri?: string }
}

type MessageFromVSCode =
  | {
      command: 'init'
      payload: {
        type: 'out'
        name: string
        children: StringifyCommonCall[]
      }
    }
  | {
      command: 'init'
      payload: {
        type: 'in'
        name: string
        children: StringifyCommonCall[]
      }
    }
