"use server";
import { logoutUser } from "../services/auth/logout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RefreshToken } from "@/services/auth/refresh";

export const apiClient = async (url, options = {}, retry = true) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access")?.value;
    const refreshToken = cookieStore.get("refresh")?.value;

    const config = {
      ...options,
      credentials: "include",
      headers: {
        // "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(refreshToken && { "x-refresh-token": refreshToken }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      if (!refreshToken) {
        console.log("No refresh token, redirecting to login");
        redirect("/auth/login");
      }

      if (retry) {
        try {
          console.log("Attempting token refresh...");
          const refreshResponse = await RefreshToken();

          if (refreshResponse.ok) {
            console.log("Token refreshed successfully, retrying request...");
            return apiClient(url, options, false);
          } else {
            console.log("Token refresh failed, logging out");
            await logoutUser();
            redirect("/auth/login");
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          await logoutUser();
          redirect("/auth/login");
        }
      } else {
        console.log("No retry allowed, logging out");
        await logoutUser();
        redirect("/auth/login");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || errorData.error || "Server error"
      );
      if (errorData.errors) {
        error.validationErrors = Array.isArray(errorData.errors)
          ? errorData.errors
          : [errorData.message];
      }
      throw error;
    }

    return response.json();
  } catch (error) {
    if (
      error.message === "NEXT_REDIRECT" ||
      error.digest?.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("API Client Error:", {
      error: error.message,
      url,
      options,
    });
    throw error;
  }
};
export const safeApiCall = async (url, options = {}) => {
  try {
    const response = await apiClient(url, options);
    return response || null;
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    return null;
  }
};
