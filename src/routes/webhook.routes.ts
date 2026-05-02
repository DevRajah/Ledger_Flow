import { Router } from "express";
import { receivePaystackWebhook } from "../controllers/webhook.controller";
import { apiKeyAuth } from "../middlewares/apiKeyAuth";


const router = Router();

router.post("/paystack", apiKeyAuth, receivePaystackWebhook);

export default router;