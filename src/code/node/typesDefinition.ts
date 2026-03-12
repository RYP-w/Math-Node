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

export type TypeNode = 'ADD' | 'SUBTRACT' | 'MULTIPLY'  | 'DIVIDE'  | 'POWER' | 'INPUT';

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