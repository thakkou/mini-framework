import { setDomAttribute, setEventListener } from "./mutators.js";

export const ROOT_NODE = document.getElementById("root");

export function routeToVDom(router) {
    const current = location.hash.slice(1) || "/";
    const matched = router.routes[current];
    return router.routes[matched ? current : "*"].fake();
}

export function getNodeFromPath(root, path) {
    if (path === "root") return root;

    // child indexes
    const indexes = [...path.matchAll(/children\[(\d+)\]/g)]
        .map((m) => Number(m[1]));

    let current = root;
    for (const index of indexes) {
        if (!current || !current.childNodes[index]) return null;
        current = current.childNodes[index];
    }
    return current;
}

export function createActualNode(vnode) {
    if (!vnode) return null;

    if (vnode.tagName === "text")
        return document.createTextNode(vnode.content);

    const element = document.createElement(vnode.tagName);

    // key's hidden property to avoid random behavior when deleting element !
    if (vnode.attributes && vnode.attributes["data-key"] !== undefined) {
        element.__mfKey = vnode.attributes["data-key"];
    }

    // attributes and special events
    for (const [key, value] of Object.entries(vnode.attributes || {})) {
        (key.startsWith("on") && typeof value === "function") ?
            setEventListener(element, key.slice(2).toLowerCase(), value) :
            setDomAttribute(element, key, value);
    }

    // explicit event listeners
    for (const [eventType, handler] of Object.entries(vnode.events || {})) {
        setEventListener(element, eventType, handler);
    }

    // render children recursively
    for (const child of vnode.children || []) {
        const childNode = createActualNode(child);
        if (childNode) element.appendChild(childNode);
    }

    return element;
}

export function getKey(node) {
    return node?.attributes?.["data-key"];
}