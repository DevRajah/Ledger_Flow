import { Request, Response } from "express";
import prisma from "../config/prisma";
import { addPaymentEventToQueue } from "../services/payment-queue.service";

export const reprocessPaymentEvent = async (req: Request, res: Response) => {
  try {
    //const { paymentEventId } = req.params;
    //This fixes the issue where paymentEventId is of type string | undefined.
    const paymentEventId = String(req.params.paymentEventId);

    const event = await prisma.paymentEvent.findUnique({
      where: { id: paymentEventId },
    });

    if (!event) {
      return res.status(404).json({
        message: "Payment event not found",
      });
    }

    const job = await addPaymentEventToQueue(paymentEventId as string);

    return res.status(200).json({
      message: "Payment event re-queued successfully",
      jobId: job.id,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to reprocess payment event",
      error: error.message,
    });
  }
};