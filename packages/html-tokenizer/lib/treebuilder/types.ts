export enum ProcessResult {
    Done = 'Done',
    DoneAckSelfClosing  = "DoneAckSelfClosing",
    SplitWhitespace = "SplitWhitespace" ,
    Reprocess = "Reprocess",
    ReprocessForeign = "ReprocessForeign",
    Script = "Script",
    ToPlaintext = "ToPlaintext"
}

export interface Attribute {
    name: string;
    value: string;
}

export interface TreeSink<Handle, Output> {
    finish(): Output;
    create_element(name: string, attrs: Attribute[]): Handle;
    get_document(): Handle; 
}