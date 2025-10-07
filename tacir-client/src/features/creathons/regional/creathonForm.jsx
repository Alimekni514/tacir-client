"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Box,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import {
  getComponentCoordinators,
  getIncubationCoordinators,
} from "@/services/users/members";
import { createCreathon, updateCreathon } from "@/services/creathons/creathons";

const COMPONENT_OPTIONS = [
  {
    value: "crea",
    label: "CREA - Créativité",
    color: "bg-tacir-blue text-white",
  },
  {
    value: "inov",
    label: "INOV - Innovation",
    color: "bg-tacir-green text-white",
  },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon", color: "bg-tacir-darkgray" },
  { value: "planned", label: "Planifié", color: "bg-tacir-blue" },
  { value: "ongoing", label: "En cours", color: "bg-tacir-yellow" },
  { value: "completed", label: "Terminé", color: "bg-tacir-green" },
  { value: "cancelled", label: "Annulé", color: "bg-tacir-pink" },
];

const CreathonForm = ({ onClose, creathon }) => {
  const userRegionId =
    typeof window !== "undefined" ? localStorage.getItem("userRegionId") : null;
  const regionName =
    typeof window !== "undefined" ? localStorage.getItem("regionName") : null;

  const [formData, setFormData] = useState({
    title: creathon?.title || "",
    description: creathon?.description || "",
    image: creathon?.image || "",
    component: creathon?.component || "",
    componentCoordinator:
      creathon?.coordinators?.componentCoordinator?._id ||
      creathon?.coordinators?.componentCoordinator ||
      "",
    generalCoordinator:
      creathon?.coordinators?.generalCoordinator?._id ||
      creathon?.coordinators?.generalCoordinator ||
      "",
    region: userRegionId || creathon?.region || "",
    location: {
      address: creathon?.location?.address || "",
      city: creathon?.location?.city || "",
      venue: creathon?.location?.venue || "",
    },
    dates: {
      startDate:
        creathon?.dates?.startDate ||
        (creathon?.startDate
          ? new Date(creathon.startDate).toISOString().split("T")[0]
          : ""),
      endDate:
        creathon?.dates?.endDate ||
        (creathon?.endDate
          ? new Date(creathon.endDate).toISOString().split("T")[0]
          : ""),
      registrationDeadline:
        creathon?.dates?.registrationDeadline ||
        (creathon?.registrationDeadline
          ? new Date(creathon.registrationDeadline).toISOString().split("T")[0]
          : ""),
    },
    duration: creathon?.duration ?? 3,
    capacity: {
      maxParticipants: creathon?.capacity?.maxParticipants ?? 50,
      maxTeams: creathon?.capacity?.maxTeams ?? 10,
    },
    jury: {
      numberOfJuries: creathon?.jury?.numberOfJuries ?? 5,
    },
    mentors: {
      numberOfMentors: creathon?.mentors?.numberOfMentors ?? 10,
    },
    budget: creathon?.budget || {
      totalBudget: 0,
      allocatedBudget: 0,
      expenses: [],
    },
    resources: creathon?.resources || {
      materials: [],
      equipment: [],
      facilities: [],
    },
    status: creathon?.status || "draft",
  });
  const [componentCoordinators, setComponentCoordinators] = useState([]);
  const [incubationCoordinators, setIncubationCoordinators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coordinatorsRes, incubationCoordsRes] = await Promise.all([
          getComponentCoordinators(),
          getIncubationCoordinators(),
        ]);
        setComponentCoordinators(coordinatorsRes);
        setIncubationCoordinators(incubationCoordsRes);
      } catch (error) {
        toast.error("Échec de la récupération des données requises");
        console.error("Erreur de récupération:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateTab = (tab) => {
    const newErrors = {};

    if (tab === "general") {
      if (!formData.title) newErrors.title = "Le titre est requis";
      if (!formData.image) newErrors.image = "L'image est requise";
      if (!formData.component)
        newErrors.component = "La composante est requise";
      if (!formData.componentCoordinator)
        newErrors.componentCoordinator =
          "Le coordinateur de composante est requis";
    }

    if (tab === "logistics") {
      if (!formData.dates.startDate)
        newErrors.startDate = "La date de début est requise";
      if (!formData.dates.endDate)
        newErrors.endDate = "La date de fin est requise";
      if (!formData.dates.registrationDeadline)
        newErrors.registrationDeadline =
          "La date limite d'inscription est requise";
      if (!formData.duration || formData.duration < 1)
        newErrors.duration = "La durée doit être d'au moins 1 jour";
      if (
        !formData.capacity.maxParticipants ||
        formData.capacity.maxParticipants < 1
      )
        newErrors.maxParticipants =
          "Le nombre de participants doit être d'au moins 1";
      if (!formData.capacity.maxTeams || formData.capacity.maxTeams < 1)
        newErrors.maxTeams = "Le nombre d'équipes doit être d'au moins 1";

      // Date validation
      if (formData.dates.startDate && formData.dates.endDate) {
        if (
          new Date(formData.dates.endDate) <= new Date(formData.dates.startDate)
        ) {
          newErrors.endDate = "La date de fin doit être après la date de début";
        }
      }

      if (formData.dates.registrationDeadline && formData.dates.startDate) {
        if (
          new Date(formData.dates.registrationDeadline) >=
          new Date(formData.dates.startDate)
        ) {
          newErrors.registrationDeadline =
            "La date limite d'inscription doit être avant la date de début";
        }
      }
    }

    if (tab === "team") {
      if (
        !formData.mentors.numberOfMentors ||
        formData.mentors.numberOfMentors < 0
      )
        newErrors.numberOfMentors = "Le nombre de mentors doit être positif";
      if (!formData.jury.numberOfJuries || formData.jury.numberOfJuries < 0)
        newErrors.numberOfJuries = "Le nombre de jurés doit être positif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (path, value) => {
    setFormData((prev) => {
      const keys = path.split(".");
      const updated = { ...prev };
      let current = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = { ...current[key] }; // ensure immutability
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });

    // Clear error when field is updated
    if (errors[path]) {
      const newErrors = { ...errors };
      delete newErrors[path];
      setErrors(newErrors);
    }
  };

  const handleResourceChange = (resourceType, value) => {
    setFormData((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        [resourceType]: value.split(",").map((item) => item.trim()),
      },
    }));
  };

  const handleNextTab = () => {
    const tabs = ["general", "logistics", "team", "resources"];
    const currentIndex = tabs.indexOf(activeTab);

    if (validateTab(activeTab) && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePrevTab = () => {
    const tabs = ["general", "logistics", "team", "resources"];
    const currentIndex = tabs.indexOf(activeTab);

    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateTab(activeTab)) {
      toast.error("Veuillez corriger les erreurs avant de soumettre");
      return;
    }

    try {
      setLoading(true);
      const creathonData = {
        ...formData,
        coordinators: {
          componentCoordinator: formData.componentCoordinator,
          generalCoordinator: formData.generalCoordinator,
        },
      };
      const payload = {
        ...creathonData,
        dates: {
          startDate: new Date(creathonData.dates.startDate).toISOString(),
          endDate: new Date(creathonData.dates.endDate).toISOString(),
          registrationDeadline: new Date(
            creathonData.dates.registrationDeadline
          ).toISOString(),
        },
      };

      if (creathon) {
        await updateCreathon(creathon._id, payload);
        toast.success("Créathon mis à jour avec succès");
      } else {
        await createCreathon(payload);
        toast.success("Créathon créé avec succès");
      }
      onClose();
    } catch (error) {
      console.error("Erreur détaillée:", error);

      // Handle both array and single message errors
      if (error.validationErrors) {
        const errors = Array.isArray(error.validationErrors)
          ? error.validationErrors
          : [error.validationErrors];

        errors.forEach((msg) => {
          if (typeof msg === "string") {
            toast.error(msg);
          } else if (msg.message) {
            toast.error(msg.message);
          }
        });
      } else {
        toast.error(error.message || "Erreur lors de la création");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredComponentCoordinators = componentCoordinators.filter(
    (coordinator) => coordinator.component === formData.component
  );

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="flex border-b border-tacir-lightgray overflow-x-auto">
        {["general", "logistics", "team", "resources"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`px-4 py-3 font-medium flex items-center whitespace-nowrap ${
              activeTab === tab
                ? "border-b-2 border-tacir-blue text-tacir-blue"
                : "text-tacir-darkgray"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "general" && <Calendar className="h-4 w-4 mr-2" />}
            {tab === "logistics" && <MapPin className="h-4 w-4 mr-2" />}
            {tab === "team" && <Users className="h-4 w-4 mr-2" />}
            {tab === "resources" && <Box className="h-4 w-4 mr-2" />}
            {tab === "general" && "Informations Générales"}
            {tab === "logistics" && "Logistique"}
            {tab === "team" && "Équipe"}
            {tab === "resources" && "Ressources"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "general" && (
          <Card className="border-tacir-lightgray">
            <CardHeader className="bg-tacir-lightgray">
              <CardTitle className="flex items-center space-x-2 text-tacir-darkblue">
                <Calendar className="h-5 w-5 text-tacir-blue" />
                <span>Informations générales</span>
              </CardTitle>
              <CardDescription className="text-tacir-darkgray">
                Définissez les détails principaux de votre créathon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title" className="text-tacir-darkblue">
                    Titre du Créathon *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Creathon 2024/2025 - Nadhour"
                    className="mt-1 border-tacir-lightgray focus:border-tacir-blue"
                    required
                  />
                  {errors.title && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-tacir-darkblue">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Décrivez le thème et les objectifs du créathon..."
                    className="mt-1 min-h-[100px] border-tacir-lightgray focus:border-tacir-blue"
                  />
                </div>

                <div>
                  <Label htmlFor="image" className="text-tacir-darkblue">
                    Image (URL) *
                  </Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="border-tacir-lightgray focus:border-tacir-blue"
                    required
                  />
                  {errors.image && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.image}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status" className="text-tacir-darkblue">
                    Statut
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger className="mt-1 border-tacir-lightgray focus:border-tacir-blue">
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${option.color} mr-2`}
                          ></span>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="region" className="text-tacir-darkblue">
                    Région
                  </Label>
                  <Input
                    id="region"
                    value={regionName || "Région non disponible"}
                    readOnly
                    className="mt-1 bg-tacir-lightgray border-tacir-lightgray"
                  />
                  <input type="hidden" name="region" value={formData.region} />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-tacir-darkblue">Composante *</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {COMPONENT_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.component === option.value
                            ? "border-tacir-blue bg-tacir-lightblue/10 bg-opacity-10"
                            : "border-tacir-lightgray hover:border-tacir-blue"
                        }`}
                        onClick={() =>
                          handleInputChange("component", option.value)
                        }
                      >
                        <div
                          className={`text-sm font-medium ${option.color} px-2 py-1 rounded-full w-fit`}
                        >
                          {option.label.split(" - ")[0]}
                        </div>
                        <p className="mt-1 text-sm text-tacir-darkgray">
                          {option.label.split(" - ")[1]}
                        </p>
                      </div>
                    ))}
                  </div>
                  {errors.component && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.component}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="componentCoordinator"
                    className="text-tacir-darkblue"
                  >
                    Coordinateur de la composante *
                  </Label>
                  <Select
                    value={formData.componentCoordinator}
                    onValueChange={(value) =>
                      handleInputChange("componentCoordinator", value)
                    }
                    disabled={
                      !formData.component ||
                      filteredComponentCoordinators.length === 0
                    }
                    required
                  >
                    <SelectTrigger className="mt-1 border-tacir-lightgray focus:border-tacir-blue">
                      <SelectValue placeholder="Sélectionnez un coordinateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredComponentCoordinators.map((coordinator) => (
                        <SelectItem key={coordinator.id} value={coordinator.id}>
                          {coordinator.firstName} {coordinator.lastName} (
                          {coordinator.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.componentCoordinator && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.componentCoordinator}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="generalCoordinator"
                    className="text-tacir-darkblue"
                  >
                    Coordinateur général
                  </Label>
                  <Select
                    value={formData.generalCoordinator}
                    onValueChange={(value) =>
                      handleInputChange("generalCoordinator", value)
                    }
                  >
                    <SelectTrigger className="mt-1 border-tacir-lightgray focus:border-tacir-blue">
                      <SelectValue placeholder="Choisir le coordinateur Générale Responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {incubationCoordinators.map((coordinator) => (
                        <SelectItem key={coordinator.id} value={coordinator.id}>
                          {coordinator.firstName} {coordinator.lastName} (
                          {coordinator.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "logistics" && (
          <Card className="border-tacir-lightgray">
            <CardHeader className="bg-tacir-lightgray">
              <CardTitle className="flex items-center space-x-2 text-tacir-darkblue">
                <MapPin className="h-5 w-5 text-tacir-blue" />
                <span>Logistique</span>
              </CardTitle>
              <CardDescription className="text-tacir-darkgray">
                Configurez les aspects logistiques de l'événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-tacir-darkblue mb-3">
                    Localisation
                  </h3>
                </div>

                <div>
                  <Label htmlFor="address" className="text-tacir-darkblue">
                    Adresse
                  </Label>
                  <Input
                    id="address"
                    value={formData.location.address}
                    onChange={(e) =>
                      handleInputChange("location.address", e.target.value)
                    }
                    placeholder="Ex: 123 rue principale"
                    className="border-tacir-lightgray focus:border-tacir-blue"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-tacir-darkblue">
                    Ville
                  </Label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) =>
                      handleInputChange("location.city", e.target.value)
                    }
                    placeholder="Ex: Tunis"
                    className="border-tacir-lightgray focus:border-tacir-blue"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="venue" className="text-tacir-darkblue">
                    Lieu
                  </Label>
                  <Input
                    id="venue"
                    value={formData.location.venue}
                    onChange={(e) =>
                      handleInputChange("location.venue", e.target.value)
                    }
                    placeholder="Ex: Espace Culturelle TACA"
                    className="border-tacir-lightgray focus:border-tacir-blue"
                  />
                </div>

                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-medium text-tacir-darkblue mb-3">
                    Dates et Capacité
                  </h3>
                </div>

                <div>
                  <Label htmlFor="startDate" className="text-tacir-darkblue">
                    Date de début *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.dates.startDate}
                    onChange={(e) =>
                      handleInputChange("dates.startDate", e.target.value)
                    }
                    className="mt-1 border-tacir-lightgray focus:border-tacir-blue"
                    required
                  />
                  {errors.startDate && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-tacir-darkblue">
                    Date de fin *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.dates.endDate}
                    onChange={(e) =>
                      handleInputChange("dates.endDate", e.target.value)
                    }
                    className="mt-1 border-tacir-lightgray focus:border-tacir-blue"
                    required
                  />
                  {errors.endDate && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="registrationDeadline"
                    className="text-tacir-darkblue"
                  >
                    Date limite d'inscription *
                  </Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={formData.dates.registrationDeadline}
                    onChange={(e) =>
                      handleInputChange(
                        "dates.registrationDeadline",
                        e.target.value
                      )
                    }
                    className="border-tacir-lightgray focus:border-tacir-blue"
                    required
                  />
                  {errors.registrationDeadline && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.registrationDeadline}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duration" className="text-tacir-darkblue">
                    Nombre de jours *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", parseInt(e.target.value))
                    }
                    min="1"
                    max="7"
                    className="mt-1 border-tacir-lightgray focus:border-tacir-blue"
                    required
                  />
                  {errors.duration && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.duration}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="maxParticipants"
                    className="text-tacir-darkblue"
                  >
                    Participants max *
                  </Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.capacity.maxParticipants}
                    onChange={(e) =>
                      handleInputChange(
                        "capacity.maxParticipants",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    className="mt-1 border-tacir-lightgray focus:border-tacir-blue"
                    required
                  />
                  {errors.maxParticipants && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.maxParticipants}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="maxTeams" className="text-tacir-darkblue">
                    Équipes max *
                  </Label>
                  <Input
                    id="maxTeams"
                    type="number"
                    value={formData.capacity.maxTeams}
                    onChange={(e) =>
                      handleInputChange(
                        "capacity.maxTeams",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    className="mt-1 border-tacir-lightgray focus:border-tacir-blue"
                    required
                  />
                  {errors.maxTeams && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.maxTeams}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "team" && (
          <Card className="border-tacir-lightgray">
            <CardHeader className="bg-tacir-lightgray">
              <CardTitle className="flex items-center space-x-2 text-tacir-darkblue">
                <Users className="h-5 w-5 text-tacir-blue" />
                <span>Équipe de soutien</span>
              </CardTitle>
              <CardDescription className="text-tacir-darkgray">
                Définissez le nombre de mentors et de jurés nécessaires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="numberOfMentors"
                    className="text-tacir-darkblue"
                  >
                    Nombre de mentors *
                  </Label>
                  <Input
                    id="numberOfMentors"
                    type="number"
                    value={formData.mentors.numberOfMentors}
                    onChange={(e) =>
                      handleInputChange(
                        "mentors.numberOfMentors",
                        parseInt(e.target.value)
                      )
                    }
                    min="0"
                    className="mt-1 border-tacir-lightgray focus:border-tacir-blue"
                    required
                  />
                  {errors.numberOfMentors && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.numberOfMentors}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="numberOfJuries"
                    className="text-tacir-darkblue"
                  >
                    Nombre de jurés *
                  </Label>
                  <Input
                    id="numberOfJuries"
                    type="number"
                    value={formData.jury.numberOfJuries}
                    onChange={(e) =>
                      handleInputChange(
                        "jury.numberOfJuries",
                        parseInt(e.target.value)
                      )
                    }
                    min="0"
                    className="mt-1 border-tacir-lightgray focus:border-tacir-blue"
                    required
                  />
                  {errors.numberOfJuries && (
                    <p className="text-sm text-tacir-pink mt-1">
                      {errors.numberOfJuries}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "resources" && (
          <>
            <Card className="border-tacir-lightgray">
              <CardHeader className="bg-tacir-lightgray">
                <CardTitle className="flex items-center space-x-2 text-tacir-darkblue">
                  <DollarSign className="h-5 w-5 text-tacir-blue" />
                  <span>Budget</span>
                </CardTitle>
                <CardDescription className="text-tacir-darkgray">
                  Définissez le budget alloué à ce créathon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="totalBudget"
                      className="text-tacir-darkblue"
                    >
                      Budget total (DT)
                    </Label>
                    <Input
                      id="totalBudget"
                      type="number"
                      value={formData.budget.totalBudget}
                      onChange={(e) =>
                        handleInputChange(
                          "budget.totalBudget",
                          parseFloat(e.target.value)
                        )
                      }
                      min="0"
                      step="0.01"
                      placeholder="Ex: 5000"
                      className="border-tacir-lightgray focus:border-tacir-blue"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="allocatedBudget"
                      className="text-tacir-darkblue"
                    >
                      Budget alloué (DT)
                    </Label>
                    <Input
                      id="allocatedBudget"
                      type="number"
                      value={formData.budget.allocatedBudget}
                      onChange={(e) =>
                        handleInputChange(
                          "budget.allocatedBudget",
                          parseFloat(e.target.value)
                        )
                      }
                      min="0"
                      step="0.01"
                      placeholder="Ex: 3000"
                      className="border-tacir-lightgray focus:border-tacir-blue"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-tacir-lightgray">
              <CardHeader className="bg-tacir-lightgray">
                <CardTitle className="flex items-center space-x-2 text-tacir-darkblue">
                  <Box className="h-5 w-5 text-tacir-blue" />
                  <span>Ressources matérielles</span>
                </CardTitle>
                <CardDescription className="text-tacir-darkgray">
                  Liste des ressources nécessaires pour cet événement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="materials" className="text-tacir-darkblue">
                      Matériels
                    </Label>
                    <Textarea
                      id="materials"
                      value={formData.resources.materials.join(", ")}
                      onChange={(e) =>
                        handleResourceChange("materials", e.target.value)
                      }
                      placeholder="Ex: Papier, stylos, post-its"
                      className="min-h-[80px] border-tacir-lightgray focus:border-tacir-blue"
                    />
                    <p className="text-xs text-tacir-darkgray mt-1">
                      Séparez les éléments par des virgules
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="equipment" className="text-tacir-darkblue">
                      Équipements
                    </Label>
                    <Textarea
                      id="equipment"
                      value={formData.resources.equipment.join(", ")}
                      onChange={(e) =>
                        handleResourceChange("equipment", e.target.value)
                      }
                      placeholder="Ex: Ordinateurs, projecteurs"
                      className="min-h-[80px] border-tacir-lightgray focus:border-tacir-blue"
                    />
                    <p className="text-xs text-tacir-darkgray mt-1">
                      Séparez les éléments par des virgules
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="facilities" className="text-tacir-darkblue">
                      Installations
                    </Label>
                    <Textarea
                      id="facilities"
                      value={formData.resources.facilities.join(", ")}
                      onChange={(e) =>
                        handleResourceChange("facilities", e.target.value)
                      }
                      placeholder="Ex: Salle de conférence, espace détente"
                      className="min-h-[80px] border-tacir-lightgray focus:border-tacir-blue"
                    />
                    <p className="text-xs text-tacir-darkgray mt-1">
                      Séparez les éléments par des virgules
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex items-center justify-between pt-6">
          <div>
            {activeTab !== "general" && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevTab}
                className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {activeTab !== "resources" && (
              <Button
                type="button"
                onClick={handleNextTab}
                className="bg-tacir-blue text-white hover:bg-tacir-darkblue"
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}

            {activeTab === "resources" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-tacir-green text-white hover:bg-tacir-darkblue"
                  disabled={loading}
                >
                  {loading
                    ? "Traitement en cours..."
                    : creathon
                    ? "Mettre à jour"
                    : "Créer"}{" "}
                  le Créathon
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreathonForm;
