export const ROOT = document.getElementById("root");

// default
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

// default
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

export function setEventListener(element, eventType, handler) {
  /**
   * Internal event registry
   */
  if (!element.__fwEventListeners) {
    element.__fwEventListeners = {};
  }

  /**
   * Remove old listener before adding new one
   */
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
  /**
   * Special handling for checkbox/radio state
   */
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
  /**
   * Reset boolean checked state
   */
  if (key === "checked") {
    element.checked = false;
  }

  element.removeAttribute(key);
}

export function diffDOM(oldNode, newNode, path = "root") {
  // Stores all detected changes
  const diffs = [];

  /**
   * NODE REMOVED
   * If no new node specified, the old node should be removed.
   */
  if (!newNode) {
    diffs.push({
      type: "REMOVE",
      path,
      oldValue: oldNode,
    });
    return diffs;
  }

  /**
   * NODE ADDED
   * If no old node specified, the new node should be inserted.
   */
  if (!oldNode) {
    diffs.push({
      type: "ADD",
      path,
      newValue: newNode,
    });
    return diffs;
  }

  /**
   * NODE REPLACEMENT
   * Replace the entire node if the tag names differ.
   */
  if (oldNode.tagName !== newNode.tagName) {
    diffs.push({
      type: "REPLACE",
      path,
      oldValue: oldNode,
      newValue: newNode,
    });
    return diffs;
  }

  /**
   * TEXT NODE COMPARISON
   * Only compare text content for text nodes.
   */
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
    /**
     * EVENT HANDLER DETECTION
     * Example: onClick -> click
     */
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

  /**
   * CHILDREN COMPARISON
   * Recursively diff all children nodes.
   */
  const oldChildren = oldNode.children || [];
  const newChildren = newNode.children || [];

  // Compare using the largest children count
  // needs a more accurate algorithm (because elements can be added at first)
  const max = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < max; i++) {
    diffs.push(...diffDOM(oldChildren[i], newChildren[i], `${path}.children[${i}]`));
  }

  return diffs;
}

export function patchDOM(router) {
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
        // Get the parent path from the child path
        const parentPath = diff.path.replace(/\.children\[\d+\]$/, "");

        const parentNode = getNodeByPath(parent, parentPath);

        if (parentNode) {
          parentNode.appendChild(createRealNode(diff.newValue));
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

export function buildVirtualDomFromRoute(router) {
  const currentPath = location.hash.slice(1) || "/";
  const matchedRoute = router.routes[currentPath];

  // if (matchedRoute) {
  //   return router.routes[currentPath].fake();
  // } else {
  //   return router.routes["*"].fake();
  // }
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

export function createVirtualRootContainer(parent, ...elements) {
  return {
    tagName: "div",
    attributes: {
      class: "todoapp", // specific to the todomvc app !!!!!!!
      id: "root",
    },
    events: {},
    children: [...elements],
  };
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