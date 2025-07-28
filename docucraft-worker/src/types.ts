import { Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const AIResponse = z.object({
  text: Str(),
});

export const AIRequest = z.object({
  text: Str(),
});
