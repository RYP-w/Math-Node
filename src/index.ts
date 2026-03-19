import "./style/index.css";
import "./style/window-title_bar.css";
import "./style/editor.css";
import "./style/world2d.css";
import "./style/node.css";
import './style/addNode.css'

import "../node_modules/bootstrap-icons/font/bootstrap-icons.min.css";

const SVG_Place_World2D = document.getElementById( "svg_place_world2d") as HTMLElement;
const toolkitContainer = document.getElementById('toolkit')!;

//<?> Import Script / Module [*]
//import { Node } from "./code/node/node";
import { Live_SelectNodeSystem, NodeSelection, } from "./code/node/nodeSelection";
import { NodeDatabase } from "./code/node/database";
import { setupNodeDragging } from "./code/node/nodeDragging";
import { Clamp } from "./code/customFunction";
import { MouseButtonState } from "./code/mouseButtonState";
import { World2d, GetScreenToWorld2d, GetWorld2dToScreen, } from "./code/world2d/world2d";
import { dragViewWorld2d } from "./code/world2d/dragView";
import { RBushRectSelection } from "./code/node/rBushRectSelection";
import { CheckConnectedNode } from "./code/node/connectionManager";
import { editValueNode, EditValueNodeState } from "./code/node/editValueNode";
import { TorpologySortNode } from "./code/functionalNode/torpologicalSortNode";
import { createNode } from "./code/functionalNode/setupNode";
import { registerShortcut } from "./code/helper/addons";
import { actionCheckCompatible } from "./code/compatibleWarning";
import type { Vector2 } from "./code/globalTypes";
import { AddNodeEnvironment } from "./code/functionalNode/addNode/addNodeEnv";
import { groupingAddNodes } from "./code/node/nodeTypes";
import { checkRemoveNodes } from "./code/node/removeNodes";

let _mousePosition:Vector2 = {x:0, y:0};
window.addEventListener('mousemove', (ev) => {
    _mousePosition = {x: ev.clientX, y:ev.clientY - 33};
})

//<?> Create World2D
const world2d = new World2d({ x: 0, y: 0 }, { x: 0, y: 0 }, 1);
world2d.offset = {
    x: world2d.RectHTML.width / 2,
    y: world2d.RectHTML.height / 2,
};
world2d.updateHTML();

//<?> Init Class
const env = new AddNodeEnvironment(toolkitContainer, (ev, name, type) => {
    const pointPosition = GetScreenToWorld2d({x: _mousePosition.x, y: _mousePosition.y + 33}, world2d)
    const node = createNode(type, {x:pointPosition.x - 75, y: pointPosition.y - 16.5}, databaseNode, name);
    env.closeAll();

    // paksa node baru ke mode selected dan mouse state left ke mode "NodeTitle"
    nodeSelection.clear();
    nodeSelection.add(node);
    mouseState.setAlt(ev,'left','NodeTitle');
});
const torpologiSortNode = new TorpologySortNode();
const nodeSelection = new NodeSelection();
const editValueNodeState = new EditValueNodeState();
const mouseState = new MouseButtonState();

//<?> Create Database Nodes
const rBushSelection = new RBushRectSelection();
const databaseNode = new NodeDatabase(SVG_Place_World2D, rBushSelection);
// databaseNode.add( //Testing adding node
//     new Node(
//         "coba coba",
//         'ADD',
//         { x: 300, y: 0 },
//         [
//             { type: "number", value: 10, enableInput: true },
//             { type: "number", value: 10, enableInput: false },
//             { type: "number", value: 10, enableInput: true },
//         ],
//         [
//             { type: "number", value: 0 },
//             { type: "number", value: 0 },
//         ],
//     ),
// );

//<?> init 
actionCheckCompatible() //? cek apakah device bisa menjalankan editor ini

//<?> Events
//<- Document Events
document.querySelectorAll<HTMLInputElement>('input[type="number"]').forEach((input) => {
    input.addEventListener("wheel", (e) => {
        e.preventDefault();
    },{ passive: false });
});

//<- Word2d Events
world2d.HtmlElement.addEventListener("mousedown", (ev) => {
    mouseState.setAlt(ev, "right", "world2d");
    mouseState.setAlt(ev, "left", "world2d");
});
world2d.HtmlElement.addEventListener("wheel", (ev) => {
    if (ev.deltaY != 0) {
        const worldPosition = GetScreenToWorld2d(
            { x: ev.clientX, y: ev.clientY },
            world2d,
        );

        const scaleDelta = 0.25 * (ev.deltaY / 100);
        world2d.scale = Clamp(
            Math.exp(Math.log(world2d.scale) + scaleDelta),
            0.5,
            5,
        );

        const newScreenPosition = GetWorld2dToScreen(worldPosition, world2d);

        world2d.target = {
            x: world2d.target.x + (ev.clientX - newScreenPosition.x),
            y: world2d.target.y + (ev.clientY - newScreenPosition.y),
        };

        world2d.updateHTML();
    }
});

//<- Window Events
window.addEventListener("mouseup", (ev) => {
    if (mouseState.getSignal('left') == 'world2d') {
        mouseState.setAlt(ev, 'left', '');
    }
    if (mouseState.getSignal('right') == 'world2d') {
        mouseState.setAlt(ev, 'right', '');
    }
});

document.addEventListener("contextmenu", (e) => {
    //? Disable Contextmenu
    e.preventDefault();
});
//<- Shortcut Keys 

registerShortcut({'key':'a','shift': true}, world2d.HtmlElement, () => {
    const rect = toolkitContainer.getBoundingClientRect();
    env.openRoot(groupingAddNodes, {
        x: _mousePosition.x - rect.left,
        y: _mousePosition.y - rect.top + 33,
    });
})

registerShortcut({key:'x'},world2d.HtmlElement, () => {
    checkRemoveNodes(databaseNode,nodeSelection);
})

world2d.HtmlElement.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement;
    const clickedInsidePopup = target.closest('.add_node');
    if (!clickedInsidePopup) {
        env.closeAll();
    }
});


//<- Group Events [prioritas utama paling atas] 
dragViewWorld2d(world2d, mouseState);
CheckConnectedNode(world2d, databaseNode, mouseState, torpologiSortNode)//? Runtime ConnectedNode System
editValueNode(world2d, databaseNode, editValueNodeState,mouseState, torpologiSortNode);
Live_SelectNodeSystem(world2d, databaseNode, rBushSelection, nodeSelection, mouseState); //? Runtime selected Node System
setupNodeDragging(world2d, databaseNode, rBushSelection, nodeSelection, mouseState); //? Runtime Moving Node System
// window.addEventListener('mousedown', () => {
//     c onsole.log("mouse down");
//     mouseState.log();
// })
// window.addEventListener('mousemove', () => {
//     c onsole.log("mouse move");
//     mouseState.log();
// });
// window.addEventListener('mouseup', () => {
//     c onsole.log("mouse up");
//     mouseState.log();
// })

