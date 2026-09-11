import { getKey } from './utils.js';

export default function diffDOM(prevNode, nextNode, path = "root") {
  const diffs = [];

  // NODE REMOVED
  if (!nextNode) {
    diffs.push({
      type: "REMOVE",
      path,
      prevValue: prevNode,
    });
    return diffs;
  }

  // NODE ADDED
  if (!prevNode) {
    diffs.push({
      type: "ADD",
      path,
      nextValue: nextNode,
    });
    return diffs;
  }

  // NODE REPLACED
  if (prevNode.tagName !== nextNode.tagName) {
    diffs.push({
      type: "REPLACE",
      path,
      prevValue: prevNode,
      nextValue: nextNode,
    });
    return diffs;
  }

  // TEXT NODE COMPARISON
  if (prevNode.tagName === "text") {
    if (prevNode.content !== nextNode.content) {
      diffs.push({
        type: "TEXT",
        path,
        prevValue: prevNode.content,
        nextValue: nextNode.content,
      });
    }
    return diffs;
  }

  // ATTRIBUTES EXTRACTION
  const oldAttrs = prevNode.attributes || {};
  const newAttrs = nextNode.attributes || {};

  // ATTRIBUTES ADDED OR CHANGED
  for (const key in newAttrs) {
    // SPECIAL EVENT HANDLER: onEvent -> event
    if (key.startsWith("on") && typeof newAttrs[key] === "function") {
      diffs.push({
        type: "EVENT",
        path,
        eventType: key.slice(2).toLowerCase(),
        nextValue: newAttrs[key],
      });
      continue;
    }

    // ATTRIBUTE VALUE CHANGED
    if (oldAttrs[key] !== newAttrs[key]) {
      diffs.push({
        type: "ATTRIBUTE",
        path,
        attribute: key,
        prevValue: oldAttrs[key],
        nextValue: newAttrs[key],
      });
    }
  }

  // ATTRIBUTES REMOVED
  for (const key in oldAttrs) {
    if (!(key in newAttrs)) {
      diffs.push({
        type: "REMOVE_ATTRIBUTE",
        path,
        attribute: key,
        prevValue: oldAttrs[key],
      });
    }
  }

  // EVENTS EXTRACTION
  const oldEvents = prevNode.events || {};
  const newEvents = nextNode.events || {};

  // EVENTS ADDED OR CHANGED
  for (const eventType in newEvents) {
    if (oldEvents[eventType] !== newEvents[eventType]) {
      diffs.push({
        type: "EVENT",
        path,
        eventType,
        nextValue: newEvents[eventType],
      });
    }
  }

  // EVENTS REMOVED
  for (const eventType in oldEvents) {
    if (!(eventType in newEvents)) {
      diffs.push({
        type: "REMOVE_EVENT",
        path,
        eventType,
      });
    }
  }

  // CHILDREN EXTRACTION
  const oldChildren = prevNode.children || [];
  const newChildren = nextNode.children || [];

  // CHECK IF KEYED ELEMENTS
  const isKeyed =
    oldChildren.some((child) => getKey(child) !== undefined) ||
    newChildren.some((child) => getKey(child) !== undefined);

  if (!isKeyed) {
    // fallback to the plain positional diff.
    const sharedLength = Math.min(oldChildren.length, newChildren.length);

    for (let i = 0; i < sharedLength; i++) {
      diffs.push(...diffDOM(
        oldChildren[i],
        newChildren[i],
        `${path}.children[${i}]`
      ));
    }

    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      diffs.push(...diffDOM(
        oldChildren[i],
        undefined,
        `${path}.children[${i}]`
      ));
    }

    for (let i = sharedLength; i < newChildren.length; i++) {
      diffs.push(...diffDOM(
        undefined,
        newChildren[i],
        `${path}.children[${i}]`
      ));
    }

    // const max = Math.max(oldChildren.length, newChildren.length);
    // for (let i = 0; i < max; i++) {
    //   diffs.push(...diffDOM(oldChildren[i], newChildren[i], `${path}.children[${i}]`));
    // }
    return diffs;
  }

  // Index old keyed children by key, so new children can find their match.
  const oldByKey = new Map();
  oldChildren.forEach((child, index) => {
    const key = getKey(child);
    if (key !== undefined) oldByKey.set(key, { child, index });
  });

  const newKeys = new Set(newChildren.map(getKey));

  // 1. Remove old keyed children with no match in the new tree.
  //    Remove highest old index first so earlier indices stay valid
  //    for the next removal in this same patch pass.
  const toRemove = [...oldByKey.entries()]
    .filter(([key]) => !newKeys.has(key))
    .sort((a, b) => b[1].index - a[1].index);

  for (const [, { index, child }] of toRemove) {
    diffs.push({
      type: "REMOVE",
      path: `${path}.children[${index}]`,
      prevValue: child,
    });
  }

  // 2. Walk the new children in order: matched keys get diffed against
  //    their old counterpart, unmatched (brand-new) keys get added.
  newChildren.forEach((newChild, newIndex) => {
    const key = getKey(newChild);
    const match = key !== undefined ? oldByKey.get(key) : undefined;
    const childPath = `${path}.children[${newIndex}]`;

    if (match) {
      diffs.push(...diffDOM(match.child, newChild, childPath));
    } else {
      diffs.push({
        type: "ADD",
        path: childPath,
        nextValue: newChild
      });
    }
  });

  return diffs;
}