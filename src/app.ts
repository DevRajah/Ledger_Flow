import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import testRoutes from "./routes/test.routes";
import webhookRoutes from "./routes/webhook.routes";
import paymentEventRoutes from "./routes/payment-event.routes";
import auditRoutes from "./routes/audit.routes";
import ledgerRoutes from "./routes/ledger.routes";

// Create the Express app
const app = express();

// Security middleware
app.use(helmet());

// Allow frontend/client apps to call our backend
app.use(cors());

// Allow backend to receive JSON data
app.use(express.json());

// Log requests in the terminal during development
app.use(morgan("dev"));

// Simple health route to confirm server is alive
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "LedgerFlow API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Use the test routes
app.use("/api/test", testRoutes);

// Use the webhook routes
app.use("/api/webhooks", webhookRoutes);

// Use the payment event routes
app.use("/api/payment-events", paymentEventRoutes);

// Use the audit routes
app.use("/api/audit-logs", auditRoutes);

// Use the ledger routes
app.use("/api/ledger", ledgerRoutes);


export default app;