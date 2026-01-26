import crypto from "node:crypto";

type AdminSessionPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
};

const base64UrlEncode = (input: Buffer | string) => {
  const buff = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buff
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const base64UrlDecodeToBuffer = (input: string) => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64");
};

const sign = (data: string, secret: string) => {
  return base64UrlEncode(crypto.createHmac("sha256", secret).update(data).digest());
};

export const createAdminSessionToken = (
  payload: Omit<AdminSessionPayload, "exp">,
  secret: string,
  maxAgeSeconds: number,
) => {
  const fullPayload: AdminSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
};

export const verifyAdminSessionToken = (token: string, secret: string) => {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  const expected = sign(encodedPayload, secret);
  const sigBuff = Buffer.from(signature);
  const expBuff = Buffer.from(expected);
  if (sigBuff.length !== expBuff.length) {
    return null;
  }
  if (!crypto.timingSafeEqual(sigBuff, expBuff)) {
    return null;
  }
  try {
    const payload = JSON.parse(base64UrlDecodeToBuffer(encodedPayload).toString("utf8")) as AdminSessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

export const getAdminSessionSecret = () => {
  const candidates = [
    process.env.ADMIN_SESSION_SECRET,
    process.env.NEXTAUTH_SECRET,
    process.env.AUTH_SECRET,
    process.env.SESSION_SECRET,
    process.env.JWT_SECRET,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed.length >= 16) return trimmed;
  }

  return null;
};
