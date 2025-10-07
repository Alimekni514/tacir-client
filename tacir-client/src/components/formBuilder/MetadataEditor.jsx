import { Calendar } from "../../components/ui/calendar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon, TrashIcon, Trophy } from "lucide-react";

const MetadataEditor = ({ metadata, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...metadata, [field]: value });
  };

  const handleNestedChange = (parent, key, value) => {
    onChange({
      ...metadata,
      [parent]: { ...metadata[parent], [key]: value },
    });
  };
  const addEventDate = () => {
    handleChange("eventDates", [
      ...(metadata.eventDates || []),
      { date: "", description: { fr: "", ar: "" } },
    ]);
  };

  const removeEventDate = (index) => {
    const updated = [...metadata.eventDates];
    updated.splice(index, 1);
    handleChange("eventDates", updated);
  };

  const updateEventDate = (index, field, value, lang) => {
    const updated = [...metadata.eventDates];
    if (field === "description") {
      updated[index].description[lang] = value;
    } else {
      updated[index][field] = value;
    }
    handleChange("eventDates", updated);
  };

  const handlePrizeChange = (index, field, value, lang) => {
    const newPrizes = metadata.prizes.map((prize, i) => {
      if (i !== index) return prize;

      if (field === "description") {
        return {
          ...prize,
          description: {
            ...prize.description,
            [lang]: value,
          },
        };
      }

      return {
        ...prize,
        [field]: value,
      };
    });

    onChange({ ...metadata, prizes: newPrizes });
  };

  const addPrize = () => {
    onChange({
      ...metadata,
      prizes: [
        ...metadata.prizes,
        {
          amount: 0,
          description: { fr: "", ar: "" },
          id: Date.now().toString(),
        },
      ],
    });
  };

  const removePrize = (index) => {
    const newPrizes = metadata.prizes.filter((_, i) => i !== index);
    onChange({ ...metadata, prizes: newPrizes });
  };

  return (
    <Card className="w-full border-tacir-lightgray/30 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-tacir-darkblue flex items-center gap-2">
          <div className="p-2 bg-tacir-blue/10 rounded-full">
            <CalendarIcon className="h-5 w-5 text-tacir-blue" />
          </div>
          Paramètres de Candidature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Section Titre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-tacir-darkblue font-medium">
              Titre (Français)
            </Label>
            <Input
              value={metadata.title?.fr || ""}
              onChange={(e) =>
                handleNestedChange("title", "fr", e.target.value)
              }
              className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
              placeholder="Titre en français"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-tacir-darkblue font-medium">
              Titre (Arabe)
            </Label>
            <Input
              dir="rtl"
              value={metadata.title?.ar || ""}
              onChange={(e) =>
                handleNestedChange("title", "ar", e.target.value)
              }
              className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
              placeholder="أدخل العنوان بالعربية"
            />
          </div>
        </div>

        {/* Section Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-tacir-darkblue font-medium">
              Description (Français)
            </Label>
            <Textarea
              value={metadata.description?.fr || ""}
              onChange={(e) =>
                handleNestedChange("description", "fr", e.target.value)
              }
              className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20 min-h-[100px]"
              placeholder="Description en français"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-tacir-darkblue font-medium">
              Description (Arabe)
            </Label>
            <Textarea
              dir="rtl"
              value={metadata.description?.ar || ""}
              onChange={(e) =>
                handleNestedChange("description", "ar", e.target.value)
              }
              className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20 min-h-[100px]"
              placeholder="أدخل الوصف بالعربية"
            />
          </div>
        </div>

        {/* URL de l'image */}
        <div className="space-y-3">
          <Label className="text-tacir-darkblue font-medium">
            URL de l'Image
          </Label>
          <div className="flex gap-2">
            <Input
              value={metadata.imageUrl || ""}
              onChange={(e) => {
                e.stopPropagation();
                handleChange("imageUrl", e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="Entrez l'URL de l'image pour l'en-tête du formulaire"
              className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
            />
            {metadata.imageUrl && (
              <Button
                className="bg-tacir-blue hover:bg-tacir-darkblue text-white whitespace-nowrap"
                type="button"
                size="sm"
                onClick={() => window.open(metadata.imageUrl, "_blank")}
              >
                Aperçu
              </Button>
            )}
          </div>
        </div>

        {/* Section Région */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-tacir-darkblue font-medium">
              Région (Français)
            </Label>
            <Input
              value={metadata.region?.fr || ""}
              onChange={(e) =>
                handleNestedChange("region", "fr", e.target.value)
              }
              placeholder="Entrez le nom de la région en français"
              className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-tacir-darkblue font-medium">
              Région (Arabe)
            </Label>
            <Input
              dir="rtl"
              value={metadata.region?.ar || ""}
              onChange={(e) =>
                handleNestedChange("region", "ar", e.target.value)
              }
              placeholder="أدخل اسم المنطقة بالعربية"
              className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
            />
          </div>
        </div>

        {/* Dates de l'événement */}
        <div className="space-y-4 p-4 bg-tacir-lightgray/10 rounded-lg">
          <h3 className="font-semibold text-tacir-darkblue text-lg">
            Dates de l'Événement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-tacir-darkblue">Date de Début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-tacir-lightgray/50 hover:bg-white hover:border-tacir-blue/50"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-tacir-blue" />
                    {metadata.startDate
                      ? format(new Date(metadata.startDate), "dd/MM/yyyy")
                      : "Sélectionner la date de début"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-tacir-lightgray/50 shadow-lg">
                  <Calendar
                    mode="single"
                    selected={
                      metadata.startDate
                        ? new Date(metadata.startDate)
                        : undefined
                    }
                    onSelect={(date) =>
                      handleChange("startDate", date.toISOString())
                    }
                    initialFocus
                    className="border-0"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-tacir-darkblue">Date de Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-tacir-lightgray/50 hover:bg-white hover:border-tacir-blue/50"
                    disabled={!metadata.startDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-tacir-blue" />
                    {metadata.endDate
                      ? format(new Date(metadata.endDate), "dd/MM/yyyy")
                      : "Sélectionner la date de fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-tacir-lightgray/50 shadow-lg">
                  <Calendar
                    mode="single"
                    selected={
                      metadata.endDate ? new Date(metadata.endDate) : undefined
                    }
                    onSelect={(date) =>
                      handleChange("endDate", date.toISOString())
                    }
                    initialFocus
                    fromDate={
                      metadata.startDate
                        ? new Date(metadata.startDate)
                        : undefined
                    }
                    className="border-0"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Lieu de l'événement */}
        <div className="space-y-4 p-4 bg-tacir-lightgray/10 rounded-lg">
          <h3 className="font-semibold text-tacir-darkblue text-lg">
            Lieu de l'Événement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-tacir-darkblue">Français</Label>
              <Input
                value={metadata.eventLocation?.fr || ""}
                onChange={(e) =>
                  handleNestedChange("eventLocation", "fr", e.target.value)
                }
                className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
                placeholder="Lieu en français"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-tacir-darkblue">Arabe</Label>
              <Input
                dir="rtl"
                value={metadata.eventLocation?.ar || ""}
                onChange={(e) =>
                  handleNestedChange("eventLocation", "ar", e.target.value)
                }
                className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
                placeholder="المكان بالعربية"
              />
            </div>
          </div>
        </div>

        {/* Dates spécifiques de l'événement */}
        <div className="space-y-4 p-4 bg-tacir-lightgray/10 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-tacir-darkblue text-lg">
              Dates Spécifiques
            </h3>
            <Button
              size="sm"
              onClick={addEventDate}
              className="bg-tacir-blue hover:bg-tacir-darkblue text-white"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Ajouter une Date
            </Button>
          </div>

          <div className="space-y-3">
            {metadata.eventDates?.map((event, index) => (
              <Card
                key={index}
                className="p-4 bg-white border-tacir-lightgray/30"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-tacir-darkblue">
                    Événement #{index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEventDate(index)}
                    className="text-tacir-pink hover:text-tacir-pink/80 hover:bg-tacir-pink/10 h-8 w-8"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-tacir-darkblue text-sm">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-tacir-lightgray/50 hover:bg-white hover:border-tacir-blue/50 text-sm"
                        >
                          <CalendarIcon className="mr-2 h-3 w-3 text-tacir-blue" />
                          {event.date
                            ? format(new Date(event.date), "dd/MM/yyyy")
                            : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-tacir-lightgray/50 shadow-lg">
                        <Calendar
                          mode="single"
                          selected={
                            event.date ? new Date(event.date) : undefined
                          }
                          onSelect={(date) =>
                            updateEventDate(index, "date", date.toISOString())
                          }
                          className="border-0"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-tacir-darkblue text-sm">
                      Description (FR)
                    </Label>
                    <Input
                      value={event.description?.fr || ""}
                      onChange={(e) =>
                        updateEventDate(
                          index,
                          "description",
                          e.target.value,
                          "fr"
                        )
                      }
                      className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20 text-sm"
                      placeholder="Description FR"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-tacir-darkblue text-sm">
                      الوصف (AR)
                    </Label>
                    <Input
                      value={event.description?.ar || ""}
                      onChange={(e) =>
                        updateEventDate(
                          index,
                          "description",
                          e.target.value,
                          "ar"
                        )
                      }
                      className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20 text-sm"
                      placeholder="الوصف AR"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Section Prix */}
        <div className="space-y-4 p-4 bg-tacir-lightgray/10 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-tacir-darkblue text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-tacir-yellow" />
              Prix
            </h3>
            <Button
              size="sm"
              onClick={addPrize}
              className="bg-tacir-orange hover:bg-amber-600 text-white"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Ajouter un Prix
            </Button>
          </div>
          <div className="space-y-3">
            {metadata.prizes?.map((p, i) => (
              <Card key={i} className="p-4 bg-white border-tacir-lightgray/30">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-tacir-darkblue">
                    Prix #{i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePrize(i)}
                    className="text-tacir-pink hover:text-tacir-pink/80 hover:bg-tacir-pink/10 h-8 w-8"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-tacir-darkblue text-sm">
                      Montant (DT)
                    </Label>
                    <Input
                      type="number"
                      value={p.amount}
                      onChange={(e) =>
                        handlePrizeChange(i, "amount", Number(e.target.value))
                      }
                      className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-tacir-darkblue text-sm">
                      Description (FR)
                    </Label>
                    <Input
                      value={p.description?.fr || ""}
                      onChange={(e) =>
                        handlePrizeChange(
                          i,
                          "description",
                          e.target.value,
                          "fr"
                        )
                      }
                      className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
                      placeholder="Description FR"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-tacir-darkblue text-sm">
                      Description (AR)
                    </Label>
                    <Input
                      dir="rtl"
                      value={p.description?.ar || ""}
                      onChange={(e) =>
                        handlePrizeChange(
                          i,
                          "description",
                          e.target.value,
                          "ar"
                        )
                      }
                      className="border-tacir-lightgray/50 focus:border-tacir-blue focus:ring-1 focus:ring-tacir-blue/20"
                      placeholder="الوصف AR"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetadataEditor;
