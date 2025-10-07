"use client";
import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Search, Plus, FileText, Calendar, MapPin, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const TemplateManager = ({
  open,
  onOpenChange,
  templates,
  onApplyTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTemplates = templates.filter(
    (template) =>
      template.title.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.title.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.fr
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      template.description?.ar
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      template.templateTags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const getTemplateIcon = (template) => {
    if (template.templateCategory === "event")
      return <Calendar className="h-5 w-5 text-blue-500" />;
    if (template.templateCategory === "contest")
      return <Award className="h-5 w-5 text-amber-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choisir un modèle</DialogTitle>
          <DialogDescription>
            Sélectionnez un modèle pour créer un nouveau formulaire
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des modèles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground flex-1 flex items-center justify-center">
              {searchTerm ? (
                <p>Aucun modèle trouvé pour "{searchTerm}"</p>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-12 w-12 opacity-30" />
                  <p>Aucun modèle disponible</p>
                  <p className="text-sm">
                    Créez votre premier modèle en enregistrant un formulaire
                    existant
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 flex-1">
              {filteredTemplates.map((template) => (
                <Card
                  key={template._id}
                  className="p-4 hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent rounded-md mt-1">
                      {getTemplateIcon(template)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {template.title.fr}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {template.description?.fr || "Aucune description"}
                      </p>

                      <div className="flex items-center mt-3 gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {template.fields?.length || 0} champs
                        </span>
                        <span className="text-xs bg-accent px-2 py-1 rounded-full">
                          {template.templateCategory}
                        </span>
                        {template.templateUsageCount > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Utilisé {template.templateUsageCount} fois
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="mt-3 w-full group-hover:bg-primary transition-colors"
                    onClick={() => onApplyTemplate(template._id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Utiliser ce modèle
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateManager;
