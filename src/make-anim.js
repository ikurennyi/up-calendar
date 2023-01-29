export default function makeAnim({
    newEl,
    old,
    place = 'afterend',
    direction = 'up',
    duration = 400,
    effect = 'shift',
}) {
    let animationNew;
    let animationOld;
    let props = { duration };

    switch (place) {
        case 'afterend':
            old.insertAdjacentElement('afterend', newEl);
            break;
        case 'beforeend':
            old.insertAdjacentElement('beforeend', newEl);
            break;
        case 'afterbegin':
            old.insertAdjacentElement('afterbegin', newEl);
        default:
            old.insertAdjacentElement('beforebegin', newEl);
            break;
    }

    if (effect === 'shift') {
        let shift;
        // const parent = old.parentElement;

        // available directions: up | down | left | right
        // insertAdjacentElement: beforebegin | afterbegin | 'beforeend' | afterend
        if (['up', 'down'].includes(direction)) {
            shift = old.clientHeight;
        } else {
            shift = old.clientWidth;
        }

        const multiplier = ['up', 'left'].includes(direction) ? 1 : -1;

        // create element and add to target

        if (direction === 'right' || direction === 'left') {
            newEl.style.transform = `translateX(${shift * multiplier}px)`;
            animationNew = [{ transform: 'translateX(0)', opacity: '1' }];
            animationOld = [{ transform: `translateX(${shift * multiplier * -1}px)`, opacity: '0' }];
        } else {
            newEl.style.transform = `translateY(${shift * multiplier}px)`;
            animationNew = [{ transform: 'translateY(0)', opacity: '1' }];
            animationOld = [{ transform: `translateY(${shift * multiplier * -1}px)`, opacity: '0' }];
        }

        newEl.style.position = 'absolute';
        newEl.style.top = '0px';
        newEl.style.opacity = '0';
    } else if (effect === 'appear') {
        animationNew = [{ transform: 'translateY(0)', opacity: '1' }];
        animationOld = [{ transform: `translateY(-20px)`, opacity: '0' }];

        newEl.style.top = '0px';
        newEl.style.position = 'absolute';
        newEl.style.transform = 'translateY(20px)';
        newEl.style.opacity = '0';
    }

    // move original item otside and new one to the target place
    newEl.animate(animationNew, props);
    old.animate(animationOld, props);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ newEl, old });
            makeCleanup({ newEl, old });
        }, duration);
    });
}

export function makeCleanup({ newEl, old }) {
    // remove old element
    old.remove();
    // cleanup added styles
    newEl.style.position = null;
    newEl.style.transform = null;
    newEl.style.opacity = null;
}
