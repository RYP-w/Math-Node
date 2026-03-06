import type { Rect, Vector2 } from "../TypeDefinition";
import type { World2d } from "../world2d/world2d";

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
    showRectElement(world2d:World2d){
        let rectSelection = world2d.toolsHtmlElement.querySelector("#rect-selection") as HTMLDivElement;
        rectSelection.style.display = "block";
    }
    closeRectElement(world2d:World2d){
        let rectSelection = world2d.toolsHtmlElement.querySelector("#rect-selection") as HTMLDivElement;
        rectSelection.style.display = "none";
    }
}