// This script sends many demo payment requests to LedgerFlow.
//
// I use this to prove the system can process thousands of simulated
// payment reconciliation events through the API, BullMQ, Redis, workers,
// PostgreSQL, ledger creation, and audit logs.
const crypto = require("crypto");
const API_BASE_URL = process.env.API_BASE_URL || "https://ledgerflow-api-9ny8.onrender.com/api";

const TOTAL_EVENTS = Number(process.env.TOTAL_EVENTS || 5000);
const CONCURRENCY = Number(process.env.CONCURRENCY || 25);

let successCount = 0;
let failedCount = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendPayment = async (index) => {
    try {
        const response = await fetch(`${API_BASE_URL}/test/simulate-payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: 1000 + index,
                currency: "GBP",
                customerEmail: `loadtest-${index}@ledgerflow.dev`,
            }),
        });

        const result = await response.json();

        if (!response.ok || result.success === false) {
            failedCount++;
            console.log(`Failed ${index}:`, {
                message: result.message,
                error: result.error,
            }); return;
        }

        successCount++;

        if (successCount % 100 === 0) {
            console.log(`Sent ${successCount}/${TOTAL_EVENTS} payments`);
        }
    } catch (error) {
        failedCount++;
        console.log(`Request failed ${index}:`, error.message);
    }
};

const runLoadTest = async () => {
    // Future me:
    // We store the time the load test started
    // so we can calculate total duration later.
    const startTime = Date.now();
    console.log("Starting LedgerFlow load test");
    console.log(`API: ${API_BASE_URL}`);
    console.log(`Total events: ${TOTAL_EVENTS}`);
    console.log(`Concurrency: ${CONCURRENCY}`);

    const uniqueId = `${Date.now()}-${crypto.randomUUID()}`;

    for (let i = 1; i <= TOTAL_EVENTS; i += CONCURRENCY) {
        const batch = [];

        for (let j = i; j < i + CONCURRENCY && j <= TOTAL_EVENTS; j++) {
            batch.push(sendPayment(j));
        }

        await Promise.all(batch);

        // Small pause so we do not destroy free-tier Render/Postgres.
        await sleep(100);
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n Load test completed");
    console.log(`Successful requests: ${successCount}`);
    console.log(`Failed requests: ${failedCount}`);
    console.log(`Duration: ${durationSeconds}s`);
};

runLoadTest();