import { Keyboard } from "grammy";

import type {
  AppConversation,
  AppConversationContext,
} from "../../types/context.js";

import {
  PRODUCT_SITE_LABELS,
  getProductBackendPublicMessage,
  productBackendApi,
  validateProductBackendConfiguration,
} from "./product-backend.api.js";

import {
  CATEGORY_LABELS,
  CONFIRM_INPUT,
  GENDER_LABELS,
  PRODUCT_CATEGORIES,
  PRODUCT_COLOR_OPTIONS,
  PRODUCT_GENDERS,
  PRODUCT_TYPES,
  SKIP_INPUT,
  TYPE_LABELS,
  type ProductCategory,
  type ProductGender,
  type ProductType,
} from "./product.constants.js";

import {
  formatProductChannelCaption,
  getProductChannelPublicMessage,
  publishProductToChannel,
  validateProductChannelConfiguration,
} from "./product-channel.js";

import {
  CUSTOM_COLOR_BUTTON,
  CUSTOM_MODEL_BUTTON,
  DONE_COLORS_BUTTON,
  NEXT_PAGE_BUTTON,
  PREVIOUS_PAGE_BUTTON,
  createChoiceKeyboard,
  createColorKeyboard,
  createConfirmKeyboard,
  createPaginatedChoiceKeyboard,
  createSkipKeyboard,
  findColorFromButton,
  type ChoiceOption,
} from "./product-keyboards.js";

import { isProductAdmin } from "./product-upload.auth.js";
import { ProductUploadError } from "./product-upload.error.js";
import { formatProductSummary } from "./product-summary.js";
import {
  getMissingBrandInstruction,
  queueProductPublicationRetry,
} from "./product-publish-retry.js";

import {
  getProductInstagramPublicMessage,
  isProductInstagramPublishingEnabled,
  publishProductToInstagram,
  validateProductInstagramConfiguration,
} from "./product-instagram.js";

import {
  normalizeProductDraft,
  validateCategory,
  validateCustomColor,
  validateDescription,
  validateDiscountPrice,
  validateGender,
  validateModel,
  validateMoney,
  validateSelectedColors,
  validateType,
} from "./product.validation.js";

import type {
  BrandOption,
  ProductDraft,
  ProductPublishDestination,
  ProductSiteId,
  ProductSitePublishResult,
} from "./product.types.js";

const PAGINATED_OPTIONS_PER_PAGE = 8;
const MAX_PRODUCT_PHOTOS = 10;
const DONE_PHOTOS_INPUT = "✅ Done adding photos";
const DONE_DESTINATIONS_INPUT = "✅ تأیید مقصدهای انتشار";

const PUBLISH_DESTINATIONS: ReadonlyArray<{
  label: string;
  value: ProductPublishDestination;
}> = [
  { value: "anilox", label: "سایت انیلوکس" },
  { value: "ebraha", label: "سایت ابراهااستایل" },
  { value: "telegram", label: "کانال تلگرام" },
  { value: "instagram", label: "اینستاگرام" },
];

type TextValidator<T> = (value: string) => T;

function removeKeyboard() {
  return {
    remove_keyboard: true as const,
  };
}

async function askText<T>(
  conversation: AppConversation,
  ctx: AppConversationContext,
  prompt: string,
  validator: TextValidator<T>,
  keyboard?: Keyboard,
) {
  while (true) {
    await ctx.reply(prompt, {
      reply_markup: keyboard ?? removeKeyboard(),
    });

    const value = (await conversation.form.text()).trim();

    try {
      return validator(value);
    } catch (error) {
      const message =
        error instanceof ProductUploadError
          ? error.publicMessage
          : "The entered value is invalid.";

      await ctx.reply(`❌ ${message}`);
    }
  }
}

async function askOptionalText(
  conversation: AppConversation,
  ctx: AppConversationContext,
  prompt: string,
  validator: (value: string | null) => string | null,
) {
  return askText(
    conversation,
    ctx,
    prompt,
    (value) => {
      return validator(value === SKIP_INPUT ? null : value);
    },
    createSkipKeyboard(SKIP_INPUT),
  );
}

async function askChoice<T extends string>(
  conversation: AppConversation,
  ctx: AppConversationContext,
  prompt: string,
  options: readonly ChoiceOption<T>[],
) {
  while (true) {
    await ctx.reply(prompt, {
      reply_markup: createChoiceKeyboard(options),
    });

    const answer = (await conversation.form.text()).trim();

    const selected = options.find((option) => {
      return option.label === answer || option.value === answer;
    });

    if (selected) {
      return selected.value;
    }

    await ctx.reply("❌ Select one of the keyboard options.");
  }
}

async function askPaginatedStringChoice(
  conversation: AppConversation,
  ctx: AppConversationContext,
  prompt: string,
  options: readonly string[],
  allowCustom: boolean,
) {
  let page = 0;

  const totalPages = Math.max(
    1,
    Math.ceil(options.length / PAGINATED_OPTIONS_PER_PAGE),
  );

  while (true) {
    await ctx.reply(`${prompt}\nPage ${page + 1} of ${totalPages}`, {
      reply_markup: createPaginatedChoiceKeyboard(
        options,
        page,
        PAGINATED_OPTIONS_PER_PAGE,
        allowCustom,
      ),
    });

    const answer = (await conversation.form.text()).trim();

    if (answer === NEXT_PAGE_BUTTON && page < totalPages - 1) {
      page += 1;
      continue;
    }

    if (answer === PREVIOUS_PAGE_BUTTON && page > 0) {
      page -= 1;
      continue;
    }

    if (allowCustom && answer === CUSTOM_MODEL_BUTTON) {
      return null;
    }

    const selected = options.find((option) => option === answer);

    if (selected) {
      return selected;
    }

    await ctx.reply("❌ Select an option from the keyboard.");
  }
}

function toggleColor(selectedColors: string[], color: string) {
  const index = selectedColors.findIndex(
    (item) =>
      item.toLocaleLowerCase("en-US") === color.toLocaleLowerCase("en-US"),
  );

  if (index >= 0) {
    selectedColors.splice(index, 1);
    return;
  }

  selectedColors.push(color);
}

async function askColors(
  conversation: AppConversation,
  ctx: AppConversationContext,
) {
  const selectedColors: string[] = [];
  const customColors: string[] = [];

  while (true) {
    const availableColors = [...PRODUCT_COLOR_OPTIONS, ...customColors];

    await ctx.reply(
      `Select one or more colors.
Press a color again to remove it.
Use Custom color for another value.
Press Done when finished.

Selected: ${selectedColors.join(", ") || "None"}`,
      {
        reply_markup: createColorKeyboard(availableColors, selectedColors),
      },
    );

    const answer = (await conversation.form.text()).trim();

    if (answer === DONE_COLORS_BUTTON) {
      try {
        return validateSelectedColors(selectedColors);
      } catch (error) {
        const message =
          error instanceof ProductUploadError
            ? error.publicMessage
            : "The selected colors are invalid.";

        await ctx.reply(`❌ ${message}`);
        continue;
      }
    }

    if (answer === CUSTOM_COLOR_BUTTON) {
      const customColor = await askText(
        conversation,
        ctx,
        "Type the custom color name:",
        validateCustomColor,
      );

      const alreadyAvailable = availableColors.some((color) => {
        return (
          color.toLocaleLowerCase("en-US") ===
          customColor.toLocaleLowerCase("en-US")
        );
      });

      if (!alreadyAvailable) {
        customColors.push(customColor);
      }

      toggleColor(selectedColors, customColor);

      continue;
    }

    const selectedColor = findColorFromButton(
      answer,
      availableColors,
      selectedColors,
    );

    if (!selectedColor) {
      await ctx.reply("❌ Select a color or press Done.");
      continue;
    }

    toggleColor(selectedColors, selectedColor);
  }
}

function getDestinationButtonText(
  destination: (typeof PUBLISH_DESTINATIONS)[number],
  selected: ReadonlySet<ProductPublishDestination>,
) {
  return `${selected.has(destination.value) ? "✅" : "⬜"} ${destination.label}`;
}

async function askPublishDestinations(
  conversation: AppConversation,
  ctx: AppConversationContext,
) {
  const selected = new Set<ProductPublishDestination>([
    "anilox",
    "ebraha",
    "telegram",
    ...(isProductInstagramPublishingEnabled()
      ? (["instagram"] as ProductPublishDestination[])
      : []),
  ]);

  while (true) {
    const keyboard = new Keyboard();

    PUBLISH_DESTINATIONS.forEach((destination, index) => {
      keyboard.text(getDestinationButtonText(destination, selected));

      if ((index + 1) % 2 === 0) {
        keyboard.row();
      }
    });

    keyboard.text(DONE_DESTINATIONS_INPUT).row().resized();

    await ctx.reply(
      `مقصدهای انتشار را انتخاب کنید.
با زدن دوبارهٔ هر گزینه می‌توانید آن را غیرفعال کنید.

انتخاب‌شده: ${PUBLISH_DESTINATIONS.filter((item) => selected.has(item.value))
        .map((item) => item.label)
        .join("، ") || "هیچ‌کدام"}`,
      { reply_markup: keyboard },
    );

    const answer = (await conversation.form.text()).trim();

    if (answer === DONE_DESTINATIONS_INPUT) {
      if (selected.size === 0) {
        await ctx.reply("❌ حداقل یک مقصد انتشار را انتخاب کنید.");
        continue;
      }

      return [...selected];
    }

    const destination = PUBLISH_DESTINATIONS.find(
      (item) => getDestinationButtonText(item, selected) === answer,
    );

    if (!destination) {
      await ctx.reply("❌ یکی از مقصدها یا دکمهٔ تأیید را انتخاب کنید.");
      continue;
    }

    if (selected.has(destination.value)) {
      selected.delete(destination.value);
    } else {
      selected.add(destination.value);
    }
  }
}

async function askPhotos(
  conversation: AppConversation,
  ctx: AppConversationContext,
) {
  const photos: ProductDraft["photos"] = [];
  const doneKeyboard = new Keyboard().text(DONE_PHOTOS_INPUT).resized();

  await ctx.reply(
    `Send 1 to ${MAX_PRODUCT_PHOTOS} product photos.
You can send them one by one or as a Telegram album.`,
    { reply_markup: removeKeyboard() },
  );

  while (photos.length < MAX_PRODUCT_PHOTOS) {
    const photoContext = await conversation.wait();
    const largestPhoto = photoContext.message?.photo?.at(-1);

    if (largestPhoto) {
      photos.push({
        fileId: largestPhoto.file_id,
        fileUniqueId: largestPhoto.file_unique_id,
        width: largestPhoto.width,
        height: largestPhoto.height,
      });

      if (photos.length === MAX_PRODUCT_PHOTOS) {
        await ctx.reply(`✅ ${photos.length} photos received.`, {
          reply_markup: removeKeyboard(),
        });
        break;
      }

      await ctx.reply(
        `📷 ${photos.length} photo${photos.length === 1 ? "" : "s"} received. Send another photo or press ${DONE_PHOTOS_INPUT}.`,
        { reply_markup: doneKeyboard },
      );
      continue;
    }

    if (photoContext.message?.text?.trim() === DONE_PHOTOS_INPUT) {
      if (photos.length > 0) {
        break;
      }

      await photoContext.reply("❌ Send at least one product photo.");
      continue;
    }

    await photoContext.reply(
      `❌ Send a Telegram Photo or press ${DONE_PHOTOS_INPUT}.`,
      { reply_markup: photos.length > 0 ? doneKeyboard : removeKeyboard() },
    );
  }

  return photos;
}

function createTypeOptions() {
  return PRODUCT_TYPES.map((value) => {
    return {
      value,
      label: TYPE_LABELS[value],
    };
  });
}

function createCategoryOptions() {
  return PRODUCT_CATEGORIES.map((value) => {
    return {
      value,
      label: CATEGORY_LABELS[value],
    };
  });
}

function createGenderOptions() {
  return PRODUCT_GENDERS.map((value) => {
    return {
      value,
      label: GENDER_LABELS[value],
    };
  });
}

function formatWebsitePublishResult(result: ProductSitePublishResult) {
  const site = PRODUCT_SITE_LABELS[result.site];

  if (result.status === "created") {
    return `✅ ${site}: منتشر شد (شناسه: ${result.id ?? "برگردانده نشد"})`;
  }

  if (result.status === "brand_missing") {
    return `⚠️ ${site}: برند در این سایت وجود ندارد`;
  }

  return `❌ ${site}: ${result.message ?? "انتشار ناموفق بود"}`;
}

export async function productUploadConversation(
  conversation: AppConversation,
  ctx: AppConversationContext,
) {
  if (!isProductAdmin(ctx.from?.id)) {
    await ctx.reply("⛔ You are not allowed to use this command.");
    return;
  }

  if (ctx.chat?.type !== "private") {
    await ctx.reply("Use product upload in a private chat with the bot.");
    return;
  }

  conversation.waitForCommand("cancel").then(async (cancelCtx) => {
    await cancelCtx.reply("❌ Product creation was cancelled.", {
      reply_markup: removeKeyboard(),
    });

    await conversation.halt();
  });

  await ctx.reply(
    `📦 Product creation started.

You can send /cancel at any step.`,
  );

  const type = validateType(
    await askChoice(
      conversation,
      ctx,
      "Select the product type:",
      createTypeOptions(),
    ),
  );

  await ctx.reply("⏳ Loading brands from the backend...", {
    reply_markup: removeKeyboard(),
  });

  const brandsResult = await conversation.external(async () => {
    try {
      const catalog = await productBackendApi.getBrands();

      return {
        ok: true as const,
        brands: catalog.brands,
        warnings: catalog.warnings,
      };
    } catch (error) {
      return {
        ok: false as const,
        message: getProductBackendPublicMessage(error),
      };
    }
  });

  if (!brandsResult.ok) {
    await ctx.reply(`❌ ${brandsResult.message}`, {
      reply_markup: removeKeyboard(),
    });
    return;
  }

  const brandWarnings = Object.entries(brandsResult.warnings);

  if (brandWarnings.length > 0) {
    await ctx.reply(
      `⚠️ فهرست برند یکی از سایت‌ها فعلاً در دسترس نیست؛ برندهای سایت دیگر نمایش داده می‌شوند.\n${brandWarnings
        .map(
          ([site, message]) =>
            `${PRODUCT_SITE_LABELS[site as keyof typeof PRODUCT_SITE_LABELS]}: ${message}`,
        )
        .join("\n")}`,
    );
  }

  const brandName = await askPaginatedStringChoice(
    conversation,
    ctx,
    "Select the brand:",
    brandsResult.brands.map((brand) => brand.name),
    false,
  );

  if (!brandName) {
    await ctx.reply("❌ No brand was selected.");
    return;
  }

  const selectedBrand = brandsResult.brands.find(
    (brand) => brand.name === brandName,
  ) as BrandOption | undefined;

  if (!selectedBrand) {
    await ctx.reply("❌ The selected brand is no longer available.");
    return;
  }

  const brand =
    selectedBrand.siteSlugs.anilox ?? selectedBrand.siteSlugs.ebraha;

  if (!brand) {
    await ctx.reply("❌ برای برند انتخاب‌شده slug معتبری پیدا نشد.");
    return;
  }

  const photos = await askPhotos(conversation, ctx);

  const model = await askText(
    conversation,
    ctx,
    "Type the model name:",
    validateModel,
  );

  let category: ProductCategory | "other" = "other";

  if (type === "shoe") {
    category = validateCategory(
      await askChoice(
        conversation,
        ctx,
        "Select the shoe category:",
        createCategoryOptions(),
      ),
    );
  }

  const gender = validateGender(
    await askChoice(
      conversation,
      ctx,
      "Select the gender:",
      createGenderOptions(),
    ),
  );

  const price = await askText(
    conversation,
    ctx,
    `Enter the regular price.
Example: 1250000 or 1250000.50`,
    (value) => validateMoney(value, "price"),
  );

  const discountPrice = await askOptionalText(
    conversation,
    ctx,
    `Enter the discount price.
Press ${SKIP_INPUT} if there is no discount.`,
    (value) => {
      return validateDiscountPrice(value, price);
    },
  );

  const description = await askOptionalText(
    conversation,
    ctx,
    `Enter the product description.
Press ${SKIP_INPUT} to leave it empty.`,
    validateDescription,
  );

  const colors = await askColors(conversation, ctx);
  const publishDestinations = await askPublishDestinations(conversation, ctx);
  const websiteTargets = publishDestinations.filter(
    (destination): destination is ProductSiteId =>
      destination === "anilox" || destination === "ebraha",
  );
  const publishToTelegram = publishDestinations.includes("telegram");
  const publishToInstagram = publishDestinations.includes("instagram");

  let draft: ProductDraft = {
    type: type as ProductType,
    brand,
    brandName,
    brandSlugs: selectedBrand.siteSlugs,
    model,
    category,
    gender: gender as ProductGender,
    price,
    discountPrice,
    description,
    colors,
    photos,
  };

  try {
    draft = normalizeProductDraft(draft);

    if (websiteTargets.length > 0) {
      validateProductBackendConfiguration();
    }
  } catch (error) {
    const message =
      error instanceof ProductUploadError
        ? error.publicMessage
        : getProductBackendPublicMessage(error);

    await ctx.reply(`❌ ${message}`, {
      reply_markup: removeKeyboard(),
    });

    return;
  }

  let channelCaption: string | null = null;

  if (publishToTelegram) {
    try {
      validateProductChannelConfiguration();

      channelCaption = formatProductChannelCaption(draft);
    } catch (error) {
      await ctx.reply(`❌ ${getProductChannelPublicMessage(error)}`, {
        reply_markup: removeKeyboard(),
      });

      return;
    }
  }

  if (publishToInstagram) {
    try {
      validateProductInstagramConfiguration(true);
    } catch (error) {
      await ctx.reply(`❌ ${getProductInstagramPublicMessage(error)}`, {
        reply_markup: removeKeyboard(),
      });

      return;
    }
  }

  if (publishToTelegram && channelCaption) {
    await ctx.reply("👁 پیش‌نمایش پست کانال تلگرام:");

    if (draft.photos.length === 1) {
      await ctx.replyWithPhoto(draft.photos[0]!.fileId, {
        caption: channelCaption,
        parse_mode: "HTML",
      });
    } else {
      await ctx.api.sendMediaGroup(
        ctx.chat.id,
        draft.photos.map((photo, index) => ({
          type: "photo" as const,
          media: photo.fileId,
          ...(index === 0
            ? {
                caption: channelCaption,
                parse_mode: "HTML" as const,
              }
            : {}),
        })),
      );
    }
  }

  const destinationLabels = PUBLISH_DESTINATIONS.filter((item) =>
    publishDestinations.includes(item.value),
  )
    .map((item) => item.label)
    .join("، ");

  await ctx.reply(`انتشار محصول در «${destinationLabels}» تأیید می‌شود؟`, {
    reply_markup: createConfirmKeyboard(CONFIRM_INPUT),
  });

  while (true) {
    const confirmation = (await conversation.form.text()).trim();

    if (confirmation === CONFIRM_INPUT) {
      break;
    }

    await ctx.reply(`❌ Press ${CONFIRM_INPUT} or use /cancel.`);
  }

  const createResult =
    websiteTargets.length > 0
      ? await conversation.external(async () => {
          try {
            const results = await productBackendApi.createProduct(
              draft,
              websiteTargets,
            );

            return {
              ok: true as const,
              results,
            };
          } catch (error) {
            return {
              ok: false as const,
              message: getProductBackendPublicMessage(error),
            };
          }
        })
      : { ok: true as const, results: [] as ProductSitePublishResult[] };

  const publishResults: ProductSitePublishResult[] = createResult.ok
    ? createResult.results
    : websiteTargets.map((site) => ({
        site,
        status: "failed",
        id: null,
        message: createResult.message,
      }));
  const retryKeyboard = ctx.from
    ? queueProductPublicationRetry(ctx.from.id, draft, publishResults)
    : null;
  const missingBrandInstructions = publishResults
    .filter((result) => result.status === "brand_missing")
    .map((result) => getMissingBrandInstruction(draft, result));

  if (publishResults.length > 0) {
    await ctx.reply(
      [
        "📡 نتیجهٔ انتشار در سایت‌ها:",
        ...publishResults.map(formatWebsitePublishResult),
        ...missingBrandInstructions,
      ].join("\n\n"),
      {
        reply_markup: retryKeyboard ?? removeKeyboard(),
      },
    );
  }

  if (publishToTelegram) {
    try {
      const channelPost = await publishProductToChannel(ctx.api, draft);

      const linkText = channelPost.messageLink
        ? `\n🔗 Post link: ${channelPost.messageLink}`
        : "";

      await ctx.reply(
        `✅ محصول در کانال تلگرام منتشر شد.
Channel message ID: ${channelPost.messageId}${linkText}`,
        {
          reply_markup: removeKeyboard(),
        },
      );
    } catch (error) {
      console.error("Product channel publish failed:", error);

      await ctx.reply(
        `⚠️ انتشار انتخاب‌شده در کانال تلگرام ناموفق بود.

${getProductChannelPublicMessage(error)}`,
        {
          reply_markup: removeKeyboard(),
        },
      );
    }
  }

  if (publishToInstagram) {
    const instagramResult = await conversation.external(async () => {
      try {
        const published = await publishProductToInstagram(draft);

        return {
          ok: true as const,
          published,
        };
      } catch (error) {
        console.error("Product Instagram publish failed:", error);

        return {
          ok: false as const,
          message: getProductInstagramPublicMessage(error),
        };
      }
    });

    if (instagramResult.ok) {
      await ctx.reply(
        `✅ The product was published to Instagram.
Instagram media ID: ${instagramResult.published.mediaId}`,
        {
          reply_markup: removeKeyboard(),
        },
      );
    } else {
      await ctx.reply(
        `⚠️ انتشار انتخاب‌شده در اینستاگرام ناموفق بود.

${instagramResult.message}`,
        {
          reply_markup: removeKeyboard(),
        },
      );
    }
  }

  await ctx.reply(formatProductSummary(draft, publishResults));
}
