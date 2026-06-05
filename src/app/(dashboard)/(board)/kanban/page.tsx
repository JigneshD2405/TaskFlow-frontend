"use client";
import { apiHandler } from "@/api/apiHandler";
import { PRIORITY_COLORS } from "@/constants";
import { useSocket } from "@/hooks/useSocket";
import { actions, selectors } from "@/redux";
import { Card, Column } from "@/types";
import { showToast } from "@/utils";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, DatePicker, Form, Input, Modal, Select, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const CardItem = memo(
  ({ card, onEdit, onDelete }: { card: Card; onEdit: (c: Card) => void; onDelete: (c: Card) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: card._id,
      data: { type: "card", card },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="group cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="flex-1 text-sm font-medium leading-snug text-slate-800">{card.title}</p>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
              className="px-1 text-xs text-slate-400 hover:text-indigo-600"
            >
              ✏️
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card);
              }}
              className="px-1 text-xs text-slate-400 hover:text-red-500"
            >
              🗑️
            </button>
          </div>
        </div>

        {card.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{card.description}</p>}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Tag color={PRIORITY_COLORS[card.priority]} className="px-1.5 py-0 text-xs">
            {card.priority}
          </Tag>
          {card.dueDate && (
            <span className="text-xs text-slate-400">
              📅{" "}
              {new Date(card.dueDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>
    );
  },
);
CardItem.displayName = "CardItem";

const ColumnComponent = memo(
  ({
    column,
    cards,
    onAddCard,
    onEditCard,
    onDeleteCard,
    onEditColumn,
    onDeleteColumn,
  }: {
    column: Column;
    cards: Card[];
    onAddCard: (col: Column) => void;
    onEditCard: (c: Card) => void;
    onDeleteCard: (c: Card) => void;
    onEditColumn: (col: Column) => void;
    onDeleteColumn: (col: Column) => void;
  }) => {
    const { setNodeRef } = useSortable({
      id: column._id,
      data: { type: "column", column },
    });

    const cardIds = useMemo(() => cards.map((c) => c._id), [cards]);

    return (
      <div ref={setNodeRef} className="flex w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-100">
        {/* Column header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-700">{column.title}</h3>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">{cards.length}</span>
          </div>
          <div className="flex gap-1">
            <Tooltip title="Edit column">
              <button
                onClick={() => onEditColumn(column)}
                className="px-1 text-xs text-slate-400 hover:text-indigo-600"
              >
                ✏️
              </button>
            </Tooltip>
            <Tooltip title="Delete column">
              <button onClick={() => onDeleteColumn(column)} className="px-1 text-xs text-slate-400 hover:text-red-500">
                🗑️
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Cards */}
        <div className="max-h-[calc(100vh-260px)] min-h-25 flex-1 space-y-2 overflow-y-auto p-2">
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <CardItem key={card._id} card={card} onEdit={onEditCard} onDelete={onDeleteCard} />
            ))}
          </SortableContext>
        </div>

        {/* Add card */}
        <div className="border-t border-slate-200 p-2">
          <button
            onClick={() => onAddCard(column)}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
          >
            + Add card
          </button>
        </div>
      </div>
    );
  },
);
ColumnComponent.displayName = "ColumnComponent";

function KanbanContent() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get("id");
  const router = useRouter();
  const dispatch = useDispatch();
  const activeBoard = useSelector(selectors.selectActiveBoard);

  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [columnTitle, setColumnTitle] = useState("");
  const [columnLoading, setColumnLoading] = useState(false);

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [cardForm] = Form.useForm();
  const [cardLoading, setCardLoading] = useState(false);

  const rollbackRef = useRef<typeof activeBoard>(null);

  useSocket(boardId);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchBoard = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const { data, status } = await apiHandler.boards.get(boardId);

      if ([200, 201].includes(status)) {
        dispatch(
          actions.setActiveBoard({
            ...data?.data,
            columns: (data?.data.columns || []).map((c: any) => ({
              ...c,
              cards: c.cards || [],
            })),
          }),
        );
      } else {
        showToast("error", data?.message || "Failed to fetch board");
      }
    } catch (err: any) {
      showToast("error", err?.message || "Failed to fetch board");
    } finally {
      setLoading(false);
    }
  }, [boardId, dispatch]);

  useEffect(() => {
    if (!boardId) {
      router.push("/board");
      return;
    }
    fetchBoard();
  }, [boardId, fetchBoard, router]);

  const sortedColumns = useMemo(() => {
    if (activeBoard?.columns.length === 0) return [];
    return [...(activeBoard?.columns || [])].sort((a, b) => a.order - b.order);
  }, [activeBoard]);

  const getColumnCards = useCallback(
    (columnId: string): Card[] => {
      const col = activeBoard?.columns.find((c) => c._id === columnId);
      if (!col) return [];
      return [...col.cards].sort((a, b) => a.order - b.order);
    },
    [activeBoard?.columns],
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card);
    }
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return;
    if (active.data.current?.type !== "card") return;

    const draggedCard = active.data.current.card as Card;
    const overColumnId = over.data.current?.type === "column" ? (over.id as string) : over.data.current?.card?.columnId;

    if (!overColumnId || draggedCard.columnId === overColumnId) return;

    dispatch(
      actions.moveCard({
        card: { ...draggedCard, columnId: overColumnId },
        fromColumnId: draggedCard.columnId,
        toColumnId: overColumnId,
      }),
    );
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveCard(null);
    if (!over || active.id === over.id) return;
    if (active.data.current?.type !== "card") return;

    const card = active.data.current.card as Card;
    const overCard = over.data.current?.card as Card | undefined;
    const targetColId = overCard?.columnId || (over.id as string);
    const targetCards = getColumnCards(targetColId);
    const newOrder = overCard ? targetCards.findIndex((c) => c._id === overCard._id) : targetCards.length;

    rollbackRef.current = activeBoard;

    try {
      await apiHandler.cards.move(card._id, {
        targetColumnId: targetColId,
        order: Math.max(0, newOrder),
      });
    } catch {
      if (rollbackRef.current) dispatch(actions.setActiveBoard(rollbackRef.current));
    }
  };

  const openAddColumn = () => {
    setEditingColumn(null);
    setColumnTitle("");
    setColumnModalOpen(true);
  };

  const openEditColumn = (col: Column) => {
    setEditingColumn(col);
    setColumnTitle(col.title);
    setColumnModalOpen(true);
  };

  const handleColumnSubmit = async () => {
    if (!columnTitle.trim()) return;
    setColumnLoading(true);
    try {
      if (editingColumn) {
        const { data } = await apiHandler.columns.update(editingColumn?._id, { title: columnTitle });
        dispatch(actions.updateColumn(data.data));
      } else {
        const { data } = await apiHandler.columns.create(boardId!, {
          title: columnTitle,
          order: sortedColumns.length,
        });
        dispatch(actions.addColumn(data.data));
      }
      setColumnModalOpen(false);
      setColumnTitle("");
    } finally {
      setColumnLoading(false);
    }
  };

  const handleDeleteColumn = async (col: Column) => {
    try {
      await apiHandler.columns.delete(col._id);
      dispatch(actions.removeColumn(col._id));
    } catch {}
  };

  const openAddCard = (col: Column) => {
    setEditingCard(null);
    setActiveColumnId(col._id);
    cardForm.resetFields();
    setCardModalOpen(true);
  };

  const openEditCard = (card: Card) => {
    setEditingCard(card);
    setActiveColumnId(card.columnId);
    cardForm.setFieldsValue({
      title: card.title,
      description: card.description,
      priority: card.priority,
      dueDate: card.dueDate ? dayjs(card.dueDate) : null,
    });
    setCardModalOpen(true);
  };

  const handleCardSubmit = async () => {
    try {
      const values = await cardForm.validateFields();
      const payload = { ...values, dueDate: values.dueDate ? values.dueDate.toISOString() : null };
      setCardLoading(true);

      if (editingCard) {
        const { data } = await apiHandler.cards.update(editingCard._id, payload);
        dispatch(actions.updateCard(data.data));
      } else {
        const { data } = await apiHandler.cards.create(activeColumnId!, payload);
        dispatch(actions.addCard(data.data));
      }
      setCardModalOpen(false);
    } catch (err: any) {
      if (err?.errorFields) return;
    } finally {
      setCardLoading(false);
    }
  };

  const handleDeleteCard = async (card: Card) => {
    try {
      await apiHandler.cards.delete(card._id);
      dispatch(actions.removeCard({ cardId: card._id, columnId: card.columnId }));
    } catch {}
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-slate-400">Loading board…</div>;
  }

  if (!activeBoard) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
        <p>Board not found.</p>
        <Button type="link" onClick={() => router.push("/board")}>
          Go back to boards
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <button onClick={() => router.push("/board")} className="mb-1 text-sm text-indigo-600 hover:underline">
            ← My Boards
          </button>
          <h1 className="text-xl font-bold text-slate-800">{activeBoard.title}</h1>
          {activeBoard.description && <p className="text-sm text-slate-500">{activeBoard.description}</p>}
        </div>
        <Button type="dashed" onClick={openAddColumn}>
          + Add Column
        </Button>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 pb-4">
            {sortedColumns.map((col) => (
              <ColumnComponent
                key={col._id}
                column={col}
                cards={getColumnCards(col._id)}
                onAddCard={openAddCard}
                onEditCard={openEditCard}
                onDeleteCard={handleDeleteCard}
                onEditColumn={openEditColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}

            {sortedColumns.length === 0 && (
              <div className="flex h-64 w-full items-center justify-center text-slate-400">
                <div className="text-center">
                  <div className="mb-2 text-4xl">📭</div>
                  <p>No columns yet. Click &quot;Add Column&quot; to get started!</p>
                </div>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="w-72 rounded-lg border border-indigo-300 bg-white p-3 opacity-95 shadow-xl">
                <p className="text-sm font-medium text-slate-800">{activeCard.title}</p>
                <Tag color={PRIORITY_COLORS[activeCard.priority]} className="mt-2 text-xs">
                  {activeCard.priority}
                </Tag>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* ── Column Modal ── */}
      <Modal
        title={editingColumn ? "Edit Column" : "Add Column"}
        open={columnModalOpen}
        onOk={handleColumnSubmit}
        onCancel={() => {
          setColumnModalOpen(false);
          setColumnTitle("");
        }}
        confirmLoading={columnLoading}
        okText={editingColumn ? "Update" : "Add"}
      >
        <Input
          value={columnTitle}
          onChange={(e) => setColumnTitle(e.target.value)}
          placeholder="Column title  e.g. To Do, In Progress"
          className="mt-2"
          onPressEnter={handleColumnSubmit}
          maxLength={200}
        />
      </Modal>

      {/* ── Card Modal ── */}
      <Modal
        title={editingCard ? "Edit Card" : "Add Card"}
        open={cardModalOpen}
        onOk={handleCardSubmit}
        onCancel={() => setCardModalOpen(false)}
        confirmLoading={cardLoading}
        okText={editingCard ? "Update" : "Add"}
        width={520}
      >
        <Form form={cardForm} layout="vertical" className="mt-2">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Card title is required" }]}>
            <Input placeholder="What needs to be done?" maxLength={500} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Add more details…" rows={3} maxLength={5000} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="priority" label="Priority">
              <Select placeholder="Select priority">
                <Select.Option value="LOW">🟢 Low</Select.Option>
                <Select.Option value="MEDIUM">🟡 Medium</Select.Option>
                <Select.Option value="HIGH">🔴 High</Select.Option>
                <Select.Option value="URGENT">🟣 Urgent</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="dueDate" label="Due Date">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default function KanbanPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center">Loading…</div>}>
      <KanbanContent />
    </Suspense>
  );
}
