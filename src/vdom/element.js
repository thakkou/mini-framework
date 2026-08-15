import { setDomAttribute, setEventListener } from "./mutators.js";

export function parseElement(domEl) {
    if (domEl.nodeType === Node.TEXT_NODE) return {
        tagName: "text",
        content: domEl.textContent,
    };

    const attributes = {};
    for (const attr of domEl.attributes) {
        attributes[attr.name] = attr.value;
    }

    // key's hidden property
    if (domEl.__mfKey !== undefined) {
        attributes["data-key"] = domEl.__mfKey;
    }

    const children = [];
    for (const child of domEl.childNodes) {
        children.push(parseElement(child));
    }

    return {
        // Event listeners cannot be reconstructed from the DOM
        tagName: domEl.tagName.toLowerCase(),
        attributes,
        events: {},
        children,
    };
}

export function createElement(tagName, attributes = {}, events = {}, ...children) {
    return {
        tagName,
        attributes,
        events,
        // .flat() only flattens one level by default.
        children: children.flat().map(child => {
            return (typeof child === "string" || typeof child === "number") ?
                { tagName: "text", content: String(child) } : child;
        })
    };
}

export function renderElement(clear, parent, ...elements) {
    if (clear) parent.innerHTML = "";

    elements.forEach(el => {
        if (el == null || el === false) return;

        if (el.tagName === "text") {
            const textNode = document.createTextNode(el.content);
            parent.appendChild(textNode);
            return;
        }

        const domEl = document.createElement(el.tagName);

        if (el.attributes) {
            for (const [key, value] of Object.entries(el.attributes)) {
                if (key.startsWith("on") && typeof value === "function") {
                    const eventType = key.slice(2).toLowerCase();
                    setEventListener(domEl, eventType, value);
                } else {
                    setDomAttribute(domEl, key, value);
                }
            }
        }

        if (el.events) {
            for (const [eventType, eventHandler] of Object.entries(el.events)) {
                setEventListener(domEl, eventType, eventHandler);
            }
        }

        // renders children recursively
        if (el.children?.length > 0) {
            renderElement(false, domEl, ...el.children);
        }

        parent.appendChild(domEl);
    });
}