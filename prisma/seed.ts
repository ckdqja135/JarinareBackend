import "dotenv/config";

async function main() {}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
