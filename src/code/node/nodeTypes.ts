import Decimal from "decimal.js";

export type DataTypeNode = 'number';
export type ValueByType = {
    'number': Decimal;
};

export type IdSocket = string;
export type IdInputSocket = `inputsocket_${number}`;
export type IdOutputSocket = `outputsocket_${number}`;
export type IdNode = `node_${number}`;
export type IdValueBox = `valuebox_${number}`;
export type IdPath = `${IdNode},${IdOutputSocket},${IdNode},${IdInputSocket}`;

type Arithmetic = 'ADD' | 'SUBTRACT' | 'MULTIPLY'  | 'DIVIDE' | 'MOD' | 'POWER' | 'SQRT' | 'ABS' | 'NEGATE' | 'FACTORIAL';
type Comparisons = 'EQUAL' | 'NOT_EQUAL' | 'GREATER' | 'LESS' | 'GREATER_EQ' | 'LESS_EQ' | 'BETWEEN' | 'CLAMP' | 'SIGN' | 'COMPARE';
type Logic = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';
export type TypeNode =  Arithmetic | Comparisons | Logic | 'INPUT' | 'DUMMY';

//?type set
export const mathThreeInOneOutArray = ['BETWEEN', 'CLAMP'] as const;
export type MathThreeInOneOut = typeof mathThreeInOneOutArray[number];
export function isMathThreeInOneOut(type: TypeNode): type is MathThreeInOneOut {
    return (mathThreeInOneOutArray as readonly TypeNode[]).includes(type);
}

export const mathTwoInOneOutArray = ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'MOD', 'POWER', 'EQUAL', 'NOT_EQUAL', 'GREATER', 'LESS', 'GREATER_EQ', 'LESS_EQ', 'COMPARE', 'AND', 'OR', 'XOR', 'NAND', 'NOR'] as const;
export type MathTwoInOneOut = typeof mathTwoInOneOutArray[number];
export function isMathTwoInOneOut(type: TypeNode): type is MathTwoInOneOut {
    return (mathTwoInOneOutArray as readonly TypeNode[]).includes(type);
}

export const mathOneInOneOutArray = [ 'SQRT', 'ABS', 'NEGATE', 'FACTORIAL', 'SIGN', 'NOT'] as const;
export type MathOneInOneOut = typeof mathOneInOneOutArray[number];
export function isMathOneInOneOut(type: TypeNode): type is MathOneInOneOut {
    return (mathOneInOneOutArray as readonly TypeNode[]).includes(type);
}

export const zeroInOneOutArray = ['INPUT'] as const;
export type ZeroInOneOut = typeof zeroInOneOutArray[number];
export function isZeroInOneOut(type: TypeNode): type is ZeroInOneOut {
    return (zeroInOneOutArray as readonly TypeNode[]).includes(type);
}

//? shortcut
type TamplateInputOutput = {input:Array<{type: DataTypeNode, value: Decimal, enableInput: boolean}>,output:Array<{type: DataTypeNode, value: Decimal}>};

//? Arithmetic Template
const templateArithmeticNode:Map<Arithmetic,TamplateInputOutput> = new Map<Arithmetic,TamplateInputOutput>([
    ['ADD',{
        input:[
            { type:'number', value: Decimal('0'), enableInput:true, },
            { type:'number', value: Decimal('0'), enableInput:true, }
        ],
        output:[ { type:'number', value: Decimal('0'),} ]
    }],
    ['SUBTRACT',{
        input:[
            { type:'number', value: Decimal('0'), enableInput:true, },
            { type:'number', value: Decimal('0'), enableInput:true, }
        ],
        output:[ { type:'number', value: Decimal('0'),} ]
    }],
    ['MULTIPLY',{
        input:[
            { type:'number', value: Decimal('0'), enableInput:true, },
            { type:'number', value: Decimal('0'), enableInput:true, }
        ],
        output:[ { type:'number', value: Decimal('0'),} ]
    }],
    ['DIVIDE',{
        input:[
            { type:'number', value: Decimal('0'), enableInput:true, },
            { type:'number', value: Decimal('0'), enableInput:true, }
        ],
        output:[ { type:'number', value: Decimal('0'),} ]
    }],
    ['MOD', {
        input:[
            {type:'number', value: Decimal('0'), enableInput:true},
            {type:'number', value: Decimal('0'), enableInput:true},
        ],
        output:[
            {type:'number', value: Decimal('0')},
        ]
    }],
    ['POWER',{
        input:[
            { type:'number', value: Decimal('0'), enableInput:true, },
            { type:'number', value: Decimal('0'), enableInput:true, },
        ],
        output:[ { type:'number', value: Decimal('0'),} ]
    }],
    ['SQRT', {
        input:[
            { type:'number', value: Decimal('0'), enableInput:true, },
        ],
        output:[
            { type:'number', value: Decimal('0'),},
        ]
    }],
    ['ABS', {
        input:[
            {type:'number', value: Decimal('0'), enableInput:true, },
        ],
        output:[
            { type:'number', value: Decimal('0'),},
        ]
    }],
    ['NEGATE', {
        input:[
            {type:'number', value: Decimal('0'), enableInput:true, },
        ],
        output:[
            { type:'number', value: Decimal('0'),},
        ]
    }],
    ['FACTORIAL', {
        input:[
            {type:'number', value: Decimal('0'), enableInput:true, },
        ],
        output:[
            { type:'number', value: Decimal('0'),},
        ]
    }]
])

const tampleteComparsionNode:Map<Comparisons,TamplateInputOutput> = new Map<Comparisons,TamplateInputOutput>([
    ['EQUAL', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['NOT_EQUAL', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['GREATER', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['LESS', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['GREATER_EQ', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['LESS_EQ', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['BETWEEN', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['CLAMP', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['SIGN', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['COMPARE', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    

])

const taampleteLogicNode:Map<Logic,TamplateInputOutput> = new Map<Logic,TamplateInputOutput>([
    ['AND', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['OR', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['NOT', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['XOR', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['NAND', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
    ['NOR', {
        input: [
            {type:'number', value:Decimal('0'), enableInput:true},
            {type:'number', value:Decimal('0'), enableInput:true},
        ],
        output: [
            {type:'number', value:Decimal('0')},
        ]
    }],
])

//<?> Gabungkan semua template 
export const templatesNode:Map<TypeNode,TamplateInputOutput> = new Map<TypeNode,TamplateInputOutput>([
    ...templateArithmeticNode,
    ...tampleteComparsionNode,
    ...taampleteLogicNode,
    ['INPUT',{
        input: [ {type:'number', value: Decimal('0'), enableInput:false} ],
        output: [ {type:'number', value: Decimal('0'),} ]
    }],
    ['DUMMY', {
        input: [  ],
        output: [  ]
    }],
    
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
    ['Comparisons', new GroupAddNode('spawn', new Map<string, GroupAddNode>([
        ['Equal', new GroupAddNode('call', 'EQUAL')],
        ['Not Equal', new GroupAddNode('call', 'NOT_EQUAL')],
        ['Greater', new GroupAddNode('call', 'GREATER')],
        ['Less', new GroupAddNode('call', 'LESS')],
        ['Greater or Equal', new GroupAddNode('call', 'GREATER_EQ')],
        ['Less or Equal', new GroupAddNode('call', 'LESS_EQ')],
        ['Between', new GroupAddNode('call', 'BETWEEN')],
        ['Clamp', new GroupAddNode('call', 'CLAMP')],
        ['Sign', new GroupAddNode('call', 'SIGN')],
        ['Compare', new GroupAddNode('call', 'COMPARE')],
    ]))],
    ['Logic', new GroupAddNode('spawn', new Map<string, GroupAddNode>([
        ['And', new GroupAddNode('call', 'AND')],
        ['Or', new GroupAddNode('call', 'OR')],
        ['Not', new GroupAddNode('call', 'NOT')],
        ['Exclusive Or', new GroupAddNode('call', 'XOR')],
        ['Not And', new GroupAddNode('call', 'NAND')],
        ['Not Or', new GroupAddNode('call', 'NOR')],
    ]))],
    ['Rounding', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
    ['Trigonometry', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
    ['Logarithms', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
    ['Exponents', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
    ['Conversion ', new GroupAddNode('spawn', new Map<string, GroupAddNode>([]))],
])