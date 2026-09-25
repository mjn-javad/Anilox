import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  TYPE_LABELS,
} from "./product.constants.js";
import type { ProductDraft } from "./product.types.js";
import type { ProductSitePublishResult } from "./product.types.js";
import { PRODUCT_SITE_LABELS } from "./product-backend.api.js";

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
  publishResults: readonly ProductSitePublishResult[] = [],
) {
  const categoryLine =
    draft.type === "shoe" && draft.category
      ? `\nCategory: ${CATEGORY_LABELS[draft.category]}`
      : "";

  const backendLines = publishResults
    .map((result) => {
      const status =
        result.status === "created"
          ? `ID: ${result.id ?? "Not returned"}`
          : result.status === "brand_missing"
            ? "Brand missing"
            : "Publish failed";

      return `${PRODUCT_SITE_LABELS[result.site]}: ${status}`;
    })
    .join("\n");

  return `📦 Product details

${backendLines || "Website publication: Not attempted"}
Type: ${TYPE_LABELS[draft.type]}
Brand: ${draft.brandName}
Model: ${draft.model}${categoryLine}
Gender: ${GENDER_LABELS[draft.gender]}
Price: ${formatMoney(draft.price)}
Discount price: ${formatMoney(draft.discountPrice)}
Colors: ${draft.colors?.join(", ") ?? "None"}

Description:
${draft.description ?? "None"}`;
}
