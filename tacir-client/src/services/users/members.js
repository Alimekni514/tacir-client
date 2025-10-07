// services/memberService.js
import { apiBaseUrl } from "../../utils/constants";
import { apiClient } from "../../hooks/apiClient";

export async function addMember(data) {
  return apiClient(`${apiBaseUrl}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function fetchMembers({
  pageIndex,
  pageSize,
  search,
  filters,
  sortField,
  sortDirection,
}) {
  try {
    // Build query params
    const params = new URLSearchParams({
      page: pageIndex + 1,
      pageSize,
      ...(search && { search }),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.isArchived && { isArchived: filters.isArchived }),
      ...(filters?.isActive && { isActive: filters.isActive }),
      ...(sortField && { sortField }),
      ...(sortDirection && { sortDirection }),
    });

    return await apiClient(`${apiBaseUrl}/members?${params.toString()}`);
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
}

export async function archiveMembers(ids) {
  return apiClient(`${apiBaseUrl}/members/archive`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}
export async function unarchiveMembers(ids) {
  return apiClient(`${apiBaseUrl}/members/unarchive`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}

export async function getComponentCoordinators() {
  try {
    return await apiClient(`${apiBaseUrl}/members/componentCoordinators`);
  } catch (error) {
    console.error("Error fetching component coordinators:", error);
    throw error;
  }
}
export async function getIncubationCoordinators() {
  try {
    return await apiClient(`${apiBaseUrl}/members/incubationCoordinators`);
  } catch (error) {
    console.error("Error fetching component coordinators:", error);
    throw error;
  }
}

// get users by role
export async function getUsersByRole(role) {
  try {
    return await apiClient(`${apiBaseUrl}/members/role/${role}`);
  } catch (error) {
    console.error(`Error fetching users by role (${role}):`, error);
    throw error;
  }
}
