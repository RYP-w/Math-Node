type ShortcutOptions = {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
};

function createShortcut(options: ShortcutOptions, callback: (ev:KeyboardEvent) => void) {
    const handler = (event: KeyboardEvent) => {
        const isKeyMatch = event.key.toLowerCase() === options.key.toLowerCase();
        
        const isCtrlMatch = !!options.ctrl === event.ctrlKey;
        const isShiftMatch = !!options.shift === event.shiftKey;
        const isAltMatch = !!options.alt === event.altKey;

        if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch) {
            event.preventDefault();
            callback(event);
        }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
}

export function registerShortcut(options: ShortcutOptions, targetElement:HTMLElement, callback: (ev:KeyboardEvent) => void) {
    let removeShortcut: (() => void) | null = null;

    const handlerMouseEnter = () => {
        if (!removeShortcut) {
            removeShortcut = createShortcut(options, callback);
        }
    }
    const handlerMouseLeave = () => {
        if (removeShortcut) {
            removeShortcut();
            removeShortcut = null;
        }
    }

    targetElement.addEventListener('mouseenter', handlerMouseEnter);
    targetElement.addEventListener('mouseleave', handlerMouseLeave);
    
    return () => {
        handlerMouseLeave();
        targetElement.removeEventListener('mouseenter', handlerMouseEnter); 
        targetElement.removeEventListener('mouseleave', handlerMouseLeave);
    }
}