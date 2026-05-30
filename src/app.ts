import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import testRoutes from "./routes/test.routes";
import webhookRoutes from "./routes/webhook.routes";
import paymentEventRoutes from "./routes/payment-event.routes";
import auditRoutes from "./routes/audit.routes";
import ledgerRoutes from "./routes/ledger.routes";
import settlementRoutes from "./routes/settlement.routes";
import reconciliationRoutes from "./routes/reconciliation.routes";
import queueRoutes from "./routes/queue.routes";
import paymentReprocessRoutes from "./routes/payment-reprocess.routes";
import queueDebugRoutes from "./routes/queue-debug.routes";
import metricsRoutes from "./routes/metrics.routes";
import { apiRateLimiter } from "./middlewares/rateLimiter";
import apiKeyRoutes from "./routes/apiKey.routes";



const app = express();


app.use(helmet());


app.use(cors());


app.use(express.json());


app.use(morgan("dev"));

// Simple health route to confirm server is alive
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "LedgerFlow API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});


app.use("/api/test", testRoutes);


app.use("/api/webhooks", webhookRoutes);


app.use("/api/payment-events", paymentEventRoutes);


app.use("/api/audit-logs", auditRoutes);


app.use("/api/ledger", ledgerRoutes);


app.use("/api/settlements", settlementRoutes);


app.use("/api/reconciliation", reconciliationRoutes);


app.use("/api/queues", queueRoutes);


app.use("/api/payments", paymentReprocessRoutes);


app.use("/api/queues", queueDebugRoutes);


app.use("/api/metrics", metricsRoutes);


app.use("/api/", apiRateLimiter);


app.use("/api/api-keys", apiKeyRoutes);


export default app;