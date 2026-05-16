import { setAuthTokenGetter } from "@workspace/api-client-react";
let currentToken = null;
export function setAuthToken(token) {
  currentToken = token;
}
export function getAuthToken() {
  return currentToken;
}
setAuthTokenGetter(() => currentToken);