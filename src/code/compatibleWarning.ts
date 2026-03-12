import { checkEditorCompatibility, randomRange } from "./helper/addons";

export function actionCheckCompatible() {
    let check = checkEditorCompatibility();
    
    const htmlCompatibleWarning = document.getElementById('compatible-warning')!;
    
    if (check.isSuitableForEditor) {
        htmlCompatibleWarning.remove();
        return;
    }

    htmlCompatibleWarning.style.display = 'flex';

    const htmlExpressionIcon = htmlCompatibleWarning.querySelector('#cw-info-expression-icon') as HTMLDivElement;
    let times: ReturnType<typeof setTimeout>;
    function blink() {
        htmlExpressionIcon.innerHTML = "(｡-﹏-)";

        times = setTimeout(() => {
            htmlExpressionIcon.innerHTML = "(｡ó﹏ò)";

            const intervalTime = randomRange(100, 2000);

            times = setTimeout(blink, intervalTime);
        }, 100);
    }

    blink();

    const updateSupportStatus = (selector: string, isSupported: boolean) => {
        const element = htmlCompatibleWarning.querySelector(selector) as HTMLDivElement;
        if (element) {
            element.classList.add(isSupported ? 'yes' : 'no');
            element.innerHTML = isSupported ? "✓" : "✕";
        }
    };

    updateSupportStatus('#cw-info-check-keyboard',check.hasKeyboardSupport);
    updateSupportStatus('#cw-info-check-mouse',check.hasMouseSupport);

    const buttonContinue = htmlCompatibleWarning.querySelector('#cw-info-button-continue') as HTMLButtonElement;
    const handleButtonEnter = () => {
        clearTimeout(times);
        htmlExpressionIcon.innerHTML = "( ╹ -╹)?";
    }
    const handleButtonOut = () => {
        clearTimeout(times);
        blink()
    }
    buttonContinue.addEventListener('mouseenter', handleButtonEnter);
    buttonContinue.addEventListener('mouseout', handleButtonOut)
    buttonContinue.onclick = () => {
        buttonContinue.removeEventListener('mouseenter', handleButtonEnter);
        buttonContinue.removeEventListener('mouseout', handleButtonOut);
        clearTimeout(times);
        htmlCompatibleWarning.remove();

    }
}