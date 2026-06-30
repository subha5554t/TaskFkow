import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ListTodo, CalendarClock, AlertTriangle, CheckCircle2, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { dashboardApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { statusLabel, formatDate, fromNow, isOverdue, activityText } from '@/lib/format';
import type { TaskStatus } from '@/lib/types';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { getDb } from '@/lib/store';

const STATUS_FILL: Record<string, string> = {
  TODO:        'var(--chart-1)',
  IN_PROGRESS: 'var(--chart-2)',
  IN_REVIEW:   'var(--chart-3)',
  DONE:        'var(--chart-4)',
};

interface StatCardProps {
  label:  string;
  value:  number;
  icon:   React.ElementType;
  tone?:  'default' | 'danger';
}

function StatCard({ label, value, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <div style={{
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      backgroundColor: 'var(--card)',
      padding: '1.25rem',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>{label}</p>
        <Icon size={16} style={{ color: tone === 'danger' ? 'var(--destructive)' : 'var(--muted-foreground)' }} />
      </div>
      <p style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: tone === 'danger' ? 'var(--destructive)' : 'var(--foreground)',
        lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  dashboardApi.getSummary,
  });

  const db = getDb(); // for resolving user names in activity feed

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>
          Welcome back, {user?.name?.split(' ')[0] ?? ''}
        </h1>
        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
          Here's what's happening across your projects.
        </p>
      </div>

      {/* Stat cards */}
      {isLoading || !data ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <StatCard label="Active tasks"     value={data.stats.activeTasks}        icon={ListTodo} />
            <StatCard label="Due this week"    value={data.stats.dueThisWeek}        icon={CalendarClock} />
            <StatCard label="Overdue"          value={data.stats.overdue}            icon={AlertTriangle}  tone="danger" />
            <StatCard label="Done this month"  value={data.stats.completedThisMonth} icon={CheckCircle2} />
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {/* Bar chart */}
              <div style={{
                borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                backgroundColor: 'var(--card)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)',
              }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Tasks by status</h2>
                <div style={{ height: '14rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.statusDistribution} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis
                        dataKey="status"
                        tickFormatter={v => statusLabel(v as TaskStatus)}
                        tickLine={false} axisLine={false}
                        tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'var(--secondary)' }}
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: 8, fontSize: 12,
                        }}
                        labelFormatter={v => statusLabel(v as TaskStatus)}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {data.statusDistribution.map(entry => (
                          <Cell key={entry.status} fill={STATUS_FILL[entry.status]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Upcoming deadlines */}
              <div style={{
                borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                backgroundColor: 'var(--card)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)',
              }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Upcoming deadlines</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  {data.upcomingDeadlines.length === 0 ? (
                    <p style={{ padding: '1.5rem 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                      No upcoming deadlines 🎉
                    </p>
                  ) : data.upcomingDeadlines.map(task => (
                    <Link
                      key={task.id}
                      to={`/projects/${task.projectId}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                        padding: '0.5rem 0.5rem', borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span style={{ fontSize: '0.875rem', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {task.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', flexShrink: 0, color: isOverdue(task.dueDate) ? 'var(--destructive)' : 'var(--muted-foreground)', fontWeight: 500 }}>
                        {formatDate(task.dueDate)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div style={{
            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
            backgroundColor: 'var(--card)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Recent activity</h2>
              <Link to="/projects" style={{ fontSize: '0.8125rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500, textDecoration: 'none' }}>
                View projects <ArrowRight size={14} />
              </Link>
            </div>
            {data.recentActivity.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                No recent activity yet.
              </p>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', listStyle: 'none', padding: 0 }}>
                {data.recentActivity.map(activity => {
                  const actUser = db.users[activity.userId];
                  return (
                    <li key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      {actUser && <Avatar name={actUser.name} size="sm" />}
                      <div style={{ flex: 1, fontSize: '0.875rem' }}>
                        {actUser && <strong style={{ fontWeight: 600 }}>{actUser.name} </strong>}
                        <span style={{ color: 'var(--muted-foreground)' }}>
                          {activityText(activity.action, activity.meta)}
                        </span>
                        <span style={{ marginLeft: '0.375rem', fontSize: '0.75rem', color: 'var(--muted-foreground)', opacity: 0.7 }}>
                          · {fromNow(activity.createdAt)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
