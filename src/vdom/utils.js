import { setDomAttribute, setEventListener } from "./mutators.js";

export const ROOT = document.getElementById("root");

export function buildVirtualDomFromRoute(router) {
    const currentPath = location.hash.slice(1) || "/";
    const matchedRoute = router.routes[currentPath];

    return router.routes[matchedRoute ? currentPath : "*"].fake();
}

export function getNodeByPath(root, path) {
    if (path === "root") {
        return root;
    }

    // Extract all child indexes from path
    const indexes = [...path.matchAll(/children\[(\d+)\]/g)].map((m) => Number(m[1]));

    let current = root;
    for (const index of indexes) {
        if (!current || !current.childNodes[index]) {
            return null;
        }
        current = current.childNodes[index];
    }
    return current;
}

export function createRealNode(vNode) {
    if (!vNode) return null;

    if (vNode.tagName === "text") {
        return document.createTextNode(vNode.content);
    }

    const element = document.createElement(vNode.tagName);

    // Apply attributes and inline events
    for (const [key, value] of Object.entries(vNode.attributes || {})) {
        if (key.startsWith("on") && typeof value === "function") {
            setEventListener(element, key.slice(2).toLowerCase(), value);
        } else {
            setDomAttribute(element, key, value);
        }
    }

    // Apply explicit event listeners
    for (const [eventType, handler] of Object.entries(vNode.events || {})) {
        setEventListener(element, eventType, handler);
    }

    // Recursively render children
    for (const child of vNode.children || []) {
        const childNode = createRealNode(child);
        if (childNode) {
            element.appendChild(childNode);
        }
    }

    return element;
}