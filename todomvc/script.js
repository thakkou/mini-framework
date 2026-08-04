import { routing, navigate, RouterConstructor } from "mini-framework/lib/router.mjs";
import { createState } from "mini-framework/lib/state-manager.mjs";
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

router.route = {
  path: "/",
  handler: () => {},
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