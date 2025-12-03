"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { KanbanBoard } from "./kanban-board";

type KanbanBoardProps = ComponentProps<typeof KanbanBoard>;

// Delay rendering the DnD board until after mount to avoid SSR/client id mismatches.
export function KanbanBoardClient(props: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <KanbanBoard {...props} />;
}
