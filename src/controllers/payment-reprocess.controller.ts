import { Request, Response } from "express";
import prisma from "../config/prisma";
import { addPaymentEventToQueue } from "../services/payment-queue.service";
import { successResponse,errorResponse } from "../utils/apiResponse";

export const reprocessPaymentEvent = async (req: Request, res: Response) => {
  try {
    //const { paymentEventId } = req.params;
    //This fixes the issue where paymentEventId is of type string | undefined.
    //const paymentEventId = String(req.params.paymentEventId);
    const paymentEventId = String(req.params.id || req.params.paymentEventId);

    const event = await prisma.paymentEvent.findUnique({
      where: { id: paymentEventId },
    });

    if (!event) {
      return errorResponse(res, "Payment event not found", null, 404);
    }

    const job = await addPaymentEventToQueue(paymentEventId as string);

    return successResponse(res, "Payment event re-queued successfully", {
      jobId: job.id,
    });
  } catch (error: any) {
    return errorResponse(res, "Failed to reprocess payment event", error);
  }
};