import type { IdNode, IdOutputSocket, Node } from "../node/node";

export function markAllDirty(rootId: Node){
    const visited:Set<IdNode> = new Set<IdNode>();
    const stack:Node[] = [rootId];

    while (stack.length > 0) {
        const node = stack.pop()!;
        if (visited.has(node.id)) continue;
        visited.add(node.id);

        if (!node) continue;

        node.dirty = true;

        for (const socketId of Object.keys(node.connection.outgoingNodes) as IdOutputSocket[]){
            for (const neighbor of node.connection.outgoingNodes[socketId].values()){
                if (!visited.has(neighbor.otherNode.id)) {
                    stack.push(neighbor.otherNode);
                }
            }
        }
    }

    return visited;
}

