import { routing, navigate, RouterConstructor } from "mini-framework/lib/router.mjs";
import { createState } from "mini-framework/lib/state-manager.mjs";
import { ROOT, createElement, renderElement } from "mini-framework/lib/vdom.mjs";
// navigate not used for now !
// + need to add handlers

// Components
// import actionsBar from "./components/ActionsBar.js";
// import Footer from "./components/Footer.js";
import Home from "./components/Home.js";
// import listItem from "./components/ListItem.js";
// import NotFound from "./components/NotFound.js";

const router = RouterConstructor();

    const listType = createState({
    listType: "all",
    });

    const list = createState({
    list: [],
    });

    const data = createState({
    count: list.getState().list.filter((item) => item.listType == "active").length
    });

    data.subscribe(() => {
    // patchDOM(router);
    });

    list.subscribe(() => {
    // patchDOM(router);
    });

    listType.subscribe(() => {
    // patchDOM(router);
    });

router.route = {
  path: "/",
  handler: () => {
    renderElement(true, ROOT, ...Home(list, listType, data));
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