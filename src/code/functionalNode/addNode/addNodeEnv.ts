import { SetElement } from '../../helper/addons';
import type { GroupAddNode, TypeNode } from '../../node/typesDefinition';
import type { Vector2 } from '../../TypeDefinition';

export class AddNodeEnvironment {
    private popupStack: { element: HTMLElement; level: number }[] = [];
    private rootContainer: HTMLElement;
    private onCall: (event:MouseEvent, name:string, type: TypeNode ) => void;
    private space = 3;

    constructor(rootContainer: HTMLElement, onCall: (event:MouseEvent, name:string, type: TypeNode) => void) {
        this.rootContainer = rootContainer;
        this.onCall = onCall;
    }

    openRoot(items: Map<string, GroupAddNode>, position: Vector2) {
        this.closeAll();
        const fogElement = this.rootContainer.querySelector('.fog');
        if (fogElement && !fogElement.classList.contains('active')) {
            fogElement.classList.add('active');
        }
        this._openPopup(items, position, 0);
    }

    closeFromLevel(targetLevel: number) {
        const toRemove = this.popupStack.filter(p => p.level >= targetLevel);
        toRemove.forEach(p => p.element.remove());
        this.popupStack = this.popupStack.filter(p => p.level < targetLevel);
    }

    closeAll() {
        const fogElement = this.rootContainer.querySelector('.fog');
        if (fogElement && fogElement.classList.contains('active')) {
            fogElement.classList.remove('active');
        }
        this.popupStack.forEach(p => p.element.remove());
        this.popupStack = [];
    }

    private _openPopup(items: Map<string, GroupAddNode>, position: Vector2, level: number, childMode:boolean = false) {
        const popup = this._buildPopup(items, position, level, childMode);
        this.rootContainer.appendChild(popup);

        const popupRect = popup.getBoundingClientRect()
        const rootContainerRect = this.rootContainer.getBoundingClientRect();

        if (popupRect.top + popupRect.height > rootContainerRect.top + rootContainerRect.height) {
            const overflowOffset = (popupRect.top + popupRect.height) - (rootContainerRect.top + rootContainerRect.height);
            position.y -= overflowOffset;
            popup.style.setProperty('--position-y',`${position.y}px`)
        }
        
        if (popupRect.x + popupRect.width > rootContainerRect.x + rootContainerRect.width) {
            if (childMode) {
                position.x -= ((popupRect.width + this.space)*2);
            }else{
                const overflowOffset = (popupRect.x + popupRect.width) - (rootContainerRect.x + rootContainerRect.width);
                position.x -= overflowOffset;
            }
            popup.style.setProperty('--position-x',`${position.x}px`)
        }
        this.popupStack.push({ element: popup, level });
    }

    

    private _buildPopup(items: Map<string, GroupAddNode>, position: Vector2, level: number, childMode:boolean): HTMLElement {
        return SetElement('div',{class: ['add_node', 'add_node-style'], style: [`--position-x: ${position.x}px`, `--position-y: ${position.y}px`], },
            //...(!childMode? [SetElement('div', { class: ['title-add_node'] }, 'Add Node')] : []),
            SetElement('div', { class: ['container-items-add_node'] }, () =>
                (items.size > 0? 
                Array.from(items.entries()).map(([key, value]) =>
                    this._buildItem(key, value, level)
                ): [
                    SetElement('div',{class:['item-empty']},SetElement('span',{},"Empty (ó_ò。 )▶A"))
                ])
            )
        );
    }

    private _buildItem(key: string, value: GroupAddNode, level: number): HTMLElement {
        const item = SetElement('div',{ class: ['item-add_node'] },
            SetElement('span', {}, key),
            ...(value.isSpawn() ? [SetElement('span', {}, '▶')] : [])
        );

        let timeOut: ReturnType<typeof setTimeout>;

        item.addEventListener('mouseenter', () => {
            this.closeFromLevel(level + 1);

            if (value.isSpawn()) {


                timeOut = setTimeout(() => {
                    console.log(item);
                    
                    const popupRect = item.getBoundingClientRect();

                    const position:Vector2 = {x: (popupRect.x + popupRect.width) + (this.space * 2), y: popupRect.y - (this.space * 12) - 2};
                    
                    this._openPopup( value.action as Map<string, GroupAddNode>, position, level + 1, true);
                },150);
            }
        });

        item.addEventListener('mouseleave', () => {
            clearTimeout(timeOut);
        })

        if (value.isCall()) {
            item.addEventListener('mousedown', (ev) => {
                this.onCall(ev, key, value.action as TypeNode);
                this.closeAll();
            });
        }

        return item;
    }
}