import { SetElement } from "../../helper/addons";
import { groupingAddNodes } from "../../node/nodeTypes";
import type { Vector2 } from "../../globalTypes";

export function createHtmlAddNode(position:Vector2) {
    return SetElement('div', {class:["add_node", "add_node-style"], attr:{'--position-x':`${position.x}px`,'--position-y':`${position.y}px`}},
        SetElement('div', {class:["title-add_node"]},"Add Node"),
        SetElement('div', {class:["container-items-add_node"]}, () => {
            let child_containerItemsAddNode:HTMLElement[] = []

            for (const [key, value] of groupingAddNodes){
                child_containerItemsAddNode.push(
                    SetElement('div', {class:['item-add_node']}, () => {
                        let child_itemAddNode:HTMLElement[] = [];
                        child_itemAddNode.push(SetElement('span',{},key));

                        if (value.isSpawn()) {
                            child_itemAddNode.push(SetElement('span',{},"▶"));
                        }

                        return child_itemAddNode;
                    })
                )
            }

            return child_containerItemsAddNode;

        })
    )
}