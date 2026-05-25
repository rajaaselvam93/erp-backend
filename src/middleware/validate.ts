import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { STATUS, STATUS_CODE, ERROR_MESSAGES } from "../constants";

export const validate =
  (schemas: {
    body?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
  }) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsed = Object.fromEntries(
          Object.entries(req.body).map(([k, v]) => {
            if (typeof v === "string" && (v.startsWith("[") || v.startsWith("{"))) {
              try { return [k, JSON.parse(v)]; } catch { return [k, v]; }
            }
            return [k, v];
          })
        );
        const sanitized = Object.fromEntries(
          Object.entries(parsed).filter(([_, v]) => v !== "")
        );
        const result = schemas.body.safeParse(sanitized);
        if (!result.success) throw result.error;
        req.body = result.data;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) throw result.error;
        req.params = result.data as Record<string, string>;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) throw result.error;
        Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true, enumerable: true });
      }

      next();
    } catch (error: any) {
      const errors: string[] = error.errors?.map((e: any) => e.message) ?? ["Validation error"];
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        status: STATUS.ERROR,
        message: ERROR_MESSAGES.VALIDATION_FAILED,
        errors,
      });
    }
  };
