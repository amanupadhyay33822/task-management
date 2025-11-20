import express from "express";
import { requireAuth } from "../middleware/auth";
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  toggleTask,
} from "../controllers/taskController";
import { body, param } from "express-validator";
import { validationResultHandler } from "../validators/validation";

const router = express.Router();

router.use(requireAuth);

router.get("/", listTasks);

router.post(
  "/",
  body("title").isString().notEmpty(),
  validationResultHandler,
  createTask
);

router.get("/:id", param("id").isInt(), validationResultHandler, getTask);

router.patch(
  "/:id",
  param("id").isInt(),
  body("title").optional().isString(),
  body("description").optional().isString(),
  body("status").optional().isIn(["OPEN", "IN_PROGRESS", "DONE"]),
  validationResultHandler,
  updateTask
);

router.delete("/:id", param("id").isInt(), validationResultHandler, deleteTask);

router.post(
  "/:id/toggle",
  param("id").isInt(),
  validationResultHandler,
  toggleTask
);

export default router;
