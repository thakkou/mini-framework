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