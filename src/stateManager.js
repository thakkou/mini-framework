export default function createState(initialState) {
  let state = initialState;
  let listeners = [];

  const getState = () => state;

  const setState = (newState) => {
    state = { ...state, ...newState }; // because the state is of type object
    listeners.forEach(f => f(state));
  }

  const subscribe = (func) => {
    listeners.push(func);
    // returned value is the unsubscribe function
    return () => {
      listeners = listeners.filter((listener) => listener !== func);
    };
  }

  return {
    getState,
    setState,
    subscribe,
  };
}