import type { DatabaseNode } from "../node/database";
import { Node } from "../node/node";
import { templatesNode, type TypeNode } from "../node/typesDefinition";
import type { Vector2 } from "../TypeDefinition";


export function createNode(type:TypeNode,position:Vector2,database:DatabaseNode): Node {
    const templateNode = templatesNode.get(type)!;
    const name = type.charAt(0).toUpperCase() + type.slice(1).toLocaleLowerCase();
    const node = new Node(name,type,position,templateNode.input,templateNode.output);
    database.add(node);
    return node;
}

// const groupNodes = {
//     ""
// }