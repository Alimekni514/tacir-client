"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getTemplates, getFormById } from "../../services/forms/formServices";
import FormPreview from "./FormPreview";
import ComponentPanel from "./ComponentPanel";
import MetadataEditor from "./MetadataEditor";
import FormCanvas from "./FormCanvas";
import SettingsSidebar from "./SettingsSidebar";
import { Button } from "../ui/button";
import { generateId } from "../../lib/idGenerator";
import { ChevronUp, ChevronDown, Settings, Copy } from "lucide-react";
import { toast } from "react-toastify";

const FormBuilder = ({ existingFormId }) => {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [selectedField, setSelectedField] = useState(null);
  const [showPredefined, setShowPredefined] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [metadataExpanded, setMetadataExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isUsingTemplate, setIsUsingTemplate] = useState(false);
  const [formData, setFormData] = useState({
    title: { fr: "", ar: "" },
    description: { fr: "", ar: "" },
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    eventLocation: { fr: "", ar: "" },
    prizes: [],
    fields: [],
    eventDates: [],
    region: { fr: "", ar: "" },
  });

  // Load form data when component mounts or when existingFormId/templateId changes
  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      try {
        if (templateId) {
          // Load template data
          const templateForm = await getFormById(templateId);
          if (templateForm) {
            setIsUsingTemplate(true);
            const templateFields = templateForm.fields.map((field) => ({
              id: generateId(),
              type: field.type,
              label: field.label || { fr: "Nouveau champ", ar: "حقل جديد" },
              name: field.name || `field_${generateId()}`,
              required: field.required ?? false,
              placeholder: field.placeholder || { fr: "", ar: "" },
              options: ["select", "radio", "checkbox"].includes(field.type)
                ? field.options?.map((option) => ({
                    ...option,
                    id: option._id || option.tempId || generateId(),
                  })) || []
                : undefined,
              isFromTemplate: true,
              templateFieldId: field._id,
            }));

            setFormData({
              title: {
                fr: `Copie de ${templateForm.title.fr}`,
                ar: `نسخة من ${templateForm.title.ar}`,
              },
              description: templateForm.description || { fr: "", ar: "" },
              startDate: new Date().toISOString(),
              endDate: new Date().toISOString(),
              eventLocation: templateForm.eventLocation || { fr: "", ar: "" },
              prizes: [],
              fields: templateFields,
              eventDates: [],
              region: { fr: "", ar: "" },
            });

            toast.success("Modèle appliqué avec succès!");
          }
        } else if (existingFormId) {
          // Load existing form for editing
          const existingForm = await getFormById(existingFormId);
          if (existingForm) {
            setFormData({
              ...existingForm,
              region: existingForm.region?.name || { fr: "", ar: "" },
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du formulaire:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [existingFormId, templateId]);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error("Échec du chargement des modèles:", error);
      }
    };
    loadTemplates();
  }, []);

  // Metadata handlers
  const handleMetadataChange = (updatedMetadata) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedMetadata,
    }));
  };

  // Update the handleAddField function
  const handleAddField = (field, isFromTemplate = false) => {
    const mapOptions = (options) =>
      options?.map((option) => ({
        ...option,
        id: option._id || option.tempId || generateId(),
      })) || [];

    const newField = isFromTemplate
      ? {
          id: field._id,
          type: field.type,
          label: field.label || { fr: "Nouveau champ", ar: "حقل جديد" },
          name: field.name || `field_${field._id}`,
          required: field.required ?? false,
          placeholder: field.placeholder || { fr: "", ar: "" },
          options: ["select", "radio", "checkbox"].includes(field.type)
            ? mapOptions(field.options)
            : undefined,
          isTemplate: true,
          templateId: field._id,
          ...(field.layout && { layout: field.layout }),
        }
      : {
          id: generateId(),
          type: field.type || field,
          label: { fr: `Nouveau ${field.type || field}`, ar: "حقل جديد" },
          name: `field_${generateId()}`,
          required: false,
          placeholder: { fr: "", ar: "" },
          options: ["select", "radio", "checkbox"].includes(field.type)
            ? mapOptions(field.options)
            : undefined,
          isTemplate: false,
          templateId: null,
        };

    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setSelectedField(newField);
  };

  // Field update handler
  const handleUpdateField = (updatedField) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((field) => {
        if (field.id === updatedField.id) {
          // For template fields, only allow certain properties to be updated
          if (field.isFromTemplate) {
            return {
              ...field,
              required: updatedField.required,
              placeholder: updatedField.placeholder,
            };
          }
          return updatedField;
        }
        return field;
      }),
    }));
    setSelectedField(updatedField);
  };

  const handleRemoveField = (fieldId) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleSelectField = (field) => {
    setSelectedField(field);
  };

  const handleReorderFields = (reorderedFields) => {
    setFormData((prev) => ({
      ...prev,
      fields: reorderedFields,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-46px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tacir-blue mx-auto"></div>
          <p className="mt-4 text-tacir-darkgray">
            {templateId
              ? "Chargement du modèle..."
              : "Chargement du formulaire..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-46px)] border-gray-600 bg-tacir-white bg-gradient-to-r from-tacir-blue/5 to-tacir-lightblue/5">
      <ComponentPanel
        onAddField={handleAddField}
        templates={templates}
        showPredefined={showPredefined}
        setShowPredefined={setShowPredefined}
        onTemplateApply={(templateFields) =>
          setFormData((prev) => ({
            ...prev,
            fields: [
              ...prev.fields,
              ...templateFields.map((field) => ({
                id: field._id,
                type: field.type,
                label: field.label,
                name: field.name || `field_${field._id || "new"}`,
                required: field.required,
                placeholder: field.placeholder || { fr: "", ar: "" },
                options: ["select", "radio", "checkbox"].includes(field.type)
                  ? field.options?.map((option) => ({
                      ...option,
                      id: option.id || option._id || generateId(),
                    }))
                  : undefined,
                isTemplate: true,
                templateId: field._id || null,
              })),
            ],
          }))
        }
      />

      <div className="flex-1 flex flex-col">
        <div className="px-6 py-2 border-b border-tacir-lightgray/30 bg-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-tacir-darkblue">
              Aperçu du Formulaire
            </h2>
            {isUsingTemplate && (
              <span className="flex items-center gap-2 text-sm text-tacir-blue bg-tacir-blue/10 px-3 py-1 rounded-full">
                <Copy className="h-4 w-4" />
                Basé sur un modèle
              </span>
            )}
          </div>
          <FormPreview
            fields={formData.fields}
            metadata={formData}
            existingFormId={existingFormId}
          />
        </div>

        {/* Metadata Section */}
        <div className="p-4 border-b overflow-auto border-tacir-lightgray/30">
          <div className="flex justify-between items-center pr-4 mb-2">
            <h3 className="text-lg font-bold text-tacir-darkblue flex items-center gap-3">
              <div className="p-2 bg-tacir-blue/10 rounded-lg">
                <Settings className="h-5 w-5 text-tacir-blue" />
              </div>
              Métadonnées du Formulaire
            </h3>
            <Button
              onClick={() => setMetadataExpanded(!metadataExpanded)}
              variant="outline"
              size="sm"
              className="text-tacir-blue border-tacir-blue/30 hover:bg-tacir-blue/10"
            >
              {metadataExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Réduire
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Développer
                </>
              )}
            </Button>
          </div>
          {metadataExpanded && (
            <div className="">
              <MetadataEditor
                metadata={formData}
                onChange={handleMetadataChange}
              />
            </div>
          )}
        </div>

        {/* Form Design Area */}
        <div className="flex-1 overflow-hidden">
          <FormCanvas
            fields={formData.fields}
            onSelectField={handleSelectField}
            onReorderFields={handleReorderFields}
            onRemoveField={handleRemoveField}
            selectedFieldId={selectedField?.id}
          />
        </div>
      </div>

      <SettingsSidebar
        selectedField={selectedField}
        onUpdateField={handleUpdateField}
        onRemoveField={handleRemoveField}
      />
    </div>
  );
};

export default FormBuilder;
