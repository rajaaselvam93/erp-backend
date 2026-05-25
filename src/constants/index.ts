export enum END_POINTS {
  LOGIN = "/login",
  REGISTER = "/register",
  REFRESH_TOKEN = "/refresh-token",
  CHANGE_PASSWORD = "/change-password",
  FORGOT_PASSWORD = "/forgot-password",
  RESET_PASSWORD = "/reset-password",
}

export enum STATUS_CODE {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum USER_ROLES {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
  ACCOUNTANT = "ACCOUNTANT",
  HR = "HR",
}

export enum USER_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum STATUS {
  SUCCESS = "success",
  ERROR = "error",
  FAILURE = "failure",
}

export enum SUCCESS_MESSAGES {
  USER_CREATED = "User Created Successfully",
  LOGIN_SUCCESS = "Login Successful",
  PASSWORD_CHANGED = "Password changed successfully",
  PASSWORD_RESET_EMAIL_SENT = "Password reset email sent successfully",
  PASSWORD_RESET_SUCCESS = "Password reset successfully",
}

export enum ERROR_MESSAGES {
  ACCOUNT_INACTIVE = "ACCOUNT_INACTIVE. Contact Admin",
  ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED. Contact Admin",
  INVALID_CREDENTIALS = "Invalid Credentials",
  USER_NOT_FOUND = "User Not Found",
  VALIDATION_FAILED = "Validation Failed",
  FAILED = "Failed to {VAR}",
  NOT_IN_ENV = "Required environment variable is missing : {VAR}",
  NO_TOKEN = "No token provided",
  INVALID_TOKEN = "Invalid token provided",
  INVALID_TOKEN_TYPE = "Invalid token type provided",
  INVALID_USER = "Invalid user provided",
  INVALID_TOKEN_PAYLOAD = "Invalid token payload",
  EXPIRED_TOKEN = "Token Expired",
  EMAIL_ALREADY_EXISTS = "Email already exists",
  UNAUTHORIZED = "Unauthorized Access",
}

export enum AUDIT_ACTIONS {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  CHANGE_PASSWORD = "CHANGE_PASSWORD",
  FORGOT_PASSWORD = "FORGOT_PASSWORD",
  RESET_PASSWORD = "RESET_PASSWORD",
}
