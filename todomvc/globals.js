import createState from "mini-framework/src/stateManager.js";

// can add router maybe !

export const listType = createState({
  listType: "all",
});

export const list = createState({
  list: [],
});

export const data = createState({
  count: 0, // countActiveTasks(),
});