import { Composer, type Context } from "grammy";

import { startCommand } from "./commands/start.command.js";
import { profileCommand } from "./commands/profile.command.js";
import type { AppContext } from "../../types/context.js";

export const userModule = new Composer<AppContext>();

userModule.command("start", startCommand);

userModule.command("profile", profileCommand);
