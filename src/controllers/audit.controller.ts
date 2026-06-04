import { Request, Response } from "express";
import prisma from "../config/prisma";
import {successResponse, errorResponse } from "../utils/apiResponse";


// Returns system audit logs for debugging and traceability.
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(res, "Audit logs fetched successfully", {
      total: logs.length,
      logs,
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch audit logs", error);
  }
};