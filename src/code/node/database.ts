import { ConnectionManager } from "./connectionManager";
import { SetElementSvg } from "../helper/addons";
import { RBushRectSelection } from "./rBushRectSelection";
import type { IdInputSocket, IdNode, IdOutputSocket, IdValueBox } from "./nodeTypes";
import { HORIZONTAL_SEGMENT_LENGTH, Node } from "./node";

export class NodeDatabase {
    private database:Map<IdNode, Node>; //? list Nodes
    connectedSystem: ConnectionManager;
    rBushSelection: RBushRectSelection;
    HtmlPlaceCurve: HTMLElement;

    constructor(HtmlPlaceCurve: HTMLElement, rBushSelection:RBushRectSelection){
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
            node.HtmlElement.remove();
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
        fromNode.node.connection.outgoingNodes[fromNode.idSocket].set(`${toNode.node.id}:${toNode.idSocket}`, {
            otherNode: toNode.node,
            otherIdSocket: toNode.idSocket,
        });
        toNode.node.connection.incomingNodes[toNode.idSocket].set(`${fromNode.node.id}:${fromNode.idSocket}`, {
            otherNode: fromNode.node,
            otherIdSocket: fromNode.idSocket,
        });

        this.createPathLine(fromNode,toNode);

        fromNode.node.HtmlSockets.outputSockets[fromNode.idSocket].setAttribute('connected','true');
        toNode.node.HtmlSockets.inputSockets[toNode.idSocket].setAttribute('connected','true');

        const elementValueBox = toNode.node.HtmlSockets.inputSockets[toNode.idSocket].closest('[id^="valuebox_"]');
        
        if (!elementValueBox) {
            ("BUG");
            return;
        }

        toNode.node.valueBoxs[elementValueBox.id as IdValueBox].changeStateReadonly(true)
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

                const pathSelector = `[node-from="${fromNode.node.id}"][socket-from="${fromNode.idSocket}"][node-to="${toNode.node.id}"][socket-to="${toNode.idSocket}"]`;
                const pathElement = this.HtmlPlaceCurve.querySelector(pathSelector);
                if (pathElement === null) {
                    console.error("BUG:",pathSelector);
                    return;
                }
                pathElement.remove();

                fromNode.node.OutgoingPathLines.delete(`${fromNode.node.id},${fromNode.idSocket},${toNode.node.id},${toNode.idSocket}`);

                if (fromNode.node.connection.outgoingNodes[fromNode.idSocket].size == 0) {
                    fromNode.node.HtmlSockets.outputSockets[fromNode.idSocket].setAttribute('connected','false');
                }
                if (toNode.node.connection.incomingNodes[toNode.idSocket].size == 0) {
                    toNode.node.HtmlSockets.inputSockets[toNode.idSocket].setAttribute('connected','false');
                }

                const elementValueBox = toNode.node.HtmlSockets.inputSockets[toNode.idSocket].closest('[id^="valuebox_"]');
                if (!elementValueBox) {
                    ("BUG");
                    return;
                }
                const valueBox = toNode.node.valueBoxs[elementValueBox.id as IdValueBox];

                //? why All? because in the future valueBox group might have 2 (x,y) or 3 (x,y,z) inputs.
                const elementInput = elementValueBox.querySelectorAll('[class*=input_]') as NodeListOf<HTMLInputElement>;
                
                if (elementInput.length == 0) {
                    ("BUG");
                    return;
                }

                valueBox.changeStateReadonly(false);

            }
        } else ("Bug");
    }

    SystemRemovingAllConnection(node:Node) {
        const incomingConnection = node.connection.incomingNodes;
        for (const idSocket of Object.keys(incomingConnection) as IdInputSocket[]){
            const incomingNodes = incomingConnection[idSocket];
            for (const incomingNode of incomingNodes.values()){
                this.SystemRemovingConnection({node:incomingNode.otherNode, idSocket:incomingNode.otherIdSocket}, {node:node, idSocket:idSocket});
            }
        }
        const outgoingConnection = node.connection.outgoingNodes;
        for (const idSocket of Object.keys(outgoingConnection) as IdOutputSocket[]){
            const outgoingNodes = outgoingConnection[idSocket];
            for (const outgoingNode of outgoingNodes.values()){
                this.SystemRemovingConnection({node:node, idSocket:idSocket}, {node:outgoingNode.otherNode, idSocket:outgoingNode.otherIdSocket});
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
        
        const positionSocketFrom = fromNode.node.getPositionSocketOutput(fromNode.idSocket);
        const positionSocketTo = toNode.node.getPositionSocketInput(toNode.idSocket);
        const path = SetElementSvg('path',{
            d: `M ${positionSocketFrom.x} ${positionSocketFrom.y} 
                L ${positionSocketFrom.x + HORIZONTAL_SEGMENT_LENGTH} ${positionSocketFrom.y} 
                L ${positionSocketTo.x - HORIZONTAL_SEGMENT_LENGTH} ${positionSocketTo.y} 
                L ${positionSocketTo.x} ${positionSocketTo.y}`,
            strokeWidth: '2',
            strokeLinejoin: 'round',
            fill: 'none',
            attr: {
                'node-from': `${fromNode.node.id}`,
                'socket-from': `${fromNode.idSocket}`,
                'node-to': `${toNode.node.id}`,
                'socket-to': `${toNode.idSocket}`,
            },
            class:['path-properties']
        });
        this.HtmlPlaceCurve.appendChild(path);
        fromNode.node.OutgoingPathLines.set(`${fromNode.node.id},${fromNode.idSocket},${toNode.node.id},${toNode.idSocket}`, path);

        // change path color directly according to socket output state
        const statePath = fromNode.node.outputSockets.get(fromNode.idSocket)?.state;
        if (!statePath) {
            console.error('BUG:','tidak ada socket pada node,', fromNode.idSocket);
            return;
        }
        path.style.setProperty('stroke',`var(--${statePath})`);
    }
}