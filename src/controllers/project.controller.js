const projectService = require('../services/project.service');
const response = require('../utils/response.util');

const getProjects = async (req, res, next) => {
  try {
    const result = await projectService.getProjects(req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const getProject = async (req, res, next) => {
  try {
    return response.success(res, await projectService.getProject(req.params.id, req.companyId));
  } catch (err) { next(err); }
};

const createProject = async (req, res, next) => {
  try {
    return response.created(res, await projectService.createProject(req.body, req.companyId), 'Project created');
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    return response.success(res, await projectService.updateProject(req.params.id, req.body, req.companyId), 'Project updated');
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.companyId);
    return response.success(res, null, 'Project deleted');
  } catch (err) { next(err); }
};

const getTasks = async (req, res, next) => {
  try {
    return response.success(res, await projectService.getTasks(req.params.id, req.companyId, req.query));
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    return response.created(res, await projectService.createTask(req.params.id, req.body, req.companyId), 'Task created');
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    return response.success(res, await projectService.updateTask(req.params.taskId, req.body, req.companyId), 'Task updated');
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    await projectService.deleteTask(req.params.taskId, req.companyId);
    return response.success(res, null, 'Task deleted');
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    return response.success(res, await projectService.getStats(req.companyId));
  } catch (err) { next(err); }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, getTasks, createTask, updateTask, deleteTask, getStats };
