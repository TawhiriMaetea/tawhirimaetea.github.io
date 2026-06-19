//code for container resize animation

const resizeObservers = new WeakMap();

export function getElementHeight(element) {
    if (!element) return 0;
    return element.getBoundingClientRect().height;
}

export function animateAutoHeightFrom(element, startHeight, durationMs) {
    if (!element) return;

    const end = element.scrollHeight;

    if (Math.abs(end - startHeight) < 0.5) {
        return;
    }

    element.style.overflow = "hidden";
    element.style.height = `${startHeight}px`;
    element.style.transition = "none";

    void element.offsetHeight;

    element.style.transition = `height ${durationMs}ms ease`;
    element.style.height = `${end}px`;

    const onEnd = () => {
        element.style.height = "auto";
        element.style.overflow = "";
        element.style.transition = "";
        element.removeEventListener("transitionend", onEnd);
    };

    element.addEventListener("transitionend", onEnd);
}

export function observeAutoHeight(element, durationMs) {
    if (!element || resizeObservers.has(element)) {
        return;
    }

    let previousHeight = element.getBoundingClientRect().height;
    let isAnimating = false;

    const observer = new ResizeObserver(() => {
        if (isAnimating) {
            return;
        }

        const currentHeight = element.getBoundingClientRect().height;

        if (Math.abs(currentHeight - previousHeight) < 0.5) {
            previousHeight = currentHeight;
            return;
        }

        isAnimating = true;
        animateAutoHeightFrom(element, previousHeight, durationMs);
        previousHeight = currentHeight;

        setTimeout(() => {
            isAnimating = false;
            previousHeight = element.getBoundingClientRect().height;
        }, durationMs + 50);
    });

    observer.observe(element);
    resizeObservers.set(element, observer);
}

export function unobserveAutoHeight(element) {
    if (!element) {
        return;
    }

    const observer = resizeObservers.get(element);
    if (!observer) {
        return;
    }

    observer.disconnect();
    resizeObservers.delete(element);
}