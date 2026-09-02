import type { Context, SessionFlavor } from "grammy";

import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";

import type { I18nFlavor } from "@grammyjs/i18n";

import type { FileFlavor } from "@grammyjs/files";

import type { SessionData } from "./session.js";

export type BaseContext = FileFlavor<
  Context & SessionFlavor<SessionData> & I18nFlavor
>;

export type AppContext = ConversationFlavor<BaseContext>;

export type AppConversationContext = FileFlavor<Context & I18nFlavor>;

export type AppConversation = Conversation<AppContext, AppConversationContext>;
