'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useUserSession } from '@/components/UserSessionContext';
import { useSync } from '@/components/SyncContext';
import TaskModal from '@/components/TaskModal';
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  User,
  ArrowRight,
  RotateCcw,
  Repeat,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function TasksPage() {
  const { language, t } = useLanguage();
  const { allUsers } = useUserSession();
  const { isSyncing, triggerSync, notifySync } = useSync();

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const handleSync = () => fetchTasks();
    const handleSwitch = () => fetchTasks();

    window.addEventListener('goeuro_sync_event', handleSync);
    window.addEventListener('goeuro_user_switched', handleSwitch);
    return () => {
      window.removeEventListener('goeuro_sync_event', handleSync);
      window.removeEventListener('goeuro_user_switched', handleSwitch);
    };
  }, []);

  const handleUpdateStatus = async (taskId: string, newStatus: string, taskTitle?: string) => {
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      notifySync('task_updated', { title: taskTitle, status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter && task.status !== statusFilter) return false;
    if (assigneeFilter && task.assigneeId !== assigneeFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchAssignee = task.assignee?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }
    return true;
  });

  const columns = [
    { id: 'TODO', label: t.tasks.statusLabels.TODO, dot: 'bg-zinc-400' },
    { id: 'IN_PROGRESS', label: t.tasks.statusLabels.IN_PROGRESS, dot: 'bg-purple-600' },
    { id: 'REVIEW', label: t.tasks.statusLabels.REVIEW, dot: 'bg-amber-500' },
    { id: 'DONE', label: t.tasks.statusLabels.DONE, dot: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header (Notion White Card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-notion">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 flex items-center space-x-2.5">
            <CheckSquare className="w-6 h-6 text-purple-600" />
            <span>{t.tasks.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {t.tasks.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerSync(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition btn-press"
            title="Sync tasks"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Tasks</span>
          </button>

          {/* View Toggle */}
          <div className="inline-flex rounded-xl border border-zinc-200 p-0.5 bg-zinc-50 text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'board' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'list' ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedTask(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-950 hover:bg-black text-white shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.tasks.createTask}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Notion Database Filters) */}
      <div className="bg-white p-3 rounded-2xl border border-zinc-200/90 shadow-notion flex flex-wrap items-center gap-2.5">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.tasks.searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 bg-zinc-50/50"
          />
        </div>

        {/* Assignee Filter */}
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="text-xs border border-zinc-200 rounded-xl px-2.5 py-1.5 bg-zinc-50/50 text-zinc-700 font-medium"
        >
          <option value="">All Assignees</option>
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs border border-zinc-200 rounded-xl px-2.5 py-1.5 bg-zinc-50/50 text-zinc-700 font-medium"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-zinc-200 rounded-xl px-2.5 py-1.5 bg-zinc-50/50 text-zinc-700 font-medium"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">In Review</option>
          <option value="DONE">Completed</option>
        </select>

        {(assigneeFilter || priorityFilter || statusFilter || searchQuery) && (
          <button
            onClick={() => {
              setAssigneeFilter('');
              setPriorityFilter('');
              setStatusFilter('');
              setSearchQuery('');
            }}
            className="text-xs text-purple-700 hover:underline px-2 font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Content: Board or List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Board View (Notion Database Columns) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="bg-zinc-100/60 border border-zinc-200/80 rounded-2xl p-3 flex flex-col min-h-[340px]">
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200/80 mb-3 px-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="font-bold text-xs text-zinc-800">{col.label}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200/80 text-zinc-700">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 hover:border-purple-300 shadow-notion hover:shadow-notion-hover transition-all duration-200 flex flex-col justify-between group hover-lift"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                              task.priority === 'URGENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : task.priority === 'HIGH'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                            }`}
                          >
                            {task.priority === 'URGENT' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                            )}
                            <span>{task.priority}</span>
                          </span>

                          {task.isRecurring && (
                            <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full flex items-center space-x-1 font-semibold">
                              <Repeat className="w-2.5 h-2.5" />
                              <span>Weekly</span>
                            </span>
                          )}
                        </div>

                        <h4
                          onClick={() => {
                            setSelectedTask(task);
                            setModalOpen(true);
                          }}
                          className="text-xs font-extrabold text-zinc-900 cursor-pointer hover:text-purple-700 leading-snug line-clamp-2 transition"
                        >
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setModalOpen(true);
                          }}
                          className="flex items-center space-x-1 text-zinc-700 hover:text-purple-700 bg-zinc-50 hover:bg-purple-50 px-2 py-0.5 rounded-lg border border-zinc-200/80 transition btn-press"
                          title="Click to reassign"
                        >
                          <User className="w-3 h-3 text-zinc-400" />
                          <span className="font-semibold truncate max-w-[100px]">
                            {task.assignee?.name || 'Unassigned'}
                          </span>
                        </button>

                        {task.dueDate && (
                          <span className="text-[10px] text-zinc-400 flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>

                      {/* Quick Move Status Pills */}
                      <div className="mt-2.5 pt-1.5 border-t border-zinc-100/80 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 text-[9px] font-medium">Move:</span>
                        <div className="flex items-center space-x-1">
                          {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((st) => (
                            st !== task.status && (
                              <button
                                key={st}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(task.id, st, task.title);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition btn-press ${
                                  st === 'DONE'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-200'
                                }`}
                              >
                                {st === 'IN_PROGRESS' ? 'Prog' : st === 'REVIEW' ? 'Rev' : st === 'DONE' ? 'Done ✓' : 'Todo'}
                              </button>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="py-12 text-center text-xs text-zinc-400">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-notion overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-zinc-50/70 transition">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      <div className="font-bold">{task.title}</div>
                      {task.team && (
                        <span className="text-[10px] text-zinc-400">{task.team.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800">
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 font-medium">
                      {task.assignee?.name || <span className="text-zinc-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'HIGH'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setModalOpen(true);
                        }}
                        className="text-xs text-purple-700 hover:text-purple-900 font-bold"
                      >
                        Edit / Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTask(null);
        }}
        onSaved={() => {
          fetchTasks();
          notifySync('task_updated', { title: selectedTask?.title });
        }}
        taskToEdit={selectedTask}
      />
    </div>
  );
}
