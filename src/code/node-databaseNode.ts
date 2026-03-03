import { SetElementPath } from "./helper/addons";
import { Node } from "./node-node";
import { SystemConnected } from "./node-systemConnected";

export class DBNode { //<?> Point 
    private dataBase: Record<string, Node>;
    private Count: number;
    System_connected: SystemConnected;
    HtmlPlaceCurve: HTMLElement;

    constructor(HtmlPlaceCurve: HTMLElement) {
        this.dataBase = {};
        this.Count = 0;
        this.System_connected = new SystemConnected(this);
        this.HtmlPlaceCurve = HtmlPlaceCurve;

    }

    add(node: Node) {
        node.SetId(`node_${this.Count}`);
        this.dataBase[node.id] = node;
        this.Count++;
    }

    removeById(id: string) {
        const element = this.dataBase[id];
        if (element) {
            delete this.dataBase[id];
        }
    }

    getById(id: string): Node | undefined {
        return this.dataBase[id]
    }

    getAll() {
        return Object.values(this.dataBase)
    }

    SystemCheckObjectConnectToObject(nodeMain: { node: Node, idSocket: string }, nodeTarget: { node: Node, idSocket: string }) {
        for (const incomingNode of nodeTarget.node.connection.incomingNodes[nodeTarget.idSocket].values()) {
            if (incomingNode.Node == nodeMain.node) {
                if (incomingNode.fromIdSocket == nodeMain.idSocket) {
                    return 1
                } else {
                    return 2
                }
            }
        }
        return 0;
    }

    SystemConnectingNode(fromNode: { node: Node, idSocket: string }, toNode: { node: Node, idSocket: string }) {
        //a
        fromNode.node.connection.outgoingNodes[fromNode.idSocket].set(`${toNode.node.id},${toNode.idSocket}`, {
            Node: toNode.node,
            fromIdSocket: fromNode.idSocket,
            toIdSocket: toNode.idSocket,
        })
        toNode.node.connection.incomingNodes[toNode.idSocket].set(`${fromNode.node.id},${fromNode.idSocket}`, {
            Node: fromNode.node,
            fromIdSocket: fromNode.idSocket,
            toIdSocket: toNode.idSocket,
        })

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
        fromNode.node.HtmlOutgoingPath.set(`${fromNode.node.id},${fromNode.idSocket},${toNode.node.id},${toNode.idSocket}`, path);

    }

    SystemRemovingConnection(fromNode: { node: Node, idSocket: string }, toNode: { node: Node, idSocket: string }) {
        const incomingNode_ToNode = toNode.node.connection.incomingNodes[toNode.idSocket].values().next();
        if (!incomingNode_ToNode.done) {
            if (incomingNode_ToNode.value.Node == fromNode.node) {
                const keyIncomingNode = toNode.node.connection.incomingNodes[toNode.idSocket].keys().next().value ?? '';
                toNode.node.connection.incomingNodes[toNode.idSocket].delete(keyIncomingNode);
                for (const key of fromNode.node.connection.outgoingNodes[fromNode.idSocket].keys()) {
                    const outgoingNodes = fromNode.node.connection.outgoingNodes[fromNode.idSocket].get(key);
                    if (outgoingNodes !== undefined) {
                        if (outgoingNodes.Node == toNode.node && outgoingNodes.toIdSocket == toNode.idSocket) {
                            fromNode.node.connection.outgoingNodes[fromNode.idSocket].delete(key);
                            break;
                        }
                    }

                }

                this.HtmlPlaceCurve.querySelector(`[node-from="${fromNode.node.id}"][socket-from="${fromNode.idSocket}"][node-to="${toNode.node.id}"][socket-to="${toNode.idSocket}"]`)?.remove();

                fromNode.node.HtmlOutgoingPath.delete(`${fromNode.node.id},${fromNode.idSocket},${toNode.node.id},${toNode.idSocket}`);

            }
        } else console.log("Bug");


    }

    SystemRemovingAllConnection(fromNode: Node, toNode: Node) {
        for (const idSocket in toNode.connection.incomingNodes) {
            const incomingNode = toNode.connection.incomingNodes[idSocket];
            for (const key of incomingNode.keys()) {
                if (incomingNode.get(key)?.Node == fromNode) {
                    incomingNode.delete(key);
                }
            }
        }
        for (const idSocket in fromNode.connection.outgoingNodes) {
            const outgoingNode = fromNode.connection.outgoingNodes[idSocket];
            for (const key of outgoingNode.keys()) {
                if (outgoingNode.get(key)?.Node == fromNode) {
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
                const incomingNode = nodeMain.connection.incomingNodes[idSocket];
                for (const key of incomingNode.keys()) {
                    const NodeIncomingNode = incomingNode.get(key);
                    if (NodeIncomingNode !== undefined) {
                        if (this.SystemCheckChild(NodeIncomingNode.Node, nodeTarget)) {
                            return true;
                        }
                    }

                }
            }
            return false
        }
    }

}