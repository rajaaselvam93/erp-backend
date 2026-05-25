import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "";

export const generateAccessToken = (userId: number) => {
  return jwt.sign({ userId, type: "access" }, ACCESS_SECRET, { expiresIn: "1d" });
};

export const generateRefreshToken = (userId: number) => {
  return jwt.sign({ userId, type: "refresh" }, REFRESH_SECRET, { expiresIn: "7d" });
};
