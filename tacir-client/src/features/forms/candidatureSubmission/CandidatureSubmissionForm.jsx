"use client";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import { toast } from "react-toastify";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Button } from "../../../components/ui/button";
import { Loader2, Calendar, MapPin, Award, FileText } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { submitCandidatureApplication } from "../../../services/forms/publicFormService";

const CandidatureFormDialog = ({ form, open, onOpenChange }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const formatDate = (dateString, locale = "fr-FR") => {
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderDescriptionWithLinks = (text, isArabic = false) => {
    const paragraphClass = isArabic ? "text-right arabic-text" : "";
    return text.split("\n").map((paragraph, index) => (
      <p key={index} className={`mb-3 ${paragraphClass}`}>
        {paragraph.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
          part.match(/^https?:\/\//) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tacir-blue hover:text-tacir-darkblue hover:underline font-medium"
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

  const onSubmit = async (data) => {
    try {
      const answers = form.fields.map((field) => ({
        field: field._id,
        value: data[field._id],
      }));

      await submitCandidatureApplication(form._id, answers);

      toast.success("Candidature soumise avec succès", {
        description: "Votre dossier de candidature a bien été enregistré",
      });

      onOpenChange(false);
    } catch (error) {
      toast.error("Échec de la soumission", {
        description: error.message || "Erreur lors de l'envoi du formulaire",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl min-w-[60vw] max-h-[96vh] p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Form Preview</DialogTitle>
        </VisuallyHidden>
        <ScrollArea className="h-[calc(96vh-1px)]">
          <div className="space-y-6 p-6 bg-tacir-lightgray/20">
            {/* Image Header */}
            {form.imageUrl && (
              <div className="w-full h-56 overflow-hidden rounded-lg mb-6 border-2 border-white shadow-md">
                <img
                  src={form.imageUrl}
                  alt="Form header"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Main Title */}
            <div className="grid grid-cols-2 gap-6 pb-6">
              <div>
                <div className="w-12 h-1 bg-tacir-pink mb-2"></div>
                <h1 className="text-2xl font-bold text-tacir-darkblue">
                  {form.title?.fr}
                </h1>
              </div>
              <div className="text-right">
                <div className="w-12 h-1 bg-tacir-pink ml-auto mb-2"></div>
                <h1 className="text-2xl font-bold text-tacir-darkblue arabic-text">
                  {form.title?.ar}
                </h1>
              </div>
            </div>

            {/* Programme Description */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-tacir-lightblue/10 rounded-full">
                    <FileText className="h-4 w-4 text-tacir-lightblue" />
                  </div>
                  <h2 className="text-lg font-semibold text-tacir-darkblue">
                    Contexte du Programme
                  </h2>
                </div>
                <div className="text-sm text-tacir-darkgray">
                  {renderDescriptionWithLinks(form.description?.fr)}
                </div>
              </div>
              <div className="space-y-3 border-l border-tacir-lightgray lg:pl-6">
                <div className="flex items-center gap-2 mb-3 justify-end">
                  <h2 className="text-lg font-semibold text-tacir-darkblue arabic-text">
                    سياق البرنامج
                  </h2>
                  <div className="p-1.5 bg-tacir-lightblue/10 rounded-full">
                    <FileText className="h-4 w-4 text-tacir-lightblue" />
                  </div>
                </div>
                <div className="text-sm text-tacir-darkgray">
                  {renderDescriptionWithLinks(form.description?.ar, true)}
                </div>
              </div>
            </section>

            {/* Event Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dates */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-tacir-yellow/10 rounded-full">
                      <Calendar className="h-4 w-4 text-tacir-yellow" />
                    </div>
                    <h2 className="text-lg font-semibold text-tacir-darkblue">
                      Dates Importantes
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-tacir-darkblue arabic-text">
                      التواريخ المهمة
                    </h2>
                    <div className="p-1.5 bg-tacir-yellow/10 rounded-full">
                      <Calendar className="h-4 w-4 text-tacir-yellow" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {form.eventDates?.map((event, index) => (
                    <div
                      key={index}
                      className="border-l-3 border-tacir-yellow/50 pl-4 py-1"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-base font-medium text-tacir-darkblue">
                            {formatDate(event.date, "fr-FR")}
                          </p>
                          <p className="text-sm text-tacir-darkgray">
                            {event.description?.fr}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-medium text-tacir-darkblue arabic-text">
                            {formatDate(event.date, "ar-TN")}
                          </p>
                          <p className="text-sm text-tacir-darkgray arabic-text">
                            {event.description?.ar}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Location */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-tacir-green/10 rounded-full">
                      <MapPin className="h-4 w-4 text-tacir-green" />
                    </div>
                    <h2 className="text-lg font-semibold text-tacir-darkblue">
                      Lieu de l'Événement
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-tacir-darkblue arabic-text">
                      مكان الحدث
                    </h2>
                    <div className="p-1.5 bg-tacir-green/10 rounded-full">
                      <MapPin className="h-4 w-4 text-tacir-green" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <p className="text-sm text-tacir-darkgray">
                    {form.eventLocation?.fr}
                  </p>
                  <p className="text-sm text-tacir-darkgray text-right arabic-text">
                    {form.eventLocation?.ar}
                  </p>
                </div>
              </section>
            </div>

            {/* Prizes */}
            {form.prizes && form.prizes.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-tacir-pink/10 rounded-full">
                      <Award className="h-4 w-4 text-tacir-pink" />
                    </div>
                    <h2 className="text-lg font-semibold text-tacir-darkblue">
                      Prix et Récompenses
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-tacir-darkblue arabic-text">
                      الجوائز
                    </h2>
                    <div className="p-1.5 bg-tacir-pink/10 rounded-full">
                      <Award className="h-4 w-4 text-tacir-pink" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.prizes?.map((prize, index) => (
                    <div
                      key={index}
                      className="bg-tacir-lightgray/20 p-4 rounded-lg border border-tacir-lightgray"
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-tacir-darkblue">
                            {prize.amount} DT
                          </p>
                          <p className="text-sm text-tacir-darkgray">
                            {prize.description?.fr}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-semibold text-tacir-darkblue arabic-text">
                            {prize.amount} دينار
                          </p>
                          <p className="text-sm text-tacir-darkgray arabic-text">
                            {prize.description?.ar}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Application Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <section className="bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-tacir-blue/10 rounded-full">
                      <FileText className="h-4 w-4 text-tacir-blue" />
                    </div>
                    <h2 className="text-lg font-semibold text-tacir-darkblue">
                      Formulaire de Candidature
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-tacir-darkblue arabic-text">
                      استمارة الترشح
                    </h2>
                    <div className="p-1.5 bg-tacir-blue/10 rounded-full">
                      <FileText className="h-4 w-4 text-tacir-blue" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {form.fields?.map((field, index) => (
                    <div
                      key={index}
                      className="bg-tacir-lightgray/20 p-4 rounded-lg border border-tacir-lightgray"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-tacir-darkblue">
                            {field.label.fr}
                            {field.required && (
                              <span className="text-tacir-pink ml-1">*</span>
                            )}
                          </label>
                          <label className="block text-sm font-medium text-tacir-darkblue arabic-text">
                            {field.label.ar}
                            {field.required && (
                              <span className="text-tacir-pink ml-1">*</span>
                            )}
                          </label>
                        </div>
                        <FormFieldRenderer
                          field={field}
                          register={register}
                          errors={errors}
                        />
                        {errors[field._id] && (
                          <p className="text-tacir-pink text-xs mt-1">
                            {errors[field._id].message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Submission Buttons */}
              <div className="sticky bottom-0 bg-white p-4 mt-4 border-t border-tacir-lightgray shadow-md rounded-b-xl">
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="text-sm px-4 py-4 border-tacir-blue text-tacir-blue hover:bg-tacir-lightgray"
                  >
                    <div className="flex flex-col">
                      <span>Annuler</span>
                      <span className="arabic-text text-xs mt-0.5">إلغاء</span>
                    </div>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-sm px-4 py-4 bg-tacir-blue hover:bg-tacir-darkblue"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <div className="flex flex-col">
                        <span>Soumettre</span>
                        <span className="arabic-text text-xs mt-0.5">
                          تقديم
                        </span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Closing */}
            <div className="text-center  border-t border-tacir-lightgray">
              <p className="text-lg font-semibold text-tacir-darkblue mb-2">
                Nous sommes impatient·e·s de vous rencontrer !
              </p>
              <p className="text-lg font-semibold text-tacir-darkblue arabic-text">
                نتطلع بشغف للقاءكم!
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const FormFieldRenderer = ({ field, register, errors }) => {
  const commonProps = {
    ...register(field._id, {
      required: field.required && "Ce champ est requis",
      pattern:
        field.type === "email"
          ? {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Format d'email invalide",
            }
          : undefined,
      valueAsNumber: field.type === "number" ? true : undefined,
    }),
    className:
      "w-full p-2 text-sm border border-tacir-darkgray rounded-md focus:ring-1 focus:ring-tacir-blue focus:border-transparent",
  };

  switch (field.type) {
    case "textarea":
      return <textarea {...commonProps} rows={3} />;
    case "select":
      return (
        <select {...commonProps}>
          <option value="">Sélectionner / إختر</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label.fr} - {option.label.ar}
            </option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div className="grid gap-2">
          {field.options?.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 p-1.5 hover:bg-tacir-lightgray/20 rounded-md"
            >
              <input
                type="radio"
                value={option.value}
                {...commonProps}
                className="h-3 w-3 text-tacir-blue"
              />
              <div className="flex flex-col">
                <span className="text-sm">{option.label.fr}</span>
                <span className="text-xs arabic-text text-tacir-darkgray">
                  {option.label.ar}
                </span>
              </div>
            </label>
          ))}
        </div>
      );
    default:
      return <input type={field.type} {...commonProps} />;
  }
};
export default CandidatureFormDialog;
