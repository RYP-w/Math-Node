import { Queue } from "../helper/addons";
import type { IdNode, IdOutputSocket, Node } from "../node/node";

//TODO: aku akan membuat sebush sistem pemerosesan pada node,
// misal jika node_1 di ubah value nya seluruh node yang bergantung/ bberhubungan dengan node tersebut akan menjadi dirty dan akan memperbarui value dan outputnya sesuai dengan urutannya
// caranya bagaimana? 

export class TorpologySortNode{
    nodeDependencies:NodeDependence[] = [];
    isRunning:boolean = false;
    visited:Set<Node> = new Set<Node>();
    maxChunck:number;
    check_cycle = 0;

    constructor(maxChunck:number = 100){
        this.maxChunck = maxChunck;
    }

    setTorpologycal(node:Node){
        this.nodeDependencies = this.makeDependence(node);
    }

    runTorpological(){
        this.visited.clear();
        this.isRunning = true;
        this.check_cycle = 0;
        requestAnimationFrame(() => {
            this.tick();
        })
    }

    stop(){
        this.isRunning = false;
    }

    play(){
        this.isRunning = true;
    }

    private tick() {
        if (!this.isRunning) return;

        this.processChunk();

        requestAnimationFrame(() => {
            this.tick();
        })
    }

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
                this.visited.add(nodeDependence.node);
                console.log("Finally: ", nodeDependence.node.id);
                count++;
            } else {
                stillPending.push(nodeDependence);
            }
            this.check_cycle++;
        }

        this.nodeDependencies = stillPending;

        if (this.nodeDependencies.length === 0) {
            this.isRunning = false;
            console.log("jumlah perulangan:", this.check_cycle);
            
        }
    }

    private makeDependence(nodeRoot:Node){
        let mapNodeDependencies:Map<IdNode,NodeDependence> = new Map<IdNode,NodeDependence>();
        let queue:Queue<Node> = new Queue<Node>();

        nodeRoot.dirty = true;
        const rootNodeDependenties = new NodeDependence(nodeRoot);
        mapNodeDependencies.set(nodeRoot.id, rootNodeDependenties);
        queue.enqueue(nodeRoot);

        let count = 0;
        
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
            count ++;
        }
        console.log('makeDependence membutuhkan perulangan: ', count, "kali");
        return [...mapNodeDependencies.values()];
    }
}

class NodeDependence{
    node:Node;
    private dependencies:Set<Node>;
    constructor(node:Node){
        this.node = node;
        this.dependencies = new Set<Node>();
    }

    setDependenties(node:Node){
        this.dependencies.add(node);
    }

    haveDependence(visited:Set<Node>){
        if (this.dependencies.size == 0) return false;
        for (const dependence of this.dependencies){
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