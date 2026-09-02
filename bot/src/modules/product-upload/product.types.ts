import type {
  ProductCategory,
  ProductGender,
  ProductType,
} from "./product.constants.js";

export interface ProductPhotoInput {
  fileId: string;
  fileUniqueId: string;
  width: number;
  height: number;
}

export interface BrandOption {
  name: string;
  slug: string;
}

export interface ProductDraft {
  type: ProductType;
  brand: string;
  brandName: string;
  model: string;
  category: ProductCategory | "other";
  gender: ProductGender;
  price: string;
  discountPrice: string | null;
  description: string | null;
  colors: string[] | null;
  photos: ProductPhotoInput[];
}

export interface CreateProductPayload {
  type: ProductType;
  brand: string;
  model: string;
  category: ProductCategory | null;
  gender: ProductGender;
  price: string;
  discount_price: string | null;
  description: string | null;
  colors: string | null;
}

export interface CreatedBackendProduct {
  id: string | null;
}
