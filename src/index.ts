import "./style/index.css";
import "./style/wondow-title_bar.css";
import "./style/editor.css";
import "./style/world2d.css";
import "./style/node.css";

import "../node_modules/bootstrap-icons/font/bootstrap-icons.min.css";

const SVG_Place_World2D = document.getElementById( "svg_place_world2d") as HTMLElement;

//<?> Import Script / Module [*]
import { Node } from "./code/node/node";
import { Live_SelectNodeSystem, NodeSelection, } from "./code/node/nodeSelection";
import { DatabaseNode } from "./code/node/database";
import { setupNodeDragging } from "./code/node/nodeDragging";
import { Clamp } from "./code/costum_function";
import { MouseButtonState } from "./code/mouseButtonState";
import { World2d, GetScreenToWorld2d, GetWorld2dToScreen, } from "./code/world2d/world2d";
import { dragViewWorld2d } from "./code/world2d/dragView";

//<?> Create World2D
const world2d = new World2d({ x: 0, y: 0 }, { x: 0, y: 0 }, 1);
world2d.offset = {
    x: world2d.RectHTML.width / 10,
    y: world2d.RectHTML.height / 10,
};
world2d.updateHTML();

//<?> Init Class
const nodeSelection = new NodeSelection();
const mouseState = new MouseButtonState();

//<?> Create Database Nodes
const databaseNode = new DatabaseNode(SVG_Place_World2D);
databaseNode.add(
    new Node(
        "coba coba",
        { x: 0, y: 0 },
        [{ type: "number", value: 10, enableInput: true }],
        [
            { type: "number", value: 0 },
            { type: "number", value: 0 },
            { type: "number", value: 0 },
            { type: "number", value: 0 },
        ],
    ),
);
databaseNode.add(
    new Node(
        "coba coba",
        { x: 150, y: 0 },
        [
            { type: "number", value: 10, enableInput: true },
            { type: "number", value: 10, enableInput: true },
        ],
        [
            { type: "number", value: 0 },
            { type: "number", value: 0 },
            { type: "number", value: 0 },
        ],
    ),
);
databaseNode.add(
    new Node(
        "coba coba",
        { x: 300, y: 0 },
        [
            { type: "number", value: 10, enableInput: true },
            { type: "number", value: 10, enableInput: false },
            { type: "number", value: 10, enableInput: true },
        ],
        [
            { type: "number", value: 0 },
            { type: "number", value: 0 },
        ],
    ),
);
databaseNode.add(
    new Node(
        "coba coba",
        { x: 450, y: 0 },
        [
            { type: "number", value: 10, enableInput: true },
            { type: "number", value: 10, enableInput: true },
            { type: "number", value: 10, enableInput: true },
            { type: "number", value: 10, enableInput: true },
        ],
        [{ type: "number", value: 0 }],
    ),
);

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
window.addEventListener("mousemove", (_ev) => {

});
window.addEventListener("mouseup", (ev) => {
    if (mouseState.getSignal('left') == 'world2d') {
        mouseState.setAlt(ev, 'left', '');
    }
    if (mouseState.getSignal('right') == 'world2d') {
        mouseState.setAlt(ev, 'right', '');
    }
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

//<- Group Events 
dragViewWorld2d(world2d, mouseState);
CheckConnectedNode()//? Runtime ConnectedNode System
Live_SelectNodeSystem(world2d, databaseNode, nodeSelection, mouseState); //? Runtime selected Node System
setupNodeDragging(world2d, databaseNode, nodeSelection, mouseState); //? Runtime Moving Node System
window.addEventListener('mouseup', (ev) => {
    console.log("mposX:",ev.clientX,"mposY:",ev.clientY,'world2d:',GetScreenToWorld2d({x:ev.clientX, y:ev.clientY},world2d))
})

function CheckConnectedNode() {
    world2d.HtmlElement.addEventListener("mousedown", (ev) => {
        if (ev.button == 0) {
            databaseNode.connectedSystem.setConnectionStart(ev);
        }
    })

    window.addEventListener("mouseup", (ev) => {
        if (ev.button == 0) {
            databaseNode.connectedSystem.setConnectionEnd(ev);
            databaseNode.connectedSystem.processConnection();
        }
    });
}