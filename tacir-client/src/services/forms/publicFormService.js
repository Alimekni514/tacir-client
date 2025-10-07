"use client";
import { apiBaseUrl } from "../../utils/constants";
export const getOpenForms = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/candidatures/open`, {
      credentials: "omit",
    });

    if (!response.ok) {
      const errorText = await response.text(); // capture raw error
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.message || "Erreur inconnue.");
    }

    return json.data || [];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des formulaires ouverts :",
      error.message
    );
    return [];
  }
};

// services/forms/publicFormService.js
export const submitCandidatureApplication = async (formId, answers) => {
  try {
    const response = await fetch(`${apiBaseUrl}/submissions/submit/${formId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
      credentials: "omit",
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData.message || `HTTP error ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!responseData.success) {
      throw new Error(responseData.message || "Submission failed");
    }

    return responseData.data;
  } catch (error) {
    console.error(
      "Erreur lors de la soumission de la candidature:",
      error.message
    );
    throw error; // Re-throw to handle in component
  }
};
