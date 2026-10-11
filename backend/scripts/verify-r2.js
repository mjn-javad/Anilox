require("dotenv").config();

const {
  getMissingConfigKeys,
  verifyConnection,
} = require("../services/r2Storage");

async function main() {
  const missingKeys = getMissingConfigKeys();

  if (missingKeys.length > 0) {
    throw new Error(`Missing R2 configuration: ${missingKeys.join(", ")}`);
  }

  await verifyConnection();
  console.log("Cloudflare R2 connection is ready.");
}

main().catch((error) => {
  console.error(`Cloudflare R2 verification failed: ${error.message}`);
  process.exitCode = 1;
});
