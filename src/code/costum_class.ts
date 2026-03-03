type MouseKey = 'left' | 'middle' | 'right';
const buttonMap: Record<number, MouseKey> = {
    0: 'left',
    1: 'middle',
    2: 'right',
};

export class EventMouseDown {
    private keys: Record<MouseKey, string> = {
        left: '',
        middle: '',
        right: '',
    }

    set(mouseEvent: MouseEvent, textSignal: string) {
        const key = buttonMap[mouseEvent.button];
        if (key) {
            this.keys[key] = textSignal;
        }
    }

    setAlt(mouseEvent: MouseEvent, mouse: MouseKey, textSignal: string) {
        const key = buttonMap[mouseEvent.button];
        if (key === mouse) {
            this.keys[key] = textSignal;
        }
    }

    getSignal(mouse: MouseKey): string {
        return this.keys[mouse];
    }

}