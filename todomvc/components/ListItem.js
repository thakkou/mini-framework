import { createElement } from "mini-framework/src/vdom/index.js";

import { list, listType } from "../src/globals.js";
import { markItemAsCompleted, removeItem, changeItemContent } from "../src/helpers.js";

export default function ListItem() {
  let result = [];
  for (let i = 0; i < list.getState().list.length; i++) {
    const element = list.getState().list[i];
    if (listType.getState().listType === "all" || listType.getState().listType === element.listType) {
      let checkBoxState = {};
      if (element.listType === "completed") {
        checkBoxState = { checked: true };
      }
      result.push(
        createElement(
          "li",
          { "data-testid": "todo-item", "data-key": element.id, class: element.listType === "completed" ? "completed" : "" },
          {},
          createElement(
            "div",
            { class: "view" },
            {},
            createElement(
              "input",
              { class: "toggle", type: "checkbox", "data-testid": "todo-item-toggle", ...checkBoxState },
              {
                click: () => {
                  markItemAsCompleted(element.id);
                },
              },
              "",
            ),
            createElement(
              "label",
              { "data-testid": "todo-item-label" },
              {
                dblclick: (event) => {
                  document.querySelectorAll(".hide-element").forEach((el) => {
                    el.classList.remove("hide-element");
                  });
                  event.target.setAttribute("class", "hide-element");
                  event.target.classList.add("hide-element");
                  event.target.previousElementSibling.classList.add("hide-element");
                  event.target.nextElementSibling.classList.add("hide-element");
                  document.querySelectorAll(".editing-input").forEach((el) => {
                    el.classList.add("hide-input");
                  });
                  event.target.parentElement.lastElementChild.classList.remove("hide-input");
                  event.target.parentElement.lastElementChild.focus();
                },
              },
              element.content,
            ),
            createElement(
              "button",
              { "data-testid": "todo-item-button", class: "destroy" },
              {
                click: () => {
                  removeItem(element.id);
                },
              },
              "",
            ),
            createElement(
              "input",
              { class: "new-todo editing-input hide-input", "data-testid": "text-input", value: element.content }, // , id: "todo-input" is duplicate
              {
                keydown: (event) => {
                  const value = event.target.value.trim();
                  if (event.key === "Enter" && value.length >= 1) {
                    changeItemContent(element.id, value);
                    document.querySelectorAll(".hide-element").forEach((el) => {
                      el.classList.remove("hide-element");
                    });
                    event.target.classList.add("hide-input");
                  }
                },
              },
              "",
            ),
          ),
        ),
      );
    }
  }
  return result;
}