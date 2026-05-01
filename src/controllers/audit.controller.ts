import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      total: logs.length,
      logs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch audit logs",
    });
  }
};