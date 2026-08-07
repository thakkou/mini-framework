import diffDOM from "./differ.js";
import { extractElement } from "./element.js";
import { setDomAttribute, setEventListener, removeDomAttribute, removeEventListener } from "./mutators.js";
import { ROOT, buildVirtualDomFromRoute, getNodeByPath, createRealNode } from "./utils.js";

export default function patchDOM(router) {
  const parent = ROOT;

  // Current DOM converted into a virtual structure
  const oldTree = extractElement(ROOT);
  // New virtual DOM generated from the active route
  const newTree = buildVirtualDomFromRoute(router);

  const diffs = diffDOM(oldTree, newTree);

  diffs.forEach((diff) => {
    // Find the targeted DOM node using the diff path
    const target = getNodeByPath(parent, diff.path);

    switch (diff.type) {
      // Update text content
      case "TEXT":
        if (target) {
          target.textContent = diff.newValue;
        }
        break;

      // Add or update an attribute
      case "ATTRIBUTE":
        if (target) {
          setDomAttribute(target, diff.attribute, diff.newValue);
        }
        break;

      // Remove an attribute
      case "REMOVE_ATTRIBUTE":
        if (target) {
          removeDomAttribute(target, diff.attribute);
        }
        break;

      // Add or update an event listener
      case "EVENT":
        if (target) {
          setEventListener(target, diff.eventType, diff.newValue);
        }
        break;

      // Remove an event listener
      case "REMOVE_EVENT":
        if (target) {
          removeEventListener(target, diff.eventType);
        }
        break;

      // Replace an entire DOM node
      case "REPLACE":
        if (target && target.parentNode) {
          const newElement = createRealNode(diff.newValue);
          target.parentNode.replaceChild(newElement, target);
        }
        break;

      // Add a new child node
      case "ADD": {
        // Extract the parent path and the target index from the child path
        const match = diff.path.match(/^(.*)\.children\[(\d+)\]$/);
        if (!match) break;

        const [, parentPath, indexStr] = match;
        const index = Number(indexStr);
        const parentNode = getNodeByPath(parent, parentPath);

        if (parentNode) {
          // Insert before whatever currently sits at this index, so the
          // new node lands in the right position instead of always at
          // the end. If nothing is there yet, insertBefore(node, null)
          // behaves exactly like appendChild.
          const referenceNode = parentNode.childNodes[index] || null;
          parentNode.insertBefore(createRealNode(diff.newValue), referenceNode);
        }

        break;
      }

      // Remove a DOM node
      case "REMOVE":
        if (target && target.parentNode) {
          target.parentNode.removeChild(target);
        }
        break;
    }
  });
}