import type { MouseButtonState } from "../mouseButtonState";
import type { World2d } from "./world2d";

export function dragViewWorld2d(world2d:World2d, mouseState:MouseButtonState){
    window.addEventListener('mousemove', (ev) => {
        if (mouseState.getSignal('right') == 'world2d') {
            mouseState.setAlt(ev, 'right', 'dragView');
        }
        if (mouseState.getSignal("right") == 'dragView') {
            const position = {
                x: world2d.target.x,
                y: world2d.target.y,
            };
            world2d.target = {
                x: position.x + ev.movementX,
                y: position.y + ev.movementY,
            };
            world2d.updateHTML();
        }
    })
    window.addEventListener('mouseup', (ev) => {
        if (mouseState.getSignal('right') == 'dragView') {
            mouseState.setAlt(ev, 'right', '');
        }
    })

}