import { SetElement } from '../../helper/addons';
import type { GroupAddNode, TypeNode } from '../../node/typesDefinition';
import type { Vector2 } from '../../TypeDefinition';

export class AddNodeEnvironment {
    private popupStack: { element: HTMLElement; level: number }[] = [];
    private rootContainer: HTMLElement;
    private onCall: (type: TypeNode) => void;

    constructor(rootContainer: HTMLElement, onCall: (type: TypeNode) => void) {
        this.rootContainer = rootContainer;
        this.onCall = onCall;
    }

    openRoot(items: Map<string, GroupAddNode>, position: Vector2) {
        this.closeAll();
        this._openPopup(items, position, 0);
    }

    closeFromLevel(targetLevel: number) {
        const toRemove = this.popupStack.filter(p => p.level >= targetLevel);
        toRemove.forEach(p => p.element.remove());
        this.popupStack = this.popupStack.filter(p => p.level < targetLevel);
    }

    closeAll() {
        this.popupStack.forEach(p => p.element.remove());
        this.popupStack = [];
    }

    private _openPopup(items: Map<string, GroupAddNode>, position: Vector2, level: number) {
        const popup = this._buildPopup(items, position, level);
        this.rootContainer.appendChild(popup);
        this.popupStack.push({ element: popup, level });
    }

    private _buildPopup(items: Map<string, GroupAddNode>, position: Vector2, level: number): HTMLElement {
        return SetElement('div',{
                class: ['add_node', 'add_node-style'],
                style: [`--position-x: ${position.x}px`, `--position-y: ${position.y}px`],
            },
            SetElement('div', { class: ['title-add_node'] }, 'Add Node'),
            SetElement('div', { class: ['container-items-add_node'] }, () =>
                Array.from(items.entries()).map(([key, value]) =>
                    this._buildItem(key, value, level)
                )
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
                    const rect = item.getBoundingClientRect();
                    const containerRect = this.rootContainer.getBoundingClientRect();
                    this._openPopup( value.action as Map<string, GroupAddNode>, { x: rect.right - containerRect.left, y: rect.top - containerRect.top}, level + 1);
                },150);
            }
        });

        item.addEventListener('mouseleave', () => {
            clearTimeout(timeOut);
        })

        if (value.isCall()) {
            item.addEventListener('mousedown', () => {
                this.onCall(value.action as TypeNode);
                this.closeAll();
            });
        }

        return item;
    }
}