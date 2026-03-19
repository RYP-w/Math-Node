import type { TorpologySortNode } from "../functionalNode/torpologicalSortNode";
import type { MouseButtonState } from "../mouseButtonState";
import type { Vector2 } from "../globalTypes";
import type { World2d } from "../world2d/world2d";
import type { NodeDatabase } from "./database";
import type { Node } from "./node";
import { Decimal } from 'decimal.js';
import type { IdNode, IdValueBox } from "./nodeTypes";

export class EditValueNodeState{
    private startPos:Vector2 = {x:0,y:0};
    private endPos:Vector2 = {x:0,y:0};
    private targetNode:Node|null = null;
    private inputElement: HTMLInputElement|null = null;
    private startValue = new Decimal('0');
    hasTypingEditeMode: boolean = false;

    setStartPos(pos:Vector2, node:Node, HtmlInput:HTMLInputElement){
        this.startPos = pos;
        this.targetNode = node;
        this.inputElement = HtmlInput;
    }

    setEndPos(pos:Vector2){
        this.endPos = pos;
    }

    hasPositionChanged(): boolean{
        if ((this.startPos.x != this.endPos.x) || (this.startPos.y != this.endPos.y)) return true;
        return false
    }

    getTargetNode(){
        return this.targetNode;
    }

    getTargetInput(){
        return this.inputElement;
    }
    getOffsetY(){
        return new Decimal(this.endPos.y - this.startPos.y);
    }
    getOffsetX(){
        return new Decimal(this.endPos.x - this.startPos.x);
    }
    setInitialValue(value:string){
        this.startValue = new Decimal(value);
    }
    getInitialValue(){
        return this.startValue;
    }

    clean(){
        this.targetNode = null;
        this.inputElement = null;
    }
}

export function editValueNode(world2d:World2d, database:NodeDatabase, editValueNodeState:EditValueNodeState, mouseState: MouseButtonState, torpologicalSort:TorpologySortNode) {
    world2d.HtmlElement.addEventListener('mousedown', (ev) => {
        let HtmlInput = ev.target as HTMLInputElement;
        if (HtmlInput.classList.contains('node-item-value')) {
            // Blur input sebelumnya jika klik input berbeda saat typing mode
            if (editValueNodeState.hasTypingEditeMode && 
                editValueNodeState.getTargetInput() !== HtmlInput) {
                editValueNodeState.getTargetInput()?.blur();
            }
            
            ev.preventDefault();
            if (ev.button != 0) return;

            
            const idNode = (HtmlInput.closest('[id^="node_"]') as HTMLDivElement).id as IdNode;
            const node = database.getById(idNode)
            if (!node) {
                console.log("BUG: node not in database: ",idNode);
                return;
            }
            editValueNodeState.setStartPos({x: ev.clientX, y:ev.clientY},node,HtmlInput);
            editValueNodeState.setInitialValue(HtmlInput.value);
            
            mouseState.setAlt(ev, 'left', 'inValueNode');
        };
    })

    window.addEventListener('mousemove', (ev) => {
        if (ev.buttons != 1) return;
        if (mouseState.getSignal('left') == 'inValueNode') {
            mouseState.setAlt(ev, 'left', 'editValueNode');
        }
        if (mouseState.getSignal('left') == 'editValueNode') {
            editValueNodeState.setEndPos({x: ev.clientX, y:ev.clientY});
            const node = editValueNodeState.getTargetNode();
            const htmlInput = editValueNodeState.getTargetInput();
            if (!node || !htmlInput) { 
                console.log("BUG: Tidak ada Html Input Dan Node");
                return;
            }
            const htmlValueBox = htmlInput.closest(`[id^="valuebox_"]`);
            if (!htmlValueBox) return;
            const step = new Decimal('10')
            if (node.valueBoxs[htmlValueBox.id as IdValueBox].type == 'number') {
                node.valueBoxs[htmlValueBox.id as IdValueBox].value = editValueNodeState.getInitialValue().plus(editValueNodeState.getOffsetX().dividedBy(step).floor());
            }
            node.UpdateHtmlValueBoxsByNode(htmlValueBox.id as IdValueBox);
            torpologicalSort.setTorpologycal(node);
        }
    })

    window.addEventListener('mouseup', (ev) => {
        if (ev.button != 0) return;
        if (mouseState.getSignal('left') == 'inValueNode') {
            editValueNodeState.setEndPos({x: ev.clientX, y:ev.clientY});
            if (!editValueNodeState.hasPositionChanged()) {
                const inputElement = editValueNodeState.getTargetInput();
                if (!inputElement) {
                    console.log("BUG: inputElement not found");
                    return;
                }
                inputElement.focus({ preventScroll: true });
                inputElement.select();
                editValueNodeState.hasTypingEditeMode = true;
                
                const handleInput = () => {
                    if (!editValueNodeState.hasTypingEditeMode) return;
                    
                    const node = editValueNodeState.getTargetNode();
                    if (!node) {
                        console.log("BUG: node not found");
                        return;
                    }
                    
                    node.UpdateNodeValueBoxsByHtml(inputElement);
                };
                
                const handleKeydown = (e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                        inputElement.blur();
                    }
                };
                
                const handleBlur = () => {
                    const node = editValueNodeState.getTargetNode();
                    if (!node) {
                        console.log("BUG");
                        return;
                    }
                    torpologicalSort.setTorpologycal(node);
                    editValueNodeState.hasTypingEditeMode = false;
                    editValueNodeState.clean();
                    
                    inputElement.removeEventListener('input', handleInput);
                    inputElement.removeEventListener('keydown', handleKeydown);
                    inputElement.removeEventListener('blur', handleBlur);
                    mouseState.removeSpecial('left','inputTypingModeNode');
                };
                
                inputElement.addEventListener('input', handleInput);
                inputElement.addEventListener('keydown', handleKeydown);
                inputElement.addEventListener('blur', handleBlur);
                mouseState.addSpecialAlt(ev, 'left', 'inputTypingModeNode');
            }
            mouseState.setAlt(ev,'left','');
        }
        if (mouseState.getSignal('left') == 'editValueNode') {
            const node = editValueNodeState.getTargetNode();
            if (!node) {
                console.log("BUG");
                return;
            }
            editValueNodeState.clean()
            mouseState.setAlt(ev,'left','');
        }
    })
}