import { session } from "grammy";

import type { AppContext } from "../types/context.js";

import { createInitialSession } from "../session/create-initial-session.js";

export const sessionMiddleware = session({
  initial: createInitialSession,
});
