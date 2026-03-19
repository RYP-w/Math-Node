import type { NodeDatabase } from "./database";
import { NodeSelection } from "./nodeSelection";

export function checkRemoveNodes(database:NodeDatabase, nodeSelection:NodeSelection) {
    for (const node of nodeSelection.getElements()){
        database.SystemRemovingAllConnection(node);
        database.removeById(node.id);
    };
    nodeSelection.clear();
}
