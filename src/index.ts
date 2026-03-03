import "./style/index.css";
import "./style/wondow-title_bar.css";
import "./style/editor.css";
import "./style/world2d.css";
import "./style/node.css";

import "../node_modules/bootstrap-icons/font/bootstrap-icons.min.css";

const SVG_Place_World2D = document.querySelector(
    "#svg_place_world2d",
) as HTMLElement;

//<?> Import Script / Module [*]
import { Node } from "./code/node-node";
import { NodeSelected } from "./code/node-nodeSelected";
import { DBNode } from "./code/node-databaseNode";
import { SetNodeSelected, MovingNodes } from "./code/node-functions";
import { Clamp } from "./code/costum_function";
import { EventMouseDown } from "./code/costum_class";
import {
    World2d,
    GetScreenToWorld2d,
    GetWorld2dToScreen,
} from "./code/world2d";

//<?> Create World2D
const world2d = new World2d({ x: 0, y: 0 }, { x: 0, y: 0 }, 1);
world2d.offset = {
    x: world2d.RectHTML.width / 10,
    y: world2d.RectHTML.height / 10,
};
world2d.updateHTML();

//<?> Init Class
const nodeSelected = new NodeSelected();
const SignalMouseDown = new EventMouseDown();

//<?> Create Database Nodes
const DatabaseNode = new DBNode(SVG_Place_World2D);
DatabaseNode.add(
    new Node(
        "coba coba",
        { x: 0, y: 0 },
        [{ type: "number", value: 10, enebleInput: true }],
        [
            { type: "number", value: 0 },
            { type: "number", value: 0 },
            { type: "number", value: 0 },
            { type: "number", value: 0 },
        ],
    ),
);
DatabaseNode.add(
    new Node(
        "coba coba",
        { x: 150, y: 0 },
        [
            { type: "number", value: 10, enebleInput: true },
            { type: "number", value: 10, enebleInput: true },
        ],
        [
            { type: "number", value: 0 },
            { type: "number", value: 0 },
            { type: "number", value: 0 },
        ],
    ),
);
DatabaseNode.add(
    new Node(
        "coba coba",
        { x: 300, y: 0 },
        [
            { type: "number", value: 10, enebleInput: true },
            { type: "number", value: 10, enebleInput: false },
            { type: "number", value: 10, enebleInput: true },
        ],
        [
            { type: "number", value: 0 },
            { type: "number", value: 0 },
        ],
    ),
);
DatabaseNode.add(
    new Node(
        "coba coba",
        { x: 450, y: 0 },
        [
            { type: "number", value: 10, enebleInput: true },
            { type: "number", value: 10, enebleInput: true },
            { type: "number", value: 10, enebleInput: true },
            { type: "number", value: 10, enebleInput: true },
        ],
        [{ type: "number", value: 0 }],
    ),
);

//<?> Events
//<- Document Events
document
    .querySelectorAll<HTMLInputElement>('input[type="number"]')
    .forEach((input) => {
        input.addEventListener(
            "wheel",
            (e) => {
                e.preventDefault();
            },
            { passive: false },
        );
    });

//<- Word2d Events
world2d.HtmlElement.addEventListener("mousedown", (ev) => {
    SignalMouseDown.setAlt(ev, "right", "world2d");
    SignalMouseDown.setAlt(ev, "left", "DragNode");
    if (ev.button === 0) {
        if ((ev.target as HTMLDivElement).classList.contains("node-title")) {
            SetNodeSelected(ev, DatabaseNode, nodeSelected);
        } else {
            nodeSelected.clear();
        }
    }
    if (ev.button == 0) {
        DatabaseNode.System_connected.SetFromNode(ev);
    }
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
window.addEventListener("mousemove", (ev) => {
    if (SignalMouseDown.getSignal("right") == "world2d") {
        const position = {
            x: world2d.target.x,
            y: world2d.target.y,
        };
        world2d.target = {
            x: position.x + ev.movementX,
            y: position.y + ev.movementY,
        };
        world2d.updateHTML();
    }
    MovingNodes(ev, DatabaseNode, nodeSelected, world2d, SignalMouseDown);
});
window.addEventListener("mouseup", (ev) => {
    SignalMouseDown.set(ev, "");
    if (ev.button == 0) {
        DatabaseNode.System_connected.SetToNode(ev);
        DatabaseNode.System_connected.CheckListConnected();
    }
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});