export enum ProcessResult {
    Done = 'Done',
    DoneAckSelfClosing  = "DoneAckSelfClosing",
    SplitWhitespace = "SplitWhitespace" ,
    Reprocess = "Reprocess",
    ReprocessForeign = "ReprocessForeign",
    Script = "Script",
    ToPlaintext = "ToPlaintext"
}