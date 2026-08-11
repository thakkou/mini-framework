export function setEventListener(elem, eventType, handler) {
    // __mfEventListeners__: internal event registry
    if (!elem.__mfEventListeners__)
        elem.__mfEventListeners__ = {};

    removeEventListener(elem, eventType);
    elem.__mfEventListeners__[eventType] = handler;
    elem.addEventListener(eventType, handler);
}

export function removeEventListener(elem, eventType) {
    const eventListeners = elem.__mfEventListeners__;
    const prevHandler = eventListeners?.[eventType];
    if (prevHandler) {
        elem.removeEventListener(eventType, prevHandler);
        delete eventListeners[eventType];
    }
}

export function setDomAttribute(elem, key, value) {
    // checkbox/radio state special handling
    if (key === "checked") {
        elem.checked = Boolean(value);
        value ?
            elem.setAttribute(key, "") :
            elem.removeAttribute(key);
    } else {
        elem.setAttribute(key, value);
    }
}

export function removeDomAttribute(elem, key) {
    // reset checked state
    if (key === "checked") elem.checked = false;
    elem.removeAttribute(key);
}