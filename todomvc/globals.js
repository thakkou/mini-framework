import { createState } from "mini-framework/lib/state-manager.mjs";

// can add router maybe !

export const listType = createState({
  listType: "all",
});

export const list = createState({
  list: [],
});

export const data = createState({
  count: list.getState().list.filter((item) => item.listType == "active").length,
});