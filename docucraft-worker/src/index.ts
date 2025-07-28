import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AiCreate } from "./endpoints/aiCreate";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Add CORS middleware
app.use(
  "*",
  cors({
    origin: ["https://docucraft-app.joaquinarturoaprendizaje.workers.dev"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post("/api/ai", AiCreate);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
