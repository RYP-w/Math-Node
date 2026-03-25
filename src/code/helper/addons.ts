import type Decimal from "decimal.js"

//<?> Set Element 
export type ElementTypes = 'div' | 'span' | 'img' | 'input' | 'i' | 'table' | 'tr' | 'td' | 'button';
export type ElementNSTypes = 'path' | 'svg';

type Attribute_1 = {id?: string, class?: Array<string>, style?: Array<string>, attr?: { [key: string]: string }};
type Attribute_2 = {id?: string, class?: Array<string>, style?: Array<string>,src?: string, attr?: { [key: string]: string }};
type Attribute_3 = {id?: string, class?: Array<string>, style?: Array<string>,value?: Decimal, attr?: { [key: string]: string }};
type Attribute_4 = {id?: string, class?: Array<string>, style?: Array<string>, width?:number, height?:number, viewBox?:string, fill?:string, attr?: { [key: string]: string }};
type Attribute_5 = {id?: string, class?: Array<string>, d?: string, stroke?: string, strokeWidth?: string, strokeLinejoin?: string, strokeLinecap?: string, fill?: string, attr?: { [key: string]: string }};

export type AttributeElementByType = {
    'div': Attribute_1,
    'span': Attribute_1,
    'img': Attribute_2,
    'input': Attribute_3,
    'i': Attribute_1,
    'table': {},
    'tr': {},
    'td': Attribute_1,
    'button': Attribute_1,
    'svg': Attribute_4,
    'path': Attribute_5,
}

export function SetElement<T extends ElementTypes>( type: T, attributes: AttributeElementByType[T] = {}, ...children: (HTMLElement | string | (() => HTMLElement[]))[]): HTMLElement {
    const element = document.createElement(type);

    const attrs = attributes as Partial<{
        id: string;
        class: Array<string>;
        style: Array<string>;
        value: any;
        src: string;
        attr: { [key: string]: string };
    }>;

    if (attrs.id) {
        element.id = attrs.id;
    }
    if (attrs.class?.length) {
        const filterClass = attrs.class.filter(cls => cls !== '');
        if (filterClass.length > 0) {
            element.classList.add(...filterClass);
        }
    }
    if (attrs.style?.length) {
        element.style.cssText = attrs.style.join('; ') + ';';
    }
    if (attrs.value !== undefined && element instanceof HTMLInputElement) {
        element.value = attrs.value.toString();
    }
    if (attrs.src && element instanceof HTMLImageElement) {
        element.src = attrs.src;
    }
    if (attrs.attr) {
        for (const key in attrs.attr) {
            element.setAttribute(key, attrs.attr[key]);
        }
    }

    children.forEach(child => {
        if (typeof child === 'function') {
            child().forEach(fnChild => {
                element.appendChild(fnChild)
            });
        } else if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });

    return element;
}

export function SetElementSvg<T extends ElementNSTypes>(type:T, attributes: AttributeElementByType[T] = {}, ...children: (SVGElement | (() => SVGElement[]))[]) {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const Path = document.createElementNS(SVG_NS, type);

    const attrs = attributes as Partial<{
        id?: string,
        class?: Array<string>,
        d?: string,
        stroke?: string,
        strokeWidth?: string,
        strokeLinejoin?: string,
        strokeLinecap?: string,
        fill?: string,
        width:number, 
        height:number, 
        viewBox:string,
        attr?: { [key: string]: string },
        
    }>;

    if (attrs.id) {
        Path.id = attrs.id;
    }
    if (attrs.class?.length) {
        const filterClass = attrs.class.filter(cls => cls !== '');
        if (filterClass.length > 0) {
            Path.classList.add(...filterClass);
        }
    }
    if (attrs.d) {
        Path.setAttribute('d', attrs.d);
    }
    if (attrs.stroke) {
        Path.setAttribute('stroke', attrs.stroke);
    }
    if (attrs.strokeWidth) {
        Path.setAttribute('stroke-width', attrs.strokeWidth)
    }
    if (attrs.strokeLinejoin) {
        Path.setAttribute('stroke-linejoin', attrs.strokeLinejoin)
    }
    if (attrs.fill) {
        Path.setAttribute('fill', attrs.fill)
    }
    if (attrs.width) {
        Path.setAttribute('width', String(attrs.width));
    }
    if (attrs.height) {
        Path.setAttribute('height', String(attrs.height));
    }
    if (attrs.viewBox) {
        Path.setAttribute('viewBox', String(attrs.viewBox));
    }
    if (attrs.attr) {
        for (const key in attrs.attr) {
            Path.setAttribute(key, attrs.attr[key]);
        }
    }

    children.forEach(child => {
        if (typeof child === 'function') {
            child().forEach(fnChild => {
                Path.appendChild(fnChild)
            });
        } else if (typeof child === 'string') {
            Path.appendChild(document.createTextNode(child));
        } else {
            Path.appendChild(child);
        }
    });

    return Path
}
//<?> Set Element [End] 


export function getAtribute_number(element: HTMLElement, atribute: string) {
    const attr = getComputedStyle(element).getPropertyValue(atribute);
    if (attr != '') {
        return parseFloat(attr)
    } else {
        console.warn("getAtribute_number() -> atribute is null: ", atribute, ' and ', attr, "\n Return: 0")
        return 0
    }
}

interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T | undefined;
    size(): number;
}
export class Queue<T> implements IQueue<T> {
    private storage: T[] = [];
    private capacity: number = Infinity;

    constructor(capacity: number = Infinity) {
        this.capacity = capacity;
    }

    enqueue(item: T): void {
        if (this.size() === this.capacity) {
        throw Error("Queue has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }
    dequeue(): T | undefined {
        return this.storage.shift();
    }
    size(): number {
        return this.storage.length;
    }
}

type ShortcutOptions = {
    key?: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
};

function createShortcut(options: ShortcutOptions, callback: (ev:KeyboardEvent) => void) {
    const handler = (event: KeyboardEvent) => {
        let isKeyMatch = true;
        if (options.key) {
            isKeyMatch = event.key.toLowerCase() === options.key.toLowerCase();
        }
        
        const isCtrlMatch = !!options.ctrl === event.ctrlKey;
        const isShiftMatch = !!options.shift === event.shiftKey;
        const isAltMatch = !!options.alt === event.altKey;

        if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch) {
            event.preventDefault();
            callback(event);
        }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
}

export function registerShortcut(options: ShortcutOptions, targetElement:HTMLElement, callback: (ev:KeyboardEvent) => void) {
    let removeShortcut: (() => void) | null = null;

    const handlerMouseEnter = () => {
        if (!removeShortcut) {
            removeShortcut = createShortcut(options, callback);
        }
    }
    const handlerMouseLeave = () => {
        if (removeShortcut) {
            removeShortcut();
            removeShortcut = null;
        }
    }

    targetElement.addEventListener('mouseenter', handlerMouseEnter);
    targetElement.addEventListener('mouseleave', handlerMouseLeave);
    
    return () => {
        handlerMouseLeave();
        targetElement.removeEventListener('mouseenter', handlerMouseEnter); 
        targetElement.removeEventListener('mouseleave', handlerMouseLeave);
    }
}

export function randomRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface InputCapabilityCheck {
    hasPrecisePointer: boolean;
    hasHoverCapability: boolean;
    isSuitableForEditor: boolean;
}

export function checkEditorCompatibility(): InputCapabilityCheck {

    const hasPrecisePointer = window.matchMedia('(pointer: fine)').matches;
    const hasHoverCapability = window.matchMedia('(hover: hover)').matches;

    const isSuitableForEditor = hasPrecisePointer && hasHoverCapability;

    return { hasPrecisePointer, hasHoverCapability, isSuitableForEditor };
}