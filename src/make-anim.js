export default function makeAnim({ newEl, old, place = 'afterend', direction = 'up', duration = 400 }) {
    let shift;
    // const parent = old.parentElement;

    // available directions: up | down | left | right
    if (['up', 'down'].includes(direction)) {
        shift = old.clientHeight;
    } else {
        shift = old.clientWidth;
    }

    const multiplier = direction === 'up' ? 1 : -1;

    // create element and add to target
    old.insertAdjacentElement('afterend', newEl);

    newEl.style.position = 'absolute';
    newEl.style.top = '0px';
    newEl.style.transform = `translateY(${shift * multiplier}px)`;
    newEl.style.opacity = '0';
    const animationNew = [{ transform: 'translateY(0)', opacity: '1' }];
    const animationOld = [{ transform: `translateY(${shift * multiplier * -1}px)`, opacity: '0' }];
    const props = { duration };

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
