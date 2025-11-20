import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export function validationResultHandler(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => ({ msg: e.msg, param: e.param })) });
  }
  next();
}
