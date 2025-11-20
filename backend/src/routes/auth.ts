import express from "express";
import { body } from "express-validator";
// import { register, login, refresh, logout } from "../controllers/authController";
import { validationResultHandler } from "../validators/validation";
import {
  login,
  logout,
  refresh,
  register,
} from "../controllers/authController";

const router = express.Router();

router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  validationResultHandler,
  register
);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").isString(),
  validationResultHandler,
  login
);

router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
