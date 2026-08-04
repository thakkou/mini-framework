import { routing, navigate, RouterConstructor } from "mini-framework/lib/router.mjs";
import { createState } from "mini-framework/lib/state-manager.mjs";
import { ROOT, createElement } from "mini-framework/lib/vdom.mjs";
// navigate not used for now !
// + need to add handlers

const router = RouterConstructor();

const listType = createState({
  listType: "all",
});

const list = createState({
  list: [],
});

const data = createState({ count: list.getState().list.filter((item) => item.listType == "active").length });

data.subscribe(() => {
  // patchDOM(router);
});

list.subscribe(() => {
  // patchDOM(router);
});

listType.subscribe(() => {
  // patchDOM(router);
});

function Home() {
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
            // markAllItemsAsCompleted();
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
                // addItem(value);
              }
            },
          },
          "",
        ),
        createElement("label", { class: "visually-hidden", for: "todo-input" }, {}, "New Todo Input"),
      ),
    ),
    createElement("main", { class: "main", "data-testid": "main" }, {}, toggleAll, createElement("ul", { class: "todo-list", "data-testid": "todo-list" }, {}, ...listItem())),
    ...actionsBar(),
  ];
}

function Footer() {
  return [
    createElement(
      "footer",
      { class: "info" },
      {},
      createElement("p", {}, {}, "Double-click to edit a todo"),
      createElement("p", {}, {}, "Created by the TodoMVC Team"),
      createElement("p", {}, {}, "Part of ", createElement("a", { href: "http://todomvc.com" }, {}, "TodoMVC")),
    ),
  ];
}

function listItem() {
  let result = [];
  for (let i = 0; i < list.getState().list.length; i++) {
    const element = list.getState().list[i];
    if (listType.getState().listType == "all" || listType.getState().listType == element.listType) {
      let checkBoxState = {};
      if (element.listType == "completed") {
        checkBoxState = { checked: true };
      }
      result.push(
        createElement(
          "li",
          { "data-testid": "todo-item", class: element.listType == "completed" ? "completed" : "" },
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
                  // markItemAsCompleted(element.id);
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
                  // removeItem(element.id);
                },
              },
              "",
            ),
            createElement(
              "input",
              { class: "new-todo editing-input hide-input", id: "todo-input", "data-testid": "text-input", value: element.content },
              {
                keydown: (event) => {
                  const value = event.target.value.trim();
                  if (event.key === "Enter" && value.length >= 2) {
                    // changeItemContent(element.id, value);
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

function NotFound() {
  return createElement("div", {}, {}, "404");
}

function actionsBar() {
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
              // removeCompleted();
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

router.route = {
  path: "/",
  handler: () => {
    // renderElement(true, ROOT, ...Home());
  },
  fakeHandler: () => {},
};

router.route = {
  path: "/active",
  handler: () => {},
  fakeHandler: () => {},
};

router.route = {
  path: "/completed",
  handler: () => {},
  fakeHandler: () => {},
};

router.route = {
  path: "*",
  handler: () => {},
  fakeHandler: () => {},
};

routing(router);