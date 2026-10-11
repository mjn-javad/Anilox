const fs = require("fs");
const path = require("path");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
} = require("@aws-sdk/client-s3");

const REQUIRED_ENV_KEYS = [
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
];

let client;

const normalizeEndpoint = (value) => {
  const parsed = new URL(String(value || "").trim());
  return `${parsed.protocol}//${parsed.host}`;
};

const normalizePublicBaseUrl = (value) =>
  String(value || "")
    .trim()
    .replace(/\/+$/, "");

const getMissingConfigKeys = () =>
  REQUIRED_ENV_KEYS.filter((key) => !String(process.env[key] || "").trim());

const isR2Configured = () => getMissingConfigKeys().length === 0;

const getConfig = () => {
  const missingKeys = getMissingConfigKeys();

  if (missingKeys.length > 0) {
    throw new Error(`Missing R2 configuration: ${missingKeys.join(", ")}`);
  }

  return {
    endpoint: normalizeEndpoint(process.env.R2_ENDPOINT),
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
    bucket: process.env.R2_BUCKET_NAME.trim(),
    publicBaseUrl: normalizePublicBaseUrl(process.env.R2_PUBLIC_BASE_URL),
  };
};

const getClient = () => {
  if (!client) {
    const config = getConfig();

    client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return client;
};

const productImageKey = (filename) =>
  `products/${path.basename(String(filename || ""))}`;

const productImageVariantNames = (imageName) => {
  const safeName = path.basename(String(imageName || ""));
  if (!safeName) return [];

  const parsed = path.parse(safeName);
  const baseName = parsed.name.replace(/-(?:320|640|960)$/i, "");

  return [
    safeName,
    `${baseName}-320.webp`,
    `${baseName}-640.webp`,
    `${baseName}-960.webp`,
  ].filter((value, index, values) => values.indexOf(value) === index);
};

const uploadFile = async ({ filePath, key, contentType = "image/webp" }) => {
  const config = getConfig();

  await getClient().send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
};

const deleteObjects = async (keys) => {
  const uniqueKeys = [...new Set((keys || []).filter(Boolean))];
  if (uniqueKeys.length === 0 || !isR2Configured()) return;

  const config = getConfig();

  await getClient().send(
    new DeleteObjectsCommand({
      Bucket: config.bucket,
      Delete: {
        Quiet: true,
        Objects: uniqueKeys.map((Key) => ({ Key })),
      },
    }),
  );
};

const deleteProductImage = async (imageName) =>
  deleteObjects(productImageVariantNames(imageName).map(productImageKey));

const getPublicProductImageUrl = (imageName) => {
  const { publicBaseUrl } = getConfig();
  return `${publicBaseUrl}/${productImageKey(imageName)
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
};

const verifyConnection = async () => {
  const config = getConfig();
  await getClient().send(new HeadBucketCommand({ Bucket: config.bucket }));
};

module.exports = {
  deleteObjects,
  deleteProductImage,
  getMissingConfigKeys,
  getPublicProductImageUrl,
  isR2Configured,
  normalizeEndpoint,
  productImageKey,
  productImageVariantNames,
  uploadFile,
  verifyConnection,
};
