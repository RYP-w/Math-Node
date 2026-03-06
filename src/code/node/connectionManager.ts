import type { DatabaseNode } from "./database";
import { Node } from "./node";

type IdInputSocket = `inputsocket_${number}`;
type IdOutputSocket = `outputsocket_${number}`;
type IdNode = `node_${number}`;

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

    setConnectionStart(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (target.classList.contains("node-item-socket") && target.classList.contains("output")) {
            const HtmlNode = target.closest('[id^="node_"]') as HTMLElement;
            const Node = this.parent.getById(HtmlNode.id as IdNode)
            if (Node == undefined){ console.warn("BUG"); return; };


            this.nodePair.from_node = {
                node: Node,
                idSocket: target.id as IdOutputSocket,
            };
        }
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
            }
            this.nodePair = {};
        } else {
            this.nodePair = {};
        }
    }
}