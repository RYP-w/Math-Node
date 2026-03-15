import type { Vector2 } from '../TypeDefinition.ts'

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
    }


}

// jika dipikir lagi, dulu guah kok niat kali buat dokumentasi
/**
* Konversi koordinat layar (screen space) menjadi koordinat dunia (world space) pada sistem World2D.
* @param position - Koordinat dalam screen space
* @param world2d - Objek konfigurasi dunia 2D 
* @return Koordinat hasil dalam world space `Vector2d`
*/
export function GetScreenToWorld2d(position: Vector2, world2d: World2d): Vector2 {
    return {
        x: (position.x - world2d.RectHTML.left - world2d.target.x - world2d.offset.x) / world2d.scale,
        y: (position.y - world2d.RectHTML.top - world2d.target.y - world2d.offset.y) / world2d.scale,
    };
}

/**
* Konversi koordinat dunia (world space) menjadi koordinat layar (screen space) pada sistem World2D.
* @param position - Koordinat dalam world space
* @param world2d - Objek konfigurasi dunia 2D 
* @return Koordinat hasil dalam screen space `Vector2d`
*/
export function GetWorld2dToScreen(position: Vector2, world2d: World2d): Vector2 {
    return {
        x: position.x * world2d.scale + world2d.target.x + world2d.offset.x + world2d.RectHTML.left,
        y: position.y * world2d.scale + world2d.target.y + world2d.offset.y + world2d.RectHTML.top,
    };
}