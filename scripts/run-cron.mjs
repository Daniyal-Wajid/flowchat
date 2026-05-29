/**
 * Local test for reminder cron.
 * Usage: npm run cron:reminders
 */
import "dotenv/config";

const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("Set CRON_SECRET in .env");
  process.exit(1);
}

const res = await fetch(`${baseUrl}/api/cron/reminders`, {
  headers: { Authorization: `Bearer ${secret}` },
});

const data = await res.json();
console.log(res.status, JSON.stringify(data, null, 2));
