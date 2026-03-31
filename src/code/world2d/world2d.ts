import type { Vector2 } from '../globalTypes.ts'

export class World2d {
    target: Vector2;
    offset: Vector2;
    scale: number;
    HtmlElement: HTMLDivElement;
    toolsHtmlElement: HTMLDivElement;
    RectHTML: DOMRect;

    constructor(target: Vector2 = { x: 0, y: 0 }, offset: Vector2 = { x: 0, y: 0 }, scale = 1) {
        this.target = target;
        this.offset = offset;
        this.scale = scale
        this.HtmlElement = document.getElementById(`world2d`) as HTMLDivElement;
        this.toolsHtmlElement = this.HtmlElement.querySelector("#world2d-tools") as HTMLDivElement;

        this.RectHTML = this.HtmlElement.getBoundingClientRect();
        this.applyHTML()
    }

    private applyHTML() {
        this.HtmlElement.style.setProperty('--world2d-target-x', `${this.target.x}px`);
        this.HtmlElement.style.setProperty('--world2d-target-y', `${this.target.y}px`);
        this.HtmlElement.style.setProperty('--world2d-offset-x', `${this.offset.x}px`);
        this.HtmlElement.style.setProperty('--world2d-offset-y', `${this.offset.y}px`);
        this.HtmlElement.style.setProperty('--world2d-scale', `${this.scale}`);
        this.HtmlElement.style.setProperty('--world2d-zero-line-w', `${this.target.x + this.offset.x + this.RectHTML.left}px`);
        this.HtmlElement.style.setProperty('--world2d-zero-line-h', `${this.target.y + this.offset.y}px`);
    }

    updateHTML() {
        this.RectHTML = this.HtmlElement.getBoundingClientRect();
        this.applyHTML();
        updateGrid(this.scale, this.HtmlElement);
    }


}

function updateGrid(scale:number, world2dElement:HTMLElement) {
    const screenSize = 25 * scale; // screen pixel size of cell level A

    const opacityA = Math.min(1, Math.max(0, (screenSize - 8) / (20 - 8))) * 0.4;

    const opacityB = Math.min(1, Math.max(0, (screenSize * 4 - 8) / (20 - 8))) * 0.4;

    world2dElement.style.setProperty('--dot-opacity-a', `${opacityA}`);
    world2dElement.style.setProperty('--dot-opacity-b', `${opacityB}`);
}

// on second thought, why did I put so much effort into documentation back then
/**
* Convert screen coordinates (screen space) to world coordinates (world space) in the World2D system.
* @param position - Coordinates in screen space
* @param world2d - 2D world configuration object 
* @return Resulting coordinates in world space `Vector2d`
*/
export function GetScreenToWorld2d(position: Vector2, world2d: World2d): Vector2 {
    return {
        x: (position.x - world2d.RectHTML.left - world2d.target.x - world2d.offset.x) / world2d.scale,
        y: (position.y - world2d.RectHTML.top - world2d.target.y - world2d.offset.y) / world2d.scale,
    };
}

/**
* Convert world coordinates (world space) to screen coordinates (screen space) in the World2D system.
* @param position - Coordinates in world space
* @param world2d - 2D world configuration object 
* @return Resulting coordinates in screen space `Vector2d`
*/
export function GetWorld2dToScreen(position: Vector2, world2d: World2d): Vector2 {
    return {
        x: position.x * world2d.scale + world2d.target.x + world2d.offset.x + world2d.RectHTML.left,
        y: position.y * world2d.scale + world2d.target.y + world2d.offset.y + world2d.RectHTML.top,
    };
}