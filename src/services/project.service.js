const { Project, ProjectTask, Customer } = require('../models');
const { Op } = require('sequelize');

class ProjectService {
  async getProjects(companyId, { page = 1, limit = 20, search = '', status = '' } = {}) {
    const where = { companyId };
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { projectName: { [Op.like]: `%${search}%` } },
        { projectCode: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [{ model: Customer, as: 'customer', attributes: ['id', 'customerName'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getProject(id, companyId) {
    const project = await Project.findOne({
      where: { id, companyId },
      include: [
        { model: Customer, as: 'customer' },
        { model: ProjectTask, as: 'tasks', required: false },
      ],
    });
    if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    return project;
  }

  async createProject(data, companyId) {
    const exists = await Project.findOne({ where: { projectCode: data.projectCode, companyId } });
    if (exists) throw Object.assign(new Error('Project code already exists'), { statusCode: 409 });
    return Project.create({ ...data, companyId });
  }

  async updateProject(id, data, companyId) {
    const project = await Project.findOne({ where: { id, companyId } });
    if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    await project.update(data);
    return project;
  }

  async deleteProject(id, companyId) {
    const project = await Project.findOne({ where: { id, companyId } });
    if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    await project.destroy();
  }

  async getTasks(projectId, companyId, { status = '' } = {}) {
    const project = await Project.findOne({ where: { id: projectId, companyId } });
    if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });

    const where = { projectId };
    if (status) where.status = status;
    return ProjectTask.findAll({ where, order: [['createdAt', 'ASC']] });
  }

  async createTask(projectId, data, companyId) {
    const project = await Project.findOne({ where: { id: projectId, companyId } });
    if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    return ProjectTask.create({ ...data, projectId });
  }

  async updateTask(id, data, companyId) {
    const task = await ProjectTask.findOne({
      where: { id },
      include: [{ model: Project, as: 'project', where: { companyId } }],
    });
    if (!task) throw Object.assign(new Error('Task not found'), { statusCode: 404 });
    if (data.status === 'done' && !task.completedAt) data.completedAt = new Date();
    await task.update(data);
    return task;
  }

  async deleteTask(id, companyId) {
    const task = await ProjectTask.findOne({
      where: { id },
      include: [{ model: Project, as: 'project', where: { companyId } }],
    });
    if (!task) throw Object.assign(new Error('Task not found'), { statusCode: 404 });
    await task.destroy();
  }

  async getStats(companyId) {
    const [total, active, completed, overdue] = await Promise.all([
      Project.count({ where: { companyId } }),
      Project.count({ where: { companyId, status: 'active' } }),
      Project.count({ where: { companyId, status: 'completed' } }),
      Project.count({ where: { companyId, status: 'active', endDate: { [Op.lt]: new Date() } } }),
    ]);
    return { totalProjects: total, activeProjects: active, completedProjects: completed, overdueProjects: overdue };
  }
}

module.exports = new ProjectService();
