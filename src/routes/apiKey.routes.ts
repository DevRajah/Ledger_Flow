import { Router } from "express";
import { createApiKey } from "../controllers/apiKey.controller";

const router = Router();

// POST /api/api-keys
router.post("/", createApiKey);

export default router;