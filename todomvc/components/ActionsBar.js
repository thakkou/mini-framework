import { createElement } from "mini-framework/src/vdom/index.js";

import { removeCompleted } from "../src/helpers.js";
import { router, data, list, listType } from "../src/globals.js";

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
  if (listType.getState().listType === "all") {
    active = {};
    completed = {};
  } else if (listType.getState().listType === "active") {
    all = {};
    completed = {};
  } else if (listType.getState().listType === "completed") {
    active = {};
    all = {};
  }
  if (list.getState().list.length != 0) {
    return [
      createElement(
        "footer",
        { class: "footer", "data-testid": "footer" },
        {},
        createElement("span", { class: "todo-count" }, {}, `${data.getState().count} ${data.getState().count === 1 ? 'item' : 'items'} left!`),
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
                // click: () => {
                //   listType.setState({ listType: "all" }); // or
                //   router.navigate('/')
                // },
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
                // click: () => {
                //   listType.setState({ listType: "active" }); // or
                //   router.navigate('/active')
                // },
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
                // click: () => {
                //   listType.setState({ listType: "completed" }); // or
                //   router.navigate('/completed')
                // },
              },
              "Completed",
            ),
          ),
        ),
        ...(list.getState().list.length - data.getState().count > 0 ? [
          createElement(
            "button",
            { class: "clear-completed" },
            {
              click: () => {
                removeCompleted();
              },
            },
            "Clear completed",
          )
        ] : [])
      ),
    ];
  } else {
    return [];
  }
}