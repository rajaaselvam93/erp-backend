module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    employeeCode: { type: DataTypes.STRING(50), allowNull: false, field: 'employee_code' },
    firstName: { type: DataTypes.STRING(100), allowNull: false, field: 'first_name' },
    lastName: { type: DataTypes.STRING(100), allowNull: false, field: 'last_name' },
    email: { type: DataTypes.STRING(255), field: 'email' },
    phone: { type: DataTypes.STRING(20), field: 'phone' },
    departmentId: { type: DataTypes.UUID, field: 'department_id' },
    designationId: { type: DataTypes.UUID, field: 'designation_id' },
    managerId: { type: DataTypes.UUID, field: 'manager_id' },
    userId: { type: DataTypes.UUID, field: 'user_id' },
    joiningDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'joining_date' },
    employmentStatus: { type: DataTypes.ENUM('active', 'inactive', 'on_leave', 'terminated'), defaultValue: 'active', field: 'employment_status' },
    employmentType: { type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'), defaultValue: 'full_time', field: 'employment_type' },
    salaryStructureId: { type: DataTypes.UUID, field: 'salary_structure_id' },
    dateOfBirth: { type: DataTypes.DATEONLY, field: 'date_of_birth' },
    gender: { type: DataTypes.ENUM('male', 'female', 'other'), field: 'gender' },
    address: { type: DataTypes.TEXT, field: 'address' },
    city: { type: DataTypes.STRING(100), field: 'city' },
    state: { type: DataTypes.STRING(100), field: 'state' },
    country: { type: DataTypes.STRING(100), field: 'country' },
    avatar: { type: DataTypes.STRING(500), field: 'avatar' },
    emergencyContact: { type: DataTypes.JSON, field: 'emergency_contact' },
    metadata: { type: DataTypes.JSON, defaultValue: {}, field: 'metadata' },
  }, {
    tableName: 'employees',
    underscored: true,
    paranoid: true,
  });

  return Employee;
};
