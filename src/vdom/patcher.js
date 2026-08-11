import diffDOM from "./differ.js";
import { parseElement } from "./element.js";
import { setDomAttribute, setEventListener, removeDomAttribute, removeEventListener } from "./mutators.js";
import { routeToVDom, getNodeFromPath, createActualNode } from "./utils.js";

export default function patchDOM(router) {
  const parent = document.getElementById("root");;

  const prevTree = parseElement(parent);
  const nextTree = routeToVDom(router);
  const diffs = diffDOM(prevTree, nextTree);

  diffs.forEach((diff) => {
    const target = getNodeFromPath(parent, diff.path);

    switch (diff.type) {
      // TEXT UPDATE
      case "TEXT":
        if (target)
          target.textContent = diff.nextValue;
        break;

      // ATTRIBUTE ADD OR UPDATE
      case "ATTRIBUTE":
        if (target)
          setDomAttribute(target, diff.attribute, diff.nextValue);
        break;

      // ATTRIBUTE REMOVE
      case "REMOVE_ATTRIBUTE":
        if (target)
          removeDomAttribute(target, diff.attribute);
        break;

      // EVENT ADD OR UPDATE
      case "EVENT":
        if (target)
          setEventListener(target, diff.eventType, diff.nextValue);
        break;

      // EVENT REMOVE
      case "REMOVE_EVENT":
        if (target)
          removeEventListener(target, diff.eventType);
        break;

      // CHILD REPLACE
      case "REPLACE":
        if (target && target.parentNode) {
          const newElement = createActualNode(diff.nextValue);
          target.parentNode.replaceChild(newElement, target);
        }
        break;

      // CHILD ADD
      case "ADD": {
        const match = diff.path.match(/^(.*)\.children\[(\d+)\]$/);
        if (!match) break;

        const [, parentPath, indexStr] = match;
        const index = Number(indexStr);
        const parentNode = getNodeFromPath(parent, parentPath);

        if (parentNode) {
          // Insert before whatever currently sits at this index, so the
          // new node lands in the right position instead of always at
          // the end. If nothing is there yet, insertBefore(node, null)
          // behaves exactly like appendChild.
          const referenceNode = parentNode.childNodes[index] || null;
          parentNode.insertBefore(createActualNode(diff.nextValue), referenceNode);
        }
        break;
      }

      // CILD REMOVE
      case "REMOVE":
        if (target && target.parentNode)
          target.parentNode.removeChild(target);
        break;
    }
  });
}