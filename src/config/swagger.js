const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Evvo ERP API',
      version: '1.0.0',
      description: 'Comprehensive Enterprise Resource Planning API with dynamic module support',
      contact: {
        name: 'Evvo ERP Team',
        email: 'support@evvoerp.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `${config.app.url}/api/v1`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 20 },
            sortBy: { type: 'string' },
            sortOrder: { type: 'string', enum: ['ASC', 'DESC'] },
            search: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Roles', description: 'Role & permission management' },
      { name: 'Modules', description: 'Dynamic module management' },
      { name: 'Dashboard', description: 'Dashboard & analytics' },
      { name: 'HRMS', description: 'Human Resource Management' },
      { name: 'CRM', description: 'Customer Relationship Management' },
      { name: 'Finance', description: 'Finance & Accounting' },
      { name: 'Inventory', description: 'Inventory Management' },
      { name: 'Sales', description: 'Sales Management' },
      { name: 'Workflows', description: 'Workflow & approval engine' },
      { name: 'Notifications', description: 'Notification system' },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
