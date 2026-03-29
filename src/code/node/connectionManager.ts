import {  NodeProcessor } from "./nodeProcessor ";
import { SetElementSvg } from "../helper/addons";
import type { MouseButtonState } from "../mouseButtonState";
import { GetScreenToWorld2d, type World2d } from "../world2d/world2d";
import type { NodeDatabase } from "./database";
import { getSocketPosition_world2d, HORIZONTAL_SEGMENT_LENGTH, Node } from "./node";
import type { IdInputSocket, IdNode, IdOutputSocket } from "./nodeTypes";

export class ConnectionManager{
    private parent: NodeDatabase; //? ikat database Node ke ConnectionManager
    private nodePair: { //? struktur data untuk memasang node output dan input
        from_node?: {node: Node, idSocket:IdOutputSocket},
        to_node?: {node: Node, idSocket: IdInputSocket}
    }

    constructor(parent: NodeDatabase){
        this.parent = parent
        this.nodePair = {};
    }

    getFromNode() : {node: Node, idSocket:IdOutputSocket} | undefined {
        return this.nodePair.from_node;
    }

    getToNode() : {node: Node, idSocket:IdInputSocket} | undefined {
        return this.nodePair.to_node;
    }

    setConnectionStart(event: MouseEvent): boolean {
        const collisionElement = event.target as HTMLElement;
        const target = collisionElement.previousElementSibling as HTMLElement;

        if (!collisionElement.classList.contains("node-item-socket-radius") || !target.classList.contains("node-item-socket") || !target.classList.contains("output")) {
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
        const collisionElement = event.target as HTMLElement;
        const target = collisionElement.previousElementSibling as HTMLElement;

        if (collisionElement.classList.contains("node-item-socket-radius") && target.classList.contains('node-item-socket') && target.classList.contains("input")) {
            const HtmlNode = target.closest('[id^="node_"]') as HTMLElement;

            this.nodePair.to_node = {
                node: this.parent.getById(HtmlNode.id as IdNode) as Node,
                idSocket: target.id as IdInputSocket,
            };
        } else {
            this.nodePair = {};
        }
    }

    processConnection(torpologySortNode:NodeProcessor) {
        if (this.nodePair.from_node !== undefined && this.nodePair.to_node !== undefined) {
            // logic koneksi (7 aturan basic)
            if (!this.parent.SystemCheckChild(this.nodePair.from_node.node, this.nodePair.to_node.node)) {
                const checkSignal = this.parent.SystemCheckObjectConnectToObject(
                    { node: this.nodePair.from_node.node, idSocket: this.nodePair.from_node.idSocket },
                    { node: this.nodePair.to_node.node, idSocket: this.nodePair.to_node.idSocket },
                )

                if (checkSignal == 1) {
                    this.parent.SystemRemovingConnection(
                        { node: this.nodePair.from_node.node, idSocket: this.nodePair.from_node.idSocket },
                        { node: this.nodePair.to_node.node, idSocket: this.nodePair.to_node.idSocket },
                    )
                    const valueBox_toNode = this.nodePair.to_node.node.getValueboxByIdSocket(this.nodePair.to_node.idSocket);
                    if ( valueBox_toNode && (!valueBox_toNode.isFinite() || valueBox_toNode.isNaN()) ) {
                        valueBox_toNode.setValueToZero();
                        torpologySortNode.setTorpologycal(this.nodePair.to_node.node);
                    }
                    //c onsole.log('Check Signal 1');
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

                    } else console.log('BUG: ada yang kosong');

                    torpologySortNode.setTorpologycal(this.nodePair.from_node.node);
                    // c onsole.log('Check Signal 2');
                } else {
                    if (this.nodePair.to_node.node.connection.incomingNodes[this.nodePair.to_node.idSocket].size == 0) {
                        this.parent.SystemConnectingNode(
                            { node: this.nodePair.from_node.node, idSocket: this.nodePair.from_node.idSocket },
                            { node: this.nodePair.to_node.node, idSocket: this.nodePair.to_node.idSocket },
                        )
                        //c onsole.log('Check Signal 3 1');
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
                        } else console.log('BUG');


                        //c onsole.log('Check Signal 3 2');
                    }
                    torpologySortNode.setTorpologycal(this.nodePair.from_node.node);
                }
            }
            this.nodePair = {};
        } else {
            this.nodePair = {};
        }
    }
}

export function CheckConnectedNode(world2d: World2d, database:NodeDatabase, mouseState:MouseButtonState, torpologiSortNode:NodeProcessor) {
    world2d.HtmlElement.addEventListener("mousedown", (ev) => {
        if (ev.button != 0 || mouseState.getSignal('left') != 'world2d') {
            return;
        }

        const sockeyRadiusElement = (ev.target as HTMLElement | null);
        if (!sockeyRadiusElement?.classList.contains('node-item-socket-radius') || !sockeyRadiusElement.closest('[class*="output"]')) {
            return;
        }
        
        mouseState.setAlt(ev, 'left', 'inSocketOutput');
    });

    window.addEventListener('mousemove', (ev) => {
        if (ev.buttons == 1 && mouseState.getSignal('left') == 'inSocketOutput') {
            const success = database.connectedSystem.setConnectionStart(ev);
            if (success) {
                const atributeOutputNode = database.connectedSystem.getFromNode();
                if (!atributeOutputNode) {
                    console.log('BUG');
                    return;
                }

                const positionMouse_world2d = GetScreenToWorld2d({x:ev.clientX, y:ev.clientY}, world2d);
                const positionSocketOutput =  getSocketPosition_world2d(atributeOutputNode.node, atributeOutputNode.idSocket);

                if (!positionSocketOutput) {
                    console.log('BUG');
                    return;
                }

                database.HtmlPlaceCurve.appendChild(
                    SetElementSvg('path',{
                        id:'tempConnectionPath',
                        d: `M ${positionSocketOutput.x} ${positionSocketOutput.y} L ${positionSocketOutput.x + HORIZONTAL_SEGMENT_LENGTH} ${positionSocketOutput.y} L ${positionMouse_world2d.x - HORIZONTAL_SEGMENT_LENGTH} ${positionMouse_world2d.y} L ${positionMouse_world2d.x} ${positionMouse_world2d.y}`,
                        stroke: 'white',
                        strokeWidth: '2',
                        strokeLinejoin: 'round',
                        fill: 'none'
                    })
                )

                mouseState.setAlt(ev, 'left', 'socketSelected');
            }
        }
        if (ev.buttons == 1 && mouseState.getSignal('left') == 'socketSelected') {
            const atributeOutputNode = database.connectedSystem.getFromNode();
            if (!atributeOutputNode) {
                console.log('BUG');
                return;
            }

            let positionTo_world2d = GetScreenToWorld2d({x:ev.clientX, y:ev.clientY}, world2d);
            const positionSocketOutput = getSocketPosition_world2d(atributeOutputNode.node, atributeOutputNode.idSocket);

            if (!positionSocketOutput) {
                console.log('BUG');
                return;
            }

            const pathElement = document.getElementById('tempConnectionPath');

            if (!pathElement) {
                console.log("BUG");
                return;
            }

            const target = ev.target as HTMLElement
            const inputSocket = target.previousElementSibling
            if (target.classList.contains('node-item-socket-radius') && inputSocket?.id.startsWith('inputsocket_')) {
                
                const nodeElement = target.closest('[id^="node_"]')

                const node = nodeElement ? database.getById(nodeElement.id as IdNode) : undefined;

                if (!node) {
                    console.log('BUG');
                    return
                }

                const positionSocketInput = getSocketPosition_world2d(node, inputSocket.id as IdInputSocket);

                if (!positionSocketInput) {
                    console.log('BUG');
                    return;
                }

                positionTo_world2d = positionSocketInput;

            }

            pathElement.setAttribute('d', `M ${positionSocketOutput.x} ${positionSocketOutput.y} L ${positionSocketOutput.x + HORIZONTAL_SEGMENT_LENGTH} ${positionSocketOutput.y} L ${positionTo_world2d.x - HORIZONTAL_SEGMENT_LENGTH} ${positionTo_world2d.y} L ${positionTo_world2d.x} ${positionTo_world2d.y}`)
        }


    });

    window.addEventListener("mouseup", (ev) => {
        if (ev.button == 0 && mouseState.getSignal('left') == 'socketSelected') {
            const tempConnectionPath = document.getElementById('tempConnectionPath');
            if (!tempConnectionPath) {
                console.log("BUG");
                return;
            }
            
            tempConnectionPath.remove();
            database.connectedSystem.setConnectionEnd(ev);
            database.connectedSystem.processConnection(torpologiSortNode);
            mouseState.setAlt(ev, 'left', 'idle');
        }
        if (ev.button == 0 && mouseState.getSignal('left') == 'inSocketOutput') {
            mouseState.setAlt(ev, 'left', 'idle');
        }
    });
}