export type DataTypeNode = 'number';
export type ValueByType = {
    'number': number;
};

export type IdSocket = string;
export type IdInputSocket = `inputsocket_${number}`;
export type IdOutputSocket = `outputsocket_${number}`;
export type IdNode = `node_${number}`;
export type IdValueBox = `valuebox_${number}`;
export type IdPath = `${IdNode},${IdOutputSocket},${IdNode},${IdInputSocket}`;

export type groupTypeNode = 'Input' | 'Output' | 'Function' | 'Comprasion' | 'Rounding' | 'Trigonometric';

export const GroupsTemplatesNode:{Input1Output1: TypeNode[], Input2Output1: TypeNode[]} = {
    Input1Output1: ['INPUT'],
    Input2Output1: ['ADD','DIVIDE','MULTIPLY','POWER','SUBTRACT']
}

export const templatesNode:Map<TypeNode,{input:Array<{type: DataTypeNode, value: number, enableInput: boolean}>,output:Array<{type: DataTypeNode, value: number}>}> = new Map([
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


export type TypeNode = 'ADD' | 'SUBTRACT' | 'MULTIPLY'  | 'DIVIDE'  | 'POWER' | 'INPUT';
type ActionByType = {
    'spawn': Map<string, GroupAddNode>;
    'call' : TypeNode;
}

export class GroupAddNode<T extends 'spawn' | 'call' = 'spawn' | 'call'> {
    type:  T;
    action: ActionByType[T];
    constructor(type: T, action: ActionByType[T]){
        this.type = type;
        this.action = action;
    }

    isSpawn(): this is GroupAddNode<'spawn'> {
        return this.type === 'spawn';
    }

    isCall(): this is GroupAddNode<'call'> {
        return this.type === 'call';
    }
}

export const groupingAddNodes:Map<string, GroupAddNode> = new Map<string, GroupAddNode>([
    ['Input',new GroupAddNode('call','INPUT')],
    ['Function', new GroupAddNode('spawn', new Map<string, GroupAddNode>([
        ['Operator', new GroupAddNode('spawn', new Map<string, GroupAddNode>([
            ['Add',new GroupAddNode('call','ADD')],
            ['Subtract',new GroupAddNode('call','SUBTRACT')],
            ['Multiply',new GroupAddNode('call','MULTIPLY')],
            ['Divide',new GroupAddNode('call','DIVIDE')],
        ]))],
        ['Other', new GroupAddNode('spawn', new Map<string, GroupAddNode>([
            ['Power', new GroupAddNode('call','POWER')]
        ]))]
    ]))]
])

