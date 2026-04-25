import type { MouseButtonState } from "../mouseButtonState";
import { GetScreenToWorld2d, type World2d } from "../world2d/world2d";
import type { NodeDatabase } from "./database";
import type { NodeProcessor } from "./nodeProcessor";
import type { IdInputSocket, IdNode, IdOutputSocket, IdSocket } from "./nodeTypes";
import { getSocketPosition_world2d, HORIZONTAL_SEGMENT_LENGTH, type Node } from "./node"
import { SetElementSvg } from "../helper/addons";

type ConnectionEndpoint = {node:Node, idSocket:IdSocket};

export class ConnectionManager {
    private parent: NodeDatabase;
    private PairNode: {
        from_node?: ConnectionEndpoint, 
        to_node?: ConnectionEndpoint;
    }

    constructor(parent: NodeDatabase) {
        this.parent = parent;
        this.PairNode = {};
    }

    reset(){
        this.PairNode.from_node = undefined;
        this.PairNode.to_node = undefined;
    }

    setFromNode(node:Node, idSocket:IdSocket){
        this.PairNode.from_node = {node:node, idSocket:idSocket};
        this.PairNode.to_node = undefined;
    }

    setToNode(node:Node, idSocket:IdSocket){
        this.PairNode.to_node = {node:node, idSocket:idSocket};
    }

    getFromNode(){
        return this.PairNode.from_node;
    }

    getToNode(){
        return this.PairNode.to_node;
    }
    

    getSocketType(endpoint: ConnectionEndpoint){
        if (endpoint.idSocket.startsWith('outputsocket_')) {
            return 'outputsocket';
        }

        return 'inputsocket'
    }

    makeConnectionNodeWithRule(
        fromNode: {
            node: Node<"number", "number">;
            idSocket: IdOutputSocket;
        }, 
        toNode: {
            node: Node;
            idSocket: IdInputSocket;
        }
    ){
        // Aturan yang di gunakan
        // 1. Koneksi tidak boleh berulang (siklik)
        // 2. Input hanya boleh terkoneksi 1 Output saja 0..1
        // 3. Output bisa terkoneksi ke banyak input 0..many
        // 4. Jika Input sudah terkoneksi dan Output lain akan terkoneksi ke input, maka koneksi lama akan di putuskan dan di hubungkan ke koneksi baru
        // 5. Jika Output sudah terkoneksi dan akan di koneksikan lagi ke input yang sama, tidak ada perubahan apapun

        if (!this.parent.SystemCheckChild(fromNode.node, toNode.node)) {
            const stateConnection = this.parent.SystemCheckSocketConnectToSocket(fromNode, toNode);
            if (stateConnection == 0) {
                this.parent.SystemConnectingNode(fromNode, toNode);
                return true;
            }else if (stateConnection == 1) {
                const prevConnectionToNode = toNode.node.connection.incomingNodes[toNode.idSocket].values().next().value;
                if (!prevConnectionToNode) {
                    console.error('BUG');
                    return false;
                }
                this.parent.SystemRemovingConnection(
                    {
                        node: prevConnectionToNode.otherNode,
                        idSocket: prevConnectionToNode.otherIdSocket
                    }, 
                    toNode
                );
                this.parent.SystemConnectingNode(fromNode, toNode);
                return true;
            }
        }
        return false;
    }

    startConnection(nodeProcessor:NodeProcessor){
        const fromNode = this.getFromNode();
        const toNode = this.getToNode();

        if (fromNode !== undefined && toNode !== undefined) {
            if (this.getSocketType(fromNode) == 'outputsocket' && this.getSocketType(toNode) == 'inputsocket') {
                console.log('Output to Input');
                console.log(this.show());
                if (this.makeConnectionNodeWithRule(
                    {node: fromNode.node, idSocket: fromNode.idSocket as IdOutputSocket}, 
                    {node: toNode.node, idSocket: toNode.idSocket as IdInputSocket}
                )) {
                    nodeProcessor.setProcess(fromNode.node);
                }
                
            }else if(this.getSocketType(fromNode) == 'inputsocket' && this.getSocketType(toNode) == 'outputsocket') {
                console.log('Input to Output');
                console.log(this.show());
                
                if (this.makeConnectionNodeWithRule(
                    {node: toNode.node, idSocket : toNode.idSocket as IdOutputSocket},
                    {node: fromNode.node, idSocket: fromNode.idSocket as IdInputSocket}
                )) {
                    nodeProcessor.setProcess(fromNode.node);
                }
            }
        }
    }

    show(){
        const from = this.PairNode.from_node;
        const to = this.PairNode.to_node;
        return `${from? `${from.node.id} ${from.idSocket}` : '[none]'} -> ${to? `${to.node.id} ${to.idSocket}` : '[none]'}`
    }

}

export function CheckConnectedNode(world2d: World2d, database:NodeDatabase, mouseState:MouseButtonState, nodeProcessor:NodeProcessor) {
    world2d.HtmlElement.addEventListener('mousedown', (ev) => {
        if (ev.button != 0 || mouseState.getSignal('left') != 'world2d') {
            return;
        }

        const socketRadiusElement = (ev.target as HTMLElement | null);
        if (!socketRadiusElement?.classList.contains('node-item-socket-radius')) {
            return;
        }

        const socketElement = socketRadiusElement.previousElementSibling as HTMLDivElement;

        if (socketElement.id.startsWith('outputsocket_')) {
            mouseState.setAlt(ev, 'left', 'inSocketOutput');
        }else{
            mouseState.setAlt(ev, 'left', 'inSocketInput');
        }
    });

    window.addEventListener('mousemove', (ev) => {
        if (mouseState.getSignal('left') == 'inSocketOutput' ||
            mouseState.getSignal('left') == 'inSocketInput') { //
            //<- Here 

            const elSocketRadius = ev.target as HTMLDivElement;
            const elSocket = elSocketRadius.previousElementSibling as HTMLDivElement;
            const elNode = elSocket.closest('[id^="node_"]') as HTMLDivElement;

            const node = database.getById(elNode.id as IdNode);

            if (!node) {
                console.error('BUG');
                return;
            }

            if (elSocket.id.startsWith('outputsocket_')) {
                database.connectedSystem.reset();
                database.connectedSystem.setFromNode(node, elSocket.id as IdSocket);
                console.log('Output');
                
            }else if (elSocket.id.startsWith('inputsocket_')) {
                const outputNodes = node.connection.incomingNodes[elSocket.id as IdInputSocket]
                console.log('Input');
                if (outputNodes.size >= 1) {
                    
                    const outputNode = outputNodes.values().next().value!
                    //? hapus koneksi lama
                    database.SystemRemovingConnection({node:outputNode.otherNode, idSocket:outputNode.otherIdSocket}, {node:node, idSocket:elSocket.id as IdInputSocket})

                    database.connectedSystem.reset();
                    database.connectedSystem.setFromNode(outputNode.otherNode, outputNode.otherIdSocket);
                }else {
                    database.connectedSystem.reset();
                    database.connectedSystem.setFromNode(node, elSocket.id as IdSocket);
                }
            }else{
                console.error('BUG');
                return;
            }

            const atributeOutputNode = database.connectedSystem.getFromNode();
            if (!atributeOutputNode) {
                console.error('BUG');
                return;
            }

            const positionMouse_world2d = GetScreenToWorld2d({x:ev.clientX, y:ev.clientY}, world2d);
            const positionSocketOutput =  getSocketPosition_world2d(atributeOutputNode.node, atributeOutputNode.idSocket as IdInputSocket);

            if (!positionSocketOutput) {
                console.error('BUG');
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

        if (mouseState.getSignal('left') == 'socketSelected') {
            //<- Here 
            const isOutput = database.connectedSystem.getFromNode()!.idSocket.startsWith('outputsocket_')
            const atributeOutputNode = database.connectedSystem.getFromNode();
            if (!atributeOutputNode) {
                console.error('BUG');
                return;
            }

            let positionTo_world2d = GetScreenToWorld2d({x:ev.clientX, y:ev.clientY}, world2d);
            const positionSocket = getSocketPosition_world2d(atributeOutputNode.node, atributeOutputNode.idSocket as IdInputSocket);

            if (!positionSocket) {
                console.error('BUG');
                return;
            }

            const pathElement = document.getElementById('tempConnectionPath');

            if (!pathElement) {
                console.error("BUG");
                return;
            }

            const target = ev.target as HTMLElement
            const socketElement = target.previousElementSibling!
            if (target.classList.contains('node-item-socket-radius') && (isOutput? socketElement.id.startsWith('inputsocket_') : socketElement.id.startsWith('outputsocket_')) ) {
                
                const nodeElement = target.closest('[id^="node_"]')

                const node = nodeElement ? database.getById(nodeElement.id as IdNode) : undefined;

                if (!node) {
                    console.error('BUG');
                    return
                }

                const positionSocket = getSocketPosition_world2d(node, socketElement.id as IdInputSocket | IdOutputSocket);

                if (!positionSocket) {
                    console.error('BUG');
                    return;
                }

                positionTo_world2d = positionSocket;

            }

            if (isOutput) {
                pathElement.setAttribute('d', `M ${positionSocket.x} ${positionSocket.y} L ${positionSocket.x + HORIZONTAL_SEGMENT_LENGTH} ${positionSocket.y} L ${positionTo_world2d.x - HORIZONTAL_SEGMENT_LENGTH} ${positionTo_world2d.y} L ${positionTo_world2d.x} ${positionTo_world2d.y}`)
            }else {
                pathElement.setAttribute('d', `M ${positionTo_world2d.x} ${positionTo_world2d.y} L ${positionTo_world2d.x + HORIZONTAL_SEGMENT_LENGTH} ${positionTo_world2d.y} L ${positionSocket.x - HORIZONTAL_SEGMENT_LENGTH} ${positionSocket.y} L ${positionSocket.x} ${positionSocket.y}`)
            }

        }
    });

    window.addEventListener('mouseup', (ev) => {
        if (ev.button == 0 && mouseState.getSignal('left') == 'socketSelected') {
            //<- Here 

            const tempConnectionPath = document.getElementById('tempConnectionPath');
            if (!tempConnectionPath) {
                console.error("BUG");
                return;
            }
            
            tempConnectionPath.remove();
            
            const elSocketRadius = ev.target as HTMLDivElement;
            if (!elSocketRadius.classList.contains('node-item-socket-radius')) {
                return;
            }
            
            const elSocket = elSocketRadius.previousElementSibling as HTMLDivElement;
            const elNode = elSocket.closest('[id^="node_"]') as HTMLDivElement;

            const node = database.getById(elNode.id as IdNode);

            if (!node) {
                console.error('BUG');
                return;
            }

            database.connectedSystem.setToNode(node, elSocket.id as IdSocket);
            database.connectedSystem.startConnection(nodeProcessor);
            
            mouseState.setAlt(ev, 'left', 'idle');
        }
        if (ev.button == 0 && (mouseState.getSignal('left') == 'inSocketOutput' || mouseState.getSignal('left') == 'inSocketInput')) {
            //<- Here 



            mouseState.setAlt(ev, 'left', 'idle');
        }
    });
}