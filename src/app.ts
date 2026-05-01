import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import testRoutes from "./routes/test.routes";

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

export default app;