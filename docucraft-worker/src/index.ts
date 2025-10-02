import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { AiCreateMultiple } from "./endpoints/aiCreateMultiple";
import { AiCreateERD } from "./endpoints/aiCreateERD";
import { AiCreateArchitecture } from "./endpoints/aiCreateArchitecture";
import { AiCreateC4 } from "./endpoints/aiCreateC4";
import { AiCreateUserStories } from "./endpoints/aiCreateUserStories";
import { AiCreateGantt } from "./endpoints/aiCreateGantt";
import { AiCreateKanban } from "./endpoints/aiCreateKanban";
import { CreatePaymentIntent } from "./endpoints/createPaymentIntent";
import { env } from "cloudflare:workers";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Add CORS middleware
let originValue;
try {
  originValue = JSON.parse(env.ORIGIN);
} catch {
  originValue = env.ORIGIN;
}
app.use(
  "*",
  cors({
    origin: originValue,
    allowMethods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post("/api/ai", AiCreateMultiple);
openapi.post("/api/ai/erd", AiCreateERD);
openapi.post("/api/ai/architecture", AiCreateArchitecture);
openapi.post("/api/ai/c4", AiCreateC4);
openapi.post("/api/ai/user-stories", AiCreateUserStories);
openapi.post("/api/ai/gantt", AiCreateGantt);
openapi.post("/api/ai/kanban", AiCreateKanban);
openapi.post("/api/payments", CreatePaymentIntent);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
