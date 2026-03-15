//<!> file ini menjadi tempat untuk class node 

import type { Vector2 } from "../TypeDefinition";
import { createNodeElement } from "./createNodeElement";

import { getAtribute_number } from "../helper/addons";
import Decimal from "decimal.js";
import {isNumericBinary, isNumericUnary, isNumericUnique, type DataTypeNode, type IdInputSocket, type IdNode, type IdOutputSocket, type IdPath, type IdSocket, type IdValueBox, type TypeNode, type ValueByType } from "./typesDefinition";



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
class ValueBox<T extends DataTypeNode = DataTypeNode> {
    id: IdValueBox;
    type: T;
    value: ValueByType[T];
    enableInput: boolean;
    socket: Socket | null;

    constructor(id: IdValueBox, type: T, value:ValueByType[T], enableInput: boolean) {
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

class OutputSocket<T extends DataTypeNode = DataTypeNode> extends Socket {
    value: ValueByType[T];
    constructor(id: IdSocket, type: T, value:ValueByType[T]){
        super(id,type);
        this.value =  value;
    }
}

let nodeIdCounter = 0;

export class Node<T1 extends DataTypeNode = DataTypeNode, T2 extends DataTypeNode = DataTypeNode> {
    name: string; //? nama node
    type:TypeNode;
    id: IdNode ; //? id node (unique)
    position: Vector2; //? posisi node di world
    selected: boolean; //? flag apakah Node dipilih
    connection: { //? menyimpan semua koneksi node
        incomingNodes:Record<IdInputSocket, Map<`${IdNode}:${IdOutputSocket}`, { //? daftar dari setiap socket input, setiap socket bisa menerima koneksi lebih dari 0 (ya walaupun saat ini tidak boleh)
            otherNode: Node;
            otherIdSocket: IdOutputSocket;
        }>>,
        outgoingNodes:Record<IdOutputSocket, Map<`${IdNode}:${IdInputSocket}`, {
            otherNode: Node;
            otherIdSocket: IdInputSocket;
        }>>,
        //? struktur map dengan value dictionary digunakan untuk memudahkan penghapusan node
    };
    outputSockets:Map<IdOutputSocket,OutputSocket>; //? list Socket output
    //! memakai valueBoxs harus di grouping sesuai dengan type pada valuebox, lihat `UpdateHtmlValueBoxs`
    valueBoxs: Record<IdValueBox, ValueBox>; //? list ValueBox
    HtmlSockets: { //? list Container HTML Input / Output Socket
        inputSockets: Record<IdInputSocket, HTMLElement>,
        outputSockets: Record<IdOutputSocket, HTMLElement>,
    };
    HtmlValueBoxs:Record<IdValueBox,HTMLElement>;
    HtmlElement: HTMLDivElement; //? Container Html Node (self)
    OutgoingPathLines: Map<IdPath,SVGPathElement>; //? list Html Path lines
    zIndex: number; //? position z / layer

    dirty:boolean;

    constructor(name: string,type:TypeNode, position: Vector2, valueBoxs: Array<{ type: T1, value: ValueByType[T1], enableInput: boolean }>, outputSockets: Array<{ type: T2, value: ValueByType[T2] }>){
        this.name = name;
        this.type = type;
        this.id = `node_${nodeIdCounter++}` as IdNode;
        this.position = position;
        this.selected = false;
        this.connection = {
            incomingNodes: {},
            outgoingNodes: {},
        };
        this.outputSockets = new Map();
        this.valueBoxs = {};
        
        this.HtmlSockets = { inputSockets: {}, outputSockets: {} };
        this.HtmlValueBoxs = {};
        this.OutgoingPathLines = new Map();

        initValueBox(this, valueBoxs);
        initOutputSocket(this, outputSockets);
        this.HtmlElement = createNodeElement(this) as HTMLDivElement
        this.HtmlElement.id = this.id;
        this.zIndex = 0;
        this.dirty = false;

        initHtmlValueboxs(this);
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

    updateValueNode(){
        for (const idValueBox of Object.keys(this.valueBoxs) as IdValueBox[]){
            const valueBox = this.valueBoxs[idValueBox];
            if (valueBox.type == 'number') {
                if (valueBox.enableInput){
                    const inputConnected = this.connection.incomingNodes[valueBox.socket!.id as IdInputSocket];
                    if (inputConnected.size > 1) {
                        console.log("BUG:");
                        break;
                    }
                    if (inputConnected.size == 1) {
                        const incomingConnection = [...inputConnected.values()][0];
                        const connectedOutputSocket = incomingConnection.otherNode.outputSockets.get(incomingConnection.otherIdSocket);
                        if (connectedOutputSocket) {
                            valueBox.value = connectedOutputSocket.value;
                        }
                    }
                }
                this.UpdateHtmlValueBoxsByNode(idValueBox);
            }
        }
        this.updateOutputValue()
    }

    updateOutputValue() {
        if (isNumericBinary(this.type)) {
            const value_0 = Decimal(String(this.valueBoxs['valuebox_0'].value));
            const value_1 = Decimal(String(this.valueBoxs['valuebox_1'].value));
            const output_0 = this.outputSockets.get("outputsocket_0");

            if (!output_0) { console.log("BUG"); return;}

            if (this.type == 'ADD') {
                output_0.value = value_0.add(value_1).toNumber();

            }else if (this.type == 'SUBTRACT') {
                output_0.value = value_0.sub(value_1).toNumber();

            }else if (this.type == 'MULTIPLY') {
                output_0.value = value_0.mul(value_1).toNumber();

            }else if (this.type == 'DIVIDE') {
                output_0.value = value_0.div(value_1).toNumber();

            }else if (this.type == 'POWER') {
                output_0.value = value_0.pow(value_1).toNumber();
            
            }else{
                console.log("BUG: ", this.type);
            }
        } else if (isNumericUnary(this.type)) {
            const value_0 = Decimal(String(this.valueBoxs['valuebox_0'].value));
            const output_0 = this.outputSockets.get("outputsocket_0");

            if (!output_0) { console.log("BUG"); return;}

            if (this.type == 'SQRT') {
                output_0.value = value_0.sqrt().toNumber();

            }else if (this.type == 'ABS') {
                output_0.value = value_0.abs().toNumber();

            }else if (this.type == 'NEGATE') {
                output_0.value = value_0.neg().toNumber();

            }else if (this.type == 'FACTORIAL') {
                if (value_0.isNegative()) {
                    output_0.value = NaN;
                }else{
                    let result = Decimal('1');
                    for (let i = Decimal('2'); i.lessThanOrEqualTo(value_0); i = i.add('1')) {
                        result = result.mul(i);
                    }
                    output_0.value = result.toNumber();
                }

            }else{
                console.log("BUG");
            }
            
        } else if (isNumericUnique(this.type)) {
            const value_0 = Decimal(String(this.valueBoxs['valuebox_0'].value));
            const output_0 = this.outputSockets.get("outputsocket_0");

            if (!output_0) { console.log("BUG"); return;}
            
            if (this.type == 'INPUT') {
                output_0.value = value_0.toNumber();
            }else{
                console.log("BUG: ", this.type);
            }
        }
        else{
            console.log("BUG");
        }
    }

    UpdateHtmlValueBoxsByNode(idValueBox: IdValueBox){
        if (this.valueBoxs[idValueBox].type == 'number') {
            const htmlInput = this.HtmlValueBoxs[idValueBox].querySelector('[class*="input_0"]') as HTMLInputElement;
            if (!htmlInput) {
                console.log("BUG: elemen input tidak di temukan: input_0, di:", idValueBox);
                return;
            }
            console.log(this.id,'->',idValueBox,":",this.valueBoxs[idValueBox].value);
            let value = this.valueBoxs[idValueBox].value;
            if (Number.isNaN(value) || !Number.isFinite(value)) {
                value = 0;
            }
            htmlInput.value = String(value);
        }
    }

    UpdateNodeValueBoxsByHtml(htmlInput:HTMLInputElement){
        if (!htmlInput.classList.contains('node-item-value')) {
            console.log("BUG");
            return;
        }

        const idValueBox = htmlInput.closest('[id^="valuebox_"]')?.id as IdValueBox | undefined;

        if (idValueBox == undefined) {
            console.log("BUG");
            return;
        }

        if (this.valueBoxs[idValueBox].type == 'number') {
            this.valueBoxs[idValueBox].value = Number(htmlInput.value);
        }
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
            const outgoingNode = this.connection.outgoingNodes[idOutputSocket].get(`${idInputNode}:${idInputSocket}`);
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

    makeDirty(){
        this.dirty = true;
    }

    hasDirty(){
        return this.dirty;
    }

    resetDirty(){
        this.dirty = false
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
    for (const outputSocket of outputSockets){
        const IdSocket:IdOutputSocket = `outputsocket_${countIdSocket}`;
        node.outputSockets.set(IdSocket, new OutputSocket(IdSocket,outputSocket.type,outputSocket.value));
        node.connection.outgoingNodes[IdSocket] = new Map()
        countIdSocket++;
    }
}

function initHtmlValueboxs(node: Node) {
    for (const key of Object.keys(node.valueBoxs) as IdValueBox[]){
        const htmlValueBox = node.HtmlElement.querySelector(`[id^="${key}"]`)
        if (htmlValueBox) {
            node.HtmlValueBoxs[htmlValueBox.id as IdValueBox] = (htmlValueBox as HTMLElement);
        }else{
            console.log("Bug: Htmltidak di temukan:",key);
        }
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

    for (const outputSocket of node.outputSockets.values()){
        const idSocket = outputSocket.id as IdOutputSocket;
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