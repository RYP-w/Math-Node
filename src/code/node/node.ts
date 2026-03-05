//<!> file ini menjadi tempat untuk class node 

import type { Vector2 } from "../TypeDefinition";
import { DrawHtml } from "./drawHtml";

import { getAtribute_number } from "../helper/addons";

type DataTypeNode = 'number';

type IdSocket = string;
type IdInputSocket = `inputsocket_${number}`;
type IdOutputSocket = `outputsocket_${number}`;
type IdNode = `node_${number}`;
type IdValueBox = `valuebox_${number}`;
type IdPath = `${IdNode},${IdOutputSocket},${IdNode},${IdInputSocket}`;

//? class Socket
//? berisi id dan tipe socket
class Socket { 
    id: IdSocket;
    type: DataTypeNode;

    constructor(id: IdSocket, type: DataTypeNode) {
        this.id = id
        this.type = type;
    }
}

//? Class ValueBox
//? berisi idValue Box, tipe boxValue, literal value, flag enable boxValue dan Class Socket
class ValueBox {
    id: IdValueBox;
    type: DataTypeNode;
    value: number;
    enableInput: boolean;
    socket: Socket | null;

    constructor(id: IdValueBox, type: DataTypeNode, value = 20, enableInput: boolean) {
        this.id = id;
        this.type = type;
        this.value = value;
        this.enableInput = enableInput;
        this.socket = null;
    }

    setSocket(id: IdSocket) {
        this.socket = new Socket(id, this.type);
    }
}

let nodeIdCounter = 0;

export class Node {
    name: string; //? nama node
    id: IdNode ; //? id node (unique)
    position: Vector2; //? posisi node di world
    selected: boolean; //? flag apakah Node dipilih
    connection: { //? menyimpan semua koneksi node
        incomingNodes:Record<IdInputSocket, Map<IdNode, { //? daftar dari setiap socket input, setiap socket bisa menerima koneksi lebih dari 0 (ya walaupun saat ini tidak boleh)
            otherNode: Node;
            otherIdSocket: IdOutputSocket;
        }>>,
        outgoingNodes:Record<IdOutputSocket, Map<IdNode, {
            otherNode: Node;
            otherIdSocket: IdInputSocket;
        }>>,
        //? struktur map dengan value dictionary digunakan untuk memudahkan penghapusan node
    };
    outputSocket:Array<Socket>; //? list Socket output
    valueBoxs: Record<IdValueBox, ValueBox>; //? list ValueBox
    HtmlSockets: { //? list Container HTML Input / Output Socket
        inputSockets: Record<IdInputSocket, HTMLElement>,
        outputSockets: Record<IdOutputSocket, HTMLElement>,
    };
    HtmlElement: HTMLDivElement; //? Container Html Node (self)
    OutgoingPathLines: Map<IdPath,SVGPathElement>; //? list Html Path lines
    zIndex: number; //? position z / layer

    constructor(name: string, position: Vector2, valueBoxs: Array<{ type: DataTypeNode, value: number, enableInput: boolean }>, outputSockets: Array<{ type: DataTypeNode, value: number }>){
        this.name = name;
        this.id = `node_${nodeIdCounter++}` as IdNode;
        this.position = position;
        this.selected = false;
        this.connection = {
            incomingNodes: {},
            outgoingNodes: {},
        };
        this.outputSocket = [];
        this.valueBoxs = {};
        
        this.HtmlSockets = { inputSockets: {}, outputSockets: {} };
        this.OutgoingPathLines = new Map();

        initValueBox(this, valueBoxs);
        initOutputSocket(this, outputSockets);
        this.HtmlElement = DrawHtml(this) as HTMLDivElement
        this.HtmlElement.id = this.id;
        this.zIndex = 0;

        initHtmlSocket(this);
        setAttributePositionSocket(this);
    }

    getPositionSocketInput(idSocket: IdInputSocket) { //? dapatkan posisi dari Socket input
        const op: Vector2 = {
            x: this.position.x + parseFloat(this.HtmlSockets.inputSockets[idSocket].getAttribute('position-socket-x') as string),
            y: this.position.y + parseFloat(this.HtmlSockets.inputSockets[idSocket].getAttribute('position-socket-y') as string),
        }
        return op
    }

    getPositionSocketOutput(idSocket: IdOutputSocket) { //? dapatkan posisi dari Socket output
        const op: Vector2 = {
            x: this.position.x + parseFloat(this.HtmlSockets.outputSockets[idSocket].getAttribute('position-socket-x') as string),
            y: this.position.y + parseFloat(this.HtmlSockets.outputSockets[idSocket].getAttribute('position-socket-y') as string),
        }
        return op
    }

    UpdateHTMLPosition() { //? update position dari Html Node
        this.HtmlElement.style.setProperty('--position-x', `${this.position.x}px`);
        this.HtmlElement.style.setProperty('--position-y', `${this.position.y}px`);
        this.UpdateHtmlPathPosition();
    }

    UpdateHtmlPathPosition() { //? update path line position dari Html
        const length_horizontal_line = 15;
        for (const [key, path] of this.OutgoingPathLines) {
            let [_, idOutputSocket, idInputNode, idInputSocket] = key.split(',') as [IdNode, IdOutputSocket, IdNode, IdInputSocket];
            const outgoingNode = this.connection.outgoingNodes[idOutputSocket].get(idInputNode);
            if (outgoingNode != undefined) {
                const positionSocketFrom = this.getPositionSocketOutput(idOutputSocket);
                const positionSocketTo = outgoingNode.otherNode.getPositionSocketInput(idInputSocket);
                //
                path.setAttribute('d', `M ${positionSocketFrom.x} ${positionSocketFrom.y} L ${positionSocketFrom.x + length_horizontal_line} ${positionSocketFrom.y} L ${positionSocketTo.x - length_horizontal_line} ${positionSocketTo.y} L ${positionSocketTo.x} ${positionSocketTo.y}`)
            } else console.log('Bug');
        }
        for (const thisIdSocket in this.connection.incomingNodes) {
            for (const incomingNodes of this.connection.incomingNodes[thisIdSocket as IdInputSocket].values()) {
                const HtmlPathIncomingNode = incomingNodes.otherNode.OutgoingPathLines.get(`${incomingNodes.otherNode.id},${incomingNodes.otherIdSocket},${this.id},${thisIdSocket as IdInputSocket}`);
                if (HtmlPathIncomingNode != undefined) {
                    const positionSocketFrom = incomingNodes.otherNode.getPositionSocketOutput(incomingNodes.otherIdSocket);
                    const positionSocketTo = this.getPositionSocketInput(thisIdSocket as IdInputSocket);
                    HtmlPathIncomingNode.setAttribute('d', `M ${positionSocketFrom.x} ${positionSocketFrom.y} L ${positionSocketFrom.x + length_horizontal_line} ${positionSocketFrom.y} L ${positionSocketTo.x - length_horizontal_line} ${positionSocketTo.y} L ${positionSocketTo.x} ${positionSocketTo.y}`)
                }
            }
        }

    }
}

function initValueBox(node:Node, valueBoxs:Array<{ type: DataTypeNode, value: number, enableInput: boolean }>){
    let countIdValueBox = 0;
    let countIdSocket = 0;
    for (const valueBox of valueBoxs){
        const idValueBox:IdValueBox = `valuebox_${countIdValueBox}`;
        node.valueBoxs[idValueBox] = new ValueBox(idValueBox, valueBox.type, valueBox.value, valueBox.enableInput);
        if (valueBox.enableInput) {
            const inputIdSocket:IdInputSocket = `inputsocket_${countIdSocket}`;
            node.valueBoxs[idValueBox].setSocket(inputIdSocket);
            node.connection.incomingNodes[inputIdSocket] = new Map();
            countIdSocket++;
        }
        countIdValueBox++;
    }
}

function initOutputSocket(node:Node, outputSockets: Array<{ type: DataTypeNode, value: number }>){
    let countIdSocket = 0;
    node.outputSocket = [];
    for (const outputSocket of outputSockets){
        const IdSocket:IdOutputSocket = `outputsocket_${countIdSocket}`;
        node.outputSocket.push(new Socket(IdSocket, outputSocket.type));
        node.connection.outgoingNodes[IdSocket] = new Map()
        countIdSocket++;
    }
}

function initHtmlSocket(node:Node) {
    for (const socketId in node.valueBoxs) {
        if (node.valueBoxs[socketId as IdValueBox].enableInput) {
            const idSocket = node.valueBoxs[socketId as IdValueBox].socket?.id as IdInputSocket;
            const HtmlSocket = node.HtmlElement.querySelector(`#${idSocket}`) as HTMLElement;
            node.HtmlSockets.inputSockets[idSocket] = HtmlSocket;
        }
    }

    for (let i = 0; i < node.outputSocket.length; i++) {
        const idSocket = node.outputSocket[i].id as IdOutputSocket;
        const HtmlSocket = node.HtmlElement.querySelector(`#${idSocket}`) as HTMLElement;
        node.HtmlSockets.outputSockets[idSocket] = HtmlSocket;
    }
}

function setAttributePositionSocket(node:Node) {
    const heightTitle = getAtribute_number(node.HtmlElement, '--height-title');
    const widthNode = getAtribute_number(node.HtmlElement, '--width-node');
    const headerLineWeight = getAtribute_number(node.HtmlElement, '--header-line-weight');
    const gapVertical = getAtribute_number(node.HtmlElement, '--gap-vertical-node-body');
    const marginY = getAtribute_number(node.HtmlElement, '--margin-y-container-items');
    const heightItems = getAtribute_number(node.HtmlElement, '--height-size-items');
    const sizeSocket = getAtribute_number(node.HtmlElement, '--size-socket');
    const offsiteSocket = getAtribute_number(node.HtmlElement, '--offsite-socket');
    const outline = getAtribute_number(node.HtmlElement, '--outline');

    const locationSocketY = heightTitle + headerLineWeight + (gapVertical - marginY) + ((marginY * 2 + heightItems) / 2);
    const itemSpacing = marginY * 2 + heightItems - sizeSocket / 2;
    const socketXInput = sizeSocket + offsiteSocket - outline - sizeSocket / 2;
    const socketXOutput = widthNode + sizeSocket + offsiteSocket + outline - sizeSocket / 2;

    let count = 0;
    for (const socketId in node.valueBoxs){
        if (node.valueBoxs[socketId as IdValueBox].enableInput) {
            const HtmlSocket = node.HtmlSockets.inputSockets[node.valueBoxs[socketId as IdValueBox].socket?.id as IdInputSocket];

            HtmlSocket.setAttribute('position-socket-x', `${socketXInput}px`);
            HtmlSocket.setAttribute('position-socket-y', `${locationSocketY + itemSpacing * count}px`);
        }
        count++;
    }

    count = 0;
    for ( const outputSocket in node.HtmlSockets.outputSockets ){
        const HtmlSocket = node.HtmlSockets.outputSockets[outputSocket as IdOutputSocket];

        HtmlSocket.setAttribute('position-socket-x', `${socketXOutput}px`);
        HtmlSocket.setAttribute('position-socket-y', `${locationSocketY + itemSpacing * count}px`);

        count++;
    }

}