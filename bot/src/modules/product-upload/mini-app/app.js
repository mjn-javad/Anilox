const telegram = window.Telegram?.WebApp;
const form = document.querySelector("#productForm");
const typeInput = document.querySelector("#type");
const categoryField = document.querySelector("#categoryField");
const categoryInput = document.querySelector("#category");
const addToSaleInput = document.querySelector("#addToSale");
const brandInput = document.querySelector("#brandName");
const brandHint = document.querySelector("#brandHint");
const variantsContainer = document.querySelector("#variants");
const addVariantButton = document.querySelector("#addVariantButton");
const resultBox = document.querySelector("#result");
const submitButton = document.querySelector("#submitButton");
const authNotice = document.querySelector("#authNotice");

const STORAGE_KEY = "emirwalk-product-upload-common-v3";
const MAX_VARIANTS = 20;
const fallbackColors = [
  "Black", "White", "Gray", "Navy", "Blue", "Brown", "Beige", "Cream",
  "Red", "Burgundy", "Green", "Olive", "Yellow", "Orange", "Pink",
  "Purple", "Gold", "Silver", "Multicolor",
];
const colorValues = {
  Black: "#000000", White: "#ffffff", Gray: "#808080", Navy: "#0b1f3a",
  Blue: "#2563eb", Brown: "#7c3f1d", Beige: "#d8b58a", Cream: "#fffdd0",
  Red: "#dc2626", Burgundy: "#800020", Green: "#16a34a", Olive: "#808000",
  Yellow: "#facc15", Orange: "#f97316", Pink: "#ec4899", Purple: "#9333ea",
  Gold: "#d4af37", Silver: "#c0c0c0",
  Multicolor: "conic-gradient(#ef4444, #facc15, #22c55e, #3b82f6, #a855f7, #ef4444)",
};
const retainedFields = [
  "type", "brandName", "model", "category", "gender", "price",
  "discountPrice", "description",
];
const destinationLabels = {
  anilox: "Anilox",
  ebraha: "EbrahaStyle",
  telegram: "Telegram",
  instagram: "Instagram",
};
const launchParameters = new URLSearchParams(window.location.search);
const launchToken = launchParameters.get("launch") || "";

let colorOptions = [...fallbackColors];
let savedDraft = readSavedDraft();
let nextVariantId = 1;
let isSubmitting = false;
const variants = new Map();

telegram?.ready();
telegram?.expand();

if (launchToken) {
  window.history.replaceState({}, "", `${window.location.pathname}${window.location.hash}`);
}

function apiUrl(path) {
  const basePath = window.location.pathname.replace(/\/+$/, "");
  return `${basePath}${path}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      "X-Telegram-Init-Data": telegram?.initData || "",
      "X-Mini-App-Launch-Token": launchToken,
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      authNotice.hidden = false;
    }
    throw new Error(payload.error || `HTTP error ${response.status}`);
  }

  return payload;
}

function setResult(message, state) {
  resultBox.hidden = false;
  resultBox.className = `message message--${state}`;
  resultBox.textContent = message;
}

function readSavedDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveCommonFields() {
  const values = {};

  for (const name of retainedFields) {
    const field = form.elements.namedItem(name);
    if (field && "value" in field) values[name] = field.value;
  }

  values.destinations = [
    ...form.querySelectorAll('input[name="destinations"]:checked'),
  ].map((input) => input.value);
  values.addToSale = Boolean(addToSaleInput?.checked);

  savedDraft = values;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

function restoreCommonFields() {
  for (const name of retainedFields) {
    if (name === "brandName") continue;
    const field = form.elements.namedItem(name);
    if (field && "value" in field && typeof savedDraft[name] === "string") {
      field.value = savedDraft[name];
    }
  }

  if (Array.isArray(savedDraft.destinations)) {
    for (const input of form.querySelectorAll('input[name="destinations"]')) {
      input.checked = savedDraft.destinations.includes(input.value);
    }
  }

  if (addToSaleInput) {
    addToSaleInput.checked = savedDraft.addToSale === true;
  }
}

function updateCategoryVisibility() {
  const isShoe = typeInput.value === "shoe";
  categoryField.hidden = !isShoe;
  categoryInput.disabled = !isShoe;
  categoryInput.required = isShoe;
  if (addToSaleInput) {
    const gender = form.elements.namedItem("gender")?.value;
    addToSaleInput.disabled = !isShoe || gender === "female";
    if (addToSaleInput.disabled) addToSaleInput.checked = false;
  }
}

function selectedDestinations() {
  return [...form.querySelectorAll('input[name="destinations"]:checked')].map(
    (input) => input.value,
  );
}

function updateColorSwatch(variant) {
  const custom = variant.colorSelect.value === "__custom__";
  variant.customInput.hidden = !custom;
  variant.customInput.required = custom;
  const color = custom ? variant.customInput.value.trim() : variant.colorSelect.value;
  const value = colorValues[color] || "#e5e7eb";
  variant.swatch.style.background = value;
  variant.swatch.classList.toggle("color-swatch--light", color === "White" || color === "Cream");
}

function currentColor(variant) {
  return variant.colorSelect.value === "__custom__"
    ? variant.customInput.value.trim()
    : variant.colorSelect.value;
}

function fillColorSelect(select, selectedValue) {
  select.replaceChildren();
  for (const color of colorOptions) select.add(new Option(color, color));
  select.add(new Option("Custom color...", "__custom__"));
  select.value = colorOptions.includes(selectedValue) ? selectedValue : "__custom__";
}

function nextUnusedColor() {
  const used = new Set(
    [...variants.values()].map((variant) => currentColor(variant).toLowerCase()),
  );
  return colorOptions.find((color) => !used.has(color.toLowerCase())) || colorOptions[0] || "Black";
}

function clearPreviewUrls(variant) {
  for (const url of variant.previewUrls) URL.revokeObjectURL(url);
  variant.previewUrls = [];
}

function updatePhotoPreview(variant) {
  clearPreviewUrls(variant);
  variant.preview.replaceChildren();
  const files = [...variant.fileInput.files];
  variant.photoLabel.textContent = files.length ? `${files.length} photo(s)` : "+ Add Photos";

  for (const file of files.slice(0, 10)) {
    const image = document.createElement("img");
    const url = URL.createObjectURL(file);
    variant.previewUrls.push(url);
    image.src = url;
    image.alt = file.name;
    variant.preview.append(image);
  }
}

function setVariantStatus(variant, message, state = "info") {
  variant.status.hidden = !message;
  variant.status.className = `variant-status variant-status--${state}`;
  variant.status.textContent = message;
}

function updateVariantNumbers() {
  [...variants.values()].forEach((variant, index) => {
    variant.number.textContent = String(index + 1);
  });
  updateSubmitLabel();
}

function updateSubmitLabel() {
  const failed = [...variants.values()].filter((variant) => variant.retryTargets.length > 0).length;
  const count = variants.size;
  submitButton.textContent = isSubmitting
    ? "Publishing Products..."
    : failed > 0
      ? `Retry Failed Products (${failed})`
      : `Create All Products (${count} color${count === 1 ? "" : "s"})`;
}

function removeVariant(variant) {
  clearPreviewUrls(variant);
  variants.delete(variant.id);
  variant.row.remove();
  updateVariantNumbers();
}

function createVariant(selectedColor = nextUnusedColor()) {
  if (variants.size >= MAX_VARIANTS) {
    setResult(`You can create at most ${MAX_VARIANTS} color variants at once.`, "error");
    return null;
  }

  const id = nextVariantId++;
  const row = document.createElement("article");
  row.className = "variant-row";
  row.innerHTML = `
    <div class="variant-number"></div>
    <div class="color-picker">
      <span class="color-swatch" aria-hidden="true"></span>
      <select aria-label="Product color"></select>
      <input class="custom-color" maxlength="50" placeholder="Custom color" hidden />
    </div>
    <div class="variant-photos">
      <div class="variant-preview"></div>
      <label class="add-photos">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple />
        <span>+ Add Photos</span>
      </label>
    </div>
    <button type="button" class="remove-variant" aria-label="Remove color">×</button>
    <div class="variant-status" hidden></div>
  `;

  const variant = {
    id,
    row,
    number: row.querySelector(".variant-number"),
    swatch: row.querySelector(".color-swatch"),
    colorSelect: row.querySelector("select"),
    customInput: row.querySelector(".custom-color"),
    fileInput: row.querySelector('input[type="file"]'),
    photoLabel: row.querySelector(".add-photos span"),
    preview: row.querySelector(".variant-preview"),
    status: row.querySelector(".variant-status"),
    retryTargets: [],
    previewUrls: [],
  };

  fillColorSelect(variant.colorSelect, selectedColor);
  if (!colorOptions.includes(selectedColor)) variant.customInput.value = selectedColor;
  updateColorSwatch(variant);

  variant.colorSelect.addEventListener("change", () => {
    updateColorSwatch(variant);
    setVariantStatus(variant, "");
  });
  variant.customInput.addEventListener("input", () => {
    updateColorSwatch(variant);
    setVariantStatus(variant, "");
  });
  variant.fileInput.addEventListener("change", () => {
    updatePhotoPreview(variant);
    setVariantStatus(variant, "");
  });
  row.querySelector(".remove-variant").addEventListener("click", () => removeVariant(variant));

  variants.set(id, variant);
  variantsContainer.append(row);
  updateVariantNumbers();
  return variant;
}

function addVariants(count) {
  for (let index = 0; index < count && variants.size < MAX_VARIANTS; index += 1) {
    createVariant();
  }
}

function isSupportedImage(file) {
  return /^image\/(?:jpeg|png|webp|heic|heif)$/i.test(file.type) ||
    /\.(?:jpe?g|png|webp|heic|heif)$/i.test(file.name);
}

function validateVariant(variant) {
  const color = currentColor(variant);
  const files = [...variant.fileInput.files];

  if (!color || color.length > 50) throw new Error("Select or enter a valid color.");
  if (files.length < 1 || files.length > 10) throw new Error("Select 1 to 10 photos for this color.");
  if (files.some((file) => file.size < 1 || file.size > 10 * 1024 * 1024)) {
    throw new Error("Each photo must be 10 MB or smaller.");
  }
  if (files.some((file) => !isSupportedImage(file))) {
    throw new Error("Use JPEG, PNG, WebP, HEIC, or HEIF photos.");
  }

  return { color, files };
}

function createVariantFormData(variant, color, files) {
  const data = new FormData();
  for (const name of ["type", "brandName", "model", "gender", "price", "discountPrice", "description"]) {
    const field = form.elements.namedItem(name);
    if (field?.value) data.append(name, field.value);
  }
  if (typeInput.value === "shoe") data.append("category", categoryInput.value);
  if (addToSaleInput?.checked) data.append("addToSale", "true");
  data.append("colors", color);
  for (const file of files) data.append("images", file);

  if (variant.retryTargets.length > 0) {
    for (const target of variant.retryTargets) data.append("targets", target);
  } else {
    for (const destination of selectedDestinations()) data.append("destinations", destination);
  }
  return data;
}

function formatPublishResults(results) {
  return results.map((item) => {
    const label = destinationLabels[item.destination] || item.destination;
    if (item.status === "created") return `✓ ${label}`;
    if (item.status === "brand_missing") return `! ${label}: add the brand, then retry`;
    return `× ${label}: ${item.message || "Publishing failed"}`;
  }).join("\n");
}

async function publishVariant(variant) {
  const { color, files } = validateVariant(variant);
  setVariantStatus(variant, `Publishing ${color}...`, "info");
  const payload = await apiRequest("/api/products", {
    method: "POST",
    body: createVariantFormData(variant, color, files),
  });
  const complete = payload.results.length > 0 && payload.results.every((item) => item.status === "created");

  if (complete) {
    setVariantStatus(variant, `${color} published successfully.`, "success");
    removeVariant(variant);
    return true;
  }

  variant.retryTargets = payload.retryTargets || [];
  setVariantStatus(variant, formatPublishResults(payload.results), "error");
  updateSubmitLabel();
  return false;
}

async function publishAllVariants() {
  if (isSubmitting) return;
  if (!form.reportValidity()) return;
  if (selectedDestinations().length === 0 && ![...variants.values()].some((item) => item.retryTargets.length)) {
    setResult("Select at least one publication destination.", "error");
    return;
  }
  if (variants.size === 0) createVariant();

  isSubmitting = true;
  submitButton.disabled = true;
  updateSubmitLabel();
  saveCommonFields();
  let succeeded = 0;
  let failed = 0;

  for (const variant of [...variants.values()]) {
    try {
      if (await publishVariant(variant)) succeeded += 1;
      else failed += 1;
    } catch (error) {
      failed += 1;
      setVariantStatus(variant, error.message || "Publishing failed.", "error");
    }
  }

  if (variants.size === 0) createVariant();
  setResult(
    failed
      ? `${succeeded} product(s) published. ${failed} failed product(s) remain below with their photos.`
      : `${succeeded} product(s) published successfully. Common product information was kept.`,
    failed ? "info" : "success",
  );
  telegram?.HapticFeedback?.notificationOccurred(failed ? "warning" : "success");
  isSubmitting = false;
  submitButton.disabled = false;
  updateSubmitLabel();
}

async function loadCatalog() {
  try {
    const payload = await apiRequest("/api/brands");
    brandInput.replaceChildren(new Option("Select Brand", ""));
    for (const brand of payload.brands) brandInput.add(new Option(brand.name, brand.name));
    if (Array.isArray(payload.colorOptions) && payload.colorOptions.length) {
      colorOptions = payload.colorOptions;
    }
    if (typeof savedDraft.brandName === "string") brandInput.value = savedDraft.brandName;
    brandInput.disabled = false;
    brandHint.textContent = `${payload.brands.length} brands loaded.`;
  } catch (error) {
    brandInput.innerHTML = '<option value="">Could not load brands</option>';
    brandHint.textContent = "Could not load brands.";
    setResult(error.message, "error");
  }
}

form.addEventListener("input", saveCommonFields);
form.addEventListener("change", saveCommonFields);
typeInput.addEventListener("change", updateCategoryVisibility);
form.elements.namedItem("gender")?.addEventListener("change", updateCategoryVisibility);
addVariantButton.addEventListener("click", () => createVariant());
for (const button of document.querySelectorAll("[data-add-count]")) {
  button.addEventListener("click", () => addVariants(Number(button.dataset.addCount)));
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  publishAllVariants();
});
window.addEventListener("pagehide", () => {
  for (const variant of variants.values()) clearPreviewUrls(variant);
});

restoreCommonFields();
updateCategoryVisibility();
loadCatalog().finally(() => createVariant());
