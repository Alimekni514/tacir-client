export const apiBaseUrl = process.env.API_URL || "http://localhost:5000/api"

// Evaluation options configuration
export const EvaluationOptions = [
    {
        text: "Excellent",
        description: "Le candidat dépasse toutes les attentes",
        icon: "⭐️",
    },
    {
        text: "Très bon",
        description: "Le candidat répond parfaitement aux attentes",
        icon: "👍",
    },
    {
        text: "Bon",
        description: "Le candidat répond aux attentes",
        icon: "✅",
    },
    {
        text: "Moyen",
        description: "Le candidat répond partiellement aux attentes",
        icon: "➖",
    },
    {
        text: "Insuffisant",
        description: "Le candidat ne répond pas aux attentes",
        icon: "❌",
    },
];

// Status configuration object
export const statusOptions = {
    submitted: {
        label: "Soumis",
        badgeVariant: "secondary",
        rowClass: "", // No additional class for default status
    },
    under_review: {
        label: "En Revue",
        badgeVariant: "warning",
        rowClass: "bg-yellow-50 hover:bg-yellow-100", // Light yellow background
    },
    accepted: {
        label: "Accepté",
        badgeVariant: "success",
        rowClass: "bg-green-50 hover:bg-green-100", // Light green background
    },
    rejected: {
        label: "Rejeté",
        badgeVariant: "destructive",
        rowClass: "bg-red-50 hover:bg-red-100", // Light red background
    },
};