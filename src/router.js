export default function Router() {
  return {
    routes: {},

    addRoute({ path, handler, component, guard }) {
      this.routes[path] = {
        main: handler,
        fake: component || null,
        guard: guard || null,
      };
    },

    async init() { // router is changed to 'this'
      const renderRoute = async () => { // need to be an arrow function, so it uses 'this' from the outer scope !
        const currentPath = location.hash.slice(1) || "/";
        const matched = this.routes[currentPath];
    
        if (matched) {
          if (await matched.guard()) return;
          matched.main();
        } else {
          // fallback route: "*"
          const notFoundRoute = this.routes["*"];
          if (notFoundRoute) notFoundRoute.main();
        }
      }
    
      await renderRoute();
      window.addEventListener("hashchange", renderRoute);
    },
    
    navigate(path) {
      if (location.hash !== path) {
        location.href = "/#" + path;
        return true;
      }
      return false;
    }
  };
}
