export default function Router() {
  return {
    routes: {},

    addRoute({ path, handler, component }) {
      this.routes[path] = {
        main: handler,
        fake: component || null,
      };
    },

    init() { // router is changed to 'this'
      const renderRoute = () => { // need to be an arrow function, so it uses 'this' from the outer scope !
        const currentPath = location.hash.slice(1) || "/";
        const matched = this.routes[currentPath];
    
        if (matched) {
          matched.main();
        } else {
          // fallback route: "*"
          const notFoundRoute = this.routes["*"];
          if (notFoundRoute) notFoundRoute.main();
        }
      }
    
      renderRoute();
      window.addEventListener("hashchange", renderRoute);
    },
    
    navigate(path) {
      location.hash = path;
    }
  };
}
