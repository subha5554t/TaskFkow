// API barrel — import from here everywhere in the app.
// All mock implementations have been replaced with real HTTP calls.

export { default as apiClient } from './client';
export * as authApi      from './auth';
export * as projectsApi  from './projects';
export * as tasksApi     from './tasks';
export * as dashboardApi from './dashboard';
