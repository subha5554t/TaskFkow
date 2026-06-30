import { useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDraggable, useDroppable,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { TASK_STATUSES, STATUS_LABELS, type PublicUser, type Task, type TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks:      Task[];
  members:    PublicUser[];
  onMove:     (taskId: string, status: TaskStatus) => void;
  onOpenTask: (task: Task) => void;
  onAddTask:  (status: TaskStatus) => void;
}

export function KanbanBoard({ tasks, members, onMove, onOpenTask, onAddTask }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const memberMap = new Map(members.map(m => [m.id, m]));
  const activeTask = tasks.find(t => t.id === activeId) ?? null;

  const handleStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const handleEnd   = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const status = over.id as TaskStatus;
    const task   = tasks.find(t => t.id === active.id);
    if (task && task.status !== status) onMove(task.id, status);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))', gap: '1rem', height: '100%', minWidth: 'max-content' }}>
        {TASK_STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter(t => t.status === status)}
            memberMap={memberMap}
            activeId={activeId}
            onOpenTask={onOpenTask}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            assignee={activeTask.assigneeId ? memberMap.get(activeTask.assigneeId) : undefined}
            dragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  status, tasks, memberMap, activeId, onOpenTask, onAddTask,
}: {
  status:     TaskStatus;
  tasks:      Task[];
  memberMap:  Map<string, PublicUser>;
  activeId:   string | null;
  onOpenTask: (task: Task) => void;
  onAddTask:  (status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const STATUS_COLORS: Record<TaskStatus, string> = {
    TODO:        'var(--muted-foreground)',
    IN_PROGRESS: 'var(--status-in-progress)',
    IN_REVIEW:   'var(--status-in-review)',
    DONE:        'var(--status-done)',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRadius: 'var(--radius)', border: '1px solid var(--border)',
      backgroundColor: 'var(--secondary)',
      minHeight: '12rem', maxHeight: 'calc(100vh - 10rem)',
    }}>
      {/* Column header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.625rem 0.75rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: STATUS_COLORS[status], flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--foreground)' }}>
            {STATUS_LABELS[status]}
          </span>
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600,
            backgroundColor: 'var(--card)', color: 'var(--muted-foreground)',
            padding: '0 0.375rem', borderRadius: '9999px', border: '1px solid var(--border)',
          }}>
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAddTask(status)}
          aria-label={`Add task to ${STATUS_LABELS[status]}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '1.5rem', height: '1.5rem', borderRadius: 'var(--radius-sm)',
            border: 'none', background: 'transparent', color: 'var(--muted-foreground)',
            cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--border)'; e.currentTarget.style.color = 'var(--foreground)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        style={{
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          padding: '0.5rem',
          flex: 1, overflowY: 'auto',
          minHeight: '6rem',
          backgroundColor: isOver ? 'rgba(109 40 217 / 0.05)' : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        {tasks.map(task => (
          <DraggableCard
            key={task.id}
            task={task}
            assignee={task.assigneeId ? memberMap.get(task.assigneeId) : undefined}
            isActive={activeId === task.id}
            onClick={() => onOpenTask(task)}
          />
        ))}
        {tasks.length === 0 && (
          <p style={{ padding: '1.5rem 0', textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)', userSelect: 'none' }}>
            Drop tasks here
          </p>
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  task, assignee, isActive, onClick,
}: {
  task:     Task;
  assignee?: PublicUser;
  isActive: boolean;
  onClick:  () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
        touchAction: 'none',
        opacity: isActive ? 0.35 : 1,
      }}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} assignee={assignee} onClick={onClick} />
    </div>
  );
}
