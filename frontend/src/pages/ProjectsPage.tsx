import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban, Calendar, Archive, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { projectsApi } from '@/api';
import type { Project } from '@/lib/types';
import type { ProjectInput } from '@/lib/validators';
import { formatFullDate } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ProjectFormModal } from '@/components/projects/ProjectFormModal';

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn:  projectsApi.listProjects,
  });

  const createMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectInput> }) =>
      projectsApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const activeProjects   = projects.filter(p => p.status === 'ACTIVE');
  const archivedProjects = projects.filter(p => p.status === 'ARCHIVED');

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>Projects</h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            Manage and track all your projects.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus size={16} />
          New project
        </Button>
      </div>

      {/* Projects grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : activeProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start managing tasks."
          action={
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus size={16} /> New project
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {activeProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => { setEditingProject(project); setOpenMenuId(null); }}
              onDelete={() => { if (confirm('Archive this project?')) { deleteMutation.mutate(project.id); } setOpenMenuId(null); }}
              menuOpen={openMenuId === project.id}
              onToggleMenu={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
            />
          ))}
        </div>
      )}

      {/* Archived */}
      {archivedProjects.length > 0 && (
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Archive size={14} /> Archived
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', opacity: 0.6 }}>
            {archivedProjects.map(p => (
              <div key={p.id} style={{
                borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                backgroundColor: 'var(--card)', padding: '1.25rem',
              }}>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={data => createMutation.mutateAsync(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit modal */}
      {editingProject && (
        <ProjectFormModal
          isOpen
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={data => updateMutation.mutateAsync({ id: editingProject.id, data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function ProjectCard({
  project, onEdit, onDelete, menuOpen, onToggleMenu,
}: {
  project:      Project;
  onEdit:       () => void;
  onDelete:     () => void;
  menuOpen:     boolean;
  onToggleMenu: () => void;
}) {
  return (
    <div style={{
      borderRadius: 'var(--radius)', border: '1px solid var(--border)',
      backgroundColor: 'var(--card)', padding: '1.25rem',
      boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '0.75rem',
      transition: 'box-shadow 0.15s, border-color 0.15s',
      position: 'relative',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--muted-foreground)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FolderKanban size={14} />
          </div>
          <Link
            to={`/projects/${project.id}`}
            style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--foreground)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--foreground)')}
          >
            {project.name}
          </Link>
        </div>

        {/* Menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); onToggleMenu(); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-sm)',
              border: 'none', background: 'transparent', color: 'var(--muted-foreground)',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            aria-label="Project options"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '110%', zIndex: 10,
              backgroundColor: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
              overflow: 'hidden', minWidth: '8rem',
              animation: 'slideInUp 0.1s ease',
            }}>
              <button onClick={onEdit} style={menuItemStyle}>
                <Pencil size={13} /> Edit
              </button>
              <button onClick={onDelete} style={{ ...menuItemStyle, color: 'var(--destructive)' }}>
                <Trash2 size={13} /> Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {project.description && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </p>
      )}

      {project.dueDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
          <Calendar size={12} />
          {formatFullDate(project.dueDate)}
        </div>
      )}

      <Link
        to={`/projects/${project.id}`}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)',
          fontSize: '0.8125rem', fontWeight: 500, border: '1px solid var(--border)',
          backgroundColor: 'transparent', color: 'var(--foreground)', textDecoration: 'none',
          transition: 'background 0.15s',
          alignSelf: 'flex-start',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        Open board
      </Link>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  width: '100%', padding: '0.5rem 0.875rem',
  fontSize: '0.8125rem', fontWeight: 500,
  border: 'none', background: 'transparent',
  color: 'var(--foreground)', cursor: 'pointer',
  transition: 'background 0.1s', fontFamily: 'inherit',
};
