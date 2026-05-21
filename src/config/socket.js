const { Server } = require('socket.io');
const config = require('./index');
const { verifyToken } = require('../utils/jwt.util');
const logger = require('../utils/logger.util');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.app.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.companyId = decoded.companyId;
      socket.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join company room for multi-tenant
    if (socket.companyId) {
      socket.join(`company:${socket.companyId}`);
    }

    // Join role room
    if (socket.role) {
      socket.join(`role:${socket.role}`);
    }

    socket.on('join:module', (moduleId) => {
      socket.join(`module:${moduleId}`);
    });

    socket.on('leave:module', (moduleId) => {
      socket.leave(`module:${moduleId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitToCompany = (companyId, event, data) => {
  if (io) {
    io.to(`company:${companyId}`).emit(event, data);
  }
};

const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToUser, emitToCompany, emitToRole, broadcast };
