import type { DatabaseNode } from "./database";
import { NodeSelection } from "./nodeSelection";

export function checkRemoveNodes(database:DatabaseNode, nodeSelection:NodeSelection) {
    for (const node of nodeSelection.getElements()){
        database.SystemRemovingAllConnection(node);
        database.removeById(node.id);
    };
    nodeSelection.clear();
}
