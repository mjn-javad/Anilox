import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  TYPE_LABELS,
} from "./product.constants.js";
import type { ProductDraft } from "./product.types.js";

function formatMoney(value: string | null) {
  if (!value) {
    return "None";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatProductSummary(
  draft: ProductDraft,
  backendProductId?: string | null,
) {
  const categoryLine =
    draft.type === "shoe" && draft.category
      ? `\nCategory: ${CATEGORY_LABELS[draft.category]}`
      : "";

  return `📦 Product details

Backend ID: ${backendProductId ?? "Not returned"}
Type: ${TYPE_LABELS[draft.type]}
Brand: ${draft.brand}
Model: ${draft.model}${categoryLine}
Gender: ${GENDER_LABELS[draft.gender]}
Price: ${formatMoney(draft.price)}
Discount price: ${formatMoney(draft.discountPrice)}
Colors: ${draft.colors?.join(", ") ?? "None"}

Description:
${draft.description ?? "None"}`;
}
