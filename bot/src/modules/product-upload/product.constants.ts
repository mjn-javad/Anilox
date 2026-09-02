export const PRODUCT_CATEGORIES = [
  "sneaker",
  "loafer",
  "formal",
  "boot",
  "sandal",
  "sport",
  "classic",
  "flat",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_GENDERS = ["male", "female", "genderless"] as const;

export type ProductGender = (typeof PRODUCT_GENDERS)[number];

export const PRODUCT_TYPES = [
  "shoe",
  "belt",
  "bag",
  "luggage",
  "glasses",
  "watch",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  sneaker: "Sneaker",
  loafer: "Loafer",
  formal: "Formal",
  boot: "Boot",
  sandal: "Sandal",
  sport: "Sport",
  classic: "Classic",
  flat: "Flat",
  other: "Other",
};

export const GENDER_LABELS: Record<ProductGender, string> = {
  male: "Men",
  female: "Women",
  genderless: "Unisex",
};

export const TYPE_LABELS: Record<ProductType, string> = {
  shoe: "Shoe",
  belt: "Belt",
  bag: "Bag",
  luggage: "Luggage",
  glasses: "Glasses",
  watch: "Watch",
};

export const PRODUCT_COLOR_OPTIONS = [
  "Black",
  "White",
  "Gray",
  "Navy",
  "Blue",
  "Brown",
  "Beige",
  "Cream",
  "Red",
  "Burgundy",
  "Green",
  "Olive",
  "Yellow",
  "Orange",
  "Pink",
  "Purple",
  "Gold",
  "Silver",
  "Multicolor",
] as const;

export const SKIP_INPUT = "⏭ Skip";
export const CONFIRM_INPUT = "✅ Publish";
