import React from "react";
import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export interface DnDItemControls {
  isFirst: boolean;
  isLast: boolean;
  moveUp: () => void;
  moveDown: () => void;
}

export interface useDnDServiceProps<T> {
  items: T[];
  setItems: (items: T[]) => void;
  renderChild: (
    item: T,
    index: number,
    controls: DnDItemControls,
  ) => React.ReactNode;
  getId: (item: T) => string | number;
  createNewItem?: () => void;
  deleteItem?: (id: string | number) => void;
  deleteLastItem?: boolean;
  onReorder?: (newItems: T[]) => void;
}

export function useDnDService<T>({
  items,
  setItems,
  renderChild,
  getId,
  createNewItem,
  deleteItem,
  deleteLastItem = false,
  onReorder,
}: useDnDServiceProps<T>) {
  const handleDelete = (idToDelete: string | number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => getId(item) !== idToDelete));
    }
    if (deleteLastItem && items.length === 1) {
      setItems([]);
    }
    deleteItem?.(idToDelete);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = arrayMove(items, index, index - 1);
    setItems(newItems);
    onReorder?.(newItems);
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const newItems = arrayMove(items, index, index + 1);
    setItems(newItems);
    onReorder?.(newItems);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => getId(item) === active.id);
    const newIndex = items.findIndex((item) => getId(item) === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    onReorder?.(newItems);
  };

  const renderedItems = items.map((item, index) => {
    const controls: DnDItemControls = {
      isFirst: index === 0,
      isLast: index === items.length - 1,
      moveUp: () => moveUp(index),
      moveDown: () => moveDown(index),
    };
    return {
      ...item,
      child: renderChild(item, index, controls),
    };
  });

  return {
    items: renderedItems,
    handleDragEnd,
    handleDelete,
    createNewItem,
    moveUp,
    moveDown,
  };
}
