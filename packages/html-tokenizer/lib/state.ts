export enum State {
    Data = "Data",
    Plaintext = "Plaintext",
    TagOpen = 'TagOpen',
    EndTagOpen = "EndTagOpen",
    SelfClosingStartTag = "SelfClosingStartTag",
    TagName = 'TagName',
    AttributeName = "AttributeName",
    AfterAttributeName = 'AfterAttributeName',
    BeforeAttributeName = 'BeforeAttributeName'
}