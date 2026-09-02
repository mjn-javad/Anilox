import type { SessionData } from "../types/session.js";

export function createInitialSession(): SessionData {
  return {
    registration: {
      step: "idle",
    },
  };
}
