"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, RefreshCw, Home, Wifi, Server } from "lucide-react";

const colorMap = {
  "tacir-orange": { bg: "bg-orange-100", border: "border-orange-500", text: "text-orange-500" },
  "red-500": { bg: "bg-red-100", border: "border-red-500", text: "text-red-500" },
  "yellow-500": { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-500" },
  "blue-500": { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-500" },
};

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState({
    code: "500",
    message: "An unexpected error occurred",
    title: "Something Went Wrong",
    description: "We encountered an unexpected error processing your request.",
    icon: AlertTriangle,
    color: "tacir-orange",
  });

  useEffect(() => {
    const code = searchParams.get("code") || "500";
    const message = searchParams.get("message") || "An unexpected error occurred";

    let details = {
      code,
      message,
      title: "Something Went Wrong",
      description: "We encountered an unexpected error processing your request.",
      icon: AlertTriangle,
      color: "tacir-orange",
    };

    switch (code) {
      case "500":
        details = { ...details, title: "Internal Server Error", description: "Our servers are experiencing technical difficulties.", icon: Server, color: "red-500" };
        break;
      case "503":
        details = { ...details, title: "Service Unavailable", description: "The authentication service is temporarily unavailable.", icon: Wifi, color: "yellow-500" };
        break;
      case "504":
        details = { ...details, title: "Gateway Timeout", description: "The request timed out. Please try again.", icon: Wifi, color: "blue-500" };
        break;
    }

    setErrorDetails(details);
  }, [searchParams]);

  const handleRetry = () => window.location.reload();
  const handleGoHome = () => (window.location.href = "/");

  const IconComponent = errorDetails.icon;
  const colorClasses = colorMap[errorDetails.color];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="relative mx-auto mb-6">
          <div className={`absolute inset-0 ${colorClasses.bg} rounded-full`}></div>
          <div className={`relative animate-pulse h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto border-4 ${colorClasses.border}`}>
            <IconComponent className={`h-10 w-10 ${colorClasses.text}`} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">{errorDetails.title}</h1>
        <p className="text-gray-600 mb-6">{errorDetails.description}</p>

        <div className="bg-gray-100/50 p-4 rounded-lg mb-8 border-l-4 border-yellow-400">
          <p className="text-gray-800 text-sm"><span className="font-semibold">Error Code:</span> {errorDetails.code}</p>
          <p className="text-gray-800 text-sm mt-1"><span className="font-semibold">Details:</span> {errorDetails.message}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>

          <button
            onClick={handleGoHome}
            className="w-full py-3 px-4 bg-white border border-blue-500 text-blue-500 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
