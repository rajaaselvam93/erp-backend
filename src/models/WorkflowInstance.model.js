const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkflowInstance extends Model {}

  WorkflowInstance.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      workflowId: { type: DataTypes.UUID, field: 'workflow_id', allowNull: false },
      companyId: { type: DataTypes.UUID, field: 'company_id' },
      resourceId: { type: DataTypes.STRING(100), field: 'resource_id', allowNull: false },
      resourceType: { type: DataTypes.STRING(100), field: 'resource_type', allowNull: false },
      initiatedBy: { type: DataTypes.UUID, field: 'initiated_by' },
      currentStep: { type: DataTypes.INTEGER, defaultValue: 1, field: 'current_step' },
      currentApproverId: { type: DataTypes.UUID, field: 'current_approver_id' },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'approved', 'rejected', 'cancelled', 'expired'),
        defaultValue: 'pending',
      },
      stepHistory: {
        type: DataTypes.JSON,
        field: 'step_history',
        defaultValue: [],
        comment: 'Array of step execution results',
      },
      completedAt: { type: DataTypes.DATE, field: 'completed_at' },
      rejectedAt: { type: DataTypes.DATE, field: 'rejected_at' },
      rejectionReason: { type: DataTypes.TEXT, field: 'rejection_reason' },
      comments: { type: DataTypes.TEXT },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'WorkflowInstance',
      tableName: 'workflow_instances',
      paranoid: false,
      indexes: [
        { fields: ['workflow_id', 'status'] },
        { fields: ['resource_id', 'resource_type'] },
        { fields: ['initiated_by'] },
      ],
    }
  );

  return WorkflowInstance;
};
