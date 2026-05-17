require("dotenv").config({ path: "../../.env" });

const interval = Number(process.env.worker__interval_ms || 5000);

console.log("[worker] starting stub worker");

setInterval(() => {
  console.log("[worker] polling queue (stub)");
}, interval);
