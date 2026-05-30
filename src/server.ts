import dotenv from "dotenv";
import app from "./app";
import "./workers/payment.worker";


dotenv.config();

const PORT = process.env.PORT || 5700;


app.listen(PORT, () => {
  console.log(`LedgerFlow server running on port ${PORT}`);
});