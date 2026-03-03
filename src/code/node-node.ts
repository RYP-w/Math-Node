import { getAtribute_number, SetElement } from "./helper/addons";
import type { Vector2 } from "./TypeDefinition";

type DataTypeNode = 'number';

class Socket {
    id: string;
    type: DataTypeNode;

    constructor(id: string, type: DataTypeNode) {
        this.id = id
        this.type = type;
    }
}
class ValueBox {
    id: string;
    type: DataTypeNode;
    value: number;
    enableInput: boolean;
    socket: Socket | null;

    constructor(id: string, type: DataTypeNode, value = 20, enableInput: boolean) {
        this.id = id;
        this.type = type;
        this.value = value;
        this.enableInput = enableInput;
        this.socket = null;
    }

    setSocket(id: string) {
        this.socket = new Socket(id, this.type);
    }
}

type NodeId = string;
type socketId = string;

type DictConnection = {
    fromNode: Node,
    fromSocketId: string,
    toNode: Node,
    toSocketId: string
}


class SavingConnection {
    DataBase: Map<socketId, Map<NodeId, Map<socketId, DictConnection>>>

    constructor() {
        this.DataBase = new Map();
    }
}

export class Node { //<?> Point 
    name: string;
    id: string;
    position: Vector2;
    selected: boolean;
    connection: {
        incomingNodes: Record<string, Map<string, {
            Node: Node,
            fromIdSocket: string,
            toIdSocket: string,
        }>>;
        outgoingNodes: Record<string, Map<string, {
            Node: Node,
            fromIdSocket: string,
            toIdSocket: string,
        }>>;
    };
    valueBoxs: { [key: string]: ValueBox };
    outputSocket: Array<Socket>;
    HtmlElement: HTMLDivElement;
    HtmlSockets: {
        inputSockets: Record<string, HTMLElement>,
        outputSockets: Record<string, HTMLElement>,
    };
    HtmlOutgoingPath: Map<string, SVGPathElement>;
    zIndex: number;

    constructor(name: string, position: { x: number, y: number }, valueBoxs: Array<{ type: DataTypeNode, value: number, enebleInput: boolean }>, outputSocket: Array<{ type: DataTypeNode, value: number }>) {
        this.name = name;
        this.id = 'node_none';
        this.position = position;
        this.selected = false;
        this.zIndex = 0;
        this.connection = {
            incomingNodes: {},
            outgoingNodes: {},
        };
        this.HtmlSockets = { inputSockets: {}, outputSockets: {} };
        this.HtmlOutgoingPath = new Map();

        let countIdValueBox = 0;
        let countIdSocket = 0;
        this.valueBoxs = {};
        for (const valueBox of valueBoxs) {
            const IdValueBox = `valuebox_${countIdValueBox}`;
            this.valueBoxs[IdValueBox] = new ValueBox(IdValueBox, valueBox.type, valueBox.value, valueBox.enebleInput);
            if (valueBox.enebleInput) {
                const IdSocket = `inputsocket_${countIdSocket}`
                this.valueBoxs[`valuebox_${countIdValueBox}`].setSocket(IdSocket);
                this.connection.incomingNodes[IdSocket] = new Map()
                countIdSocket++;
            }
            countIdValueBox++;
        }
        countIdSocket = 0;
        this.outputSocket = [];
        for (const initSocket of outputSocket) {
            const IdSocket = `outputsocket_${countIdSocket}`
            this.outputSocket.push(new Socket(IdSocket, initSocket.type));
            this.connection.outgoingNodes[IdSocket] = new Map()
            countIdSocket++;
        }

        this.HtmlElement = this.AddToHtml() as HTMLDivElement

        const heightTitle = getAtribute_number(this.HtmlElement, '--height-title');
        const widthNode = getAtribute_number(this.HtmlElement, '--width-node');
        const headerLineWeight = getAtribute_number(this.HtmlElement, '--header-line-weight');
        const gapVertical = getAtribute_number(this.HtmlElement, '--gap-vertical-node-body');
        const marginY = getAtribute_number(this.HtmlElement, '--margin-y-container-items');
        const heightItems = getAtribute_number(this.HtmlElement, '--height-size-items');
        const sizeSocket = getAtribute_number(this.HtmlElement, '--size-socket');
        const offsiteSocket = getAtribute_number(this.HtmlElement, '--offsite-socket');
        const outline = getAtribute_number(this.HtmlElement, '--outline');

        const locationSocketY = heightTitle + headerLineWeight + (gapVertical - marginY) + ((marginY * 2 + heightItems) / 2);
        const itemSpacing = marginY * 2 + heightItems - sizeSocket / 2;
        const socketXInput = sizeSocket + offsiteSocket - outline - sizeSocket / 2;
        const socketXOutput = widthNode + sizeSocket + offsiteSocket + outline - sizeSocket / 2;

        let count = 0;
        for (const socketId in this.valueBoxs) {
            if (this.valueBoxs[socketId].enableInput) {
                const idSocket = this.valueBoxs[socketId].socket?.id as string;
                const HtmlSocket = this.HtmlElement.querySelector(`#${idSocket}`) as HTMLElement;
                this.HtmlSockets.inputSockets[idSocket] = HtmlSocket;
                HtmlSocket.setAttribute('position-socket-x', `${socketXInput}px`);
                HtmlSocket.setAttribute('position-socket-y', `${locationSocketY + itemSpacing * count}px`);
            }
            count++;
        }

        for (let i = 0; i < this.outputSocket.length; i++) {
            const idSocket = this.outputSocket[i].id;
            const HtmlSocket = this.HtmlElement.querySelector(`#${idSocket}`) as HTMLElement;
            this.HtmlSockets.outputSockets[idSocket] = HtmlSocket;
            HtmlSocket.setAttribute('position-socket-x', `${socketXOutput}px`);
            HtmlSocket.setAttribute('position-socket-y', `${locationSocketY + itemSpacing * i}px`);
        }

        // this.HtmlElement.appendChild(
        //     SetElement('div', { id: 'apa-saja', style: ['width: 100%', 'height: 1px', 'background-color: red', 'position:absolute', `transform: translate(0px, ${locationSocketY + itemSpacing * 2}px)`] }),
        // )
        // this.HtmlElement.appendChild(
        //     SetElement('div', { id: 'apa-saja', style: ['width: 1px', 'height: 100%', 'background-color: green', 'position:absolute', `transform: translate(${socketXOutput}px, 0px)`] }),
        // )

        console.log(this.connection);

    }

    getPositionSocketInput(idSocket: string) {
        const op: Vector2 = {
            x: this.position.x + parseFloat(this.HtmlSockets.inputSockets[idSocket].getAttribute('position-socket-x') as string),
            y: this.position.y + parseFloat(this.HtmlSockets.inputSockets[idSocket].getAttribute('position-socket-y') as string),
        }
        return op
    }

    getPositionSocketOutput(idSocket: string) {
        const op: Vector2 = {
            x: this.position.x + parseFloat(this.HtmlSockets.outputSockets[idSocket].getAttribute('position-socket-x') as string),
            y: this.position.y + parseFloat(this.HtmlSockets.outputSockets[idSocket].getAttribute('position-socket-y') as string),
        }
        return op
    }


    AddToHtml() {
        const HtmlNode = SetElement('div', { id: this.id, class: ["node-style", "node"], style: [`--position-x: ${this.position.x}px`, `--position-y: ${this.position.y}px`] });
        HtmlNode.appendChild(
            SetElement('div', { class: ['node-container-region'] },
                SetElement('div', { class: ['node-title'] },
                    SetElement('div', { class: ['no-event'], style: ['display: flex', 'align-items: center', 'height: 100%', 'margin-left: 3px'] },
                        SetElement('img', { class: ['no-event'], style: ['width:20px'], src: "./src/assets/logo.webp" }),
                        SetElement('span', {}, this.name)
                    )
                ),
                SetElement('div', { class: ['node-header-line'] }),
                SetElement('div', { class: ['node-body'] },
                    SetElement('div', { id: 'node-items-container' }),
                    () => {
                        const ElOutput: HTMLElement[] = []


                        const maxCountValueBoxs = Object.keys(this.valueBoxs).length;
                        const maxCountOutputSocket = this.outputSocket.length;
                        const maxCountCountainer = Math.max(maxCountValueBoxs, maxCountOutputSocket);

                        for (let Count = 0; Count < maxCountCountainer; Count++) {
                            ElOutput.push(
                                SetElement('div', { class: ['node-item-row'] },
                                    SetElement('div', { class: ['node-container-value-box'] },
                                        () => {
                                            const nodeContainerValueBox: HTMLElement[] = [];

                                            if (Count + 1 > maxCountValueBoxs) {
                                                return nodeContainerValueBox;
                                            }

                                            const valueBox = this.valueBoxs[`valuebox_${Count}`];
                                            const checkEnebleInput = valueBox.enableInput;
                                            if (checkEnebleInput) {
                                                nodeContainerValueBox.push(
                                                    SetElement('div', { class: ['node-container-socket', 'input'] },
                                                        SetElement('div', { class: ['node-item-socket', 'input'], id: valueBox.socket?.id })
                                                    )
                                                );
                                            }

                                            nodeContainerValueBox.push(
                                                SetElement('div', { class: ['node-container-item-value', !checkEnebleInput ? 'left-margin-wrap-socket' : ''] },
                                                    () => {
                                                        const nodeContainerItemValue: HTMLElement[] = [];



                                                        if (valueBox.type == 'number') {
                                                            nodeContainerItemValue.push(
                                                                SetElement('input', { class: ['node-item-value'], value: valueBox.value, attr: { 'type': 'number' } })
                                                            )
                                                        }
                                                        return nodeContainerItemValue;
                                                    }
                                                )
                                            )
                                            return nodeContainerValueBox;
                                        }
                                    ),
                                    SetElement('div', { class: ['node-container-socket', 'output'] },
                                        () => {
                                            const nodeContainerSocketOutput: HTMLElement[] = []

                                            if (Count + 1 <= maxCountOutputSocket) {
                                                nodeContainerSocketOutput.push(
                                                    SetElement('div', { class: ['node-item-socket', 'output'], id: this.outputSocket[Count].id })
                                                );
                                            }
                                            return nodeContainerSocketOutput;
                                        }
                                    )
                                )
                            )
                        }
                        return ElOutput;
                    }
                )
            )
        )
        document.querySelector('#place_world2d')?.appendChild(HtmlNode);
        return HtmlNode
    }

    UpdateHTMLPosition() {
        this.HtmlElement.style.setProperty('--position-x', `${this.position.x}px`);
        this.HtmlElement.style.setProperty('--position-y', `${this.position.y}px`);
        this.UpdateHtmlPathPosition();
    }

    UpdateHtmlPathPosition() {
        const length_horizontal_line = 15;
        for (const [key, path] of this.HtmlOutgoingPath) {
            const attributeKey = key.split(',');
            const outgoingNode = this.connection.outgoingNodes[attributeKey[1]].get(`${attributeKey[2]},${attributeKey[3]}`);
            if (outgoingNode != undefined) {
                const positionSocketFrom = this.getPositionSocketOutput(attributeKey[1]);
                const positionSocketTo = outgoingNode.Node.getPositionSocketInput(attributeKey[3]);
                //
                path.setAttribute('d', `M ${positionSocketFrom.x} ${positionSocketFrom.y} L ${positionSocketFrom.x + length_horizontal_line} ${positionSocketFrom.y} L ${positionSocketTo.x - length_horizontal_line} ${positionSocketTo.y} L ${positionSocketTo.x} ${positionSocketTo.y}`)
            } else console.log('Bug');
        }
        for (const thisIdSocket in this.connection.incomingNodes) {
            for (const incomingNodes of this.connection.incomingNodes[thisIdSocket].values()) {
                const HtmlPathIncomingNode = incomingNodes.Node.HtmlOutgoingPath.get(`${incomingNodes.Node.id},${incomingNodes.fromIdSocket},${this.id},${thisIdSocket}`);
                if (HtmlPathIncomingNode != undefined) {
                    const positionSocketFrom = incomingNodes.Node.getPositionSocketOutput(incomingNodes.fromIdSocket);
                    const positionSocketTo = this.getPositionSocketInput(thisIdSocket);
                    HtmlPathIncomingNode.setAttribute('d', `M ${positionSocketFrom.x} ${positionSocketFrom.y} L ${positionSocketFrom.x + length_horizontal_line} ${positionSocketFrom.y} L ${positionSocketTo.x - length_horizontal_line} ${positionSocketTo.y} L ${positionSocketTo.x} ${positionSocketTo.y}`)
                }
            }
        }

    }

    SetId(id: string) {
        this.id = id;
        this.HtmlElement.id = id;
    }
}