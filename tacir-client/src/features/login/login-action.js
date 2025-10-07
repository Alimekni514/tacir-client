import { apiBaseUrl } from "../../utils/constants";
import { fetchMentorProfile } from "@/services/mentor/mentor.services";

export async function loginAction(args) {
  const url = apiBaseUrl + "/auth/login";

  try {
    const response = await fetch(url, {
      body: JSON.stringify(args),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.requiresActivation) {
        return {
          requiresActivation: true,
          userId: data.userId,
          message: data.message || "Account activation required",
        };
      }

      console.error("Login failed:", data.message);
      return {
        success: false,
        error: data.message || "Authentication failed",
      };
    }

    if (!data.user) {
      console.error("No user data in response:", data);
      return {
        success: false,
        error: "Authentication succeeded but no user data received",
      };
    }

    const roles = data.user.roles || [];

    // Handle mentor profile check FIRST if user is a mentor
    if (typeof window !== "undefined" && roles.includes("mentor")) {
      try {
        const mentorStatus = await fetchMentorProfile();
        console.log("Mentor profile status:", mentorStatus);

        if (
          mentorStatus?.requiresProfileCompletion ||
          mentorStatus?.requiresProfileCreation
        ) {
          return {
            success: true,
            user: data.user,
            redirect: "/mentor/profile",
            requiresProfileCompletion: true,
          };
        }
      } catch (error) {
        console.error("Error fetching mentor profile:", error);
        // Continue with normal flow if there's an error
      }
    }
    // Default redirect path based on roles
    let redirectPath = "/dashboard";

    if (roles.includes("admin")) {
      redirectPath = "/admin/members";
    } else if (roles.includes("IncubationCoordinator")) {
      redirectPath = "/incubation-coordinator/candidatures";
    } else if (roles.includes("ComponentCoordinator")) {
      redirectPath = "/component-coordinator";
    } else if (roles.includes("RegionalCoordinator")) {
      redirectPath = "/regional-coordinator";
    } else if (roles.includes("mentor")) {
      redirectPath = "/mentor"; // Default mentor path (will be overridden if needed)
    } else if (roles.includes("projectHolder")) {
      redirectPath = "/project-holder"; // Default mentor path (will be overridden if needed)
    }

    // Handle role-specific data
    if (typeof window !== "undefined") {
      // Clear old localStorage values
      localStorage.removeItem("userRegionId");
      localStorage.removeItem("regionName");
      localStorage.removeItem("userComponent");

      // RegionalCoordinator data
      if (roles.includes("RegionalCoordinator") && data.user.region) {
        localStorage.setItem("userRegionId", data.user.region.id);
        if (data.user.region.name) {
          localStorage.setItem(
            "regionName",
            data.user.region.name.fr || data.user.region.name
          );
        }
      }

      // ComponentCoordinator data
      if (roles.includes("ComponentCoordinator") && data.user.component) {
        const componentType = data.user.component.composant;
        if (componentType && ["crea", "inov"].includes(componentType)) {
          localStorage.setItem("userComponent", componentType);
        }
      }
    }

    // Final return
    return {
      success: true,
      user: data.user,
      redirect: redirectPath,
    };
  } catch (error) {
    console.error("Login failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
}
