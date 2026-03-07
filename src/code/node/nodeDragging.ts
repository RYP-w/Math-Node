import { MouseButtonState } from "../mouseButtonState";
import { World2d } from "../world2d/world2d";
import { DatabaseNode } from "./database";
import { NodeSelection } from "./nodeSelection";
import { rBushRectSelection } from "./rBushRectSelection";

export function setupNodeDragging(world2D: World2d, databaseNode:DatabaseNode, rBushSelection:rBushRectSelection, nodeSelection:NodeSelection, mouseState:MouseButtonState) {
    world2D.HtmlElement.addEventListener('mousemove', (ev) => {
        if (ev.button == 0) {
            if (mouseState.getSignal('left') == 'NodeTitle') {
                mouseState.setAlt(ev, 'left', 'DragNode');
            }
        }
    });
    window.addEventListener('mousemove', (ev) => {
        if (mouseState.getSignal('left') == 'DragNode' && mouseState.getSignal('right') != 'dragView') {
            nodeSelection.getElements().forEach(el => {
                const node = databaseNode.getById(el.id);
                if (node) {
                    node.position.x += (ev.movementX / world2D.scale);
                    node.position.y += (ev.movementY / world2D.scale);
                    node.UpdateHTMLPosition();
                }
            });
        }
    })
    window.addEventListener('mouseup', (ev) => {
        if (ev.button == 0 && mouseState.getSignal('left') == 'DragNode') {
            nodeSelection.getElements().forEach(el => {
                const node = databaseNode.getById(el.id);
                if (node) {
                    rBushSelection.update(node);
                }
            })
            mouseState.setAlt(ev, 'left', '');
        }
    })
}