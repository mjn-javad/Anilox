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

export type ProductSiteId = "anilox" | "ebraha";

export type ProductPublishDestination =
  | ProductSiteId
  | "telegram"
  | "instagram";

export interface BrandOption {
  name: string;
  siteSlugs: Partial<Record<ProductSiteId, string>>;
}

export interface ProductData {
  type: ProductType;
  brand: string;
  brandName: string;
  brandSlugs: Partial<Record<ProductSiteId, string>>;
  model: string;
  category: ProductCategory | "other";
  gender: ProductGender;
  price: string;
  discountPrice: string | null;
  description: string | null;
  colors: string[] | null;
}

export interface ProductDraft extends ProductData {
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

export interface ProductImageUpload {
  blob: Blob;
  filename: string;
}

export type ProductSitePublishStatus = "created" | "brand_missing" | "failed";

export interface ProductSitePublishResult {
  site: ProductSiteId;
  status: ProductSitePublishStatus;
  id: string | null;
  message: string | null;
}
