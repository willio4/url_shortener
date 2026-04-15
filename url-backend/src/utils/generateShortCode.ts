export function generateShortCode() {
  const urlCodeLength = 8;
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let urlCode = "";

  for (let i = 0; i < urlCodeLength; i++) {
    const random = Math.floor(Math.random() * chars.length);
    urlCode += chars[random];
  }

  return urlCode;
};
