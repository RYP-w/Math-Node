import { Node } from "./node-node";

export class NodeSelected {
    private nodes: Map<string, Node>;

    constructor() {
        this.nodes = new Map();
    }

    clear() {
        const elementsToUpdate: HTMLElement[] = [];

        for (const id of this.nodes.keys()) {
            const element = document.getElementById(id);
            if (element) {
                elementsToUpdate.push(element);
            }
        }

        elementsToUpdate.forEach(el => el.classList.remove('selectedChecked'));

        this.nodes.clear();
    }

    set(node: Node) {
        if (this.nodes.has(node.id)) return;

        this.clear();

        const element = document.getElementById(node.id);
        if (element) {
            element.classList.add('selectedChecked');
            this.nodes.set(node.id, node);
        } else {
            console.warn(`Element with id ${node.id} not found`);
        }
    }

    isThere(element: HTMLDivElement | Node): boolean {
        return this.nodes.has(element.id);
    }

    getNode(id: string): Node | undefined {
        return this.nodes.get(id);
    }

    getElements(): Node[] {
        return Array.from(this.nodes.values());
    }

    add(node: Node) {
        if (this.nodes.has(node.id)) return;

        const element = document.getElementById(node.id);
        if (element) {
            element.classList.add('selectedChecked');
            this.nodes.set(node.id, node);
        }
    }

    removeById(id: string) {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('selectedChecked');
        }
        this.nodes.delete(id);
    }
}