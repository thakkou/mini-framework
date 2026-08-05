import { routing, navigate, RouterConstructor } from "mini-framework/lib/router.mjs";
import { ROOT, createElement, renderElement, patchDOM, createVirtualRootContainer } from "mini-framework/lib/vdom.mjs";
// navigate not used for now !
// + need to add handlers

import { data, list, listType } from "./globals.js";

// Components
// import actionsBar from "./components/ActionsBar.js";
import Footer from "./components/Footer.js";
import Home from "./components/Home.js";
// import listItem from "./components/ListItem.js";
// import NotFound from "./components/NotFound.js";

const router = RouterConstructor();

data.subscribe(() => {
  patchDOM(router);
});

list.subscribe(() => {
  patchDOM(router);
});

listType.subscribe(() => {
  patchDOM(router);
});

document.addEventListener("click", () => {
  event.stopPropagation();
  document.querySelectorAll(".hide-element").forEach((el) => {
    el.classList.remove("hide-element");
  });
  document.querySelectorAll(".editing-input").forEach((el) => {
    el.classList.add("hide-input");
  });
});

router.route = {
  path: "/",
  handler: () => {
    renderElement(true, ROOT, ...Home(list, listType, data));
  },
  fakeHandler: () => {
    return createVirtualRootContainer(ROOT, ...Home(list, listType, data));
  },
};

router.route = {
  path: "/active",
  handler: () => {
    renderElement(true, ROOT, ...Home(list, listType, data));
  },
  fakeHandler: () => {
    return createVirtualRootContainer(ROOT, ...Home(list, listType, data));
  },
};

router.route = {
  path: "/completed",
  handler: () => {
    renderElement(true, ROOT, ...Home(list, listType, data));
  },
  fakeHandler: () => {
    return createVirtualRootContainer(ROOT, ...Home(list, listType, data));
  },
};

router.route = {
  path: "*",
  handler: () => {
    renderElement(true, ROOT, ...Home(list, listType, data));
  },
  fakeHandler: () => {
    return createVirtualRootContainer(ROOT, ...Home(list, listType, data));
  },
};

routing(router);
renderElement(false, document.body, ...Footer());