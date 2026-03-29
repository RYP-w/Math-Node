import { Queue } from "../helper/addons";
import type { Node } from "./node";
import type { IdNode, IdOutputSocket } from "./nodeTypes";

export class NodeProcessor{
    nodeDependencies:NodeDependence[] = [];
    isRunning:boolean = false;
    visited:Set<Node> = new Set<Node>();
    maxChunck:number;

    constructor(maxChunck:number = 100){
        this.maxChunck = maxChunck;
    }

    setTorpologycal(node:Node){
        const newNodeDependencies = this.makeDependence(node);
        this.mergeDependencies(newNodeDependencies)
        this.runTorpological()
    }

    stop(){
        this.isRunning = false;
    }

    play(){
        this.isRunning = true;
    }

    private runTorpological(){
        if (this.isRunning) {return;}
        this.visited.clear();
        this.isRunning = true;
        requestAnimationFrame(() => {
            this.tick();
        })
    }

    private clear(){
        this.isRunning = false;
        this.visited.clear();
    }

    private tick() {
        if (!this.isRunning) return;

        // console.log(this.nodeDependencies.map(node => `${node.node.id}:[${node.getDependenties().size}]`));

        this.processChunk();

        requestAnimationFrame(() => {
            this.tick();
        })
    }

    //
    private processChunk() {
        let count = 0;
        const stillPending: NodeDependence[] = [];

        for (const nodeDependence of this.nodeDependencies) {
            if (count >= this.maxChunck) {
                stillPending.push(nodeDependence);
                continue;
            }

            if (!nodeDependence.haveDependence(this.visited)) {
                nodeDependence.node.dirty = false;
                nodeDependence.node.updateValueNode();
                this.visited.add(nodeDependence.node);
                count++;
            } else {
                stillPending.push(nodeDependence);
            }
        }

        this.nodeDependencies = stillPending;

        if (this.nodeDependencies.length === 0) {
            this.clear()
        }
    }

    /**return list node yang memiliki ketergantungan terhadap node lain => {idNode} {list other nodeDepencies} */
    private makeDependence(nodeRoot:Node):Map<IdNode, NodeDependence>{
        let mapNodeDependencies:Map<IdNode,NodeDependence> = new Map<IdNode,NodeDependence>();
        let queue:Queue<Node> = new Queue<Node>();

        nodeRoot.dirty = true;
        const rootNodeDependenties = new NodeDependence(nodeRoot);
        mapNodeDependencies.set(nodeRoot.id, rootNodeDependenties);
        queue.enqueue(nodeRoot);

        while (queue.size() > 0) {
            const node = queue.dequeue()!;

            for (const socketId of Object.keys(node.connection.outgoingNodes) as IdOutputSocket[]){
                for (const neighbor of node.connection.outgoingNodes[socketId].values()){
                    
                    if (!mapNodeDependencies.has(neighbor.otherNode.id)) {
                        mapNodeDependencies.set(neighbor.otherNode.id, new NodeDependence(neighbor.otherNode));
                        queue.enqueue(neighbor.otherNode);
                        neighbor.otherNode.dirty = true;
                    }

                    mapNodeDependencies.get(neighbor.otherNode.id)?.setDependenties(node);
                }
            }
        }
        
        return mapNodeDependencies;
    }

    /**menggabungkan daftar node baru yang akan di peroses dengan node yang sedang di peroses di Torpological */
    private mergeDependencies(newNodeDependencies: Map<IdNode, NodeDependence>){
        if (this.nodeDependencies.length == 0) {
            this.nodeDependencies = [...newNodeDependencies.values()]; return;
        }

        // menghapus node visited yang sama di newNodeDependencies
        for (const nodeDependence of newNodeDependencies.values()) {
            this.visited.delete(nodeDependence.node);
        }

        for (const nodeDependence of this.nodeDependencies) {
            const mergeNodeDependence = newNodeDependencies.get(nodeDependence.node.id);

            // jika nodeDependence tidak berada di newNodeDependencies, skip
            if (!mergeNodeDependence) continue;

            nodeDependence.setDependenties(...mergeNodeDependence.getDependenties())
            newNodeDependencies.delete(nodeDependence.node.id);
        }

        // tambahkan node baru ke nodeDependencies
        for (const nodeDependence of newNodeDependencies.values()){
            this.nodeDependencies.push(nodeDependence);
        }
    }
}

class NodeDependence{
    node:Node;
    private dependencies:Set<Node>;
    constructor(node:Node){
        this.node = node;
        this.dependencies = new Set<Node>();
    }

    setDependenties(...nodes:Node[]){
        for (const eNode of nodes) {
            this.dependencies.add(eNode);
        }
    }

    /**cek apakah masih ada node *dependency* yang belum diproses */
    haveDependence(visited:Set<Node>){
        if (this.dependencies.size == 0) return false;
        for (const dependence of this.dependencies){
            // apakah `dependency` ini belum ada di daftar yang sudah beres
            if (!visited.has(dependence)) {
                return true;
            }
        }
        return false;
    }
    
    getDependenties(){
        return this.dependencies;
    }

    removeDependenties(node:Node){
        const signal = this.dependencies.delete(node);
        if (!signal) {
            console.log("BUG: ini bug kah?");
        }
        return signal;
    }
}

//? apakah sebaiknya class tetap ada (di deklarasikan ke root)? 