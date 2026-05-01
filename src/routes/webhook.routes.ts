import { Router } from "express";
import { receivePaystackWebhook } from "../controllers/webhook.controller";

const router = Router();

router.post("/paystack", receivePaystackWebhook);

export default router;