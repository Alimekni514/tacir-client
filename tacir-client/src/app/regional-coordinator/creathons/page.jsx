"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  MapPin,
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  BarChart3,
  Sparkles,
  Info,
  ChevronDown,
  Lightbulb,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreathonForm from "@/features/creathons/regional/creathonForm";
import {
  getCreathonsByRegion,
  getCreathonStatsByRegion,
} from "@/services/creathons/creathons";
import { toast } from "react-toastify";
import { CreathonDetails } from "@/features/creathons/regional/CreathonDetails";
import Loader from "@/components/ui/Loader";

const RegionalDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCreathon, setEditingCreathon] = useState(null);
  const [selectedCreathon, setSelectedCreathon] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [regionalStats, setRegionalStats] = useState([]);
  const [creathon, setCreathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRegion, setUserRegion] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const fetchCreathonAndStats = async () => {
      try {
        setLoading(true);

        const regionName =
          typeof window !== "undefined"
            ? localStorage.getItem("regionName")
            : "";
        const regionId =
          typeof window !== "undefined"
            ? localStorage.getItem("userRegionId") || null
            : null;

        if (!regionId || regionId === "null") {
          return;
        }

        setUserRegion(regionName);
        const [creathonRes, statsRes] = await Promise.all([
          getCreathonsByRegion(regionId),
          getCreathonStatsByRegion(regionId),
        ]);

        const currentCreathon = creathonRes || null;

        if (currentCreathon?.dates) {
          currentCreathon.startDate = currentCreathon.dates.startDate;
          currentCreathon.endDate = currentCreathon.dates.endDate;
          currentCreathon.registrationDeadline =
            currentCreathon.dates.registrationDeadline;
        }

        const stats = statsRes?.stats || {};
        setCreathon(currentCreathon);

        const updatedStats = currentCreathon
          ? [
              {
                title: "Créathon Actuel",
                value: "1",
                description: `Créathon principal de la région ${regionName}`,
                icon: Calendar,
                color: "text-tacir-lightblue",
                bgColor: "bg-tacir-lightblue/10",
              },
              {
                title: "Participants Prévus",
                value: stats.participantCount?.toString() || "0",
                description: "Estimation pour le créathon régional",
                icon: Users,
                color: "text-tacir-blue",
                bgColor: "bg-tacir-blue/10",
              },
              {
                title: "Validation",
                value: currentCreathon.validations?.componentValidation
                  ?.validatedBy
                  ? "Validé"
                  : "En attente",
                description: "Validation coordinateur de composante",
                icon: CheckCircle,
                color: currentCreathon.validations?.componentValidation
                  ?.validatedBy
                  ? "text-tacir-green"
                  : "text-tacir-yellow",
                bgColor: currentCreathon.validations?.componentValidation
                  ?.validatedBy
                  ? "bg-tacir-green/10"
                  : "bg-tacir-yellow/10",
              },
            ]
          : [
              {
                title: "Aucun Créathon",
                value: "0",
                description: "Créez votre premier créathon",
                icon: Calendar,
                color: "text-tacir-darkgray",
                bgColor: "bg-tacir-lightgray",
              },
              {
                title: "Participants",
                value: "0",
                description: "Aucun participant prévu",
                icon: Users,
                color: "text-tacir-darkgray",
                bgColor: "bg-tacir-lightgray",
              },
              {
                title: "Statut",
                value: "Non créé",
                description: "Créez un créathon pour commencer",
                icon: CheckCircle,
                color: "text-tacir-darkgray",
                bgColor: "bg-tacir-lightgray",
              },
            ];

        setRegionalStats(updatedStats);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchCreathonAndStats();
  }, []);

  const handleEdit = (creathon) => {
    const formReadyData = {
      ...creathon,
      dates: {
        startDate: creathon.startDate
          ? new Date(creathon.startDate).toISOString().split("T")[0]
          : "",
        endDate: creathon.endDate
          ? new Date(creathon.endDate).toISOString().split("T")[0]
          : "",
        registrationDeadline: creathon.registrationDeadline
          ? new Date(creathon.registrationDeadline).toISOString().split("T")[0]
          : "",
      },
      location: creathon.location || { address: "", city: "", venue: "" },
      capacity: creathon.capacity || { maxParticipants: 50, maxTeams: 10 },
      jury: creathon.jury || { numberOfJuries: 5 },
      mentors: creathon.mentors || { numberOfMentors: 10 },
      coordinators: creathon.coordinators || {
        componentCoordinator: "",
        generalCoordinator: "",
      },
      budget: creathon.budget || {
        totalBudget: 0,
        allocatedBudget: 0,
        expenses: [],
      },
      resources: creathon.resources || {
        materials: [],
        equipment: [],
        facilities: [],
      },
    };

    setEditingCreathon(formReadyData);
    setShowForm(true);
  };

  const handleView = (creathon) => {
    setSelectedCreathon(creathon);
    setShowDetails(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCreathon(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedCreathon(null);
  };

  const getComponentIcon = (component) => {
    switch (component) {
      case "crea":
        return <Sparkles className="h-4 w-4" />;
      case "tech":
        return <BarChart3 className="h-4 w-4" />;
      case "business":
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getComponentColor = (component) => {
    switch (component) {
      case "crea":
        return "bg-tacir-pink/10 text-tacir-pink border-tacir-pink";
      case "tech":
        return "bg-tacir-lightblue/10 text-tacir-lightblue border-tacir-lightblue";
      case "business":
        return "bg-tacir-green/10 text-tacir-green border-tacir-green";
      default:
        return "bg-tacir-blue/10 text-tacir-blue border-tacir-blue";
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 mx-auto py-8 px-6 container bg-tacir-lightgray min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-tacir-lightgray/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-tacir-blue rounded-xl shadow-md">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-tacir-darkblue">
                Gestion des Créathons Régionaux
              </h1>
              <p className="text-tacir-darkgray mt-1">
                Création et gestion du créathon principal de la région{" "}
                <span className="font-semibold text-tacir-blue">
                  {userRegion}
                </span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => handleEdit(creathon || {})}
            className="bg-tacir-blue hover:bg-tacir-blue/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            {creathon ? "Modifier le Créathon" : "Créer un Créathon"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regionalStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow border-0 bg-white"
            >
              <CardContent className="px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-tacir-darkgray">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-tacir-darkgray mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Creathon Card */}
      {creathon ? (
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-tacir-darkblue">
              Crathon Principal - Région {userRegion}
            </CardTitle>
            <CardDescription className="text-tacir-darkgray">
              Détails logistiques du créathon régional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-start justify-between p-6 border border-tacir-lightgray rounded-lg hover:bg-tacir-lightgray/20 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="text-xl font-bold text-tacir-darkblue">
                    {creathon.title}
                  </h4>
                  <Badge className={getComponentColor(creathon.component)}>
                    {getComponentIcon(creathon.component)}
                    <span className="ml-1">
                      {creathon.component?.toUpperCase()}
                    </span>
                  </Badge>
                  <Badge
                    variant={
                      creathon.validations?.componentValidation?.validatedBy
                        ? "success"
                        : "warning"
                    }
                    className={
                      creathon.validations?.componentValidation?.validatedBy
                        ? "bg-tacir-green text-white"
                        : "bg-tacir-yellow text-white"
                    }
                  >
                    {creathon.validations?.componentValidation?.validatedBy
                      ? "Validé"
                      : "À valider"}
                  </Badge>
                </div>

                <p className="text-tacir-darkgray mb-4">
                  {creathon.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 text-tacir-darkgray">
                    <MapPin className="h-4 w-4 text-tacir-blue flex-shrink-0" />
                    <span>
                      {creathon.location?.venue}, {creathon.location?.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-tacir-darkgray">
                    <Calendar className="h-4 w-4 text-tacir-blue flex-shrink-0" />
                    <span>
                      {formatDate(creathon.dates?.startDate)} -{" "}
                      {formatDate(creathon.dates?.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-tacir-darkgray">
                    <Users className="h-4 w-4 text-tacir-blue flex-shrink-0" />
                    <span>
                      {creathon.mentors?.numberOfMentors} mentors •{" "}
                      {creathon.jury?.numberOfJuries} jurés
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-tacir-darkgray">
                    <Users className="h-4 w-4 text-tacir-blue flex-shrink-0" />
                    <span>
                      {creathon.capacity?.maxParticipants} participants max
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:flex-col lg:items-end lg:gap-3 mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  onClick={() => handleView(creathon)}
                  className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir détails
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEdit(creathon)}
                  className="border-tacir-lightblue text-tacir-lightblue hover:bg-tacir-lightblue hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto text-tacir-darkgray/40 mb-4" />
            <h3 className="text-lg font-semibold text-tacir-darkblue mb-2">
              Aucun créathon créé
            </h3>
            <p className="text-tacir-darkgray mb-6">
              Commencez par créer un créathon pour votre région {userRegion}
            </p>
            <Button
              onClick={() => handleEdit({})}
              className="bg-tacir-blue hover:bg-tacir-blue/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un Créathon
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      {/* Enhanced Information Card */}
      <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300">
        <CardHeader
          className=" cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-tacir-darkblue flex items-center gap-2">
              <Info className="h-5 w-5 text-tacir-lightblue" />
              Guide de Validation - Processus Important
            </CardTitle>
            <ChevronDown
              className={`h-5 w-5 text-tacir-darkgray transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </CardHeader>

        <CardContent
          className={`overflow-hidden transition-all duration-500 ${
            isExpanded ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="space-y-4">
            {/* Process Timeline */}
            <div className="relative">
              <div className="absolute left-3 top-0 h-full w-0.5 bg-tacir-lightblue/30"></div>

              <div className="flex items-start gap-4 mb-6 relative">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tacir-yellow/20 border-2 border-tacir-yellow flex items-center justify-center">
                  <span className="text-xs font-bold text-tacir-yellow">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-tacir-darkblue">
                    Phase Régionale
                  </h4>
                  <p className="text-sm text-tacir-darkgray mt-1">
                    Vous complétez tous les détails logistiques du créathon
                  </p>
                  <Badge className="bg-tacir-yellow/20 text-tacir-yellow border-0 mt-2">
                    En cours
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6 relative">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tacir-lightblue/20 border-2 border-tacir-lightblue flex items-center justify-center">
                  <span className="text-xs font-bold text-tacir-lightblue">
                    2
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-tacir-darkblue">
                    Validation Composante
                  </h4>
                  <p className="text-sm text-tacir-darkgray mt-1">
                    Le coordinateur de composante valide votre création
                  </p>
                  <Badge className="bg-tacir-lightblue/20 text-tacir-lightblue border-0 mt-2">
                    Prochainement
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tacir-green/20 border-2 border-tacir-green flex items-center justify-center">
                  <span className="text-xs font-bold text-tacir-green">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-tacir-darkblue">
                    Gestion Équipe
                  </h4>
                  <p className="text-sm text-tacir-darkgray mt-1">
                    Le coordinateur gère mentors et jury après validation
                  </p>
                  <Badge className="bg-tacir-green/20 text-tacir-green border-0 mt-2">
                    Finalisation
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-tacir-lightgray/30 rounded-lg p-4">
              <h4 className="font-semibold text-tacir-darkblue mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-tacir-yellow" />
                Conseils Rapides
              </h4>
              <ul className="text-sm text-tacir-darkgray space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-tacir-green">✓</span>
                  Vérifiez tous les détails logistiques avant soumission
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-tacir-green">✓</span>
                  Assurez-vous des disponibilités des lieux et dates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-tacir-green">✓</span>
                  Coordinateur composante: contact@creathon.ma
                </li>
              </ul>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3 p-3 bg-tacir-lightblue/10 rounded-lg">
              <div
                className={`w-3 h-3 rounded-full ${
                  creathon
                    ? "animate-pulse bg-tacir-yellow"
                    : "bg-tacir-darkgray"
                }`}
              ></div>
              <span className="text-sm text-tacir-darkblue">
                {creathon
                  ? "En attente de validation composante"
                  : "Prêt à créer votre premier créathon"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Dialogs */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="!max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-tacir-darkblue">
              {editingCreathon ? "Modifier le Créathon" : "Nouveau Créathon"}
            </DialogTitle>
            <DialogDescription className="text-tacir-darkgray">
              {editingCreathon
                ? "Modifiez les détails du créathon"
                : "Remplissez les informations du créathon"}
            </DialogDescription>
          </DialogHeader>
          <CreathonForm onClose={handleCloseForm} creathon={editingCreathon} />
        </DialogContent>
      </Dialog>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="!max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-tacir-darkblue">
              Détails du Créathon
            </DialogTitle>
            <DialogDescription className="text-tacir-darkgray">
              Informations complètes sur le créathon régional
            </DialogDescription>
          </DialogHeader>
          {selectedCreathon && <CreathonDetails creathon={selectedCreathon} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegionalDashboard;
