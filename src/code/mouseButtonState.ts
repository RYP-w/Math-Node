type MouseSignal = 'DragNode' | 'world2d' | 'RectSelect' | 'titleSelect' | '';
type MouseKey = 'left' | 'middle' | 'right';
const buttonMap: Record<number, MouseKey> = {
    0: 'left',
    1: 'middle',
    2: 'right',
};

export class MouseButtonState {
    private keys: Record<MouseKey, MouseSignal> = {
        left: '',
        middle: '',
        right: '',
    }

    set(mouseEvent: MouseEvent, textSignal: MouseSignal) {
        const key = buttonMap[mouseEvent.button];
        if (key) {
            this.keys[key] = textSignal;
        }
    }

    setAlt(mouseEvent: MouseEvent, mouse: MouseKey, textSignal: MouseSignal) {
        const key = buttonMap[mouseEvent.button];
        if (key === mouse) {
            this.keys[key] = textSignal;
        }
    }

    getSignal(mouse: MouseKey): MouseSignal {
        return this.keys[mouse];
    }

}