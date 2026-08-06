import { createElement } from "mini-framework/lib/vdom.js";

export default function NotFound() {
  return createElement("div", {}, {}, "404");
}