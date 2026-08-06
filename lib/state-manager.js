export function createState(initialState) {
  let state = initialState;
  let listeners = [];

  const getState = () => state;

  const setState = (newState) => {
    state = { ...state, ...newState }; // state = newState;
    listeners.forEach((listener) => listener(state));
  }

  const subscribe = (fn) => {
    listeners.push(fn);

    // Optional unsubscribe support
    return () => {
      listeners = listeners.filter((listener) => listener !== fn);
    };
  }

  return {
    getState,
    setState,
    subscribe,
  };
}