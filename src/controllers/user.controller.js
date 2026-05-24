const userService = require('../services/user.service');
const response = require('../utils/response.util');
const Joi = require('joi');
const { validate } = require('../middleware/validate.middleware');
const multer = require('multer');
const path = require('path');
const config = require('../config');

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), config.upload.dir, 'avatars'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.userId}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

const createUserSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().max(30).allow('', null),
  roleId: Joi.string().uuid().required(),
  department: Joi.string().max(100).allow('', null),
  designation: Joi.string().max(150).allow('', null),
  employeeId: Joi.string().max(50).allow('', null),
  status: Joi.string().valid('active', 'inactive', 'pending'),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().min(1).max(100),
  email: Joi.string().email(),
  phone: Joi.string().max(30).allow('', null),
  roleId: Joi.string().uuid().allow(null),
  department: Joi.string().max(100).allow('', null),
  designation: Joi.string().max(150).allow('', null),
  employeeId: Joi.string().max(50).allow('', null),
  status: Joi.string().valid('active', 'inactive', 'suspended', 'pending'),
});

const getUsers = async (req, res, next) => {
  try {
    const { page, limit, sortBy, sortOrder, search, status, roleId } = req.query;
    const result = await userService.getUsers(req.companyId, {
      filters: { ...(status && { status }), ...(roleId && { roleId }) },
      page,
      limit,
      sortBy,
      sortOrder,
      search: search || '',
    });
    return response.paginated(res, result.data, result.total, result.page, result.limit);
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return response.success(res, user);
  } catch (err) {
    next(err);
  }
};

const createUser = [
  validate(createUserSchema),
  async (req, res, next) => {
    try {
      const user = await userService.createUser(req.body, req.companyId);
      return response.created(res, user, 'User created successfully');
    } catch (err) {
      next(err);
    }
  },
];

const updateUser = [
  validate(updateUserSchema),
  async (req, res, next) => {
    try {
      const user = await userService.updateUser(req.params.id, req.body, req.userId);
      return response.success(res, user, 'User updated successfully');
    } catch (err) {
      next(err);
    }
  },
];

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.userId);
    return response.success(res, null, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

const updateProfile = [
  validate(updateUserSchema.fork(['email'], (schema) => schema.optional())),
  async (req, res, next) => {
    try {
      const user = await userService.updateUser(req.userId, req.body, req.userId);
      return response.success(res, user, 'Profile updated');
    } catch (err) {
      next(err);
    }
  },
];

const uploadAvatar = [
  upload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) return response.badRequest(res, 'No file uploaded');
      const avatarPath = `/${config.upload.dir}/avatars/${req.file.filename}`;
      await userService.updateAvatar(req.userId, avatarPath);
      return response.success(res, { avatar: avatarPath }, 'Avatar updated');
    } catch (err) {
      next(err);
    }
  },
];

const updatePreferences = async (req, res, next) => {
  try {
    const prefs = await userService.updatePreferences(req.userId, req.body);
    return response.success(res, prefs, 'Preferences updated');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  uploadAvatar,
  updatePreferences,
};
