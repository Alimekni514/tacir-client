"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, FileText } from "lucide-react";

const SaveAsTemplateDialog = ({
  open,
  onOpenChange,
  form,
  onSave,
  loading,
}) => {
  const [templateData, setTemplateData] = useState({
    title: { fr: "", ar: "" },
    description: { fr: "", ar: "" },
    category: "custom",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  const handleSave = () => {
    if (!templateData.title.fr.trim()) {
      return;
    }
    onSave(templateData);
  };

  const addTag = () => {
    if (tagInput.trim() && !templateData.tags.includes(tagInput.trim())) {
      setTemplateData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTemplateData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enregistrer comme modèle
          </DialogTitle>
          <DialogDescription>
            Créez un modèle réutilisable à partir de ce formulaire
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* French Title */}
          <div>
            <Label htmlFor="title-fr">Titre (Français) *</Label>
            <Input
              id="title-fr"
              value={templateData.title.fr}
              onChange={(e) =>
                setTemplateData((prev) => ({
                  ...prev,
                  title: { ...prev.title, fr: e.target.value },
                }))
              }
              placeholder="Nom du modèle en français"
            />
          </div>

          {/* Arabic Title */}
          <div>
            <Label htmlFor="title-ar">Titre (Arabe)</Label>
            <Input
              id="title-ar"
              value={templateData.title.ar}
              onChange={(e) =>
                setTemplateData((prev) => ({
                  ...prev,
                  title: { ...prev.title, ar: e.target.value },
                }))
              }
              placeholder="اسم النموذج بالعربية"
              dir="rtl"
            />
          </div>

          {/* French Description */}
          <div>
            <Label htmlFor="desc-fr">Description (Français)</Label>
            <Textarea
              id="desc-fr"
              value={templateData.description.fr}
              onChange={(e) =>
                setTemplateData((prev) => ({
                  ...prev,
                  description: { ...prev.description, fr: e.target.value },
                }))
              }
              placeholder="Décrivez l'utilisation de ce modèle"
              rows={3}
            />
          </div>

          {/* Arabic Description */}
          <div>
            <Label htmlFor="desc-ar">Description (Arabe)</Label>
            <Textarea
              id="desc-ar"
              value={templateData.description.ar}
              onChange={(e) =>
                setTemplateData((prev) => ({
                  ...prev,
                  description: { ...prev.description, ar: e.target.value },
                }))
              }
              placeholder="صف استخدام هذا النموذج"
              dir="rtl"
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Select
              value={templateData.category}
              onValueChange={(value) =>
                setTemplateData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">Événement</SelectItem>
                <SelectItem value="contest">Concours</SelectItem>
                <SelectItem value="application">Candidature</SelectItem>
                <SelectItem value="survey">Enquête</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Mots-clés</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ajouter un mot-clé"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Ajouter
                </Button>
              </div>
              {templateData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {templateData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !templateData.title.fr.trim()}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Enregistrer le modèle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveAsTemplateDialog;
