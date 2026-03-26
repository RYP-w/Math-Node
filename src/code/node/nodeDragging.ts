import { MouseButtonState } from "../mouseButtonState";
import type { Vector2 } from "../globalTypes";
import { World2d } from "../world2d/world2d";
import { NodeDatabase } from "./database";
import { NodeSelection } from "./nodeSelection";
import { RBushRectSelection } from "./rBushRectSelection";
import type { IdNode } from "./nodeTypes";

export function setupNodeDragging(world2D: World2d, databaseNode:NodeDatabase, rBushSelection:RBushRectSelection, nodeSelection:NodeSelection, mouseState:MouseButtonState) {
    let previousNodePosition:Map<IdNode,Vector2> = new Map<IdNode,Vector2>();
    let levelClampDragging:Record<number,'25x'|'50x'> = {
        1 : '25x',
        3 : '50x'
    }
    let currentLevelClamp = 0;

    const updateLevelState = (ev: KeyboardEvent) => {
        let newClamp = 0;
        if (ev.ctrlKey) {
            newClamp |= 1; 
        }
        if (ev.shiftKey) {
            newClamp |= 2; 
        }
        currentLevelClamp = newClamp;
    };

    world2D.HtmlElement.addEventListener('mousemove', (ev) => {
        if (ev.button == 0) {
            if (mouseState.getSignal('left') == 'NodeTitle') {
                mouseState.setAlt(ev, 'left', 'DragNode');
                nodeSelection.getElements().forEach( (node) => {
                    previousNodePosition.set(node.id, {x:node.position.x, y:node.position.y});
                })
            }
        }
    });
    window.addEventListener('keydown',updateLevelState);
    window.addEventListener('keyup', updateLevelState);
    window.addEventListener('mousemove', (ev) => {
        if (mouseState.getSignal('left') == 'DragNode' && mouseState.getSignal('right') != 'dragView') {
            nodeSelection.getElements().forEach(el => {
                const node = databaseNode.getById(el.id);
                if (node) {
                    const currentPrevNodePosition = previousNodePosition.get(el.id)
                    if (!currentPrevNodePosition) {
                        console.log('BUG');
                        return;
                    }

                    let multiplyClamp = 1;
                    if (levelClampDragging[currentLevelClamp] == '25x') {
                        multiplyClamp = 25;
                    }
                    if (levelClampDragging[currentLevelClamp] == '50x') {
                        multiplyClamp = 50;
                    }
                    
                    currentPrevNodePosition.x += (ev.movementX / world2D.scale);
                    currentPrevNodePosition.y += (ev.movementY / world2D.scale);

                    node.position.x = Math.floor(((currentPrevNodePosition.x + (multiplyClamp/2)) / multiplyClamp)) * multiplyClamp;
                    node.position.y = Math.floor(((currentPrevNodePosition.y + (multiplyClamp/2)) / multiplyClamp)) * multiplyClamp;
                    
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
            previousNodePosition.clear();
            mouseState.setAlt(ev, 'left', 'idle');
        }
    });

    
}

