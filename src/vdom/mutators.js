export function setEventListener(element, eventType, handler) {
    // Internal event registry
    if (!element.__fwEventListeners) {
        element.__fwEventListeners = {};
    }

    // Remove old listener before adding new one
    removeEventListener(element, eventType);

    element.__fwEventListeners[eventType] = handler;
    element.addEventListener(eventType, handler);
}

export function removeEventListener(element, eventType) {
    const eventListeners = element.__fwEventListeners;
    const oldHandler = eventListeners?.[eventType];

    if (oldHandler) {
        element.removeEventListener(eventType, oldHandler);
        delete eventListeners[eventType];
    }
}

export function setDomAttribute(element, key, value) {
    // Special handling for checkbox/radio state
    if (key === "checked") {
        element.checked = Boolean(value);

        if (value) {
            element.setAttribute(key, "");
        } else {
            element.removeAttribute(key);
        }
        return;
    }
    element.setAttribute(key, value);
}

export function removeDomAttribute(element, key) {
    // Reset boolean checked state
    if (key === "checked") {
        element.checked = false;
    }
    element.removeAttribute(key);
}