import type { IdSocket } from "./nodeTypes";

class ConnectionManagerV2 {
    private PairNode: {
        from_node?:{fromNode:{node:Node, idSocket:IdSocket}, toNode?:{node:Node, idSocket:IdSocket}};
    }

    constructor() {
        this.PairNode = {};
    }
}