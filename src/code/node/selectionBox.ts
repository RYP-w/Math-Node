import type { Rect, Vector2 } from "../globalTypes";
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
            x1:x_min, 
            y1:y_min, 
            x2:x_max, 
            y2: y_max
        }
    }
    get_startPos():Vector2{
        return this.previous_position;
    }
    get_movingPos(){
        return this.position;
    }
    get_minPos():Vector2{
        let x_min = Math.min(this.previous_position.x, this.position.x);
        let y_min = Math.min(this.previous_position.y, this.position.y);
        return {
            x: x_min,
            y: y_min,
        }
    }
    get_maxPos():Vector2{
        let x_max = Math.max(this.previous_position.x, this.position.x);
        let y_max = Math.max(this.previous_position.y, this.position.y);
                return {
            x: x_max,
            y: y_max,
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
    updateStateErctElement(world2d:World2d, rect:Rect){
        let rectSelection = world2d.toolsHtmlElement.querySelector("#rect-selection") as HTMLDivElement;
        rectSelection.style.setProperty('--position-x1',`${rect.x1}px`);
        rectSelection.style.setProperty('--position-y1',`${rect.y1}px`);
        rectSelection.style.setProperty('--position-x2',`${rect.x2}px`);
        rectSelection.style.setProperty('--position-y2',`${rect.y2}px`);
    }
}