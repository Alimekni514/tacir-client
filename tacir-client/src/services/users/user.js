"use server";

import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "../../utils/constants";

export async function fetchCurrentUser() {
  try {
    const data = await apiClient(`${apiBaseUrl}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch user");
  }
}

export async function fetchUser(accessToken, refreshToken) {
  try {
    const response = await fetch(`${apiBaseUrl}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(refreshToken && { "x-refresh-token": refreshToken }),
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        return { success: true, user: data.user };
      }
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
