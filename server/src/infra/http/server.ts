import { env } from "../../config/env.js";
import { createApp } from "./app.js";

async function bootstrap() {
  const app = await createApp();
  await app.listen({
    port: env.PORT,
    host: "0.0.0.0",
  });
  app.log.info(`HTTP server running on port ${env.PORT}`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
