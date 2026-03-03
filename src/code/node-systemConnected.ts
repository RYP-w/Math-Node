import { DBNode } from "./node-databaseNode";
import { Node } from "./node-node";

export class SystemConnected { //<?> Point 
    private parent: DBNode;
    private Nodes: {
        from_node?: { node: Node, idSocket: string },
        to_node?: { node: Node, idSocket: string }
    }

    constructor(parent: DBNode) {
        this.Nodes = {};
        this.parent = parent;
    }

    //? mouse pressed
    SetFromNode(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (target.classList.contains("node-item-socket") && target.classList.contains("output")) {
            const HtmlNode = target.closest('[id^="node_"]') as HTMLElement;

            this.Nodes.from_node = {
                node: this.parent.getById(HtmlNode.id) as Node,
                idSocket: target.id,
            };
        }
    }

    SetToNode(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (target.classList.contains("node-item-socket") && target.classList.contains("input")) {
            const HtmlNode = target.closest('[id^="node_"]') as HTMLElement;

            this.Nodes.to_node = {
                node: this.parent.getById(HtmlNode.id) as Node,
                idSocket: target.id,
            };
        } else {
            this.Nodes = {};
        }
    }

    CheckListConnected() {
        if (this.Nodes.from_node !== undefined && this.Nodes.to_node !== undefined) {
            // logic koneksi (7 aturan basic)
            if (!this.parent.SystemCheckChild(this.Nodes.from_node.node, this.Nodes.to_node.node)) {
                const checkSignal = this.parent.SystemCheckObjectConnectToObject(
                    { node: this.Nodes.from_node.node, idSocket: this.Nodes.from_node.idSocket },
                    { node: this.Nodes.to_node.node, idSocket: this.Nodes.to_node.idSocket },
                )

                console.log(this.Nodes);


                if (checkSignal == 1) {
                    this.parent.SystemRemovingConnection(
                        { node: this.Nodes.from_node.node, idSocket: this.Nodes.from_node.idSocket },
                        { node: this.Nodes.to_node.node, idSocket: this.Nodes.to_node.idSocket },
                    )
                    console.log('Check Signal 1');
                } else if (checkSignal == 2) {
                    const incomingNode_ToNode = this.Nodes.to_node.node.connection.incomingNodes[this.Nodes.to_node.idSocket].values().next();
                    if (!incomingNode_ToNode.done) {
                        this.parent.SystemRemovingConnection(
                            { node: this.Nodes.from_node.node, idSocket: incomingNode_ToNode.value.fromIdSocket },
                            { node: this.Nodes.to_node.node, idSocket: this.Nodes.to_node.idSocket },
                        )
                        this.parent.SystemConnectingNode(
                            { node: this.Nodes.from_node.node, idSocket: this.Nodes.from_node.idSocket },
                            { node: this.Nodes.to_node.node, idSocket: this.Nodes.to_node.idSocket },
                        )

                    } else console.log('ada yang kosong');


                    console.log('Check Signal 2');
                } else {
                    if (this.Nodes.to_node.node.connection.incomingNodes[this.Nodes.to_node.idSocket].size == 0) {
                        this.parent.SystemConnectingNode(
                            { node: this.Nodes.from_node.node, idSocket: this.Nodes.from_node.idSocket },
                            { node: this.Nodes.to_node.node, idSocket: this.Nodes.to_node.idSocket },
                        )
                        console.log('Check Signal 3 1');
                    } else {
                        const incomingNode_ToNode = this.Nodes.to_node.node.connection.incomingNodes[this.Nodes.to_node.idSocket].values().next();
                        if (!incomingNode_ToNode.done) {
                            this.parent.SystemRemovingConnection(
                                { node: incomingNode_ToNode.value.Node, idSocket: incomingNode_ToNode.value.fromIdSocket },
                                { node: this.Nodes.to_node.node, idSocket: this.Nodes.to_node.idSocket },
                            )
                            this.parent.SystemConnectingNode(
                                { node: this.Nodes.from_node.node, idSocket: this.Nodes.from_node.idSocket },
                                { node: this.Nodes.to_node.node, idSocket: this.Nodes.to_node.idSocket },
                            )
                        } else console.log('Bug');


                        console.log('Check Signal 3 2');
                    }

                }
            }
            this.Nodes = {};
        } else {
            this.Nodes = {};
        }
    }

}


