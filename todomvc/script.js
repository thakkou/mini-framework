import Router from "mini-framework/lib/router.js";
import { ROOT, createElement, renderElement, patchDOM, createVirtualRootContainer } from "mini-framework/lib/vdom.js";

import { data, list, listType } from "./globals.js";

// Components
import Home from "./components/Home.js";
import Footer from "./components/Footer.js";

const router = Router();

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

router.init();
renderElement(false, document.body, ...Footer());