import jwt from "jsonwebtoken";
import prisma from "../config/database";
import { STATUS_CODE, STATUS, ERROR_MESSAGES } from "../constants";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "";

const authenticateJWT = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        status: STATUS.FAILURE,
        data: { detail: ERROR_MESSAGES.NO_TOKEN },
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, ACCESS_SECRET);
    } catch {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        status: STATUS.FAILURE,
        data: { detail: ERROR_MESSAGES.INVALID_TOKEN },
      });
    }

    if (decoded.type !== "access") {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        status: STATUS.FAILURE,
        data: { detail: ERROR_MESSAGES.INVALID_TOKEN_TYPE },
      });
    }

    if (!decoded.userId) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        status: STATUS.FAILURE,
        data: { detail: ERROR_MESSAGES.INVALID_TOKEN_PAYLOAD },
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, name: true, email: true, status: true },
    });

    if (!user) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        status: STATUS.FAILURE,
        data: { detail: ERROR_MESSAGES.USER_NOT_FOUND },
      });
    }

    if (user.status === "INACTIVE") {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        status: STATUS.FAILURE,
        data: { detail: ERROR_MESSAGES.ACCOUNT_INACTIVE },
      });
    }

    if (user.status === "SUSPENDED") {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        status: STATUS.FAILURE,
        data: { detail: ERROR_MESSAGES.ACCOUNT_SUSPENDED },
      });
    }

    req.user = decoded;
    req.userDetails = { id: user.id, name: user.name, email: user.email, role: user.role };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(STATUS_CODE.UNAUTHORIZED).json({
      status: STATUS.FAILURE,
      data: { detail: ERROR_MESSAGES.UNAUTHORIZED },
    });
  }
};

export default authenticateJWT;
