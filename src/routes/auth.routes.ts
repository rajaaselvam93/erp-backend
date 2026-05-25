import express from "express";
import { validate } from "../middleware/validate";
import { Schemas } from "../schemas/index";
import {
  register,
  login,
  refreshTokenController,
  changePasswordController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller";
import authenticateJWT from "../middleware/auth.middleware";
import { END_POINTS } from "../constants";

const router = express.Router();

router.post(END_POINTS.REGISTER, validate({ body: Schemas.registerSchema }), register);
router.post(END_POINTS.LOGIN, validate({ body: Schemas.loginSchema }), login);
router.post(END_POINTS.REFRESH_TOKEN, validate({ body: Schemas.refreshTokenSchema }), refreshTokenController);
router.post(END_POINTS.CHANGE_PASSWORD, authenticateJWT, validate({ body: Schemas.changePasswordSchema }), changePasswordController);
router.post(END_POINTS.FORGOT_PASSWORD, validate({ body: Schemas.forgotPasswordSchema }), forgotPasswordController);
router.post(END_POINTS.RESET_PASSWORD, validate({ body: Schemas.resetPasswordSchema }), resetPasswordController);

export default router;
