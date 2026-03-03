import { EventMouseDown } from "./costum_class";
import { World2d } from "./world2d";
import { DBNode } from "./node-databaseNode";
import { NodeSelected } from "./node-nodeSelected";

export function SetNodeSelected(event: MouseEvent, dataNode: DBNode, nodeSelected: NodeSelected) {
    if ((event.target as HTMLDivElement).classList.contains('node-title')) {
        const parent = (event.target as HTMLDivElement).closest('[id^="node_"]') as HTMLDivElement;
        const getNode = dataNode.getById(parent.id);
        if (getNode) {
            nodeSelected.set(getNode);
        }
    }
}

export function MovingNodes(event: MouseEvent, dataNode: DBNode, dataSelect: NodeSelected, world2D: World2d, Signal: EventMouseDown) {
    if (Signal.getSignal('left') == "DragNode" && Signal.getSignal('right') != 'world2d') {
        dataSelect.getElements().forEach(el => {
            const node = dataNode.getById(el.id);
            if (node) {
                node.position.x += (event.movementX / world2D.scale);
                node.position.y += (event.movementY / world2D.scale);
                node.UpdateHTMLPosition()
            }
        })
    }
}