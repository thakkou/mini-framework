import Router from "mini-framework/lib/router.js";
import { ROOT, createElement, renderElement, patchDOM, createVirtualRootContainer } from "mini-framework/lib/vdom.js";

import { data, list, listType } from "./globals.js";
import { countActiveTasks } from "./helpers.js";

// Components
import Home from "./components/Home.js";
import Footer from "./components/Footer.js";
import NotFound from "./components/NotFound.js";

const router = Router();

data.subscribe(() => {
  patchDOM(router);
});

list.subscribe(() => {
  // Keep `count` in sync automatically whenever `list` changes,
  // instead of relying on every mutation site to update it manually.
  data.setState({ count: countActiveTasks() });
  patchDOM(router);
});

listType.subscribe(() => {
  patchDOM(router);
});



document.addEventListener("click", (event) => { // specified event so it doesnt use global event !
  event.stopPropagation();
  document.querySelectorAll(".hide-element").forEach((el) => {
    el.classList.remove("hide-element");
  });
  document.querySelectorAll(".editing-input").forEach((el) => {
    el.classList.add("hide-input");
  });
});

router.addRoute({
  path: "/",
  handler: () => {
    listType.setState({ listType: "all" });
    // renderElement(true, ROOT, ...Home());
  },
  fakeHandler: () => {
    return createVirtualRootContainer(ROOT, ...Home());
  },
});

router.addRoute({
  path: "/active",
  handler: () => {
    listType.setState({ listType: "active" });
    // renderElement(true, ROOT, ...Home());
  },
  fakeHandler: () => {
    return createVirtualRootContainer(ROOT, ...Home());
  },
});

router.addRoute({
  path: "/completed",
  handler: () => {
    listType.setState({ listType: "completed" });
    // renderElement(true, ROOT, ...Home());
  },
  fakeHandler: () => {
    return createVirtualRootContainer(ROOT, ...Home());
  },
});

router.addRoute({
  path: "*",
  handler: () => {
    renderElement(true, ROOT, ...NotFound()); // MAYBE CAN USE PATCH dom !
  },
  fakeHandler: () => {
    return createVirtualRootContainer(ROOT, ...NotFound());
  },
});

router.init();
renderElement(false, document.body, ...Footer());