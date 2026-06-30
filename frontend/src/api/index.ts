// API barrel — import from here everywhere in the app.
// When backend is ready, swap the mock implementations in each file.

export * as authApi      from './auth';
export * as projectsApi  from './projects';
export * as tasksApi     from './tasks';
export * as dashboardApi from './dashboard';
export { ApiError }      from '@/lib/apiError';
