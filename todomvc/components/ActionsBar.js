import { createElement } from "mini-framework/lib/vdom.js";

import { removeCompleted } from "../helpers.js";
import { data, list, listType } from "../globals.js";

export default function ActionsBar() {
  let all = {
    class: "selected",
  };
  let active = {
    class: "selected",
  };
  let completed = {
    class: "selected",
  };
  if (listType.getState().listType == "all") {
    active = {};
    completed = {};
  } else if (listType.getState().listType == "active") {
    all = {};
    completed = {};
  } else if (listType.getState().listType == "completed") {
    active = {};
    all = {};
  }
  if (list.getState().list.length != 0) {
    return [
      createElement(
        "footer",
        { class: "footer", "data-testid": "footer" },
        {},
        createElement("span", { class: "todo-count" }, {}, `${data.getState().count} item left!`),
        createElement(
          "ul",
          { class: "filters", "data-testid": "footer-navigation" },
          {},
          createElement(
            "li",
            {},
            {},
            createElement(
              "a",
              { ...all, href: "#/" },
              {
                click: () => {
                  listType.setState({ listType: "all" });
                },
              },
              "All",
            ),
          ),
          createElement(
            "li",
            {},
            {},
            createElement(
              "a",
              { ...active, href: "#/active" },
              {
                click: () => {
                  listType.setState({ listType: "active" });
                },
              },
              "Active",
            ),
          ),
          createElement(
            "li",
            {},
            {},
            createElement(
              "a",
              { ...completed, href: "#/completed" },
              {
                click: () => {
                  listType.setState({ listType: "completed" });
                },
              },
              "Completed",
            ),
          ),
        ),
        createElement(
          "button",
          { class: "clear-completed" },
          {
            click: () => {
              removeCompleted();
            },
          },
          "Clear completed",
        ),
      ),
    ];
  } else {
    return [];
  }
}