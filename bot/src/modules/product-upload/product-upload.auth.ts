export function isProductAdmin(userId: number | undefined) {
  if (!userId) {
    return false;
  }

  const adminIds = process.env.ADMIN_ID?.split(",")
    .map((adminId) => adminId.trim())
    .filter((adminId) => /^\d+$/.test(adminId));

  return adminIds?.includes(String(userId)) ?? false;
}
