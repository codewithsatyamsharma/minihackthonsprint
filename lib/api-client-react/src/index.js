import { useMutation, useQuery } from "@tanstack/react-query";

let authTokenGetter = null;
let baseUrl = "";

export function setBaseUrl(url) {
  baseUrl = url?.replace(/\/$/, "") ?? "";
}

export function setAuthTokenGetter(getter) {
  authTokenGetter = getter;
}

function withParams(path, params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return `${path}${query ? `?${query}` : ""}`;
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.data !== undefined) {
    headers.set("content-type", "application/json");
    options.body = JSON.stringify(options.data);
  }
  const token = authTokenGetter?.();
  if (token && !headers.has("authorization")) headers.set("authorization", `Bearer ${token}`);
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(data?.error ?? data?.message ?? `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

const queryOptions = (options) => options?.query ?? {};

export const getHealthCheckQueryKey = () => ["/api/healthz"];
export const getGetMeQueryKey = () => ["/api/auth/me"];
export const getListUsersQueryKey = (params = {}) => ["/api/users", params];
export const getGetUserByUsernameQueryKey = (username) => ["/api/users", username];
export const getGetUserProjectsQueryKey = (username) => ["/api/users", username, "projects"];
export const getGetUserPostsQueryKey = (username) => ["/api/users", username, "posts"];
export const getListProjectsQueryKey = (params = {}) => ["/api/projects", params];
export const getGetProjectQueryKey = (id) => ["/api/projects", id];
export const getListPostsQueryKey = (params = {}) => ["/api/posts", params];
export const getGetPostQueryKey = (id) => ["/api/posts", id];
export const getSearchQueryKey = (params = {}) => ["/api/search", params];
export const getGetSavedQueryKey = () => ["/api/saved"];
export const getGetFeedQueryKey = () => ["/api/feed"];
export const getGetTrendingTagsQueryKey = () => ["/api/stats/trending-tags"];
export const getGetPlatformSummaryQueryKey = () => ["/api/stats/summary"];

export const useGetMe = (options) =>
  useQuery({ queryKey: getGetMeQueryKey(), queryFn: () => api("/api/auth/me"), ...queryOptions(options) });
export const useListUsers = (params = {}, options) =>
  useQuery({ queryKey: getListUsersQueryKey(params), queryFn: () => api(withParams("/api/users", params)), ...queryOptions(options) });
export const useGetUserByUsername = (username, options) =>
  useQuery({ queryKey: getGetUserByUsernameQueryKey(username), queryFn: () => api(`/api/users/${username}`), ...queryOptions(options) });
export const useGetUserProjects = (username, options) =>
  useQuery({ queryKey: getGetUserProjectsQueryKey(username), queryFn: () => api(`/api/users/${username}/projects`), ...queryOptions(options) });
export const useGetUserPosts = (username, options) =>
  useQuery({ queryKey: getGetUserPostsQueryKey(username), queryFn: () => api(`/api/users/${username}/posts`), ...queryOptions(options) });
export const useListProjects = (params = {}, options) =>
  useQuery({ queryKey: getListProjectsQueryKey(params), queryFn: () => api(withParams("/api/projects", params)), ...queryOptions(options) });
export const useGetProject = (id, options) =>
  useQuery({ queryKey: getGetProjectQueryKey(id), queryFn: () => api(`/api/projects/${id}`), ...queryOptions(options) });
export const useListPosts = (params = {}, options) =>
  useQuery({ queryKey: getListPostsQueryKey(params), queryFn: () => api(withParams("/api/posts", params)), ...queryOptions(options) });
export const useGetPost = (id, options) =>
  useQuery({ queryKey: getGetPostQueryKey(id), queryFn: () => api(`/api/posts/${id}`), ...queryOptions(options) });
export const useSearch = (params = {}, options) =>
  useQuery({ queryKey: getSearchQueryKey(params), queryFn: () => api(withParams("/api/search", params)), ...queryOptions(options) });
export const useGetSaved = (options) =>
  useQuery({ queryKey: getGetSavedQueryKey(), queryFn: () => api("/api/saved"), ...queryOptions(options) });
export const useGetFeed = (options) =>
  useQuery({ queryKey: getGetFeedQueryKey(), queryFn: () => api("/api/feed"), ...queryOptions(options) });
export const useGetTrendingTags = (options) =>
  useQuery({ queryKey: getGetTrendingTagsQueryKey(), queryFn: () => api("/api/stats/trending-tags"), ...queryOptions(options) });
export const useGetPlatformSummary = (options) =>
  useQuery({ queryKey: getGetPlatformSummaryQueryKey(), queryFn: () => api("/api/stats/summary"), ...queryOptions(options) });

export const useRegister = (options) =>
  useMutation({ mutationFn: ({ data }) => api("/api/auth/register", { method: "POST", data }), ...options });
export const useLogin = (options) =>
  useMutation({ mutationFn: ({ data }) => api("/api/auth/login", { method: "POST", data }), ...options });
export const useUpdateProfile = (options) =>
  useMutation({ mutationFn: ({ data }) => api("/api/users/me", { method: "PATCH", data }), ...options });
export const useCreateProject = (options) =>
  useMutation({ mutationFn: ({ data }) => api("/api/projects", { method: "POST", data }), ...options });
export const useUpdateProject = (options) =>
  useMutation({ mutationFn: ({ id, data }) => api(`/api/projects/${id}`, { method: "PATCH", data }), ...options });
export const useDeleteProject = (options) =>
  useMutation({ mutationFn: ({ id }) => api(`/api/projects/${id}`, { method: "DELETE" }), ...options });
export const useCreatePost = (options) =>
  useMutation({ mutationFn: ({ data }) => api("/api/posts", { method: "POST", data }), ...options });
export const useUpdatePost = (options) =>
  useMutation({ mutationFn: ({ id, data }) => api(`/api/posts/${id}`, { method: "PATCH", data }), ...options });
export const useDeletePost = (options) =>
  useMutation({ mutationFn: ({ id }) => api(`/api/posts/${id}`, { method: "DELETE" }), ...options });
export const useToggleLike = (options) =>
  useMutation({ mutationFn: ({ data }) => api("/api/interactions/like", { method: "POST", data }), ...options });
export const useToggleSave = (options) =>
  useMutation({ mutationFn: ({ data }) => api("/api/interactions/save", { method: "POST", data }), ...options });
