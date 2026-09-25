const telegram = window.Telegram?.WebApp;
const form = document.querySelector("#productForm");
const typeInput = document.querySelector("#type");
const categoryField = document.querySelector("#categoryField");
const brandInput = document.querySelector("#brandName");
const brandOptions = document.querySelector("#brandOptions");
const brandHint = document.querySelector("#brandHint");
const imagesInput = document.querySelector("#images");
const photoHint = document.querySelector("#photoHint");
const photoPreview = document.querySelector("#photoPreview");
const resultBox = document.querySelector("#result");
const submitButton = document.querySelector("#submitButton");
const retryButton = document.querySelector("#retryButton");
const authNotice = document.querySelector("#authNotice");

const STORAGE_KEY = "emirwalk-product-upload-draft-v1";
const retainedFields = [
  "type",
  "brandName",
  "model",
  "category",
  "gender",
  "price",
  "discountPrice",
  "description",
];
const destinationLabels = {
  anilox: "انیلوکس",
  ebraha: "ابراهااستایل",
  telegram: "کانال تلگرام",
  instagram: "اینستاگرام",
};

let retryTargets = [];
let previewUrls = [];

telegram?.ready();
telegram?.expand();

if (!telegram?.initData) {
  authNotice.hidden = false;
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
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `خطای HTTP ${response.status}`);
  }

  return payload;
}

function setResult(message, state) {
  resultBox.hidden = false;
  resultBox.className = `result result--${state}`;
  resultBox.textContent = message;
}

function saveRetainedFields() {
  const values = {};

  for (const name of retainedFields) {
    const field = form.elements.namedItem(name);

    if (field && "value" in field) {
      values[name] = field.value;
    }
  }

  values.destinations = [
    ...form.querySelectorAll('input[name="destinations"]:checked'),
  ].map((input) => input.value);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

function restoreRetainedFields() {
  let values = {};

  try {
    values = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    values = {};
  }

  for (const name of retainedFields) {
    const field = form.elements.namedItem(name);

    if (field && "value" in field && typeof values[name] === "string") {
      field.value = values[name];
    }
  }

  if (Array.isArray(values.destinations)) {
    for (const input of form.querySelectorAll('input[name="destinations"]')) {
      input.checked = values.destinations.includes(input.value);
    }
  }
}

function updateCategoryVisibility() {
  const isShoe = typeInput.value === "shoe";
  categoryField.hidden = !isShoe;
  form.elements.category.disabled = !isShoe;
}

function clearPreviewUrls() {
  for (const url of previewUrls) {
    URL.revokeObjectURL(url);
  }

  previewUrls = [];
}

function updatePhotoPreview() {
  clearPreviewUrls();
  photoPreview.replaceChildren();
  const files = [...imagesInput.files];

  photoHint.textContent = files.length
    ? `${files.length} عکس انتخاب شده است`
    : "هنوز عکسی انتخاب نشده است";

  for (const file of files.slice(0, 10)) {
    const image = document.createElement("img");
    const url = URL.createObjectURL(file);
    previewUrls.push(url);
    image.src = url;
    image.alt = file.name;
    photoPreview.append(image);
  }
}

async function loadBrands() {
  try {
    const payload = await apiRequest("/api/brands");
    brandOptions.replaceChildren();

    for (const brand of payload.brands) {
      const option = document.createElement("option");
      option.value = brand.name;
      option.label = brand.sites
        .map((site) => destinationLabels[site])
        .join(" + ");
      brandOptions.append(option);
    }

    const warningSites = Object.keys(payload.warnings || {});
    brandHint.textContent = warningSites.length
      ? "فهرست یکی از سایت‌ها در دسترس نبود؛ فهرست سایت دیگر نمایش داده شد."
      : `${payload.brands.length} برند از اجتماع دو سایت`;
  } catch (error) {
    brandHint.textContent = "دریافت برندها ناموفق بود.";
    setResult(error.message, "error");
  }
}

function validateFiles() {
  const files = [...imagesInput.files];

  if (files.length < 1 || files.length > 10) {
    throw new Error("بین ۱ تا ۱۰ عکس انتخاب کنید.");
  }

  if (files.some((file) => file.size > 10 * 1024 * 1024)) {
    throw new Error("حجم هر عکس باید حداکثر ۱۰ مگابایت باشد.");
  }
}

function validateDestinations() {
  const selected = form.querySelectorAll(
    'input[name="destinations"]:checked',
  );

  if (selected.length === 0) {
    throw new Error("حداقل یک محل انتشار را انتخاب کنید.");
  }
}

function formatPublishResults(results) {
  return results
    .map((item) => {
      const label =
        destinationLabels[item.destination] || item.destination;

      if (item.status === "created") {
        return `✅ ${label}: منتشر شد — شناسه ${item.id || "برگردانده نشد"}`;
      }

      if (item.status === "brand_missing") {
        return `⚠️ ${label}: ابتدا برند را در این سایت اضافه کنید.`;
      }

      return `❌ ${label}: ${item.message || "انتشار ناموفق بود"}`;
    })
    .join("\n");
}

async function submitProduct(targets = []) {
  try {
    validateFiles();

    if (targets.length === 0) {
      validateDestinations();
    }
    submitButton.disabled = true;
    retryButton.disabled = true;
    setResult("در حال آپلود عکس‌ها و انتشار محصول…", "warning");

    const data = new FormData(form);

    for (const target of targets) {
      data.append("targets", target);
    }

    const payload = await apiRequest("/api/products", {
      method: "POST",
      body: data,
    });
    retryTargets = payload.retryTargets || [];
    const complete = payload.results.every((item) => item.status === "created");
    const extraMessage = complete
      ? "\n\nمشخصات مشترک برای محصول بعدی حفظ شد؛ رنگ و عکس جدید را وارد کنید."
      : retryTargets.length > 0
        ? "\n\nپس از افزودن برند، بدون تغییر رنگ و عکس روی تلاش مجدد بزنید."
        : "\n\nبه دلیل خطای ارتباطی، رنگ و عکس‌ها حفظ شدند. برای جلوگیری از ثبت تکراری، وضعیت سایت را بررسی کنید.";

    setResult(
      `${formatPublishResults(payload.results)}${extraMessage}`,
      complete ? "success" : "warning",
    );

    retryButton.hidden = retryTargets.length === 0;

    if (complete) {
      form.elements.colors.value = "";
      imagesInput.value = "";
      updatePhotoPreview();
    }

    saveRetainedFields();
    telegram?.HapticFeedback?.notificationOccurred(complete ? "success" : "warning");
  } catch (error) {
    setResult(error.message || "انتشار محصول ناموفق بود.", "error");
    telegram?.HapticFeedback?.notificationOccurred("error");
  } finally {
    submitButton.disabled = false;
    retryButton.disabled = false;
  }
}

form.addEventListener("input", saveRetainedFields);
form.addEventListener("change", saveRetainedFields);
typeInput.addEventListener("change", updateCategoryVisibility);
imagesInput.addEventListener("change", updatePhotoPreview);
form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  submitProduct();
});
retryButton.addEventListener("click", () => submitProduct(retryTargets));
window.addEventListener("pagehide", clearPreviewUrls);

restoreRetainedFields();
updateCategoryVisibility();
updatePhotoPreview();
loadBrands();
