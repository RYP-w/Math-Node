import type { DatabaseNode } from "../node/database";
import { Node, type DataTypeNode } from "../node/node";
import type { Vector2 } from "../TypeDefinition";

export type TypeNode = 'ADD' | 'SUBTRACT' | 'MULTIPLY'  | 'DIVIDE'  | 'POWER' | 'INPUT';

export function addNode(type:TypeNode,position:Vector2,database:DatabaseNode) {
    const templateNode = templatesNode.get(type)!;
    const name = type.charAt(0).toUpperCase() + type.slice(1).toLocaleLowerCase();
    database.add(new Node(name,type,position,templateNode.input,templateNode.output));
}

export const GroupsTemplatesNode:{Input1Output1: TypeNode[], Input2Output1: TypeNode[]} = {
    Input1Output1: ['INPUT'],
    Input2Output1: ['ADD','DIVIDE','MULTIPLY','POWER','SUBTRACT']
}

const templatesNode:Map<TypeNode,{input:Array<{type: DataTypeNode, value: number, enableInput: boolean}>,output:Array<{type: DataTypeNode, value: number}>}> = new Map([
    ['ADD',{
        input:[
            { type:'number', value:0, enableInput:true, },
            { type:'number', value:0, enableInput:true, }
        ],
        output:[ { type:'number', value:0,} ]
    }],
    ['SUBTRACT',{
        input:[
            { type:'number', value:0, enableInput:true, },
            { type:'number', value:0, enableInput:true, }
        ],
        output:[ { type:'number', value:0,} ]
    }],
    ['MULTIPLY',{
        input:[
            { type:'number', value:0, enableInput:true, },
            { type:'number', value:0, enableInput:true, }
        ],
        output:[ { type:'number', value:0,} ]
    }],
    ['DIVIDE',{
        input:[
            { type:'number', value:0, enableInput:true, },
            { type:'number', value:0, enableInput:true, }
        ],
        output:[ { type:'number', value:0,} ]
    }],
    ['POWER',{
        input:[
            { type:'number', value:0, enableInput:true, },
            { type:'number', value:0, enableInput:true, }
        ],
        output:[ { type:'number', value:0,} ]
    }],
    ['INPUT',{
        input: [ {type:'number', value:0, enableInput:false} ],
        output: [ {type:'number', value:0,} ]
    }]
]);

// const groupNodes = {
//     ""
// }