import { MouseButtonState } from "../mouseButtonState";
import { World2d } from "../world2d";
import { DataBaseNode } from "./database";
import { SelectedNode } from "./selectNode";

export function MovingNodes(event: MouseEvent, dataNode: DataBaseNode, dataSelect: SelectedNode, world2D: World2d, Signal: MouseButtonState) {
    if (Signal.getSignal('left') == "DragNode" && Signal.getSignal('right') != 'world2d') {
        dataSelect.getElements().forEach(el => {
            const node = dataNode.getById(el.id);
            if (node) {
                node.position.x += (event.movementX / world2D.scale);
                node.position.y += (event.movementY / world2D.scale);
                node.UpdateHTMLPosition();
            }
        });
    }
}