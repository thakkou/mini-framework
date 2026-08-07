export default function diffDOM(oldNode, newNode, path = "root") {
  // Stores all detected changes
  const diffs = [];

  // NODE REMOVED: If no new node specified, the old node should be removed.
  if (!newNode) {
    diffs.push({
      type: "REMOVE",
      path,
      oldValue: oldNode,
    });
    return diffs;
  }

  // NODE ADDED: If no old node specified, the new node should be inserted.
  if (!oldNode) {
    diffs.push({
      type: "ADD",
      path,
      newValue: newNode,
    });
    return diffs;
  }

  // NODE REPLACEMENT: Replace the entire node if the tag names differ.
  if (oldNode.tagName !== newNode.tagName) {
    diffs.push({
      type: "REPLACE",
      path,
      oldValue: oldNode,
      newValue: newNode,
    });
    return diffs;
  }

  // TEXT NODE COMPARISON: Only compare text content for text nodes.
  if (oldNode.tagName === "text") {
    if (oldNode.content !== newNode.content) {
      diffs.push({
        type: "TEXT",
        path,
        oldValue: oldNode.content,
        newValue: newNode.content,
      });
    }
    return diffs;
  }

  // Extract attributes safely
  const oldAttrs = oldNode.attributes || {};
  const newAttrs = newNode.attributes || {};

  // CHANGED OR ADDED ATTRIBUTES
  for (const key in newAttrs) {
    // EVENT HANDLER DETECTION: Example: onClick -> click
    if (key.startsWith("on") && typeof newAttrs[key] === "function") {
      diffs.push({
        type: "EVENT",
        path,
        eventType: key.slice(2).toLowerCase(),
        newValue: newAttrs[key],
      });
      continue;
    }

    // Attribute value changed
    if (oldAttrs[key] !== newAttrs[key]) {
      diffs.push({
        type: "ATTRIBUTE",
        path,
        attribute: key,
        oldValue: oldAttrs[key],
        newValue: newAttrs[key],
      });
    }
  }

  // REMOVED ATTRIBUTES
  for (const key in oldAttrs) {
    if (!(key in newAttrs)) {
      diffs.push({
        type: "REMOVE_ATTRIBUTE",
        path,
        attribute: key,
        oldValue: oldAttrs[key],
      });
    }
  }

  // Extract event maps safely
  const oldEvents = oldNode.events || {};
  const newEvents = newNode.events || {};

  // CHANGED OR ADDED EVENTS
  for (const eventType in newEvents) {
    if (oldEvents[eventType] !== newEvents[eventType]) {
      diffs.push({
        type: "EVENT",
        path,
        eventType,
        newValue: newEvents[eventType],
      });
    }
  }

  // REMOVED EVENTS
  for (const eventType in oldEvents) {
    if (!(eventType in newEvents)) {
      diffs.push({
        type: "REMOVE_EVENT",
        path,
        eventType,
      });
    }
  }

  // CHILDREN COMPARISON: Recursively diff all children nodes.
  const oldChildren = oldNode.children || [];
  const newChildren = newNode.children || [];

  const getKey = (node) => node?.attributes?.["data-key"];

  const isKeyed =
    oldChildren.some((child) => getKey(child) !== undefined) ||
    newChildren.some((child) => getKey(child) !== undefined);

  if (!isKeyed) {
    // No keys in play at this level: fall back to the plain positional diff.
    const max = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < max; i++) {
      diffs.push(...diffDOM(oldChildren[i], newChildren[i], `${path}.children[${i}]`));
    }
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
      oldValue: child,
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
      diffs.push({ type: "ADD", path: childPath, newValue: newChild });
    }
  });

  return diffs;
}