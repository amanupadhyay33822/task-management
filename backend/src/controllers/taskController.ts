import { Request, Response } from "express";

// import { TaskStatus } from "@prisma/client";
import { prisma } from "../prisma";
import { TaskStatus } from "../generated/prisma/enums";

/**
 * GET /tasks
 * Query params: page (default 1), limit (default 10), status, search
 */
export async function listTasks(req: Request, res: Response) {
  const userId = req.user!.id;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 10);
  const status = (req.query.status as string) || undefined;
  const search = (req.query.search as string) || undefined;

  const where: any = { userId };

  if (status) {
    if (!["OPEN", "IN_PROGRESS", "DONE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }
    where.status = status;
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" } as any;
  }

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return res.json({
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: tasks,
  });
}

export async function createTask(req: Request, res: Response) {
  const userId = req.user!.id;
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  const task = await prisma.task.create({
    data: { title, description, userId },
  });

  return res.status(201).json(task);
}

export async function getTask(req: Request, res: Response) {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.userId !== userId) return res.status(404).json({ message: "Task not found" });

  return res.json(task);
}

export async function updateTask(req: Request, res: Response) {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return res.status(404).json({ message: "Task not found" });

  const { title, description, status } = req.body;
  if (status && !["OPEN", "IN_PROGRESS", "DONE"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { title: title ?? existing.title, description: description ?? existing.description, status: status ?? existing.status },
  });

  return res.json(updated);
}

export async function deleteTask(req: Request, res: Response) {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return res.status(404).json({ message: "Task not found" });

  await prisma.task.delete({ where: { id } });
  return res.status(204).send();
}

export async function toggleTask(req: Request, res: Response) {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return res.status(404).json({ message: "Task not found" });

  const newStatus = existing.status === "DONE" ? "OPEN" : "DONE";

  const updated = await prisma.task.update({ where: { id }, data: { status: newStatus as TaskStatus } });
  return res.json(updated);
}
