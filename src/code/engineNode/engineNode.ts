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

    constructor(maxChunck:number = 100){
        this.maxChunck = maxChunck;
    }

    setTorpologycal(node:Node){
        this.nodeDependencies = this.makeDependence(node);
    }

    runTorpological(){
        this.isRunning = true;
        requestAnimationFrame(() => {
            this.tick();
        })
    }

    private tick() {
        if (!this.isRunning) return;

        this.processChunk();

        requestAnimationFrame(() => {
            this.tick();
        })
    }

    private processChunk() {
        let count:number = 0;
        while (this.nodeDependencies.length > 0){
            console.log(this.nodeDependencies[ count % this.nodeDependencies.length ]);
            
            //proses di sini
            const nodeDependence = this.nodeDependencies[ count % this.nodeDependencies.length ];
            if (!nodeDependence.hasDependenties(this.visited)) {
                
            }

            count++;
            if (count >= this.maxChunck) {
                break;
            }
        }
        if (this.nodeDependencies.length == 0) {
            this.isRunning = false;
        }
    }

    private makeDependence(nodeRoot:Node){
        let mapNodeDependencies:Map<IdNode,NodeDependence> = new Map<IdNode,NodeDependence>();
        let queue:Queue<Node> = new Queue<Node>();

        const rootNodeDependenties = new NodeDependence(nodeRoot);
        mapNodeDependencies.set(nodeRoot.id, rootNodeDependenties);
        queue.enqueue(nodeRoot);
        
        while (queue.size() > 0) {
            const node = queue.dequeue()!;
            console.log('dequeue:',node);

            for (const socketId of Object.keys(node.connection.outgoingNodes) as IdOutputSocket[]){
                for (const neighbor of node.connection.outgoingNodes[socketId].values()){
                    console.log(node.id,'->',neighbor.otherNode.id);
                    
                    if (!mapNodeDependencies.has(neighbor.otherNode.id)) {
                        mapNodeDependencies.set(neighbor.otherNode.id, new NodeDependence(neighbor.otherNode));
                        queue.enqueue(neighbor.otherNode);
                        neighbor.otherNode.dirty = true;
                    }

                    mapNodeDependencies.get(neighbor.otherNode.id)?.setDependenties(node);
                }
            }
        }

        return [...mapNodeDependencies.values()]
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

    hasDependenties(visited:Set<Node>){
        for (const dependence of this.dependencies){
            if (visited.has(dependence)) {
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