import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function AppLayout() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        minWidth: 0,
        overflowY: 'auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <TopNav />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
