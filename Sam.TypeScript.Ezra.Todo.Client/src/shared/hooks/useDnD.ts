import { useCallback, useState } from 'react';

interface UseDnDProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  getItemId: (item: T) => number;
}

export function useDnD<T>({ items, onReorder, getItemId }: UseDnDProps<T>) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [keyboardDraggedId, setKeyboardDraggedId] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.classList.add('dragging');
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('dragging');
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedId !== null && draggedId !== id) {
        if (dragOverId !== id) {
          setDragOverId(id);
        }
      }
    },
    [draggedId, dragOverId],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!currentTarget.contains(relatedTarget)) {
      setDragOverId(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: number) => {
      e.preventDefault();
      setDragOverId(null);
      if (draggedId === null || draggedId === targetId) return;

      const draggedIndex = items.findIndex((item) => getItemId(item) === draggedId);
      const targetIndex = items.findIndex((item) => getItemId(item) === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      const newItems = [...items];
      const [movedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, movedItem);

      onReorder(newItems);
    },
    [draggedId, items, onReorder, getItemId],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: number) => {
      // Toggle dragging state with Space or Enter
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (keyboardDraggedId === id) {
          setKeyboardDraggedId(null);
        } else {
          setKeyboardDraggedId(id);
        }
        return;
      }

      // If Escape is pressed, cancel dragging
      if (e.key === 'Escape') {
        if (keyboardDraggedId !== null) {
          e.preventDefault();
          e.stopPropagation(); // Prevent bubbling to List/App escape handlers
          setKeyboardDraggedId(null);
        }
        return;
      }

      // Only handle movement keys if we are currently dragging this item
      if (keyboardDraggedId !== id) return;

      const currentIndex = items.findIndex((item) => getItemId(item) === id);
      if (currentIndex === -1) return;

      let targetIndex = -1;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        targetIndex = currentIndex - 1;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        targetIndex = currentIndex + 1;
      }

      if (targetIndex >= 0 && targetIndex < items.length) {
        e.preventDefault();
        const newItems = [...items];
        const [movedItem] = newItems.splice(currentIndex, 1);
        newItems.splice(targetIndex, 0, movedItem);

        onReorder(newItems);

        // Keep focus on the handle after reorder (React might lose it if DOM changes significantly)
        setTimeout(() => {
          (e.target as HTMLElement).focus();
        }, 0);
      }
    },
    [items, onReorder, getItemId, keyboardDraggedId],
  );

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleKeyDown,
    dragOverId,
    setDragOverId,
    isDragging: draggedId !== null,
    keyboardDraggedId,
  };
}
