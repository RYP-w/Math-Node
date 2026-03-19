import type { Rect } from "../globalTypes";
import { Node } from "./node"
import RBush from "rbush";
import type { IdNode } from "./nodeTypes";

interface NodeBushRect {
    minX:number;
    minY:Number;
    maxX:number;
    maxY:number;
    node: Node;
}

export class RBushRectSelection {
    private bush = new RBush<NodeBushRect>();
    private entryMap = new Map<IdNode, NodeBushRect>();

    private getBounds(node: Node) {
        const width = node.HtmlElement.offsetWidth;
        const height = node.HtmlElement.offsetHeight;
        return {
            minX: node.position.x,
            minY: node.position.y,
            maxX: node.position.x + width,
            maxY: node.position.y + height,
        }
    }

    insert(node:Node){
        const entry: NodeBushRect = { ...this.getBounds(node), node}
        this.bush.insert(entry);
        this.entryMap.set(node.id,entry);
    }

    remove(node:Node){
        const entry = this.entryMap.get(node.id);
        if (!entry) return;
        this.bush.remove(entry);
        this.entryMap.delete(node.id);
    }

    update(node:Node){
        this.remove(node);
        this.insert(node);
    }

    RectSelection(rect:Rect){
        const result = this.bush.search({minX: rect.x1, minY: rect.y1, maxX: rect.x2, maxY: rect.y2});
        return result.map(e => e.node);
    }
}