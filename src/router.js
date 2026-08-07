export default function Router() {
  return {
    routes: {},

    // Register a route
    addRoute({ path, handler, fakeHandler }) {
      this.routes[path] = {
        main: handler,
        fake: fakeHandler || null,
      };
    },

    // set route({ path, handler, fakeHandler }) {
    //   this.routes[path] = {
    //     main: handler,
    //     fake: fakeHandler || null,
    //   };
    // },

    init() { // router is changed to 'this'
      const renderRoute = () => { // need to be an arrow function, so it uses 'this' from the outer scope !
        const currentPath = location.hash.slice(1) || "/";
        const matchedRoute = this.routes[currentPath];
    
        if (matchedRoute) {
          matchedRoute.main();
        } else {
          // Fallback route: "*"
          const notFoundRoute = this.routes["*"];
          
          console.log(notFoundRoute)
          if (notFoundRoute) {
            notFoundRoute.main();
          }
        }
      }
    
      // Initial route render
      renderRoute();
    
      // Listen for route changes
      window.addEventListener("hashchange", renderRoute);
    },
    
    navigate(path) {
      location.hash = path;
    }
  };
}
