import Router from "mini-framework/src/router.js";
import { ROOT, createElement, renderElement, patchDOM } from "mini-framework/src/vdom/index.js";

import { data, list, listType } from "./globals.js";
import { countActiveTasks } from "./helpers.js";

// Components
import App from "./components/App.js";
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

// --- ROUTES ---------------------------------------

router.addRoute({
  path: "/",
  handler: () => {
    listType.setState({ listType: "all" });
    // renderElement(true, ROOT, ...Home());
  },
  fakeHandler: () => {
    return App(...Home());
  },
});

router.addRoute({
  path: "/active",
  handler: () => {
    listType.setState({ listType: "active" });
    // renderElement(true, ROOT, ...Home());
  },
  fakeHandler: () => {
    return App(...Home());
  },
});

router.addRoute({
  path: "/completed",
  handler: () => {
    listType.setState({ listType: "completed" });
    // renderElement(true, ROOT, ...Home());
  },
  fakeHandler: () => {
    return App(...Home());
  },
});

router.addRoute({
  path: "*",
  handler: () => {
    renderElement(true, ROOT, ...NotFound()); // MAYBE CAN USE PATCH dom !
  },
  fakeHandler: () => {
    return App(...NotFound());
  },
});

// --- ROUTES: END -------------------------

document.addEventListener("click", (event) => {
  event.stopPropagation();
  if (event.target.closest(".editing-input")) {
    return;
  }
  document.querySelectorAll(".editing-input").forEach((el) => {
    el.classList.add("hide-input");
  });
  document.querySelectorAll(".hide-element").forEach((el) => {
    el.classList.remove("hide-element");
  });
});

router.init();
renderElement(false, document.body, Footer());