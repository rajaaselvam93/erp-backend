import { SUCCESS_MESSAGES, ERROR_MESSAGES, STATUS_CODE, STATUS, AUDIT_ACTIONS } from "../constants";
import { AuthService, AuditService } from "../services";

export const register = async (req: any, res: any) => {
  try {
    const user = await AuthService.createUser(req.body);

    if (req.userDetails?.id) {
      AuditService.logAudit(req.userDetails.id, AUDIT_ACTIONS.REGISTER, { body: req.body });
    }

    return res.status(STATUS_CODE.CREATED).json({
      status: STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.USER_CREATED,
      data: user,
    });
  } catch (err: any) {
    return res.status(err.statuscode || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: STATUS.ERROR,
      message: err.message || ERROR_MESSAGES.FAILED.replace("{VAR}", "Create User"),
    });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const data = await AuthService.loginUser(email, password);

    AuditService.logAudit(data.userId, AUDIT_ACTIONS.LOGIN, { body: { email } });

    return res.status(STATUS_CODE.SUCCESS).json({
      status: STATUS.SUCCESS,
      data,
    });
  } catch (err: any) {
    return res.status(err.statuscode || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: STATUS.ERROR,
      message: err.message || ERROR_MESSAGES.FAILED.replace("{VAR}", "Login"),
    });
  }
};

export const refreshTokenController = async (req: any, res: any) => {
  try {
    const { refreshToken } = req.body;
    const data = await AuthService.refreshAccessToken(refreshToken);

    return res.status(STATUS_CODE.SUCCESS).json({
      status: STATUS.SUCCESS,
      data,
    });
  } catch (err: any) {
    return res.status(err.statuscode || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: STATUS.ERROR,
      message: err.message || ERROR_MESSAGES.FAILED.replace("{VAR}", "Refresh Token"),
    });
  }
};

export const changePasswordController = async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const data = await AuthService.changePassword(userId, currentPassword, newPassword);

    AuditService.logAudit(userId, AUDIT_ACTIONS.CHANGE_PASSWORD, { params: { userId } });

    return res.status(STATUS_CODE.SUCCESS).json({
      status: STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
      data,
    });
  } catch (err: any) {
    return res.status(err.statuscode || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: STATUS.ERROR,
      message: err.message || ERROR_MESSAGES.FAILED.replace("{VAR}", "Change Password"),
    });
  }
};

export const forgotPasswordController = async (req: any, res: any) => {
  try {
    const { email } = req.body;
    const data = await AuthService.forgotPassword(email);

    AuditService.logAudit(data.userId, AUDIT_ACTIONS.FORGOT_PASSWORD, { body: { email } });

    return res.status(STATUS_CODE.SUCCESS).json({
      status: STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      data,
    });
  } catch (err: any) {
    return res.status(err.statuscode || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: STATUS.ERROR,
      message: err.message || ERROR_MESSAGES.FAILED.replace("{VAR}", "Forgot Password"),
    });
  }
};

export const resetPasswordController = async (req: any, res: any) => {
  try {
    const { token, newPassword } = req.body;
    const data = await AuthService.resetPassword(token, newPassword);

    AuditService.logAudit(data.userId, AUDIT_ACTIONS.RESET_PASSWORD, {});

    return res.status(STATUS_CODE.SUCCESS).json({
      status: STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      data,
    });
  } catch (err: any) {
    return res.status(err.statuscode || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      status: STATUS.ERROR,
      message: err.message || ERROR_MESSAGES.FAILED.replace("{VAR}", "Reset Password"),
    });
  }
};
