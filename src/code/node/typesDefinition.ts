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

type Arithmetic = 'ADD' | 'SUBTRACT' | 'MULTIPLY'  | 'DIVIDE' | 'MOD' | 'POWER' | 'SQRT' | 'ABS' | 'NEGATE' | 'FACTORIAL';
export type TypeNode =  Arithmetic | 'INPUT' | 'DUMMY';

//? numeric binary type set
const numericBinaryArray = ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'MOD', 'POWER'] as const;
export type NumericBinary = typeof numericBinaryArray[number];
const numericBinary = new Set<TypeNode>(numericBinaryArray);
//* Function
export function isNumericBinary(type:TypeNode): type is NumericBinary{
    return numericBinary.has(type);
}

//? numeric unary type set
const numericUnaryArray = [ 'SQRT', 'ABS', 'NEGATE', 'FACTORIAL'] as const;
export type NumericUnary = typeof numericUnaryArray[number];
const numericUnary = new Set<TypeNode>(numericUnaryArray);
//* Function
export function isNumericUnary(type:TypeNode):type is NumericUnary {
    return numericUnary.has(type);
}

//? numeric unique type set
const numericUniqueArray = ['INPUT'] as const;
export type NumericUnique = typeof numericUniqueArray[number];
const numericUnique = new Set<TypeNode>(numericUniqueArray);
//* Function
export function isNumericUnique(type:TypeNode):type is NumericUnique {
    return numericUnique.has(type);
}


//? shortcut
type TamplateInputOutput = {input:Array<{type: DataTypeNode, value: number, enableInput: boolean}>,output:Array<{type: DataTypeNode, value: number}>};

//? Arithmetic Template
const templateArithmeticNode:Map<Arithmetic,TamplateInputOutput> = new Map<Arithmetic,TamplateInputOutput>([
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
    ['MOD', {
        input:[
            {type:'number', value:0, enableInput:true},
            {type:'number', value:0, enableInput:true},
        ],
        output:[
            {type:'number', value:0},
        ]
    }],
    ['POWER',{
        input:[
            { type:'number', value:0, enableInput:true, },
            { type:'number', value:0, enableInput:true, },
        ],
        output:[ { type:'number', value:0,} ]
    }],
    ['SQRT', {
        input:[
            { type:'number', value:0, enableInput:true, },
        ],
        output:[
            { type:'number', value:0,},
        ]
    }],
    ['ABS', {
        input:[
            {type:'number', value:0, enableInput:true, },
        ],
        output:[
            { type:'number', value:0,},
        ]
    }],
    ['NEGATE', {
        input:[
            {type:'number', value:0, enableInput:true, },
        ],
        output:[
            { type:'number', value:0,},
        ]
    }],
    ['FACTORIAL', {
        input:[
            {type:'number', value:0, enableInput:true, },
        ],
        output:[
            { type:'number', value:0,},
        ]
    }]
])

//<?> Gabungkan semua template 
export const templatesNode:Map<TypeNode,TamplateInputOutput> = new Map<TypeNode,TamplateInputOutput>([
    ...templateArithmeticNode,
    ['INPUT',{
        input: [ {type:'number', value:0, enableInput:false} ],
        output: [ {type:'number', value:0,} ]
    }],
    ['DUMMY', {
        input: [  ],
        output: [  ]
    }]
    
]);



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
    ['Arithmetic', new GroupAddNode('spawn', new Map<string, GroupAddNode>([
        ['Add',new GroupAddNode('call','ADD')],
        ['Subtract',new GroupAddNode('call','SUBTRACT')],
        ['Multiply',new GroupAddNode('call','MULTIPLY')],
        ['Divide',new GroupAddNode('call','DIVIDE')],
        ['Mod', new GroupAddNode('call', 'MOD')],
        ['Power', new GroupAddNode('call', 'POWER')],
        ['Sqrt', new GroupAddNode('call', 'SQRT')],
        ['Absolute', new GroupAddNode('call', 'ABS')],
        ['Negate', new GroupAddNode('call', 'NEGATE')],
        ['Factorial', new GroupAddNode('call', 'FACTORIAL')],
    ]))],
    ['Comparisons', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
    ['Logic', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
    ['Rounding', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
    ['Trigonometry', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
    ['Logarithms', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
    ['Exponents', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
    ['Conversion ', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
])

