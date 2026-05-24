module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    projectCode: { type: DataTypes.STRING(50), allowNull: false, field: 'project_code' },
    projectName: { type: DataTypes.STRING(255), allowNull: false, field: 'project_name' },
    description: { type: DataTypes.TEXT },
    customerId: { type: DataTypes.UUID, field: 'customer_id' },
    projectManagerId: { type: DataTypes.UUID, field: 'project_manager_id' },
    startDate: { type: DataTypes.DATEONLY, field: 'start_date' },
    endDate: { type: DataTypes.DATEONLY, field: 'end_date' },
    budget: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    actualCost: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'actual_cost' },
    status: { type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'), defaultValue: 'planning' },
    priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
    progressPercent: { type: DataTypes.INTEGER, defaultValue: 0, field: 'progress_percent' },
    billingType: { type: DataTypes.ENUM('fixed', 'hourly', 'milestone'), defaultValue: 'fixed', field: 'billing_type' },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
  }, {
    tableName: 'projects',
    underscored: true,
    paranoid: true,
  });

  const ProjectTask = sequelize.define('ProjectTask', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectId: { type: DataTypes.UUID, allowNull: false, field: 'project_id' },
    parentTaskId: { type: DataTypes.UUID, field: 'parent_task_id' },
    taskName: { type: DataTypes.STRING(255), allowNull: false, field: 'task_name' },
    description: { type: DataTypes.TEXT },
    assignedTo: { type: DataTypes.UUID, field: 'assigned_to' },
    startDate: { type: DataTypes.DATEONLY, field: 'start_date' },
    dueDate: { type: DataTypes.DATEONLY, field: 'due_date' },
    completedAt: { type: DataTypes.DATE, field: 'completed_at' },
    estimatedHours: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0, field: 'estimated_hours' },
    actualHours: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0, field: 'actual_hours' },
    status: { type: DataTypes.ENUM('todo', 'in_progress', 'review', 'done', 'cancelled'), defaultValue: 'todo' },
    priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
    progressPercent: { type: DataTypes.INTEGER, defaultValue: 0, field: 'progress_percent' },
  }, {
    tableName: 'project_tasks',
    underscored: true,
    paranoid: true,
  });

  Project.hasMany(ProjectTask, { foreignKey: 'projectId', as: 'tasks' });
  ProjectTask.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

  return { Project, ProjectTask };
};
