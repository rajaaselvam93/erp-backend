const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ModuleField extends Model {}

  ModuleField.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      moduleId: {
        type: DataTypes.UUID,
        field: 'module_id',
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Display name',
      },
      columnName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'MySQL column name (snake_case)',
      },
      fieldType: {
        type: DataTypes.ENUM(
          'text', 'textarea', 'number', 'decimal', 'email', 'phone',
          'url', 'password', 'date', 'datetime', 'time', 'boolean',
          'select', 'multiselect', 'radio', 'checkbox', 'file', 'image',
          'relation', 'json', 'color', 'rating', 'currency', 'formula',
          'lookup', 'autonumber', 'signature', 'richtext'
        ),
        allowNull: false,
        defaultValue: 'text',
      },
      dataType: {
        type: DataTypes.STRING(50),
        comment: 'MySQL data type: VARCHAR(255), TEXT, INT, DECIMAL(10,2), etc.',
      },
      label: { type: DataTypes.STRING(150) },
      placeholder: { type: DataTypes.STRING(255) },
      helpText: { type: DataTypes.STRING(500) },
      defaultValue: { type: DataTypes.TEXT },
      isRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
      isUnique: { type: DataTypes.BOOLEAN, defaultValue: false },
      isReadOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
      isHidden: { type: DataTypes.BOOLEAN, defaultValue: false },
      isSearchable: { type: DataTypes.BOOLEAN, defaultValue: false },
      isSortable: { type: DataTypes.BOOLEAN, defaultValue: true },
      isFilterable: { type: DataTypes.BOOLEAN, defaultValue: false },
      showInList: { type: DataTypes.BOOLEAN, defaultValue: true },
      showInForm: { type: DataTypes.BOOLEAN, defaultValue: true },
      showInDetail: { type: DataTypes.BOOLEAN, defaultValue: true },
      // Validation rules
      validation: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'min, max, pattern, custom validation rules',
      },
      // For select/multiselect/radio fields
      options: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: '[{label, value, color}]',
      },
      // For relation fields
      relationConfig: {
        type: DataTypes.JSON,
        defaultValue: null,
        comment: '{moduleId, displayField, valueField, multiple}',
      },
      // For formula fields
      formula: { type: DataTypes.TEXT },
      // Column width in list view
      width: { type: DataTypes.INTEGER, defaultValue: 150 },
      // Appearance
      section: { type: DataTypes.STRING(100) },
      colSpan: { type: DataTypes.INTEGER, defaultValue: 1 },
      sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
      styles: { type: DataTypes.JSON, defaultValue: {} },
      conditionalDisplay: {
        type: DataTypes.JSON,
        defaultValue: null,
        comment: '{field, operator, value}',
      },
    },
    {
      sequelize,
      modelName: 'ModuleField',
      tableName: 'module_fields',
      paranoid: true,
      indexes: [
        { fields: ['module_id'] },
        { fields: ['field_type'] },
        { fields: ['sort_order'] },
      ],
    }
  );

  return ModuleField;
};
