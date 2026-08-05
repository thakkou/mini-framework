import { createElement } from "mini-framework/lib/vdom.mjs";

export default function NotFound() {
  return createElement("div", {}, {}, "404");
}