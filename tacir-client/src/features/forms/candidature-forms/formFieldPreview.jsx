// FormFieldRenderer.jsx
"use client";

const getFieldTypeLabel = (type) => {
  const labels = {
    text: "Réponse courte",
    textarea: "Réponse longue",
    number: "Nombre",
    radio: "Choix multiple",
  };
  return labels[type] || "Champ personnalisé";
};

const renderPreviewField = (field) => {
  switch (field.type) {
    case "text":
    case "textarea":
    case "number":
      return <div className="h-8 bg-gray-100 w-full rounded mt-2" />;
    case "radio":
      return (
        <div className="space-y-2 mt-2">
          {field.options?.map((option, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-4 w-4 border rounded-full" />
              <span>{option.label.fr}</span>
              <span className="text-right flex-1">{option.label.ar}</span>
            </div>
          ))}
        </div>
      );
    default:
      return <div className="h-8 bg-gray-100 w-full rounded mt-2" />;
  }
};

const CandidatureFormFieldRenderer = ({ field, previewMode }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.label?.fr}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <label className="block text-sm font-medium text-gray-700 text-right mt-1">
            {field.label?.ar}
          </label>
        </div>
        <span className="text-xs text-gray-500 ml-2">
          {getFieldTypeLabel(field.type)}
        </span>
      </div>

      {previewMode && (
        <div className="text-gray-500 italic">{renderPreviewField(field)}</div>
      )}
    </div>
  );
};

export default CandidatureFormFieldRenderer;
