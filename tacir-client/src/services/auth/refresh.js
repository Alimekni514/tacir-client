"use server";
import { apiBaseUrl } from "../../utils/constants";
import { cookies } from "next/headers";
import { fetchUser } from "../users/user";
export async function RefreshToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh")?.value;

  if (!refreshToken) {
    throw new Error("Refresh token not found in cookies");
  }

  try {
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-refresh-token": refreshToken,
      },
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Token refresh failed");
    }

    return response;
  } catch (error) {
    console.error("Refresh token failed:", error.message);
    throw new Error("Session expired");
  }
}

// PURE middleware authentication - NO redirects, NO apiClient
export async function authenticateInMiddleware(accessToken, refreshToken) {
  try {
    // Step 1: Try with access token first
    if (accessToken) {
      console.log("Trying with access token...");
      const userResult = await fetchUser(accessToken, refreshToken);
      if (userResult.success) {
        console.log("Access token worked!");
        return { success: true, user: userResult.user };
      }
      console.log("Access token failed:", userResult.error);
    }

    // Step 2: If access token failed, try to refresh
    if (refreshToken) {
      console.log("Attempting token refresh in middleware...");
      const refreshResult = await refreshTokenDirectly(refreshToken);

      if (refreshResult.success) {
        console.log("Token refresh successful!");

        // Step 3: Try to get user with new token
        const userResult = await fetchUser(
          refreshResult.newAccessToken,
          refreshToken
        );
        if (userResult.success) {
          return {
            success: true,
            user: userResult.user,
            newAccessToken: refreshResult.newAccessToken,
          };
        }
      }
      console.log("Token refresh failed:", refreshResult.error);
    }

    return { success: false, error: "All authentication methods failed" };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: error.message };
  }
}
export async function refreshTokenDirectly(refreshToken) {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-refresh-token": refreshToken,
      },
    });

    if (response.ok) {
      // Try to extract new access token from response
      const data = await response.json().catch(() => ({}));

      // Check if token is in response body
      if (data.accessToken) {
        return { success: true, newAccessToken: data.accessToken };
      }

      // Check if token is in cookies
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        const accessCookieMatch = setCookieHeader.match(/access=([^;]+)/);
        if (accessCookieMatch) {
          return { success: true, newAccessToken: accessCookieMatch[1] };
        }
      }

      // If we can't find the new token, still consider it successful
      // The backend might have set the cookie directly
      return { success: true, newAccessToken: null };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.message || `HTTP ${response.status}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
