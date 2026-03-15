import type { DatabaseNode } from "../node/database";
import { Node } from "../node/node";
import { templatesNode, type TypeNode } from "../node/typesDefinition";
import type { Vector2 } from "../TypeDefinition";


export function createNode(type:TypeNode,position:Vector2,database:DatabaseNode, name:string|undefined = undefined): Node {
    const templateNode = templatesNode.get(type)!;
    let trueName = type.charAt(0).toUpperCase() + type.slice(1).toLocaleLowerCase();
    if (name) {
        trueName = name;
    }
    const node = new Node(trueName,type,position,templateNode.input,templateNode.output);
    database.add(node);
    return node;
}

// const groupNodes = {
//     ""
// }