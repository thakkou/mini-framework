import { createElement } from "mini-framework/lib/vdom.js";

export default function NotFound() {
  return [
    createElement("h1", {}, {}, "404"),
    // + 'Page Not Found' message
  ];
}