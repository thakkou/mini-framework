import { routing, navigate, RouterConstructor } from "../framezone/router.mjs";
// navigate not used for now !
// + need to add handlers

const router = RouterConstructor();

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