import "./style/index.css";
import "./style/wondow-title_bar.css";
import "./style/editor.css";
import "./style/world2d.css";
import "./style/node.css";

import "../node_modules/bootstrap-icons/font/bootstrap-icons.min.css";

const SVG_Place_World2D = document.getElementById( "svg_place_world2d") as HTMLElement;

//<?> Import Script / Module [*]
//import { Node } from "./code/node/node";
import { Live_SelectNodeSystem, NodeSelection, } from "./code/node/nodeSelection";
import { DatabaseNode } from "./code/node/database";
import { setupNodeDragging } from "./code/node/nodeDragging";
import { Clamp } from "./code/costum_function";
import { MouseButtonState } from "./code/mouseButtonState";
import { World2d, GetScreenToWorld2d, GetWorld2dToScreen, } from "./code/world2d/world2d";
import { dragViewWorld2d } from "./code/world2d/dragView";
import { rBushRectSelection } from "./code/node/rBushRectSelection";
import { CheckConnectedNode } from "./code/node/connectionManager";
import { editValueNode, EditValueNodeState } from "./code/node/editValueNode";
import { TorpologySortNode } from "./code/engineNode/torpologicalSortNode";
import { addNode } from "./code/engineNode/addNode";
import { registerShortcut } from "./code/helper/addons";

//<?> Create World2D
const world2d = new World2d({ x: 0, y: 0 }, { x: 0, y: 0 }, 1);
world2d.offset = {
    x: 0,//world2d.RectHTML.width / 10,
    y: 0,//world2d.RectHTML.height / 10,
};
world2d.updateHTML();

//<?> Init Class
const torpologiSortNode = new TorpologySortNode();
const nodeSelection = new NodeSelection();
const editValueNodeState = new EditValueNodeState()
const mouseState = new MouseButtonState();

//<?> Create Database Nodes
const rBushSelection = new rBushRectSelection();
const databaseNode = new DatabaseNode(SVG_Place_World2D, rBushSelection);
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
addNode('ADD',{x:20, y:20},databaseNode);
addNode('DIVIDE',{x:20, y:200},databaseNode);
addNode('MULTIPLY',{x:200, y:20},databaseNode);
addNode('POWER',{x:200, y:200},databaseNode);
addNode('INPUT', {x:380, y:200}, databaseNode);

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
        
})

//<- Group Events [prioritas utama paling atas] 
dragViewWorld2d(world2d, mouseState);
CheckConnectedNode(world2d, databaseNode, mouseState, torpologiSortNode)//? Runtime ConnectedNode System
editValueNode(world2d, databaseNode, editValueNodeState,mouseState, torpologiSortNode);
Live_SelectNodeSystem(world2d, databaseNode, rBushSelection, nodeSelection, mouseState); //? Runtime selected Node System
setupNodeDragging(world2d, databaseNode, rBushSelection, nodeSelection, mouseState); //? Runtime Moving Node System
// window.addEventListener('mousedown', () => {
//     console.log("mouse down");
//     mouseState.log();
// })
// window.addEventListener('mousemove', () => {
//     console.log("mouse move");
//     mouseState.log();
// });
// window.addEventListener('mouseup', () => {
//     console.log("mouse up");
//     mouseState.log();
// })

