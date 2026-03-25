import type { NodeDatabase } from "./database";
import { Node } from "./node";
import { templatesNode, type TypeNode } from "./nodeTypes";
import type { Vector2 } from "../globalTypes";


export function createNode(type:TypeNode, position:Vector2, database:NodeDatabase, name:string|undefined = undefined): Node {
    const templateNode = templatesNode.get(type)!;
    let trueName = type.charAt(0).toUpperCase() + type.slice(1).toLocaleLowerCase();
    if (name) {
        trueName = name;
    }
    const node = new Node(trueName,type,position,templateNode.input,templateNode.output);
    database.add(node);
    return node;
}