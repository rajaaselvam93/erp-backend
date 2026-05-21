const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Workflow extends Model {}

  Workflow.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      companyId: { type: DataTypes.UUID, field: 'company_id' },
      moduleId: { type: DataTypes.UUID, field: 'module_id' },
      name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT },
      trigger: {
        type: DataTypes.ENUM('on_create', 'on_update', 'on_delete', 'on_status_change', 'manual', 'scheduled'),
        defaultValue: 'manual',
      },
      triggerConditions: { type: DataTypes.JSON, defaultValue: {} },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      isParallel: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'All steps execute simultaneously',
      },
      notifyOnComplete: { type: DataTypes.BOOLEAN, defaultValue: true },
      notifyOnReject: { type: DataTypes.BOOLEAN, defaultValue: true },
      autoApproveOnTimeout: { type: DataTypes.BOOLEAN, defaultValue: false },
      timeoutHours: { type: DataTypes.INTEGER, defaultValue: 72 },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'Workflow',
      tableName: 'workflows',
      paranoid: true,
    }
  );

  return Workflow;
};
