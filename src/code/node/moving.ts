import { MouseButtonState } from "../mouseButtonState";
import { World2d } from "../world2d";
import { DataBaseNode } from "./database";
import { SelectedNode } from "./selectNode";

export function Live_MovingNodesSystem(world2D: World2d, databaseNode:DataBaseNode, databaseNodeSelected:SelectedNode, mouseButtonState:MouseButtonState) {
    world2D.HtmlElement.addEventListener('mousemove', (ev) => {
        if (ev.button == 0) {
            if (mouseButtonState.getSignal('left') == 'NodeTitle') {
                mouseButtonState.set(ev, 'DragNode');
            }
        }
    });
    window.addEventListener('mousemove', (ev) => {
        if (mouseButtonState.getSignal('left') == 'DragNode' && mouseButtonState.getSignal('right') != 'world2d') {
            databaseNodeSelected.getElements().forEach(el => {
                const node = databaseNode.getById(el.id);
                if (node) {
                    node.position.x += (ev.movementX / world2D.scale);
                    node.position.y += (ev.movementY / world2D.scale);
                    node.UpdateHTMLPosition();
                }
            });
        }
    })
}