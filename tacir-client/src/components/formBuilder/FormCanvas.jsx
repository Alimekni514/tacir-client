import { Card } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import FormFieldRenderer from "./FormFieldRenderer";
import { useState, useRef } from "react";
import { generateId } from "../../lib/idGenerator";

const FormCanvas = ({
  fields,
  selectedFieldId,
  onSelectField,
  onRemoveField,
  onReorderFields,
  onAddField,
  ...props
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReceivingDrop, setIsReceivingDrop] = useState(false);
  const dragCounter = useRef(0);

  // Create a smaller drag image
  const createDragImage = (element, text) => {
    const dragImage = document.createElement("div");
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    dragImage.style.left = "-1000px";
    dragImage.style.width = "200px";
    dragImage.style.height = "60px";
    dragImage.style.backgroundColor = "white";
    dragImage.style.border = "2px solid #3B82F6";
    dragImage.style.borderRadius = "8px";
    dragImage.style.padding = "12px";
    dragImage.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
    dragImage.style.fontSize = "14px";
    dragImage.style.fontWeight = "500";
    dragImage.style.color = "#1E40AF";
    dragImage.style.display = "flex";
    dragImage.style.alignItems = "center";
    dragImage.style.justifyContent = "center";
    dragImage.style.transform = "rotate(-2deg)";
    dragImage.style.opacity = "0.9";
    dragImage.textContent = text;

    document.body.appendChild(dragImage);

    return dragImage;
  };

  // Handle drag start for existing fields (reordering)
  const handleDragStart = (e, field, index) => {
    setDraggedItem({ field, index, isReorder: true });
    setIsDragging(true);

    e.dataTransfer.effectAllowed = "move";

    // Create custom drag image
    const dragText = field.label?.fr || field.label || `Champ ${field.type}`;
    const dragImage = createDragImage(e.target, `📋 ${dragText}`);

    // Set the custom drag image
    setTimeout(() => {
      e.dataTransfer.setDragImage(dragImage, 100, 30);
      // Clean up the temporary element after a short delay
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      }, 100);
    }, 0);

    // Add visual feedback to the original element
    setTimeout(() => {
      if (e.target && e.target.closest(".draggable-field")) {
        e.target.closest(".draggable-field").style.opacity = "0.5";
        e.target.closest(".draggable-field").style.transform =
          "scale(0.95) rotate(1deg)";
      }
    }, 0);
  };

  // Handle drag end for existing fields
  const handleDragEnd = (e) => {
    setDraggedItem(null);
    setDragOverIndex(null);
    setIsDragging(false);
    setIsReceivingDrop(false);
    dragCounter.current = 0;

    // Reset visual feedback for all elements
    const draggableElements = document.querySelectorAll(".draggable-field");
    draggableElements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  };

  // Handle drag over for all types
  const handleDragOver = (e) => {
    e.preventDefault();

    // Check if it's a component from the panel
    const dragData = e.dataTransfer.types.includes("application/json");
    if (dragData) {
      e.dataTransfer.dropEffect = "copy";
      setIsReceivingDrop(true);
    } else {
      e.dataTransfer.dropEffect = "move";
    }
  };

  // Handle drag enter with better targeting
  const handleDragEnter = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;

    // Only set drag over index if we're not dragging the same item
    if (!draggedItem || draggedItem.index !== index) {
      setDragOverIndex(index);
    }
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setTimeout(() => {
        if (dragCounter.current === 0) {
          setDragOverIndex(null);
          setIsReceivingDrop(false);
        }
      }, 50);
    }
  };

  // Handle drop with better logic
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;

    // Check if it's a new component from the panel
    try {
      const dragDataString = e.dataTransfer.getData("application/json");
      if (dragDataString) {
        const dragData = JSON.parse(dragDataString);

        // Create new field from dragged component
        const newField = createFieldFromComponent(
          dragData.component,
          dragData.isTemplate
        );

        // Add field at specific index
        const newFields = [...fields];
        newFields.splice(dropIndex, 0, newField);

        if (onReorderFields) {
          onReorderFields(newFields);
        }

        setIsReceivingDrop(false);
        setDragOverIndex(null);
        return;
      }
    } catch (error) {
      console.log("Not a JSON drag operation, treating as reorder");
    }

    // Handle reordering of existing fields
    if (draggedItem && draggedItem.isReorder) {
      const sourceIndex = draggedItem.index;

      // Calculate the actual drop index
      let actualDropIndex = dropIndex;

      // If dragging from above to below, adjust index
      if (sourceIndex < dropIndex) {
        actualDropIndex = dropIndex - 1;
      }

      // Only reorder if the position actually changed
      if (sourceIndex !== actualDropIndex) {
        const newFields = [...fields];
        const [removed] = newFields.splice(sourceIndex, 1);
        newFields.splice(actualDropIndex, 0, removed);

        if (onReorderFields) {
          onReorderFields(newFields);
        }
      }
    }

    setDraggedItem(null);
    setDragOverIndex(null);
    setIsDragging(false);
    setIsReceivingDrop(false);
  };

  // Create field from component
  const createFieldFromComponent = (component, isTemplate = false) => {
    const mapOptions = (options) =>
      options?.map((option) => ({
        ...option,
        id: option._id || option.tempId || generateId(),
      })) || [];

    return isTemplate
      ? {
          id: component._id,
          type: component.type,
          label: component.label || { fr: "Nouveau champ", ar: "حقل جديد" },
          name: component.name || `field_${component._id}`,
          required: component.required ?? false,
          placeholder: component.placeholder || { fr: "", ar: "" },
          options: ["select", "radio", "checkbox"].includes(component.type)
            ? mapOptions(component.options)
            : undefined,
          isTemplate: true,
          templateId: component._id,
          ...(component.layout && { layout: component.layout }),
        }
      : {
          id: generateId(),
          type: component.type || component,
          label: {
            fr: `Nouveau ${component.type || component}`,
            ar: "حقل جديد",
          },
          name: `field_${generateId()}`,
          required: false,
          placeholder: { fr: "", ar: "" },
          options: ["select", "radio", "checkbox"].includes(component.type)
            ? mapOptions(component.options)
            : undefined,
          isTemplate: false,
          templateId: null,
        };
  };

  // Enhanced FormFieldRenderer with drag functionality
  const DraggableFormFieldRenderer = ({ field, index, ...fieldProps }) => {
    const isBeingDragged =
      draggedItem?.index === index && draggedItem?.isReorder;
    const isDropTarget = dragOverIndex === index;

    return (
      <div className="relative">
        {/* Drop indicator above */}
        {isDropTarget && !isBeingDragged && (
          <div className="absolute -top-3 left-0 right-0 z-20">
            <div className="h-1 bg-tacir-blue rounded-full opacity-80 relative">
              <div className="absolute -left-2 -top-1.5 w-4 h-4 bg-tacir-blue rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="absolute -right-2 -top-1.5 w-4 h-4 bg-tacir-blue rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        <div
          className={`draggable-field transition-all duration-200 ease-in-out relative ${
            isBeingDragged ? "opacity-50 scale-95" : ""
          } ${isDropTarget && !isBeingDragged ? "transform scale-102" : ""}`}
          draggable
          onDragStart={(e) => handleDragStart(e, field, index)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
        >
          <FormFieldRenderer
            field={field}
            {...fieldProps}
            className={`${fieldProps.className || ""} ${
              isBeingDragged ? "pointer-events-none" : ""
            } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          />
        </div>
      </div>
    );
  };

  return (
    <ScrollArea className="h-full px-6">
      <Card
        className={`min-h-[520px] p-6 transition-all duration-200 ${
          isDragging || isReceivingDrop
            ? "bg-tacir-lightgray/10 border-tacir-blue/30 border-2 border-dashed"
            : ""
        }`}
        onDragOver={handleDragOver}
        onDragEnter={(e) => {
          e.preventDefault();
          if (e.dataTransfer.types.includes("application/json")) {
            setIsReceivingDrop(true);
          }
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsReceivingDrop(false);
            setDragOverIndex(null);
          }
        }}
        onDrop={(e) => handleDrop(e, fields.length)}
      >
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div
              className={`text-center space-y-4 transition-all duration-300 ${
                isReceivingDrop ? "scale-110" : ""
              }`}
            >
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
                  isReceivingDrop
                    ? "bg-tacir-blue/20 border-2 border-tacir-blue border-dashed animate-pulse"
                    : "bg-tacir-lightgray/20"
                }`}
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    isReceivingDrop ? "text-tacir-blue" : "text-tacir-darkgray"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <p
                  className={`text-lg font-medium mb-2 transition-colors ${
                    isReceivingDrop ? "text-tacir-blue" : "text-tacir-darkblue"
                  }`}
                >
                  {isReceivingDrop
                    ? "Relâchez pour ajouter le champ"
                    : "Commencez à créer votre formulaire"}
                </p>
                <p className="text-sm text-tacir-darkgray">
                  {isReceivingDrop
                    ? "Le nouveau champ sera ajouté ici"
                    : "Glissez des champs depuis la palette ou cliquez pour les ajouter"}
                </p>
                <p className="text-xs text-tacir-darkgray mt-2">
                  Une fois ajoutés, vous pourrez les réorganiser par
                  glisser-déposer
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 relative">
            {/* Drag instruction hint */}
            {!isDragging && !isReceivingDrop && fields.length > 1 && (
              <div className="mb-6 p-3 bg-tacir-blue/5 border border-tacir-blue/20 rounded-lg">
                <p className="text-sm text-tacir-blue flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                  Glissez et déposez les champs pour les réorganiser
                </p>
              </div>
            )}

            {fields.map((field, index) => {
              const fieldId =
                field._id || field.id || `temp-${index}-${Date.now()}`;
              return (
                <DraggableFormFieldRenderer
                  key={`field-${fieldId}-${index}`}
                  field={field}
                  index={index}
                  onRemove={() => onRemoveField(field.id || field._id)}
                  onClick={() => onSelectField(field)}
                  isSelected={
                    selectedFieldId === (field.id || field._id?.toString())
                  }
                  {...props}
                />
              );
            })}

            {/* Bottom drop zone for new items */}
            {(isReceivingDrop || isDragging) && (
              <div
                className={`h-16 border-2 border-dashed rounded-lg transition-all duration-200 flex items-center justify-center relative ${
                  dragOverIndex === fields.length
                    ? "border-tacir-blue bg-tacir-blue/10 scale-105 animate-pulse"
                    : "border-tacir-lightgray/40 bg-tacir-lightgray/5"
                }`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, fields.length)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, fields.length)}
              >
                <p
                  className={`text-sm font-medium transition-colors ${
                    dragOverIndex === fields.length
                      ? "text-tacir-blue"
                      : "text-tacir-darkgray"
                  }`}
                >
                  {dragOverIndex === fields.length
                    ? "Relâchez pour ajouter ici"
                    : "Zone de dépôt"}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </ScrollArea>
  );
};

export default FormCanvas;
