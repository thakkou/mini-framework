// why need a fake handler ?!

export function RouterConstructor() {
  return {
    routes: {},

    // Register a route
    set route({ path, handler, fakeHandler }) {
      this.routes[path] = {
        main: handler,
        fake: fakeHandler || null,
      };
    },
  };
}

export function routing(router) {
  function renderRoute() {
    const currentPath = location.hash.slice(1) || "/";
    console.log(currentPath)
    const matchedRoute = router.routes[currentPath];

    if (matchedRoute) {
      matchedRoute.main();
    } else {
      // Fallback route: "*"
      const notFoundRoute = router.routes["*"];

      if (notFoundRoute) {
        notFoundRoute.main();
      }
    }
  }

  // Initial route render
  renderRoute();

  // Listen for route changes
  window.addEventListener("hashchange", renderRoute);
}

export function navigate(path) {
  location.hash = path;
  console.log(path)
}