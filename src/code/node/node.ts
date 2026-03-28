//<!> file ini menjadi tempat untuk class node 

import type { Vector2 } from "../globalTypes";
import { createNodeElement } from "./createNodeElement";

import { getAtribute_number } from "../helper/addons";
import Decimal from "decimal.js";
import {isMathOneInOneOut, isMathThreeInOneOut, isMathTwoInOneOut, isOneInZeroOut, isZeroInOneOut, type DataTypeNode, type IdInputSocket, type IdNode, type IdOutputSocket, type IdPath, type IdSocket, type IdValueBox, type StateOutputValueNode, type TypeNode, type ValueByType } from "./nodeTypes";

export const HORIZONTAL_SEGMENT_LENGTH = 11.5

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
    readOnly: boolean;
    socket: Socket | null;
    HtmlElement?:HTMLElement;

    constructor(id: IdValueBox, type: T, value:ValueByType[T], enableInput: boolean, readOnly: boolean) {
        this.id = id;
        this.type = type;
        this.value = value;
        this.enableInput = enableInput;
        this.readOnly = readOnly;
        this.socket = null;
    }

    changeStateReadonly(state:boolean){
        if (!this.HtmlElement) return;

        (this.HtmlElement.querySelectorAll('[class*="input_"]') as NodeListOf<HTMLInputElement>).forEach(HtmlInput => {
            if (state) {
                HtmlInput.type = 'text';
                HtmlInput.disabled = true;

            }else {
                HtmlInput.type = 'number';
                HtmlInput.disabled = false;
                
            }
        })
    }

    isFinite(){
        if (this.type == 'number') {
            return this.value.isFinite();
        }
    }

    isNaN(){
        if (this.type == 'number') {
            return this.value.isNaN();
        }
    }

    setValueToZero(){
        if (!this.HtmlElement) return;

        if (this.type == 'number') {
            this.value = Decimal('0');
        }
        
        (this.HtmlElement.querySelectorAll('[class*="input_"]') as NodeListOf<HTMLInputElement>).forEach(HtmlInput => {
            HtmlInput.value = '0';
        })
    }

    setSocket(id: IdSocket) {
        this.socket = new Socket(id, this.type);
    }

    setHtmlElelemt(e: HTMLElement){
        this.HtmlElement = e;
    }
}

class OutputSocket<T extends DataTypeNode = DataTypeNode> extends Socket {
    state: StateOutputValueNode;
    value: ValueByType[T];
    HtmlElement?: HTMLElement;
    node: Node;

    constructor(id: IdSocket, type: T, value:ValueByType[T], node: Node){
        super(id,type);
        this.value =  value;
        this.state = 'normal';
        this.node = node;
    }

    setHtmlElement(element:HTMLElement) {
        this.HtmlElement = element;
    }

    updateStateByValue(){
        let new_state:StateOutputValueNode = 'normal';
        if (this.value.isNaN()) {
            new_state = 'error';
        }else if (!this.value.isFinite()) {
            new_state = 'infinity';
        }

        if (new_state == this.state) {
            return false;
        }
        
        this.state = new_state;
        return true;
    }

    updatePathOutput(){
        for (const [key, path] of this.node.OutgoingPathLines){
            let [_, idOutputSocket, _idInputNode, _idInputSocket] = key.split(',') as [IdNode, IdOutputSocket, IdNode, IdInputSocket];
            if (idOutputSocket == this.id) {
                path.style.setProperty('stroke',`var(--${this.state})`)
            }
        }
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
    HtmlElement: HTMLDivElement; //? Container Html Node (self)
    OutgoingPathLines: Map<IdPath,SVGPathElement>; //? list Html Path lines
    zIndex: number; //? position z / layer

    dirty:boolean;

    constructor(name: string,type:TypeNode, position: Vector2, valueBoxs: Array<{ type: T1, value: ValueByType[T1], enableInput?: boolean, readOnly?: boolean }>, outputSockets: Array<{ type: T2, value: ValueByType[T2] }>){
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

    /** perbarui value pada valueBox dengan outputSocket yang terhubung; */
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

    /** perbarui value pada outputSocket sesuai dengan type node */
    updateOutputValue() {
        if (isMathThreeInOneOut(this.type)) {
            const value_0 = Decimal(String(this.valueBoxs['valuebox_0'].value));
            const value_1 = Decimal(String(this.valueBoxs['valuebox_1'].value));
            const value_2 = Decimal(String(this.valueBoxs['valuebox_2'].value));
            const output_0 = this.outputSockets.get("outputsocket_0");

            if (!output_0) { console.log("BUG"); return;}

            if (this.type == 'BETWEEN') {
                output_0.value = value_1.lessThanOrEqualTo(value_0) && value_0.lessThanOrEqualTo(value_2)? Decimal('1') : Decimal('0');

            }else if (this.type == 'CLAMP') {
                output_0.value = Decimal.max(value_1, Decimal.min(value_2, value_0));

            }else{
                console.log("BUG: ", this.type);
                return;
            }

            if (output_0.updateStateByValue()) {
                output_0.updatePathOutput()
            }

        }else if (isMathTwoInOneOut(this.type)) {
            const value_0 = Decimal(String(this.valueBoxs['valuebox_0'].value));
            const value_1 = Decimal(String(this.valueBoxs['valuebox_1'].value));
            const output_0 = this.outputSockets.get("outputsocket_0");

            if (!output_0) { console.log("BUG"); return;}

            if (this.type == 'ADD') {
                output_0.value = value_0.add(value_1);

            }else if (this.type == 'SUBTRACT') {
                output_0.value = value_0.sub(value_1);

            }else if (this.type == 'MULTIPLY') {
                output_0.value = value_0.mul(value_1);

            }else if (this.type == 'DIVIDE') {
                output_0.value = value_0.div(value_1);

            }else if (this.type == 'MOD') {
                output_0.value = value_0.mod(value_1);

            }else if (this.type == 'POWER') {
                output_0.value = value_0.pow(value_1);
            
            }else if (this.type == 'EQUAL') {
                output_0.value = value_0.equals(value_1)? Decimal('1') : Decimal('0');

            }else if (this.type == 'NOT_EQUAL') {
                output_0.value = value_0.equals(value_1)? Decimal('0') : Decimal('1');

            }else if (this.type == 'GREATER') {
                output_0.value = value_0.greaterThan(value_1)? Decimal('1') : Decimal('0');

            }else if (this.type == 'LESS') {
                output_0.value = value_0.lessThan(value_1)? Decimal('1') : Decimal('0');

            }else if (this.type == 'GREATER_EQ') {
                output_0.value = value_0.greaterThanOrEqualTo(value_1)? Decimal('1') : Decimal('0');

            }else if (this.type == 'LESS_EQ') {
                output_0.value = value_0.lessThanOrEqualTo(value_1)? Decimal('1') : Decimal('0');

            }else if (this.type == 'COMPARE') {
                const result = value_0.cmp(value_1);

                if (result == 1) {
                    output_0.value = Decimal('1');
                }else if (result == 0) {
                    output_0.value = Decimal('0');
                }else if (result == -1) {
                    output_0.value = Decimal('-1');
                } else {
                    output_0.value = Decimal('NaN');
                }

            }else if (this.type == 'AND') {
                if (convertValueLN(value_0) && convertValueLN(value_1)) {
                    output_0.value = Decimal('1');
                } else {
                    output_0.value = Decimal('0');
                }

            }else if (this.type == 'OR') {
                if (convertValueLN(value_0) || convertValueLN(value_1)) {
                    output_0.value = Decimal('1');
                } else {
                    output_0.value = Decimal('0');
                }

            }else if (this.type == 'XOR') {
                const rst_0 = convertValueLN(value_0);
                const rst_1 = convertValueLN(value_1);
                if ((rst_0 && !rst_1) || (!rst_0 && rst_1)) {
                    output_0.value = Decimal('1');
                } else {
                    output_0.value = Decimal('0');
                }
                
            }else if (this.type == 'NAND') {
                if (convertValueLN(value_0) && convertValueLN(value_1)) {
                    output_0.value = Decimal('0');
                } else {
                    output_0.value = Decimal('1');
                }

            }else if (this.type == 'NOR') {
                if (convertValueLN(value_0) || convertValueLN(value_1)) {
                    output_0.value = Decimal('0');
                } else {
                    output_0.value = Decimal('1');
                }

            }else if (this.type == 'ROUND_MUL') {
                output_0.value = value_0.div(value_1).round().mul(value_1);
                
            }else if (this.type == 'FLOOR_MUL') {
                output_0.value = value_0.div(value_1).floor().mul(value_1);

            }else if (this.type == 'CEIL_MUL') {
                output_0.value = value_0.div(value_1).ceil().mul(value_1);

            }else if (this.type == 'ATAN2') {
                output_0.value = Decimal.atan2(value_0, value_1);

            }else if (this.type == 'LOG') {
                output_0.value = Decimal.log(value_0, value_1);

            }else if (this.type == 'MIN') {
                output_0.value = Decimal.min(value_0, value_1);

            }else if (this.type == 'MAX') {
                output_0.value = Decimal.max(value_0, value_1);
                
            } else{
                console.log("BUG: ", this.type);
                return;
            }

            if (output_0.updateStateByValue()) {
                output_0.updatePathOutput()
            }

        }else if (isMathOneInOneOut(this.type)) {
            const value_0 = Decimal(String(this.valueBoxs['valuebox_0'].value));
            const output_0 = this.outputSockets.get("outputsocket_0");

            if (!output_0) { console.log("BUG"); return;}

            if (this.type == 'SQRT') {
                output_0.value = value_0.sqrt();

            }else if (this.type == 'ABS') {
                output_0.value = value_0.abs();

            }else if (this.type == 'NEGATE') {
                output_0.value = value_0.neg();

            }else if (this.type == 'FACTORIAL') {
                if (value_0.isNegative() || !value_0.isFinite()) {
                    output_0.value = Decimal('NaN');
                } else{
                    if (value_0.greaterThanOrEqualTo('1000')) {
                        output_0.value = Decimal('Infinity');
                    }else{
                        let result = Decimal('1');

                        for (let i = Decimal('2'); i.lessThanOrEqualTo(value_0); i = i.add('1')) {
                            result = result.mul(i);
                        }

                        output_0.value = result;
                    }
                }

            }else if (this.type == 'SIGN') {
                if (value_0.lessThan('0')) {
                    output_0.value = Decimal('-1');

                }else if (value_0.equals('0')) {
                    output_0.value = Decimal('0');

                }else if (value_0.greaterThan('0')) {
                    output_0.value = Decimal('1');

                }else{
                    console.log('BUG:', value_0.toString()); return;

                }
            }else if (this.type == 'NOT') {
                output_0.value = convertValueLN(value_0)? Decimal('0') : Decimal('1');

            }else if (this.type == 'ROUND') {
                output_0.value = value_0.round();

            }else if (this.type == 'FLOOR') {
                output_0.value = value_0.floor();

            }else if (this.type == 'CEIL') {
                output_0.value = value_0.ceil();

            }else if (this.type == 'TRUNC') {
                output_0.value = value_0.trunc();

            }else if (this.type == 'EVEN') {
                if (value_0.equals('0')) { output_0.value = Decimal('0'); }
                else {
                    const sign = value_0.greaterThan(0)? 1 : -1;
                    const abs = value_0.abs();
                    const c = abs.ceil();
                    output_0.value = (c.mod('2').equals('1')? c.add('1') : c).mul(sign);
                }
                
            }else if (this.type == 'ODD') {
                if (value_0.equals('0')) { output_0.value = Decimal('1'); }
                else {
                    const sign = value_0.greaterThan(0)? 1 : -1;
                    const abs = value_0.abs();
                    const c = abs.ceil();
                    output_0.value = (c.mod('2').equals('0')? c.add('1') : c).mul(sign)
                }

            }else if (this.type == 'SIN') {
                output_0.value = value_0.sin();

            }else if (this.type == 'COS') {
                output_0.value = value_0.cos();

            }else if (this.type == 'TAN') {
                output_0.value = value_0.tan();

            }else if (this.type == 'ASIN') {
                output_0.value = value_0.asin();

            }else if (this.type == 'ACOS') {
                output_0.value = value_0.acos();

            }else if (this.type == 'ATAN') {
                output_0.value = value_0.atan();

            }else if (this.type == 'SEC') {
                output_0.value = Decimal('1').div(value_0.cos());

            }else if (this.type == 'CSC') {
                output_0.value = Decimal('1').div(value_0.sin());

            }else if (this.type == 'COT') {
                output_0.value = Decimal('1').div(value_0.tan());
                
            }else if (this.type == 'LOG_N') {
                output_0.value = value_0.ln();

            }else if (this.type == 'LOG2') {
                output_0.value = Decimal.log2(value_0);

            }else if (this.type == 'LOG10') {
                output_0.value = Decimal.log10(value_0);

            } else{
                console.log("BUG");
                return;
            }

            if (output_0.updateStateByValue()) {
                output_0.updatePathOutput()
            }
            
        }else if (isZeroInOneOut(this.type)) {
            const output_0 = this.outputSockets.get("outputsocket_0");

            if (!output_0) { console.log("BUG"); return;}
            
            if (this.type == 'INPUT') {
                const value_0 = Decimal(String(this.valueBoxs['valuebox_0'].value));
                output_0.value = value_0;

            }else if (this.type == 'PI') {
                output_0.value = Decimal.acos(-1);

            }else if (this.type == 'E') {
                output_0.value = Decimal(1).exp();
            }else if (this.type == 'SQRT2') {
                output_0.value = Decimal.sqrt('2');

            }else if (this.type == 'LOG_N2') {
                output_0.value = Decimal.ln('2');

            }else if (this.type == 'LOG_N10') {
                output_0.value = Decimal.ln('10');

            }else if (this.type == 'INF') {
                output_0.value = Decimal('Infinity');

            } else{
                console.log("BUG: ", this.type);
                return;
            }

            if (output_0.updateStateByValue()) {
                output_0.updatePathOutput()
            }

        }else if (isOneInZeroOut(this.type)) {
            
            if (this.type == 'Output') {
                return;
            } else{
                console.log("BUG: ", this.type);
                return;
            }
        }else{
            console.log("BUG");
            return;
        }
    }

    UpdateHtmlValueBoxsByNode(idValueBox: IdValueBox){
        if (this.valueBoxs[idValueBox].type == 'number') {
            const htmlInput = this.valueBoxs[idValueBox].HtmlElement?.querySelector('[class*="input_0"]');
            if (!htmlInput) {
                console.log("BUG: elemen input tidak di temukan: input_0, di:", idValueBox);
                return;
            }
            let value = this.valueBoxs[idValueBox].value;
            (htmlInput as HTMLInputElement).value = value.toString();
        }
    }

    UpdateValueOfValueBoxsByHtml(htmlInput:HTMLInputElement){
        if (!htmlInput.classList.contains('node-item-value')) {
            console.log("BUG");
            return;
        }

        const idValueBox = htmlInput.closest('[id^="valuebox_"]')?.id as IdValueBox | undefined;

        if (idValueBox == undefined) {
            console.log("BUG");
            return;
        }

        if (this.valueBoxs[idValueBox].type == 'number' && htmlInput.value != '') {
            this.valueBoxs[idValueBox].value = Decimal(htmlInput.value);
        }
    }

    getValueboxByIdSocket(idSocket: IdInputSocket){
        const htmlValuBox = this.HtmlSockets.inputSockets[idSocket].closest('[id^="valuebox_"]');
        if (!htmlValuBox) {
            return null;
        }
        return this.valueBoxs[htmlValuBox.id as IdValueBox];
    }

    UpdateHTMLPosition() { //? update position dari Html Node
        this.HtmlElement.style.setProperty('--position-x', `${this.position.x}px`);
        this.HtmlElement.style.setProperty('--position-y', `${this.position.y}px`);
        this.UpdateHtmlPathPosition();
    }

    UpdateHtmlPathPosition() { //? update path line position dari Html
        for (const [key, path] of this.OutgoingPathLines) {
            let [_, idOutputSocket, idInputNode, idInputSocket] = key.split(',') as [IdNode, IdOutputSocket, IdNode, IdInputSocket];
            const outgoingNode = this.connection.outgoingNodes[idOutputSocket].get(`${idInputNode}:${idInputSocket}`);
            if (outgoingNode != undefined) {
                const positionSocketFrom = this.getPositionSocketOutput(idOutputSocket);
                const positionSocketTo = outgoingNode.otherNode.getPositionSocketInput(idInputSocket);
                //
                path.setAttribute('d', `M ${positionSocketFrom.x} ${positionSocketFrom.y} L ${positionSocketFrom.x + HORIZONTAL_SEGMENT_LENGTH} ${positionSocketFrom.y} L ${positionSocketTo.x - HORIZONTAL_SEGMENT_LENGTH} ${positionSocketTo.y} L ${positionSocketTo.x} ${positionSocketTo.y}`)
            } else console.log('Bug');
        }
        for (const thisIdSocket in this.connection.incomingNodes) {
            for (const incomingNodes of this.connection.incomingNodes[thisIdSocket as IdInputSocket].values()) {
                const HtmlPathIncomingNode = incomingNodes.otherNode.OutgoingPathLines.get(`${incomingNodes.otherNode.id},${incomingNodes.otherIdSocket},${this.id},${thisIdSocket as IdInputSocket}`);
                if (HtmlPathIncomingNode != undefined) {
                    const positionSocketFrom = incomingNodes.otherNode.getPositionSocketOutput(incomingNodes.otherIdSocket);
                    const positionSocketTo = this.getPositionSocketInput(thisIdSocket as IdInputSocket);
                    HtmlPathIncomingNode.setAttribute('d', `M ${positionSocketFrom.x} ${positionSocketFrom.y} L ${positionSocketFrom.x + HORIZONTAL_SEGMENT_LENGTH} ${positionSocketFrom.y} L ${positionSocketTo.x - HORIZONTAL_SEGMENT_LENGTH} ${positionSocketTo.y} L ${positionSocketTo.x} ${positionSocketTo.y}`)
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

//**Convert Value For Logic Node
function convertValueLN(value:Decimal){
    if (value.equals(0)) {
        return false;
    }
    return true;
}

function initValueBox(node:Node, valueBoxs:Array<{ type: DataTypeNode, value: Decimal, enableInput?: boolean, readOnly?: boolean }>){
    let countIdValueBox = 0;
    let countIdSocket = 0;
    for (const valueBox of valueBoxs){
        const idValueBox:IdValueBox = `valuebox_${countIdValueBox}`;
        node.valueBoxs[idValueBox] = new ValueBox(idValueBox, valueBox.type, Decimal(String(valueBox.value)), valueBox.enableInput ?? true, valueBox.readOnly ?? false);
        if (valueBox.enableInput ?? true) {
            const inputIdSocket:IdInputSocket = `inputsocket_${countIdSocket}`;
            node.valueBoxs[idValueBox].setSocket(inputIdSocket);
            node.connection.incomingNodes[inputIdSocket] = new Map();
            countIdSocket++;
        }
        countIdValueBox++;
    }
}

function initOutputSocket(node:Node, outputSockets: Array<{ type: DataTypeNode, value: Decimal }>){
    let countIdSocket = 0;
    for (const outputSocket of outputSockets){
        const IdSocket:IdOutputSocket = `outputsocket_${countIdSocket}`;
        node.outputSockets.set(IdSocket, new OutputSocket(IdSocket,outputSocket.type, Decimal(String(outputSocket.value)), node));
        node.connection.outgoingNodes[IdSocket] = new Map()
        countIdSocket++;
    }
}

function initHtmlValueboxs(node: Node) {
    for (const key of Object.keys(node.valueBoxs) as IdValueBox[]){
        const htmlValueBox = node.HtmlElement.querySelector(`[id^="${key}"]`)
        if (htmlValueBox) {
            node.valueBoxs[htmlValueBox.id as IdValueBox].setHtmlElelemt(htmlValueBox as HTMLElement);
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

export function getSocketPosition_world2d(node:Node, socket:IdInputSocket | IdOutputSocket) : Vector2 | undefined {
    const positionNode:Vector2 = node.position;
    const socketHtml = isInputSocket(socket) ? node.HtmlSockets.inputSockets[socket] : node.HtmlSockets.outputSockets[socket];
    const positionSocketX = socketHtml.getAttribute('position-socket-x');
    const positionSocketY = socketHtml.getAttribute('position-socket-y');

    if (!positionSocketX || !positionSocketY) {
        console.log("BUG");
        return undefined
    }

    return { x: positionNode.x + parseFloat(positionSocketX), y: positionNode.y + parseFloat(positionSocketY)};
}

function isInputSocket(socket: IdInputSocket | IdOutputSocket): socket is IdInputSocket {
    return socket.startsWith('inputsocket_');
}