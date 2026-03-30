# Math-Node
Math-Node is a node-based calculator simulation, where nodes can be connected to one another (without loops) to process and calculate values
***

🔗 **[[Try it in Browser]](https://ryp-w.github.io/Math-Node/)**

## Available Nodes

### Input & Output
| Node | Description |
|---|---|
| `Input` | Manual value input |
| `Output` | Display the final result |

### Arithmetic
| Node | Formula | Description |
|---|---|---|
| `Add` | `a + b` | Addition |
| `Subtract` | `a - b` | Subtraction |
| `Multiply` | `a * b` | Multiplication |
| `Divide` | `a / b` | Division |
| `Mod` | `a % b` | Remainder of division |
| `Power` | `a ^ b` | a raised to the power of b |
| `Sqrt` | `√a` | Square root of a |
| `Absolute` | `\|a\|` | Absolute value |
| `Negate` | `-a` | Flip the sign |
| `Factorial` | `a!` | Factorial |

### Comparison
| Node | Formula | Description |
|---|---|---|
| `Equal` | `a == b` | Returns 1 if equal, else 0 |
| `Not Equal` | `a != b` | Returns 1 if not equal, else 0 |
| `Greater` | `a > b` | Returns 1 if a is greater, else 0 |
| `Less` | `a < b` | Returns 1 if a is less, else 0 |
| `Greater or Equal` | `a >= b` | Returns 1 if a ≥ b, else 0 |
| `Less or Equal` | `a <= b` | Returns 1 if a ≤ b, else 0 |
| `Between` | `b <= a <= c` | Returns 1 if a is within range, else 0 |
| `Minimal` | `min(a, b)` | Returns the smallest value |
| `Maximal` | `max(a, b)` | Returns the largest value |
| `Clamp` | `max(b, min(c, a))` | Constrain a between b and c |
| `Sign` | `1 / 0 / -1` | Returns sign of a |
| `Compare` | `1 / 0 / -1` | Returns 1 if a > b, -1 if a < b, 0 if equal |

### Logic
> Values are treated as boolean: `0` = false, non-zero = true. Output is always `1` or `0`.

| Node | Formula | Description |
|---|---|---|
| `And` | `a && b` | True if both are non-zero |
| `Or` | `a \|\| b` | True if either is non-zero |
| `Not` | `!a` | Invert boolean value |
| `Exclusive Or` | `a ⊕ b` | True if inputs differ |
| `Not And` | `!(a && b)` | Negated AND |
| `Not Or` | `!(a \|\| b)` | Negated OR |

### Rounding
| Node | Formula | Description |
|---|---|---|
| `Round` | `round(a)` | Round to nearest integer |
| `Floor` | `floor(a)` | Round down |
| `Ceil` | `ceil(a)` | Round up |
| `Trunc` | `trunc(a)` | Remove decimal part |
| `Round Multiply` | `round(a / b) * b` | Round to nearest multiple of b |
| `Floor Multiply` | `floor(a / b) * b` | Floor to nearest multiple of b |
| `Ceil Multiply` | `ceil(a / b) * b` | Ceil to nearest multiple of b |
| `Even` | `nearest even(a)` | Round to nearest even integer |
| `Odd` | `nearest odd(a)` | Round to nearest odd integer |

### Trigonometry
> All angle inputs and outputs are in **radians**.

| Node | Formula | Description |
|---|---|---|
| `Sinus` | `sin(a)` | Sine |
| `Cosine` | `cos(a)` | Cosine |
| `Tangent` | `tan(a)` | Tangent |
| `Arc Sine` | `asin(a)` | Arc Sine |
| `Arc Cosine` | `acos(a)` | Arc Cosine |
| `Arc Tangent` | `atan(a)` | Arc Tangent |
| `Arc Tangent 2` | `atan2(a, b)` | Arc Tangent of a/b using both signs |
| `Cosecant` | `1 / sin(a)` | Cosecant |
| `Secant` | `1 / cos(a)` | Secant |
| `Cotangent` | `1 / tan(a)` | Cotangent |

### Logarithm
| Node | Formula | Description |
|---|---|---|
| `Natural logarithm` | `ln(a)` | Natural logarithm |
| `logarithm` | `log_b(a)` | Logarithm of a with base b |
| `logarithm base 2` | `log2(a)` | Logarithm base 2 |
| `logarithm base 10` | `log10(a)` | Logarithm base 10 |

### Exponent
| Node | Formula | Description |
|---|---|---|
| `EXPONENT` | `e ^ a` | e raised to the power of a |
| `Power 2` | `2 ^ a` | 2 raised to the power of a |
| `Power 10` | `10 ^ a` | 10 raised to the power of a |

### Conversion
| Node | Formula | Description |
|---|---|---|
| `Radians to Degrees` | `a * 180 / π` | Radians to degrees |
| `Degrees to Radians` | `a * π / 180` | Degrees to radians |
| `Normalize` | `(a - min) / (max - min)` | Map value to 0–1 range |

### Constants
| Node | Value | Description |
|---|---|---|
| `PI` | `π ≈ 3.14159265...` | Pi |
| `Euler` | `e ≈ 2.71828182...` | Euler's number |
| `Sqrt 2` | `√2 ≈ 1.41421356...` | Square root of 2 |
| `NL 2` | `ln(2) ≈ 0.69314718...` | Natural log of 2 |
| `NL 10` | `ln(10) ≈ 2.30258509...` | Natural log of 10 |
| `Infinity` | `∞` | Infinity |

## Precision & Arithmetic

All calculations use [Decimal.js](https://github.com/MikeMcl/decimal.js) 
to avoid floating point issues common in JavaScript (e.g. `0.1 + 0.2 ≠ 0.3`).

> **Default Decimal.js configuration (unchanged):**
> - Precision: **20** significant digits
> - Rounding: **ROUND_HALF_UP**
> 
> Example: `123.45678901234567890123` is stored as `123.45678901234567890` (20 digits total).
> For most use cases this is more than sufficient, but be aware for extremely large 
> or high-precision calculations.

## Getting Started

### Installation
``` cmd
git clone https://github.com/RYP-w/Math-Node.git
cd Math-Node
npm install
npm run dev
```

## Build
``` cmd
npm run build
```

## Tech Stack
| Technology | Purpose |
|---|---|
| [TypeScript](https://www.typescriptlang.org/) | Type-safe programming language |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Decimal.js](https://github.com/MikeMcl/decimal.js) | Precise decimal arithmetic |
| [RBush](https://github.com/mourner/rbush) | Spatial indexing for node selection |

## Assets
| Source / Creator | Description |
|---|---|
| [Cozette - the-moonwitch](https://github.com/the-moonwitch/Cozette) | Main project font |
| [Input Prompts - Kenney](https://kenney.nl/assets/input-prompts) | Input icons and prompts |

## What's Next?
I usually add new features randomly based on what I feel like exploring, rather than strictly following this list. But here are some ideas floating around:
- [ ] Add horizontal node resizing
- [ ] Refactor node execution to use a proper topological sort algorithm
- [ ] data type Boolean, Vector2, Vector3, and Vector4
- [ ] copy and paste system for node
- [ ] save and load system for node

## Note
> First project — code is messy, docs are sparse. Learning in progress ✌️