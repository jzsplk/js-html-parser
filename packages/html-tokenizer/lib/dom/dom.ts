import { TreeSink } from "../treebuilder/types";

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

export class Node {
  public data: NodeData;
  public parent: Node | null;
  public children: Node[];

  public constructor(data: NodeData) {
    this.data = data;
    this.parent = null;
    this.children = [];
  }
}

export type Handle = Node;

export class RcDom implements TreeSink<Handle, any> {
  public document: Handle;

  constructor() {
    this.document = new Node({ type: NodeType.Document });
  }

  public get_document() {
    return this.document;
  }

  public finish() {}

  public create_element(name: string, attrs: Attribute[]): Node {
    // return new Node({type: NodeType.Element, name: name, attrs});
    return new Node({ type: NodeType.Element, name, attrs });
  }
}
