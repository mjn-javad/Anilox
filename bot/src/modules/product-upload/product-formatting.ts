export function isContactUsPrice(value: string | null) {
  return value !== null && Number(value) === 1;
}

export function formatProductPrice(value: string | null, unit?: string) {
  if (!value) {
    return "None";
  }

  if (isContactUsPrice(value)) {
    return "Contact us";
  }

  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(Number(value));

  return unit ? `${formatted} ${unit}` : formatted;
}

export function getModelHashtag(model: string) {
  const normalizedModel = model.trim().toLocaleLowerCase("en-US");
  const correctedModel = normalizedModel === "frndi" ? "fendi" : normalizedModel;
  const hashtagValue = correctedModel
    .replace(/[^\p{L}\p{N}_]+/gu, "")
    .replace(/^_+|_+$/g, "");

  return hashtagValue ? `#${hashtagValue}` : "";
}
