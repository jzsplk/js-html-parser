export enum ProcessResult {
    Done,
    DoneAckSelfClosing,
    SplitWhitespace,
    Reprocess,
    ReprocessForeign,
    Script,
    ToPlaintext
}