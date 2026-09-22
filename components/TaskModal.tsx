'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { useUserSession } from './UserSessionContext';
import { X, Calendar, User, Flag, Users, Layers, MessageSquare } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  taskToEdit?: any;
}

export default function TaskModal({ isOpen, onClose, onSaved, taskToEdit }: TaskModalProps) {
  const { language, t } = useLanguage();
  const { allUsers } = useUserSession();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [pathwayId, setPathwayId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('TODO');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringRule, setRecurringRule] = useState('WEEKLY');
  const [newComment, setNewComment] = useState('');

  const [teams, setTeams] = useState<any[]>([]);
  const [pathways, setPathways] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/teams')
      .then((r) => r.json())
      .then((d) => setTeams(Array.isArray(d) ? d : []));

    fetch('/api/pathways')
      .then((r) => r.json())
      .then((d) => setPathways(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setAssigneeId(taskToEdit.assigneeId || '');
      setTeamId(taskToEdit.teamId || '');
      setPathwayId(taskToEdit.pathwayId || '');
      setPriority(taskToEdit.priority || 'MEDIUM');
      setStatus(taskToEdit.status || 'TODO');
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
      setIsRecurring(!!taskToEdit.isRecurring);
      setRecurringRule(taskToEdit.recurringRule || 'WEEKLY');
    } else {
      setTitle('');
      setDescription('');
      setAssigneeId('');
      setTeamId('');
      setPathwayId('');
      setPriority('MEDIUM');
      setStatus('TODO');
      setDueDate('');
      setIsRecurring(false);
      setRecurringRule('WEEKLY');
    }
    setNewComment('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (taskToEdit) {
        await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: taskToEdit.id,
            title,
            description,
            assigneeId: assigneeId || null,
            priority,
            status,
            dueDate: dueDate || null,
            comment: newComment || undefined,
          }),
        });
      } else {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            assigneeId: assigneeId || null,
            teamId: teamId || null,
            pathwayId: pathwayId || null,
            priority,
            dueDate: dueDate || null,
            isRecurring,
            recurringRule: isRecurring ? recurringRule : null,
          }),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-notion-modal border border-zinc-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <h2 className="text-base sm:text-lg font-bold text-zinc-950">
            {taskToEdit ? (language === 'my' ? 'တာဝန် ပြင်ဆင်ရန် / လွှဲပြောင်းရန်' : 'Edit / Reassign Task') : t.tasks.createTask}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Record first 5 Germany videos in Hamburg"
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Description / Action Context
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specific guidelines, deliverable links, or checklists..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>Accountable Owner / Assignee</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50 font-medium"
              >
                <option value="">-- Select Assignee --</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title || u.role.name}) {u.status === 'INACTIVE' ? '[Inactive]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center space-x-1">
                <Flag className="w-3.5 h-3.5 text-purple-600" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50 font-medium"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Department / Team</span>
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
              >
                <option value="">-- General Org Task --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Pathway (Optional)</span>
              </label>
              <select
                value={pathwayId}
                onChange={(e) => setPathwayId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
              >
                <option value="">-- Not Pathway Specific --</option>
                {pathways.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
              />
            </div>

            {taskToEdit ? (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50 font-medium"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">In Review</option>
                  <option value="DONE">Completed</option>
                </select>
              </div>
            ) : (
              <div className="pt-5">
                <label className="flex items-center space-x-2 text-xs font-bold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-600"
                  />
                  <span>Recurring Weekly Task (Slide 7 Cadence)</span>
                </label>
              </div>
            )}
          </div>

          {taskToEdit && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>Add Note / Comment</span>
              </label>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Log activity, handover note, or blocker..."
                className="w-full px-3.5 py-1.5 text-xs border border-zinc-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none bg-zinc-50/50"
              />
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-black rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
