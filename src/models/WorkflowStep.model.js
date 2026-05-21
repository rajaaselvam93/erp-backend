const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WorkflowStep extends Model {}

  WorkflowStep.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      workflowId: { type: DataTypes.UUID, field: 'workflow_id', allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT },
      stepOrder: { type: DataTypes.INTEGER, allowNull: false, field: 'step_order' },
      stepType: {
        type: DataTypes.ENUM('approval', 'notification', 'action', 'condition', 'delay'),
        defaultValue: 'approval',
        field: 'step_type',
      },
      approverType: {
        type: DataTypes.ENUM('user', 'role', 'manager', 'department_head', 'dynamic'),
        defaultValue: 'role',
        field: 'approver_type',
      },
      approverConfig: {
        type: DataTypes.JSON,
        field: 'approver_config',
        defaultValue: {},
        comment: '{roleId, userId, field, etc.}',
      },
      requireAllApprovers: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'require_all_approvers' },
      autoApprove: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'auto_approve' },
      timeoutHours: { type: DataTypes.INTEGER, defaultValue: 48, field: 'timeout_hours' },
      onApprove: { type: DataTypes.JSON, defaultValue: {}, field: 'on_approve' },
      onReject: { type: DataTypes.JSON, defaultValue: {}, field: 'on_reject' },
      onTimeout: { type: DataTypes.JSON, defaultValue: {}, field: 'on_timeout' },
      conditions: { type: DataTypes.JSON, defaultValue: [] },
      notifyApprover: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'notify_approver' },
      notifyRequester: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'notify_requester' },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'WorkflowStep',
      tableName: 'workflow_steps',
      paranoid: true,
    }
  );

  return WorkflowStep;
};
