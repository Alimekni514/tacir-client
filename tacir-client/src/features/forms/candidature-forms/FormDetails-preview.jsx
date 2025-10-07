"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CandidatureFormFieldRenderer from "./formFieldPreview";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Calendar,
  MapPin,
  FileText,
  Users,
  Image as ImageIcon,
  Clock,
  Award,
  Globe,
} from "lucide-react";
import { useState } from "react";

const CandidatureFormDetailsPreview = ({ form, open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!form) return null;

  const {
    title,
    description,
    imageUrl,
    eventDates,
    eventLocation,
    prizes,
    fields,
    region,
    startDate,
    endDate,
    createdAt,
    updatedAt,
  } = form;

  // Date formatting utility
  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Function to render links in description
  const renderDescriptionWithLinks = (text) => {
    if (!text) return null;
    return text.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
          part.match(/^https?:\/\//) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tacir-lightblue hover:underline"
            >
              {part}
            </a>
          ) : (
            part
          )
        )}
      </p>
    ));
  };

  const getFormStatus = () => {
    if (!startDate || !endDate) return "incomplete";

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "active";
  };

  const statusConfig = {
    incomplete: {
      label: "Incomplet",
      color: "text-gray-700 bg-gray-100",
    },
    upcoming: {
      label: "À venir",
      color: "text-blue-700 bg-blue-100",
    },
    active: { label: "Actif", color: "text-green-700 bg-green-100" },
    ended: { label: "Terminé", color: "text-red-700 bg-red-100" },
  };

  const status = getFormStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl h-[95vh] p-0 overflow-hidden flex flex-col">
        <VisuallyHidden asChild>
          <DialogTitle>Détails du Formulaire</DialogTitle>
        </VisuallyHidden>

        {/* Header with tabs */}
        <div className="flex border-b border-gray-200 bg-white shrink-0">
          <button
            className={`flex-1 py-3 px-4 text-xs font-medium flex items-center justify-center gap-1 ${
              activeTab === "overview"
                ? "text-tacir-lightblue border-b-2 border-tacir-lightblue"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <FileText className="h-3.5 w-3.5" />
            Aperçu
          </button>
          <button
            className={`flex-1 py-3 px-4 text-xs font-medium flex items-center justify-center gap-1 ${
              activeTab === "details"
                ? "text-tacir-lightblue border-b-2 border-tacir-lightblue"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("details")}
          >
            <Calendar className="h-3.5 w-3.5" />
            Détails
          </button>
          <button
            className={`flex-1 py-3 px-4 text-xs font-medium flex items-center justify-center gap-1 ${
              activeTab === "fields"
                ? "text-tacir-lightblue border-b-2 border-tacir-lightblue"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("fields")}
          >
            <Users className="h-3.5 w-3.5" />
            Champs ({fields?.length || 0})
          </button>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Header with image */}
            {imageUrl ? (
              <div className="w-full h-48 overflow-hidden relative rounded-xl">
                <img
                  src={imageUrl}
                  alt="En-tête du formulaire"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h1 className="text-2xl font-bold">
                      {title?.fr || "Formulaire Sans Titre"}
                    </h1>
                    <p className="text-sm opacity-90">
                      {description?.fr?.substring(0, 100) || ""}
                      {description?.fr?.length > 100 ? "..." : ""}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-gradient-to-r from-gray-100 to-blue-50 flex items-center justify-center p-6 rounded-xl">
                <div className="flex items-center gap-3 text-tacir-darkblue">
                  <ImageIcon className="h-8 w-8 opacity-70" />
                  <div>
                    <h1 className="text-2xl font-bold">
                      {title?.fr || "Formulaire Sans Titre"}
                    </h1>
                    <p className="text-sm opacity-80">
                      {description?.fr?.substring(0, 100) ||
                        "Aucune description fournie"}
                      {description?.fr?.length > 100 ? "..." : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status and dates */}
            <div className="flex justify-between items-center">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[status].color}`}
              >
                {statusConfig[status].label}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {formatDate(startDate)} - {formatDate(endDate)}
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Title Section */}
                <div className="text-center space-y-3 py-3">
                  <h1 className="text-3xl font-bold text-tacir-darkblue">
                    {title?.fr || "Formulaire Sans Titre"}
                  </h1>
                  <h1 className="text-2xl text-tacir-darkblue font-arabic">
                    {title?.ar || "نموذج بدون عنوان"}
                  </h1>
                </div>

                {/* Description Section */}
                {(description?.fr || description?.ar) && (
                  <div className="space-y-4 p-6 bg-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 text-tacir-darkblue mb-3">
                      <FileText className="h-5 w-5" />
                      <h3 className="font-semibold">Description</h3>
                    </div>
                    {description?.fr && (
                      <div className="prose text-gray-700 leading-relaxed">
                        {renderDescriptionWithLinks(description.fr)}
                      </div>
                    )}
                    {description?.ar && (
                      <div className="prose text-gray-700 text-right leading-relaxed font-arabic border-t pt-4 mt-4">
                        {renderDescriptionWithLinks(description.ar)}
                      </div>
                    )}
                  </div>
                )}

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Important Dates */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-tacir-darkblue" />
                      <h3 className="font-semibold text-gray-900">
                        Dates Importantes
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {eventDates?.map((event, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-red-100 pl-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="font-semibold text-gray-900">
                                {formatDate(event.date)}
                              </p>
                              <p className="text-gray-700 text-sm">
                                {event.description?.fr}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {formatDate(event.date)}
                              </p>
                              <p className="text-gray-700 text-sm">
                                {event.description?.ar}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Event Location */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-tacir-green" />
                      <h3 className="font-semibold text-gray-900">
                        Lieu de l'Événement
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-700 flex-1 pr-4">
                          {eventLocation?.fr}
                        </p>
                        <p className="text-gray-700 flex-1 text-right pl-4">
                          {eventLocation?.ar}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Region */}
                {region && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="h-5 w-5 text-tacir-darkblue" />
                      <h3 className="font-semibold text-gray-900">Région</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                          Français
                        </p>
                        <p className="text-gray-900 font-medium">
                          {region?.fr}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide text-right">
                          العربية
                        </p>
                        <p className="text-gray-900 font-medium text-right font-arabic">
                          {region?.ar}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview of first 3 fields */}
                {fields?.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-tacir-darkblue" />
                      Aperçu des Champs
                    </h3>
                    <div className="space-y-3">
                      {fields.slice(0, 3).map((field, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <CandidatureFormFieldRenderer
                            field={field}
                            previewMode
                          />
                        </div>
                      ))}
                      {fields.length > 3 && (
                        <div className="text-center text-sm text-gray-500 py-2">
                          + {fields.length - 3} autres champs
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Event Dates */}
                {eventDates?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-tacir-darkblue" />
                      Dates Importantes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {eventDates.map((event, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-xl border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-tacir-blue bg-blue-100 px-3 py-1 rounded-full">
                              Date #{index + 1}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900 text-base mb-2">
                            {event.date
                              ? formatDate(event.date)
                              : "Date non spécifiée"}
                          </p>
                          {event.description?.fr && (
                            <p className="text-gray-700 text-sm mb-2">
                              {event.description.fr}
                            </p>
                          )}
                          {event.description?.ar && (
                            <p className="text-gray-700 text-sm text-right font-arabic">
                              {event.description.ar}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prizes Section */}
                {prizes?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Award className="h-5 w-5 text-tacir-orange" />
                      Prix et Récompenses
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {prizes.map((prize, index) => (
                        <div
                          key={index}
                          className="p-4 bg-yellow-50 rounded-xl border border-yellow-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-tacir-yellow bg-yellow-100 px-3 py-1 rounded-full">
                              Prix #{index + 1}
                            </span>
                            <span className="text-lg font-bold text-tacir-yellow">
                              {prize?.amount || 0} DT
                            </span>
                          </div>
                          {prize?.description?.fr && (
                            <p className="text-gray-900 text-base mb-2">
                              {prize.description.fr}
                            </p>
                          )}
                          {prize?.description?.ar && (
                            <p className="text-gray-900 text-base text-right font-arabic">
                              {prize.description.ar}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Metadata Summary */}
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Informations du Formulaire
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Statut</p>
                      <p
                        className={`font-medium text-sm inline-block px-3 py-1 rounded-full ${statusConfig[status].color}`}
                      >
                        {statusConfig[status].label}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Nombre de champs</p>
                      <p className="font-medium text-gray-900">
                        {fields?.length || 0} champs
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Date de création</p>
                      <p className="font-medium text-gray-900">
                        {createdAt ? formatDate(createdAt) : "Non spécifié"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Dernière modification
                      </p>
                      <p className="font-medium text-gray-900">
                        {updatedAt ? formatDate(updatedAt) : "Non spécifié"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "fields" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Champs du Formulaire ({fields?.length || 0})
                </h3>

                {fields?.length > 0 ? (
                  <div className="space-y-4">
                    {fields.map((field, index) => {
                      const fieldId =
                        field._id || `temp-${index}-${Date.now()}`;
                      return (
                        <div
                          key={`field-${fieldId}-${index}`}
                          className="p-4 bg-white rounded-xl border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-tacir-lightblue bg-tacir-lightblue/10 px-3 py-1 rounded-full">
                              {field.type}
                            </span>
                            <span className="text-sm text-gray-600">
                              {field.required ? "Requis" : "Optionnel"}
                            </span>
                          </div>
                          <CandidatureFormFieldRenderer
                            field={field}
                            previewMode
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <FileText className="h-10 w-10 mx-auto opacity-40 mb-3" />
                    <p className="text-base">
                      Aucun champ n'a été ajouté au formulaire
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CandidatureFormDetailsPreview;
