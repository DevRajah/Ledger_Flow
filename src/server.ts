import dotenv from "dotenv";
import app from "./app";

// Load .env variables
dotenv.config();

const PORT = process.env.PORT || 5700;

// Start the server
app.listen(PORT, () => {
  console.log(`LedgerFlow server running on port ${PORT}`);
});