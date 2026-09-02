import type { Api } from "grammy";

import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  TYPE_LABELS,
} from "./product.constants.js";
import type { ProductDraft } from "./product.types.js";

const TELEGRAM_PHOTO_CAPTION_LIMIT = 1_024;

type ProductChannelErrorCode =
  | "CHANNEL_ID_MISSING"
  | "CHANNEL_ID_INVALID"
  | "CAPTION_TOO_LONG";

export class ProductChannelError extends Error {
  constructor(
    public readonly code: ProductChannelErrorCode,
    public readonly publicMessage: string,
  ) {
    super(code);
    this.name = "ProductChannelError";
  }
}

function getProductChannelId() {
  const channelId = process.env.PRODUCT_CHANNEL_ID?.trim();

  if (!channelId) {
    throw new ProductChannelError(
      "CHANNEL_ID_MISSING",
      "PRODUCT_CHANNEL_ID is missing from .env.",
    );
  }

  const isPublicUsername = /^@[a-zA-Z0-9_]{5,32}$/.test(channelId);

  const isNumericChannelId = /^-100\d+$/.test(channelId);

  if (!isPublicUsername && !isNumericChannelId) {
    throw new ProductChannelError(
      "CHANNEL_ID_INVALID",
      "Use @channel_username or a numeric channel ID such as -1001234567890.",
    );
  }

  return channelId;
}

function getProductPriceUnit() {
  return process.env.PRODUCT_PRICE_UNIT?.trim() || "Toman";
}

export function validateProductChannelConfiguration() {
  getProductChannelId();
}

function escapeHtmlCharacter(character: string) {
  switch (character) {
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    case '"':
      return "&quot;";
    default:
      return character;
  }
}

function escapeHtmlWithLimit(value: string, maximumEscapedLength: number) {
  const normalized = value.trim() || "None";
  let result = "";

  for (const character of normalized) {
    const escapedCharacter = escapeHtmlCharacter(character);

    if (result.length + escapedCharacter.length > maximumEscapedLength - 1) {
      return `${result}…`;
    }

    result += escapedCharacter;
  }

  return result;
}

function formatMoney(value: string | null) {
  if (!value) {
    return "None";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatProductChannelCaption(draft: ProductDraft) {
  const priceUnit = escapeHtmlWithLimit(getProductPriceUnit(), 20);

  const brandName = escapeHtmlWithLimit(draft.brandName, 90);

  const model = escapeHtmlWithLimit(draft.model, 110);

  const colors = escapeHtmlWithLimit(draft.colors?.join(", ") ?? "None", 160);

  const categoryLine =
    draft.type === "shoe" && draft.category
      ? `\n👟 <b>Category:</b> ${CATEGORY_LABELS[draft.category]}`
      : "";

  const captionWithoutDescription = `<b>📦 ${brandName} — ${model}</b>

🏷 <b>Type:</b> ${TYPE_LABELS[draft.type]}
🏭 <b>Brand:</b> ${brandName}
🧩 <b>Model:</b> ${model}${categoryLine}
👤 <b>Gender:</b> ${GENDER_LABELS[draft.gender]}
💰 <b>Price:</b> ${formatMoney(draft.price)} ${priceUnit}
🔥 <b>Discount price:</b> ${
    draft.discountPrice
      ? `${formatMoney(draft.discountPrice)} ${priceUnit}`
      : "None"
  }
🎨 <b>Colors:</b> ${colors}

📝 <b>Description:</b>
`;

  const availableDescriptionLength =
    TELEGRAM_PHOTO_CAPTION_LIMIT - captionWithoutDescription.length;

  if (availableDescriptionLength < 1) {
    throw new ProductChannelError(
      "CAPTION_TOO_LONG",
      "The product information is too long for a Telegram photo caption.",
    );
  }

  const description = escapeHtmlWithLimit(
    draft.description ?? "None",
    availableDescriptionLength,
  );

  return `${captionWithoutDescription}${description}`;
}

export function getProductChannelPublicMessage(error: unknown) {
  if (error instanceof ProductChannelError) {
    return error.publicMessage;
  }

  return "The channel post failed. Check PRODUCT_CHANNEL_ID and the bot's Post Messages permission.";
}

export async function publishProductToChannel(api: Api, draft: ProductDraft) {
  const message = await api.sendPhoto(
    getProductChannelId(),
    draft.photo.fileId,
    {
      caption: formatProductChannelCaption(draft),
      parse_mode: "HTML",
    },
  );

  const channelUsername =
    "username" in message.chat ? message.chat.username : undefined;

  return {
    chatId: String(message.chat.id),
    messageId: message.message_id,
    messageLink: channelUsername
      ? `https://t.me/${channelUsername}/${message.message_id}`
      : null,
  };
}
