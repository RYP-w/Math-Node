import { checkEditorCompatibility, randomRange, SetElement } from "./helper/addons";

export function actionCheckCompatible() {
    let check = checkEditorCompatibility();
    
    if (check.isSuitableForEditor) {
        return;
    }

    const htmlCompatibleWarning = document.getElementById('body')!.appendChild(createCompatibleWarningHtml()); 

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

    updateSupportStatus('#cw-info-check-keyboard',check.hasHoverCapability);
    updateSupportStatus('#cw-info-check-mouse',check.hasPrecisePointer);

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

function createCompatibleWarningHtml() {
    return SetElement('div', {id:'compatible-warning'},
        SetElement('div', {id:'cw-container-info'}, 
            SetElement('div', {id:'cw-info-expression-icon'}, "(｡ó﹏ò)"),
            SetElement('div', {}, 'Device mungkin tidak kompatibel dengan editor ini.'),
            SetElement('div', {class:['cw-text-detail']}, 'Detail:'),
            SetElement('table', {},
                SetElement('tr', {},
                    SetElement('td', {class:['cw-info-title']}, '• Keyboard support'),
                    SetElement('td', {class:['cw-info-colon']}, ':'),
                    SetElement('td', {id:'cw-info-check-keyboard', class:['cw-info-check']}),
                ),
                SetElement('tr', {},
                    SetElement('td', {class:['cw-info-title']}, '• Mouse support'),
                    SetElement('td', {class:['cw-info-colon']}, ':'),
                    SetElement('td', {id:'cw-info-check-mouse', class:['cw-info-check']}),
                )
            ),
            SetElement('div', {style:['display: flex;', 'justify-content: center;']},
                SetElement('button', {id:'cw-info-button-continue', style:['margin-top: 10px;']}, 'Tetap Lanjutkan ▶')
            )
        )
    );
}