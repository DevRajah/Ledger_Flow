import prisma from "../config/prisma";

// This service records important system actions.
// Example: webhook received, duplicate detected, payment saved.
export const createAuditLog = async (data: {
  action: string;
  entityType: string;
  entityId?: string;
  actor?: string;
  metadata?: any;
}) => {
  return prisma.auditLog.create({
    data: {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      actor: data.actor || "SYSTEM",
      metadata: data.metadata || {},
    },
  });
};