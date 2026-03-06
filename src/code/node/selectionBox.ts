import type { MouseButtonState } from "../mouseButtonState";
import type { Rect, Vector2 } from "../TypeDefinition";
import type { World2d } from "../world2d";

export class SelectionBox{
    private previous_position:Vector2;
    private position:Vector2;
    constructor(){
        this.previous_position = {
            x:0,
            y:0
        };
        this.position = {
            x:0,
            y:0
        }
    }
    set_startPosition(position:Vector2){
        this.previous_position = position;
    }
    set_MovingPosition(position:Vector2){
        this.position = position;
    }
    get_rect():Rect{
        let x_min = Math.min(this.previous_position.x, this.position.x);
        let y_min = Math.min(this.previous_position.y, this.position.y);
        let x_max = Math.max(this.previous_position.x, this.position.x);
        let y_max = Math.max(this.previous_position.y, this.position.y);

        return {
            x:x_min, 
            y:y_min, 
            width:x_max, 
            height: y_max
        }
    }
}

const selectionBox = new SelectionBox();

export function setupNodeSelection(world2d: World2d, eventMouseDown:MouseButtonState) {
    world2d.HtmlElement.addEventListener("mousedown", (ev) => {
        if (ev.button == 0) {
            selectionBox.set_startPosition({x:ev.clientX, y:ev.clientY});
        }
    });
    window.addEventListener('mousemove', (ev) => {
        if (ev.button == 0) {
            if (eventMouseDown.getSignal('left') == 'world2d') {
                eventMouseDown.set(ev,'RectSelect')
            }
            if (eventMouseDown.getSignal('left') == 'RectSelect') {
                selectionBox.set_MovingPosition({x:ev.clientX, y:ev.clientY});
            }
        }
        
    });
    window.addEventListener('mouseup', (ev) => {
        if (ev.button == 0 && eventMouseDown.getSignal('left') == 'RectSelect') {
            console.log(selectionBox.get_rect());
            eventMouseDown.set(ev,'');
        }
    })
}