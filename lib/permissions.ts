export const ALL_PERMISSIONS = [
  { id: 'org:manage', label: 'Manage Organization Settings', description: 'Modify pathways, org details, and global rules' },
  { id: 'user:manage', label: 'Manage Users & Teams', description: 'Invite, deactivate, and reassign team members' },
  { id: 'role:manage', label: 'Manage Roles & Permissions', description: 'Create and adjust role permission sets' },
  { id: 'task:read', label: 'View Tasks', description: 'View assigned and team tasks' },
  { id: 'task:write', label: 'Create & Edit Tasks', description: 'Create, update, and complete tasks' },
  { id: 'task:assign', label: 'Reassign Tasks', description: 'Reassign tasks between staff members' },
  { id: 'content:read', label: 'View Marketing Content', description: 'View content pipeline and calendar' },
  { id: 'content:write', label: 'Create & Edit Content', description: 'Draft content items and submit for review' },
  { id: 'content:factual_review', label: 'Factual Review Approval', description: 'Approve or reject factual accuracy of pathway content' },
  { id: 'content:brand_approve', label: 'Brand Approval', description: 'Final brand and tone of voice approval before scheduling' },
  { id: 'lead:read', label: 'View Leads & Inquiries', description: 'Access private student inquiry queue and contact info' },
  { id: 'lead:write', label: 'Manage Leads', description: 'Update status, log contact, book consultations, and convert to cases' },
  { id: 'case:read', label: 'View Student Cases', description: 'View active student admission files and documents' },
  { id: 'case:write', label: 'Manage Student Cases', description: 'Update case milestones, checklists, and handovers' },
  { id: 'knowledge:read', label: 'View Knowledge Base', description: 'Access approved FAQs, SOPs, and scripts' },
  { id: 'knowledge:write', label: 'Manage Knowledge Base', description: 'Create, edit, and approve knowledge items' },
  { id: 'report:view', label: 'View Reports & Analytics', description: 'Access team performance and launch KPI dashboards' },
  { id: 'team:manage', label: 'Manage Department Leads', description: 'Assign team managers and supervise department workloads' },
  { id: 'finance:view', label: 'View Financial Overview', description: 'Access organization income, expenses, and P&L financial reports' },
  { id: 'finance:manage', label: 'Manage Income & Expenses', description: 'Create and update student payment records, fees, and operational expenses' },
  { id: 'payroll:manage', label: 'Manage Staff Payroll & Salaries', description: 'Calculate monthly salaries, case commissions, bonuses, and process payroll payouts' },
];

export function hasPermission(permissionsJsonOrArray: string | string[], requiredPermission: string): boolean {
  try {
    const permissions: string[] = typeof permissionsJsonOrArray === 'string'
      ? JSON.parse(permissionsJsonOrArray)
      : permissionsJsonOrArray;

    if (!Array.isArray(permissions)) return false;
    if (permissions.includes('*')) return true;
    if (permissions.includes(requiredPermission)) return true;

    // Check wildcard namespace (e.g., 'lead:*' covers 'lead:read')
    const [namespace] = requiredPermission.split(':');
    if (permissions.includes(`${namespace}:*`)) return true;

    return false;
  } catch (err) {
    return false;
  }
}
