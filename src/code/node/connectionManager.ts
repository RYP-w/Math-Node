import { markAllDirty } from "../engineNode/engineNode";
import type { MouseButtonState } from "../mouseButtonState";
import type { World2d } from "../world2d/world2d";
import type { DatabaseNode } from "./database";
import { Node, type IdInputSocket, type IdNode, type IdOutputSocket } from "./node";

export class ConnectionManager{
    private parent: DatabaseNode; //? ikat database Node ke ConnectionManager
    private nodePair: { //? struktur data untuk memasang node output dan input
        from_node?: {node: Node, idSocket:IdOutputSocket},
        to_node?: {node: Node, idSocket: IdInputSocket}
    }

    constructor(parent: DatabaseNode){
        this.parent = parent
        this.nodePair = {};
    }

    setConnectionStart(event: MouseEvent): boolean {
        const target = event.target as HTMLElement;

        if (!target.classList.contains("node-item-socket") || !target.classList.contains("output")) {
            return false;
        }

        const HtmlNode = target.closest('[id^="node_"]') as HTMLElement;
        if (!HtmlNode) {
            console.warn("Socket element not inside a node");
            return false;
        }

        const Node = this.parent.getById(HtmlNode.id as IdNode);
        if (Node == undefined) { 
            console.warn("BUG: Node not found in database"); 
            return false; 
        }

        this.nodePair.from_node = {
            node: Node,
            idSocket: target.id as IdOutputSocket,
        };

        return true;
    }

    setConnectionEnd(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (target.classList.contains("node-item-socket") && target.classList.contains("input")) {
            const HtmlNode = target.closest('[id^="node_"]') as HTMLElement;

            this.nodePair.to_node = {
                node: this.parent.getById(HtmlNode.id as IdNode) as Node,
                idSocket: target.id as IdInputSocket,
            };
        } else {
            this.nodePair = {};
        }
    }

    processConnection() {
        if (this.nodePair.from_node !== undefined && this.nodePair.to_node !== undefined) {
            // logic koneksi (7 aturan basic)
            if (!this.parent.SystemCheckChild(this.nodePair.from_node.node, this.nodePair.to_node.node)) {
                const checkSignal = this.parent.SystemCheckObjectConnectToObject(
                    { node: this.nodePair.from_node.node, idSocket: this.nodePair.from_node.idSocket },
                    { node: this.nodePair.to_node.node, idSocket: this.nodePair.to_node.idSocket },
                )

                console.log(this.nodePair);

                if (checkSignal == 1) {
                    this.parent.SystemRemovingConnection(
                        { node: this.nodePair.from_node.node, idSocket: this.nodePair.from_node.idSocket },
                        { node: this.nodePair.to_node.node, idSocket: this.nodePair.to_node.idSocket },
                    )
                    console.log('Check Signal 1');
                } else if (checkSignal == 2) {
                    const incomingNode_ToNode = this.nodePair.to_node.node.connection.incomingNodes[this.nodePair.to_node.idSocket].values().next();
                    if (!incomingNode_ToNode.done) {
                        this.parent.SystemRemovingConnection(
                            { node: this.nodePair.from_node.node, idSocket: incomingNode_ToNode.value.otherIdSocket },
                            { node: this.nodePair.to_node.node, idSocket: this.nodePair.to_node.idSocket },
                        )
                        this.parent.SystemConnectingNode(
                            { node: this.nodePair.from_node.node, idSocket: this.nodePair.from_node.idSocket },
                            { node: this.nodePair.to_node.node, idSocket: this.nodePair.to_node.idSocket },
                        )

                    } else console.log('ada yang kosong');


                    console.log('Check Signal 2');
                } else {
                    if (this.nodePair.to_node.node.connection.incomingNodes[this.nodePair.to_node.idSocket].size == 0) {
                        this.parent.SystemConnectingNode(
                            { node: this.nodePair.from_node.node, idSocket: this.nodePair.from_node.idSocket },
                            { node: this.nodePair.to_node.node, idSocket: this.nodePair.to_node.idSocket },
                        )
                        console.log('Check Signal 3 1');
                    } else {
                        const incomingNode_ToNode = this.nodePair.to_node.node.connection.incomingNodes[this.nodePair.to_node.idSocket].values().next();
                        if (!incomingNode_ToNode.done) {
                            this.parent.SystemRemovingConnection(
                                { node: incomingNode_ToNode.value.otherNode, idSocket: incomingNode_ToNode.value.otherIdSocket },
                                { node: this.nodePair.to_node.node, idSocket: this.nodePair.to_node.idSocket },
                            )
                            this.parent.SystemConnectingNode(
                                { node: this.nodePair.from_node.node, idSocket: this.nodePair.from_node.idSocket },
                                { node: this.nodePair.to_node.node, idSocket: this.nodePair.to_node.idSocket },
                            )
                        } else console.log('Bug');


                        console.log('Check Signal 3 2');
                    }

                }
                console.log(...markAllDirty(this.nodePair.to_node.node));
            }
            this.nodePair = {};
        } else {
            this.nodePair = {};
        }
    }
}

export function CheckConnectedNode(world2d: World2d, database:DatabaseNode, mouseState:MouseButtonState) {
    world2d.HtmlElement.addEventListener("mousedown", (ev) => {
        if (ev.button == 0 && mouseState.getSignal('left') == 'world2d') {

        }
    });

    window.addEventListener('mousemove', (ev) => {
        if (ev.buttons == 1 && mouseState.getSignal('left') == 'world2d') {
            const success = database.connectedSystem.setConnectionStart(ev);
            if (success) {
                mouseState.setAlt(ev, 'left', 'socketSelected');
            }
        }
        if (ev.buttons == 1 && mouseState.getSignal('left') == 'socketSelected') {
            
        }


    });

    window.addEventListener("mouseup", (ev) => {
        if (ev.button == 0 && mouseState.getSignal('left') == 'socketSelected') {
            database.connectedSystem.setConnectionEnd(ev);
            database.connectedSystem.processConnection();
            mouseState.setAlt(ev, 'left', '');
        }
    });
}