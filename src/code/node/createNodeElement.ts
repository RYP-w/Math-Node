import { Node } from "./node";
import { SetElement } from "../helper/addons";

export function createNodeElement(node: Node) {
    const HtmlNode = SetElement('div', { id: node.id, class: ["node-style", "node"], style: [`--position-x: ${node.position.x}px`, `--position-y: ${node.position.y}px`] });
    HtmlNode.appendChild(
        SetElement('div', { class: ['node-container-region'] },
            SetElement('div', { class: ['node-title'] },
                SetElement('div', { class: ['no-event'], style: ['display: flex', 'align-items: center', 'height: 100%', 'margin-left: 3px'] },
                    //SetElement('img', { class: ['no-event'], style: ['width:20px'], src: "./src/assets/logo.webp" }),
                    SetElement('i', {class:["svgfont-tournament"],style:['font-size: x-large']}),
                    SetElement('span', {}, node.name)
                )
            ),
            SetElement('div', { class: ['node-header-line'] }),
            SetElement('div', { class: ['node-body'] },
                SetElement('div', { id: 'node-items-container' }),
                () => {
                    const ElOutput: HTMLElement[] = []

                    const maxCountValueBoxs = Object.keys(node.valueBoxs).length;
                    const maxCountOutputSocket = node.outputSockets.size;
                    const maxCountCountainer = Math.max(maxCountValueBoxs, maxCountOutputSocket);
                    const outputSockets = [...node.outputSockets.values()];
                    
                    for (let Count = 0; Count < maxCountCountainer; Count++) {
                        ElOutput.push(
                            SetElement('div', { class: ['node-item-row'] }, () => {
                                    const nodeItemRow: HTMLElement[] = [];
                                    let idNodeContainerValueBox:string | undefined;
                                    if (Count < maxCountValueBoxs) {
                                        idNodeContainerValueBox = `valuebox_${Count}`
                                    }

                                    nodeItemRow.push(
                                        SetElement('div', { id:idNodeContainerValueBox, class: ['node-container-value-box'] },
                                            () => {
                                                const nodeContainerValueBox: HTMLElement[] = [];

                                                if (Count + 1 > maxCountValueBoxs) {
                                                    return nodeContainerValueBox;
                                                }

                                                const valueBox = node.valueBoxs[`valuebox_${Count}`];
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
                                                                    SetElement('input', {class: ['node-item-value', 'input_0'], value: valueBox.value, attr: { 'type': 'number' } })
                                                                )
                                                            }
                                                            return nodeContainerItemValue;
                                                        }
                                                    )
                                                )
                                                return nodeContainerValueBox;
                                            }
                                        )
                                    )

                                    nodeItemRow.push(
                                        SetElement('div', { class: ['node-container-socket', 'output'] },
                                            () => {
                                                const nodeContainerSocketOutput: HTMLElement[] = []

                                                if (Count + 1 <= maxCountOutputSocket) {
                                                    nodeContainerSocketOutput.push(
                                                        SetElement('div', { class: ['node-item-socket', 'output'], id: outputSockets[Count].id })
                                                    );
                                                }
                                                return nodeContainerSocketOutput;
                                            }
                                        )
                                    )

                                    return nodeItemRow
                                }
                            )
                        )
                    }
                    return ElOutput;
                }
            )
        )
    )
    document.getElementById('place_world2d')?.appendChild(HtmlNode);
    return HtmlNode
}