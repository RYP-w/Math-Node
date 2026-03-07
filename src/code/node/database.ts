import { ConnectionManager } from "./connectionManager";
import { SetElementPath } from "../helper/addons";
import type { Node } from "./node";
import { rBushRectSelection } from "./rBushRectSelection";

type IdInputSocket = `inputsocket_${number}`;
type IdOutputSocket = `outputsocket_${number}`;
type IdNode = `node_${number}`;


export class DatabaseNode {
    private database:Map<IdNode, Node>; //? list Nodes
    connectedSystem: ConnectionManager;
    rBushSelection: rBushRectSelection;
    HtmlPlaceCurve: HTMLElement;

    constructor(HtmlPlaceCurve: HTMLElement, rBushSelection:rBushRectSelection){
        this.database = new Map<IdNode, Node>()
        this.connectedSystem = new ConnectionManager(this);
        this.HtmlPlaceCurve = HtmlPlaceCurve;
        this.rBushSelection = rBushSelection;
    }

    add(node: Node) {
        this.rBushSelection.insert(node);
        this.database.set(node.id,node);
    }

    removeById(id: IdNode) {
        const node = this.database.get(id);
        if (node) {
            this.rBushSelection.remove(node);
            this.database.delete(id);
        }
    }

    getById(id: IdNode): Node | undefined {
        return this.database.get(id);
    }

    getAll() {
        return [...this.database.values()]
    }

    getAll_raw(){
        return this.database;
    }

    SystemCheckObjectConnectToObject(fromNode: { node: Node, idSocket: IdOutputSocket }, toNode: { node: Node, idSocket: IdInputSocket }) {
        for (const incomingNode of toNode.node.connection.incomingNodes[toNode.idSocket].values()) {
            if (incomingNode.otherNode == fromNode.node) {
                if (incomingNode.otherIdSocket == fromNode.idSocket) {
                    return 1
                } else {
                    return 2
                }
            }
        }
        return 0;
    }

    SystemConnectingNode(fromNode: { node: Node, idSocket: IdOutputSocket }, toNode: { node: Node, idSocket: IdInputSocket }) {
        //a
        fromNode.node.connection.outgoingNodes[fromNode.idSocket].set(`${toNode.node.id}`, {
            otherNode: toNode.node,
            otherIdSocket: toNode.idSocket,
        })
        toNode.node.connection.incomingNodes[toNode.idSocket].set(`${fromNode.node.id}`, {
            otherNode: fromNode.node,
            otherIdSocket: fromNode.idSocket,
        })
        this.createPathLine(fromNode,toNode);
    }

    SystemRemovingConnection(fromNode: { node: Node, idSocket: IdOutputSocket }, toNode: { node: Node, idSocket: IdInputSocket }) {
        const incomingNode_ToNode = toNode.node.connection.incomingNodes[toNode.idSocket].values().next();
        if (!incomingNode_ToNode.done) {
            if (incomingNode_ToNode.value.otherNode == fromNode.node) {
                const keyIncomingNode = toNode.node.connection.incomingNodes[toNode.idSocket].keys().next().value ?? '';
                if (keyIncomingNode == "") { console.warn("BUG"); return; }
                toNode.node.connection.incomingNodes[toNode.idSocket].delete(keyIncomingNode);
                for (const key of fromNode.node.connection.outgoingNodes[fromNode.idSocket].keys()) {
                    const outgoingNodes = fromNode.node.connection.outgoingNodes[fromNode.idSocket].get(key);
                    if (outgoingNodes !== undefined) {
                        if (outgoingNodes.otherNode == toNode.node && outgoingNodes.otherIdSocket == toNode.idSocket) {
                            fromNode.node.connection.outgoingNodes[fromNode.idSocket].delete(key);
                            break;
                        }
                    }

                }

                this.HtmlPlaceCurve.querySelector(`[node-from="${fromNode.node.id}"][socket-from="${fromNode.idSocket}"][node-to="${toNode.node.id}"][socket-to="${toNode.idSocket}"]`)?.remove();

                fromNode.node.OutgoingPathLines.delete(`${fromNode.node.id},${fromNode.idSocket},${toNode.node.id},${toNode.idSocket}`);

            }
        } else console.log("Bug");
    }

    SystemRemovingAllConnection(fromNode: Node, toNode: Node) {
        for (const idSocket in toNode.connection.incomingNodes) {
            const incomingNode = toNode.connection.incomingNodes[idSocket as IdInputSocket];
            for (const key of incomingNode.keys()) {
                if (incomingNode.get(key)?.otherNode == fromNode) {
                    incomingNode.delete(key);
                }
            }
        }
        for (const idSocket in fromNode.connection.outgoingNodes) {
            const outgoingNode = fromNode.connection.outgoingNodes[idSocket as IdOutputSocket];
            for (const key of outgoingNode.keys()) {
                if (outgoingNode.get(key)?.otherNode == fromNode) {
                    outgoingNode.delete(key);
                }
            }
        }
    }

    SystemCheckChild(nodeMain: Node, nodeTarget: Node) {
        if (nodeMain == nodeTarget) {
            return true;
        } else {
            for (const idSocket in nodeMain.connection.incomingNodes) {
                const incomingNode = nodeMain.connection.incomingNodes[idSocket as IdInputSocket];
                for (const key of incomingNode.keys()) {
                    const NodeIncomingNode = incomingNode.get(key);
                    if (NodeIncomingNode !== undefined) {
                        if (this.SystemCheckChild(NodeIncomingNode.otherNode, nodeTarget)) {
                            return true;
                        }
                    }

                }
            }
            return false
        }
    }

    private createPathLine(fromNode: { node: Node, idSocket: IdOutputSocket }, toNode: { node: Node, idSocket: IdInputSocket }){
        
        const length_horizontal_line = 15;
        const positionSocketFrom = fromNode.node.getPositionSocketOutput(fromNode.idSocket);
        const positionSocketTo = toNode.node.getPositionSocketInput(toNode.idSocket);
        const path = SetElementPath({
            d: `M ${positionSocketFrom.x} ${positionSocketFrom.y} L ${positionSocketFrom.x + length_horizontal_line} ${positionSocketFrom.y} L ${positionSocketTo.x - length_horizontal_line} ${positionSocketTo.y} L ${positionSocketTo.x} ${positionSocketTo.y}`,
            stroke: 'white',
            strokeWidth: '2',
            strokeLinejoin: 'round',
            fill: 'none',
            attr: {
                'node-from': `${fromNode.node.id}`,
                'socket-from': `${fromNode.idSocket}`,
                'node-to': `${toNode.node.id}`,
                'socket-to': `${toNode.idSocket}`,
            }
        });
        this.HtmlPlaceCurve.appendChild(path);
        fromNode.node.OutgoingPathLines.set(`${fromNode.node.id},${fromNode.idSocket},${toNode.node.id},${toNode.idSocket}`, path);
    }
}