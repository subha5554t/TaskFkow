import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Project } from '@/lib/types';
import { projectSchema, type ProjectInput } from '@/lib/validators';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface ProjectFormModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSubmit:  (data: ProjectInput) => Promise<unknown>;
  isLoading: boolean;
  project?:  Project;
}

export function ProjectFormModal({ isOpen, onClose, onSubmit, isLoading, project }: ProjectFormModalProps) {
  const isEdit = !!project;

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<ProjectInput>({
      resolver: zodResolver(projectSchema),
      defaultValues: project
        ? { name: project.name, description: project.description ?? '', dueDate: project.dueDate?.slice(0, 10) ?? '' }
        : { name: '', description: '', dueDate: '' },
    });

  const submit = handleSubmit(async data => {
    await onSubmit(data);
    reset();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit project' : 'New project'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="project-form" isLoading={isLoading}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Project name" htmlFor="proj-name" error={errors.name?.message} required>
          <Input id="proj-name" {...register('name')} error={!!errors.name} placeholder="e.g. Website Redesign" />
        </Field>
        <Field label="Description" htmlFor="proj-desc" error={errors.description?.message}>
          <Textarea id="proj-desc" {...register('description')} error={!!errors.description} placeholder="What is this project about?" />
        </Field>
        <Field label="Due date" htmlFor="proj-due" error={errors.dueDate?.message}>
          <Input id="proj-due" type="date" {...register('dueDate')} error={!!errors.dueDate} />
        </Field>
      </form>
    </Modal>
  );
}
