import { data, list } from "./globals.js";

// in framework or in todomvc ?!
export function generateUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addItem(newItemVal) {
  list.setState({
    list: [
      ...list.getState().list,
      {
        id: generateUniqueId(),
        listType: "active",
        content: newItemVal,
      },
    ],
  });
  data.setState({ count: countActiveTasks() });
}

export function removeCompleted() {
  for (let i = 0; i < list.getState().list.length; i++) {
    const element = list.getState().list[i];
    if (element.listType == "completed") {
      removeItem(element.id);
      i--;
    }
  }
  data.setState({ count: countActiveTasks() });
}

export function removeItem(itemId) {
  list.setState({ list: [...list.getState().list.filter((item) => item.id !== itemId)] });
  data.setState({ count: countActiveTasks() });
}

export function countActiveTasks() {
  let result = 0;
  for (let i = 0; i < list.getState().list.length; i++) {
    const element = list.getState().list[i];
    if (element.listType == "active") {
      result++;
    }
  }
  return result;
}

export function markItemAsCompleted(itemId) {
  list.setState({
    list: [
      ...list.getState().list.map((item) => {
        if (item.id === itemId) {
          if (item.listType == "completed") {
            return {
              ...item,
              listType: "active",
            };
          } else {
            return {
              ...item,
              listType: "completed",
            };
          }
        }
        return item;
      }),
    ],
  });
  data.setState({ count: countActiveTasks() });
}

export function markAllItemsAsCompleted() {
  if (data.getState().count != 0) {
    list.setState({
      list: [
        ...list.getState().list.map((item) => {
          return {
            ...item,
            listType: "completed",
          };
        }),
      ],
    });
  } else {
    list.setState({
      list: [
        ...list.getState().list.map((item) => {
          return {
            ...item,
            listType: "active",
          };
        }),
      ],
    });
  }
  data.setState({ count: countActiveTasks() });
}

export function changeItemContent(itemId, newContent) {
  list.setState({
    list: [
      ...list.getState().list.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            content: newContent,
          };
        }
        return item;
      }),
    ],
  });
}