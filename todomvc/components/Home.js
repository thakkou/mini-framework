import { createElement } from "mini-framework/lib/vdom.js";

import { markAllItemsAsCompleted, addItem } from "../helpers.js";
import { list } from "../globals.js";

// Components
import ListItem from "./ListItem.js";
import ActionsBar from "./ActionsBar.js";

export default function Home() { //should get lists from context !!
  let toggleAll = {};
  if (list.getState().list.length != 0) {
    toggleAll = createElement(
      "div",
      { class: "toggle-all-container" },
      {},
      createElement(
        "input",
        { class: "toggle-all", type: "check-box", id: "toggle-all", "data-testid": "toggle-all" },
        {
          click: () => {
            markAllItemsAsCompleted();
          },
        },
        "",
      ),
      createElement("label", { class: "toggle-all-label", for: "toggle-all" }),
    );
  }
  return [
    createElement(
      "header",
      { class: "header", "data-testid": "header" },
      {},
      createElement("h1", {}, {}, "todos"),
      createElement(
        "div",
        { class: "input-container" },
        {},
        createElement(
          "input",
          { class: "new-todo", id: "todo-input", type: "text", "data-testid": "text-input", placeholder: "What needs to be done?", value: "" },
          {
            keydown: (event) => {
              const value = event.target.value.trim();
              if (event.key === "Enter" && value.length >= 2) {
                event.target.value = "";
                addItem(value);
              }
            },
          },
          "",
        ),
        createElement("label", { class: "visually-hidden", for: "todo-input" }, {}, "New Todo Input"),
      ),
    ),
    createElement("main", { class: "main", "data-testid": "main" }, {}, toggleAll, createElement("ul", { class: "todo-list", "data-testid": "todo-list" }, {}, ...ListItem())),
    ...ActionsBar(),
  ];
}