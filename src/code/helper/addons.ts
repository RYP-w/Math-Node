
//<?> Set Element 
export type ElementTypes = 'div' | 'span' | 'img' | 'input' | 'i'
export type AttributesElement = {
    id?: string,
    class?: Array<string>,
    style?: Array<string>,
    value?: number,
    src?: string,
    attr?: { [key: string]: string }
}

export type AttributesElementPath = {
    id?: string,
    class?: Array<string>,
    d?: string,
    stroke?: string,
    strokeWidth?: string,
    strokeLinejoin?: string,
    strokeLinecap?: string,
    fill?: string,
    attr?: { [key: string]: string }
}

export function SetElement(type: ElementTypes, attributes: AttributesElement = {}, ...children: (HTMLElement | string | (() => HTMLElement[]))[]): HTMLElement {
    const element = document.createElement(type);

    if (attributes.id) {
        element.id = attributes.id;
    }
    if (attributes.class?.length) {
        const filterClass = attributes.class.filter(cls => cls !== '');
        if (filterClass.length > 0) {
            element.classList.add(...filterClass);
        }
    }
    if (attributes.style?.length) {
        element.style.cssText = attributes.style.join('; ') + ';';
    }
    if (attributes.value !== undefined && element instanceof HTMLInputElement) {
        element.value = String(attributes.value);
    }
    if (attributes.src && element instanceof HTMLImageElement) {
        element.src = attributes.src;
    }
    if (attributes.attr) {
        for (const key in attributes.attr) {
            element.setAttribute(key, attributes.attr[key]);
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

    return element
}

export function SetElementPath(attributes: AttributesElementPath = {}) {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const Path = document.createElementNS(SVG_NS, 'path');

    if (attributes.id) {
        Path.id = attributes.id;
    }
    if (attributes.class?.length) {
        const filterClass = attributes.class.filter(cls => cls !== '');
        if (filterClass.length > 0) {
            Path.classList.add(...filterClass);
        }
    }
    if (attributes.d) {
        Path.setAttribute('d', attributes.d);
    }
    if (attributes.stroke) {
        Path.setAttribute('stroke', attributes.stroke);
    }
    if (attributes.strokeWidth) {
        Path.setAttribute('stroke-width', attributes.strokeWidth)
    }
    if (attributes.strokeLinejoin) {
        Path.setAttribute('stroke-linejoin', attributes.strokeLinejoin)
    }
    if (attributes.fill) {
        Path.setAttribute('fill', attributes.fill)
    }
    if (attributes.attr) {
        for (const key in attributes.attr) {
            Path.setAttribute(key, attributes.attr[key]);
        }
    }

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