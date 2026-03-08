type MouseSignal = 'world2d' | 'DragNode' | 'RectSelect' | 'NodeTitle' | 'dragView' | 'socketSelected' | 'editValueNode' | 'inValueNode' | '';
type SpecialSignal = 'inputTypingModeNode' | '';
type MouseKey = 'left' | 'middle' | 'right';

// Mapping untuk ev.button (index tombol yang memicu event)
const buttonMap: Record<number, MouseKey> = {
    0: 'left',
    1: 'middle',
    2: 'right',
};
const setMouseEvent = new Set<string>(['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu'])
const buttonBits: Record<MouseKey, number> = {
    left: 1,
    middle: 4,
    right: 2,
}; 

export class MouseButtonState {
    private keys: Record<MouseKey, MouseSignal> = {
        left: '',
        middle: '',
        right: '',
    }

    private specialKeys: Record<MouseKey, Set<SpecialSignal>> = {
        left: new Set<SpecialSignal>(),
        middle: new Set<SpecialSignal>(),
        right: new Set<SpecialSignal>(),
    }

    private normalize(ev: MouseEvent): number {
        if (setMouseEvent.has(ev.type)) {
            return ev.button;
        }
        return -1;
    }

    private isButtonPressed(ev: MouseEvent, mouse: MouseKey): boolean {
        if (setMouseEvent.has(ev.type)) {
            return buttonMap[ev.button] === mouse;
        }
        return (ev.buttons & buttonBits[mouse]) !== 0;
    }

    set(mouseEvent: MouseEvent, signal: MouseSignal) {
        const key = buttonMap[this.normalize(mouseEvent)];
        if (key) {
            this.keys[key] = signal;
        }
    }

    setAlt(mouseEvent: MouseEvent, mouse: MouseKey, signal: MouseSignal) {
        if (this.isButtonPressed(mouseEvent, mouse)) {
            this.keys[mouse] = signal;
        }
    }

    getSignal(mouse: MouseKey): MouseSignal {
        return this.keys[mouse];
    }

    addSpecial(mouseEvent: MouseEvent, signal: SpecialSignal) {
        const key = buttonMap[this.normalize(mouseEvent)];
        if (key) {
            this.specialKeys[key].add(signal);
        }
    }

    addSpecialAlt(mouseEvent: MouseEvent, mouse: MouseKey, signal: SpecialSignal) {
        if (this.isButtonPressed(mouseEvent, mouse)) {
            this.specialKeys[mouse].add(signal);
        }
    }

    hasSpecial(mouse: MouseKey, signal: SpecialSignal){
        return this.specialKeys[mouse].has(signal);
    }

    getListSpecials(mouse: MouseKey){
        return this.specialKeys[mouse]
    }

    removeSpecial(mouse: MouseKey, signal: SpecialSignal){
        return this.specialKeys[mouse].delete(signal);
    }

    specialExist(mouse: MouseKey){
        if (this.specialKeys[mouse].size == 0) {
            return false;
        }
        return true;
    }

    log(){
        console.log('keys:','\nleft:',this.keys.left,'middle:',this.keys.middle,'right:',this.keys.right,'\nspecialKeys:', '\nleft:',...this.specialKeys.left, 'middle:',...this.specialKeys.middle, 'right:',...this.specialKeys.right)
    }

}