import {TreeSink} from '../treebuilder/types'

export enum NodeType {
    Document = "Document",
    Doctype = "Doctype",
    Text = "Text",
    Comment = "Comment",
    Element = "Element",
    ProcessingInstruction = "ProcessingInstruction",
}
    
export interface Document {
    type: NodeType.Document;
}
    
export interface Attribute {
   name: string;
   value: string; 
}

export interface Text {
    type: NodeType.Text;
    contents: string;
}

export interface Comment {
    type: NodeType.Comment;
    contents: string;
}
    
export interface Element {
    type: NodeType.Element;
    name: string;
    attrs: Attribute[];
    // template_contents: Node
}
    
export type NodeData = Element | Comment | Document;
    
export class Node implements TreeSink<any, any> {
    public data: NodeData;
    public parent: Node | null;
    public children: Node[];

    public constructor(data: NodeData) {
        this.data = data;     
        this.parent = null;
        this.children = [];   
    }
    
    public create_element (name: string, attrs: Attribute[]): Node {
        // return new Node({type: NodeType.Element, name: name, attrs});
        return new Node({type: NodeType.Element, name, attrs});
    }
    
    public finish() {
        
    }
    
    public get_document() {

    } 
 }
    