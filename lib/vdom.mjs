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