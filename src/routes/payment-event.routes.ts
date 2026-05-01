import { Router } from "express";
import { getPaymentEvents } from "../controllers/payment-event.controller";

const router = Router();

router.get("/", getPaymentEvents);

export default router;