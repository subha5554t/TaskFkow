import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, LayoutGrid, List, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectsApi, tasksApi } from '@/api';
import { getDb } from '@/lib/store';
import type { Task, TaskStatus } from '@/lib/types';
import type { TaskInput } from '@/lib/validators';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';

type ViewMode = 'kanban' | 'list';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient   = useQueryClient();

  const [view,              setView]              = useState<ViewMode>('kanban');
  const [isCreateOpen,      setIsCreateOpen]      = useState(false);
  const [defaultStatus,     setDefaultStatus]     = useState<TaskStatus>('TODO');
  const [selectedTask,      setSelectedTask]      = useState<Task | null>(null);

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn:  () => projectsApi.getProject(projectId!),
    enabled:  !!projectId,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn:  () => tasksApi.listTasks(projectId!),
    enabled:  !!projectId,
  });

  const db      = getDb();
  const members = (project?.memberIds ?? []).map(id => db.users[id]).filter(Boolean).map(u => { const { passwordHash: _, ...pub } = u; return pub; });

  const createMutation = useMutation({
    mutationFn: (input: TaskInput) =>
      tasksApi.createTask({ ...input, projectId: projectId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsCreateOpen(false);
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const isLoading = projLoading || tasksLoading;

  const openAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setIsCreateOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        padding: '0.875rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        flexShrink: 0,
      }}>
        <Link to="/projects" style={{ color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--foreground)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
        >
          <ArrowLeft size={14} /> Projects
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--foreground)' }}>
          {project?.name ?? '…'}
        </h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <button
              onClick={() => setView('kanban')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 500,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                backgroundColor: view === 'kanban' ? 'var(--secondary)' : 'transparent',
                color: view === 'kanban' ? 'var(--foreground)' : 'var(--muted-foreground)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <LayoutGrid size={14} /> Board
            </button>
            <button
              onClick={() => setView('list')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem', fontSize: '0.8125rem', fontWeight: 500,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                backgroundColor: view === 'list' ? 'var(--secondary)' : 'transparent',
                color: view === 'list' ? 'var(--foreground)' : 'var(--muted-foreground)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <List size={14} /> List
            </button>
          </div>
          <Button size="sm" onClick={() => openAddTask('TODO')}>
            <Plus size={15} /> Add task
          </Button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: view === 'list' ? 'auto' : 'hidden', overflowX: view === 'kanban' ? 'auto' : 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))', gap: '1rem' }}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : view === 'kanban' ? (
          <div style={{ padding: '1.25rem', height: '100%' }}>
            <KanbanBoard
              tasks={tasks}
              members={members}
              onMove={(id, status) => moveMutation.mutate({ id, status })}
              onOpenTask={setSelectedTask}
              onAddTask={openAddTask}
            />
          </div>
        ) : (
          <TaskListView
            tasks={tasks}
            members={members}
            onOpenTask={setSelectedTask}
            onMove={(id, status) => moveMutation.mutate({ id, status })}
          />
        )}
      </div>

      {/* Modals */}
      <TaskFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={data => createMutation.mutateAsync(data)}
        isLoading={createMutation.isPending}
        members={members}
        defaultStatus={defaultStatus}
      />

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          projectId={projectId!}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdate={updated => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            setSelectedTask(updated);
          }}
        />
      )}
    </div>
  );
}
