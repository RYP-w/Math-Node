import type { MouseButtonState } from "../mouseButtonState";
import type { Rect } from "../globalTypes";
import { GetScreenToWorld2d, GetWorld2dToScreen, type World2d } from "../world2d/world2d";
import { NodeDatabase } from "./database";
import { Node } from "./node";
import type { RBushRectSelection } from "./rBushRectSelection";
import { SelectionBox } from "./selectionBox";
import type { IdNode } from "./nodeTypes";

export class NodeSelection { //? class untuk menyimpan node node yang di pilih
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

const selectionBox = new SelectionBox();

export function SetSelectedNode(event: MouseEvent, dataNode: NodeDatabase, selectedNode: NodeSelection) {
    if ((event.target as HTMLDivElement).classList.contains('node-title')) {
        const parent = (event.target as HTMLDivElement).closest('[id^="node_"]') as HTMLDivElement;
        const getNode = dataNode.getById(parent.id as IdNode);
        if (getNode) {
            selectedNode.set(getNode);
        }
    }
}

// fungsi ini hanya menandai mouseState apakah jika di tekan node-title jika tidak ya udah nggak usah
// sama fungsi ini juga akan memilih system secara individual jika mouse statenya adalah mouse state
export function Live_SelectNodeSystem(world2d:World2d, databaseNode:NodeDatabase, rBushSelection:RBushRectSelection, nodeSelection:NodeSelection, mouseState:MouseButtonState) {
    world2d.HtmlElement.addEventListener("mousedown", (ev) => {
        if (ev.button == 0) {
            let target = ev.target as HTMLElement;
            if (target.classList.contains('node-title')) {
                const parent = target.closest('[id^="node_"]') as HTMLDivElement;
                const getNode = databaseNode.getById(parent.id as IdNode);
                if (getNode) {
                    nodeSelection.set(getNode);
                    mouseState.setAlt(ev, 'left', 'NodeTitle');
                }
            }else {
                nodeSelection.clear();
            }
            selectionBox.set_startPosition(GetScreenToWorld2d({x:ev.clientX, y:ev.clientY},world2d)); //? set start position
        }
    })
    window.addEventListener('mousemove', (ev) => {
        if (ev.button == 0) {
            if (mouseState.getSignal('left') == 'world2d' && !mouseState.hasSpecial('left','inputTypingModeNode')) {
                mouseState.setAlt(ev, 'left', 'RectSelect');
                selectionBox.showRectElement(world2d);
            }
            if (mouseState.getSignal('left') == 'RectSelect') {
                selectionBox.set_MovingPosition(GetScreenToWorld2d({x:ev.clientX, y:ev.clientY},world2d));
                let minPos = GetWorld2dToScreen(selectionBox.get_minPos(), world2d);
                let maxPos = GetWorld2dToScreen(selectionBox.get_maxPos(), world2d);
                let rePosition:Rect = {x1: minPos.x - 2, y1: minPos.y - 35, x2: maxPos.x - 2, y2: maxPos.y - 35};
                selectionBox.updateStateErctElement(world2d, rePosition);
            }
        }
    });
    window.addEventListener('wheel', (_ev) => {
        if (mouseState.getSignal('left') == 'RectSelect') {
            let minPos = GetWorld2dToScreen(selectionBox.get_minPos(), world2d);
            let maxPos = GetWorld2dToScreen(selectionBox.get_maxPos(), world2d);
            let rePosition:Rect = {x1: minPos.x - 2, y1: minPos.y - 35, x2: maxPos.x - 2, y2: maxPos.y - 35};
            selectionBox.updateStateErctElement(world2d, rePosition);
        }
    })
    window.addEventListener('mouseup', (ev) => {
        if (ev.button == 0) {
            if (mouseState.getSignal('left') == 'NodeTitle') {
                mouseState.setAlt(ev, 'left', '');
            }
            if (mouseState.getSignal('left') == 'RectSelect') {
                checkNodeInZoneSelection(rBushSelection, selectionBox, nodeSelection);
                selectionBox.closeRectElement(world2d);
                mouseState.setAlt(ev, 'left', '');
            }
        }
    })
}

function checkNodeInZoneSelection(rBushSelection:RBushRectSelection, selectionBox:SelectionBox, nodeSelection:NodeSelection) {
    const rectBox = selectionBox.get_rect();
    const result = rBushSelection.RectSelection(rectBox);
    if (result.length == 0) return;
    for (const node of result){
        nodeSelection.add(node);
    }
}