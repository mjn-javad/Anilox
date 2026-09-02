import { Keyboard } from "grammy";

export const NEXT_PAGE_BUTTON = "Next ▶️";
export const PREVIOUS_PAGE_BUTTON = "◀️ Previous";

export const CUSTOM_MODEL_BUTTON = "✍️ Custom model";

export const CUSTOM_COLOR_BUTTON = "➕ Custom color";

export const DONE_COLORS_BUTTON = "✅ Done";

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
}

function addButtonsInRows(
  keyboard: Keyboard,
  labels: readonly string[],
  columns = 2,
) {
  labels.forEach((label, index) => {
    keyboard.text(label);

    if ((index + 1) % columns === 0) {
      keyboard.row();
    }
  });

  if (labels.length % columns !== 0) {
    keyboard.row();
  }
}

export function createChoiceKeyboard<T extends string>(
  options: readonly ChoiceOption<T>[],
) {
  const keyboard = new Keyboard();

  addButtonsInRows(
    keyboard,
    options.map((option) => option.label),
  );

  return keyboard.resized().oneTime();
}

export function createPaginatedChoiceKeyboard(
  options: readonly string[],
  page: number,
  pageSize: number,
  allowCustom: boolean,
) {
  const keyboard = new Keyboard();

  const totalPages = Math.max(1, Math.ceil(options.length / pageSize));

  const start = page * pageSize;

  const pageOptions = options.slice(start, start + pageSize);

  addButtonsInRows(keyboard, pageOptions);

  if (page > 0) {
    keyboard.text(PREVIOUS_PAGE_BUTTON);
  }

  if (page < totalPages - 1) {
    keyboard.text(NEXT_PAGE_BUTTON);
  }

  if (page > 0 || page < totalPages - 1) {
    keyboard.row();
  }

  if (allowCustom) {
    keyboard.text(CUSTOM_MODEL_BUTTON).row();
  }

  return keyboard.resized();
}

export function getColorButtonText(
  color: string,
  selectedColors: readonly string[],
) {
  const selected = selectedColors.some(
    (item) =>
      item.toLocaleLowerCase("en-US") === color.toLocaleLowerCase("en-US"),
  );

  return `${selected ? "✅" : "⬜"} ${color}`;
}

export function createColorKeyboard(
  availableColors: readonly string[],
  selectedColors: readonly string[],
) {
  const keyboard = new Keyboard();

  addButtonsInRows(
    keyboard,
    availableColors.map((color) => {
      return getColorButtonText(color, selectedColors);
    }),
  );

  keyboard.text(CUSTOM_COLOR_BUTTON).text(DONE_COLORS_BUTTON).row();

  return keyboard.resized();
}

export function findColorFromButton(
  answer: string,
  availableColors: readonly string[],
  selectedColors: readonly string[],
) {
  return (
    availableColors.find((color) => {
      return getColorButtonText(color, selectedColors) === answer;
    }) ?? null
  );
}

export function createSkipKeyboard(skipLabel: string) {
  return new Keyboard().text(skipLabel).resized().oneTime();
}

export function createConfirmKeyboard(confirmLabel: string) {
  return new Keyboard().text(confirmLabel).text("/cancel").resized().oneTime();
}
