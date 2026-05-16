import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.SESSION_SECRET ?? "devhub-secret-change-in-prod";
const JWT_EXPIRES_IN = "7d";
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
export function verifyToken(token): JwtPayload {
  return jwt.verify(token, JWT_SECRET);
}