import { setDomAttribute, setEventListener } from "./mutators.js";

export function extractElement(domElement) {
    if (domElement.nodeType === Node.TEXT_NODE) {
        return {
            tagName: "text",
            content: domElement.textContent,
        };
    }

    const attributes = {};
    for (const attr of domElement.attributes) {
        attributes[attr.name] = attr.value;
    }

    const children = [];
    for (const child of domElement.childNodes) {
        children.push(extractElement(child));
    }

    return {
        tagName: domElement.tagName.toLowerCase(),
        attributes,
        events: {}, // Event listeners cannot be reconstructed from the DOM
        children,
    };
}

export function createElement(tagName, attributes = {}, events = {}, ...children) {
    return {
        tagName,
        attributes,
        events,

        children: children.flat().map((child) => {
            if (typeof child === "string" || typeof child === "number") {
                return {
                    tagName: "text",
                    content: String(child),
                };
            }

            return child;
        }),
    };
}

export function renderElement(clear, parent, ...elements) {
    // Clear existing content if requested
    if (clear) {
        parent.innerHTML = "";
    }

    elements.forEach((element) => {
        // Ignore invalid render values
        if (element == null || element === false) return;

        // Render text nodes
        if (element.tagName === "text") {
            const textNode = document.createTextNode(element.content);
            parent.appendChild(textNode);
            return;
        }

        // Create DOM element
        const domElement = document.createElement(element.tagName);

        // Apply attributes
        if (element.attributes) {
            for (const [key, value] of Object.entries(element.attributes)) {
                if (key.startsWith("on") && typeof value === "function") {
                    const eventType = key.slice(2).toLowerCase();
                    setEventListener(domElement, eventType, value);
                } else {
                    setDomAttribute(domElement, key, value);
                }
            }
        }

        // Attach events
        if (element.events) {
            for (const [eventType, eventHandler] of Object.entries(element.events)) {
                setEventListener(domElement, eventType, eventHandler);
            }
        }

        // Render children recursively
        if (element.children?.length > 0) {
            renderElement(false, domElement, ...element.children);
        }

        // Append final element to parent
        parent.appendChild(domElement);
    });
}