import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Coffee,
  Utensils,
  Bus,
  Camera,
  Video,
  Archive,
  Presentation,
  Film,
  MessageSquare,
  Home,
  PenTool,
  BookOpen,
  Briefcase,
  DollarSign,
  Star,
  MessageCircle,
  Monitor,
  Globe,
} from "lucide-react";

const TrainingDetailsModal = ({ training, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const getActivityLabel = (activity) => {
    const activities = {
      training: "Formation",
      créa: "Créa",
      innov: "Innov",
      archi: "Archi",
      diffusion: "Diffusion",
      eco: "Eco",
    };
    return activities[activity] || activity;
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      case "rescheduled":
        return "info";
      default:
        return "outline";
    }
  };

  const renderSectionHeader = (title, icon) => (
    <div className="flex items-center mb-4">
      {icon &&
        React.cloneElement(icon, { className: "w-5 h-5 mr-2 text-tacir-blue" })}
      <h3 className="text-lg font-semibold text-tacir-darkblue">{title}</h3>
    </div>
  );

  const renderDetailItem = (label, value, icon) => (
    <div className="space-y-1">
      <div className="flex items-center text-sm font-medium text-tacir-darkgray">
        {icon && React.cloneElement(icon, { className: "w-4 h-4 mr-2" })}
        {label}
      </div>
      <p className="text-sm text-gray-700 pl-6">{value || "Non spécifié"}</p>
    </div>
  );

  const renderListItems = (items, getLabel, getIcon) => (
    <ul className="space-y-2">
      {items?.map((item, index) => (
        <li key={index} className="flex items-start space-x-2">
          {getIcon && (
            <span className="mt-0.5">
              {React.cloneElement(getIcon(item), {
                className: "w-4 h-4 text-tacir-darkgray",
              })}
            </span>
          )}
          <span className="text-sm text-gray-700">{getLabel(item)}</span>
        </li>
      ))}
    </ul>
  );

  const logisticsIcons = {
    catering: <Utensils />,
    perdiem_meals: <Utensils />,
    coffee_break: <Coffee />,
    perdiem_transport: <Bus />,
  };

  const travelIcons = {
    hebergement_restauration: <Home />,
    materiel: <PenTool />,
    salles_reunion: <Users />,
  };

  const communicationIcons = {
    photo: <Camera />,
    video: <Video />,
    archivage: <Archive />,
    presentation: <Presentation />,
    rollup: <Film />,
    streaming: <Video />,
    autre: <MessageSquare />,
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl !max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="border-b border-gray-200 px-6 py-4">
          <DialogTitle className="text-xl font-bold text-tacir-darkblue">
            Détails de la formation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Basic Information */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            {renderSectionHeader("Informations de base", <BookOpen />)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderDetailItem("Titre", training?.title)}
              {renderDetailItem("Type", training?.type)}
              {renderDetailItem(
                "Activité du composant",
                getActivityLabel(training?.componentActivity)
              )}
              <div className="space-y-1">
                <div className="flex items-center text-sm font-medium text-tacir-darkgray">
                  <span className="mr-2">Statut:</span>
                </div>
                <Badge
                  variant={getStatusVariant(training?.status)}
                  className="capitalize"
                >
                  {training?.status}
                </Badge>
              </div>
              {renderDetailItem("Description", training?.description)}
            </div>
          </div>

          {/* Dates & Location */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            {renderSectionHeader("Dates et lieu", <Calendar />)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderDetailItem(
                "Dates",
                `${formatDate(training?.startDate)}${
                  training?.endDate ? ` au ${formatDate(training?.endDate)}` : ""
                }`,
                <Calendar />
              )}
              {renderDetailItem("Heure", training?.time, <Clock />)}
              
              {/* Nouvelle section pour le type de session */}
              {training?.sessionType && (
                renderDetailItem(
                  "Type de session",
                  training?.sessionType === "online" ? "En ligne" : "Présentiel",
                  training?.sessionType === "online" ? <Monitor /> : <MapPin />
                )
              )}
              
              {/* Affichage conditionnel du lien de meeting ou du lieu */}
              {training?.sessionType === "online" && training?.meetingLink && (
                renderDetailItem(
                  "Lien de la session",
                  training?.meetingLink,
                  <Globe />
                )
              )}
              
              {training?.sessionType === "in-person" && training?.proposedLocation && (
                renderDetailItem(
                  "Lieu proposé",
                  training?.proposedLocation,
                  <MapPin />
                )
              )}
              
              {/* Ancien champ de location pour compatibilité */}
              {!training?.sessionType && training?.location && (
                renderDetailItem("Lieu", training?.location, <MapPin />)
              )}
              
              {renderDetailItem(
                "Participants maximum",
                training?.maxParticipants,
                <Users />
              )}
            </div>
          </div>

          {/* People */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            {renderSectionHeader("Personnes impliquées", <Users />)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-tacir-darkgray">
                  <User className="w-4 h-4 mr-2" />
                  Formateurs:
                </div>
                {training?.trainers?.length > 0 ? (
                  renderListItems(
                    training?.trainers,
                    (trainer) =>
                      `${trainer?.personalInfo?.fullName || "Inconnu"} - ${
                        trainer?.personalInfo?.specialization || "Non spécifié"
                      }`,
                    () => <User />
                  )
                ) : (
                  <p className="text-sm text-gray-700 pl-6">Non spécifié</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-tacir-darkgray">
                  <User className="w-4 h-4 mr-2" />
                  Coordinateurs d'incubation:
                </div>
                {training?.incubationCoordinators?.length > 0 ? (
                  renderListItems(
                    training?.incubationCoordinators,
                    (coordinator) =>
                      `${coordinator?.firstName} ${coordinator?.lastName} (${coordinator?.email})`,
                    () => <User />
                  )
                ) : (
                  <p className="text-sm text-gray-700 pl-6">Non spécifié</p>
                )}
              </div>
            </div>
          </div>

          {/* Cohorts */}
          {training?.cohorts?.length > 0 && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              {renderSectionHeader("Cohortes cibles", <Users />)}
              <div className="flex flex-wrap gap-2">
                {training?.cohorts.map((cohort, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-tacir-blue text-tacir-blue bg-tacir-blue/10"
                  >
                    {cohort}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Logistical Needs */}
          {(training?.logisticsNeeds?.length > 0 ||
            training?.logisticsDetails ||
            training?.specificNeeds) && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              {renderSectionHeader("Besoins logistiques", <Briefcase />)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {training?.logisticsNeeds?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-tacir-darkgray">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Besoins:
                    </div>
                    {renderListItems(
                      training?.logisticsNeeds,
                      (need) => {
                        const labels = {
                          catering: "Restauration",
                          perdiem_meals: "Perdiem repas",
                          coffee_break: "Pause café",
                          perdiem_transport: "Perdiem transport",
                        };
                        return labels[need] || need;
                      },
                      (need) => logisticsIcons[need] || <Briefcase />
                    )}
                  </div>
                )}
                {training?.logisticsDetails &&
                  renderDetailItem(
                    "Détails logistiques",
                    training?.logisticsDetails
                  )}
                {training?.specificNeeds &&
                  renderDetailItem(
                    "Besoins spécifiques",
                    training?.specificNeeds
                  )}
              </div>
            </div>
          )}

          {/* Travel & On-Site Needs */}
          {(training?.travelNeeds?.length > 0 ||
            training?.organizationalNeeds) && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              {renderSectionHeader("Voyage et besoins sur site", <MapPin />)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {training?.travelNeeds?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-tacir-darkgray">
                      <MapPin className="w-4 h-4 mr-2" />
                      Besoins:
                    </div>
                    {renderListItems(
                      training?.travelNeeds,
                      (need) => {
                        const labels = {
                          hebergement_restauration:
                            "Hébergement & Restauration",
                          materiel: "Matériel",
                          salles_reunion: "Salles de réunion",
                        };
                        return labels[need] || need;
                      },
                      (need) => travelIcons[need] || <MapPin />
                    )}
                  </div>
                )}
                {training?.organizationalNeeds &&
                  renderDetailItem(
                    "Besoins organisationnels",
                    training?.organizationalNeeds
                  )}
              </div>
            </div>
          )}

          {/* Communication Needs */}
          {(training?.communicationNeeds?.length > 0 ||
            training?.communicationNeedsOther) && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              {renderSectionHeader(
                "Besoins de communication",
                <MessageCircle />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {training?.communicationNeeds?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-tacir-darkgray">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Besoins:
                    </div>
                    {renderListItems(
                      training?.communicationNeeds,
                      (need) => {
                        const labels = {
                          photo: "Photo",
                          video: "Vidéo",
                          archivage: "Archivage",
                          presentation: "Présentation",
                          rollup: "Rollup",
                          streaming: "Streaming",
                          autre: "Autre",
                        };
                        return labels[need] || need;
                      },
                      (need) => communicationIcons[need] || <MessageCircle />
                    )}
                  </div>
                )}
                {training?.communicationNeedsOther &&
                  renderDetailItem(
                    "Autres besoins",
                    training?.communicationNeedsOther
                  )}
              </div>
            </div>
          )}

          {/* Resources & Partners */}
          {(training?.requiredPartners ||
            training?.humanResources ||
            training?.materialResources?.length > 0 ||
            training?.financialResources) && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              {renderSectionHeader("Ressources et partenaires", <DollarSign />)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {training?.requiredPartners &&
                  renderDetailItem(
                    "Partenaires requis",
                    training?.requiredPartners
                  )}
                {training?.humanResources &&
                  renderDetailItem(
                    "Ressources humaines",
                    training?.humanResources
                  )}
                {training?.materialResources?.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-tacir-darkgray">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Ressources matérielles:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 pl-6">
                      {training?.materialResources.map((resource, index) => (
                        <li key={index}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {training?.financialResources &&
                  renderDetailItem(
                    "Ressources financières",
                    training?.financialResources
                  )}
              </div>
            </div>
          )}

          {/* Miscellaneous */}
          {(training?.highlightMoments || training?.additionalComments) && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              {renderSectionHeader("Divers", <Star />)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {training?.highlightMoments &&
                  renderDetailItem(
                    "Moments forts",
                    training?.highlightMoments,
                    <Star />
                  )}
                {training?.additionalComments &&
                  renderDetailItem(
                    "Commentaires supplémentaires",
                    training?.additionalComments,
                    <MessageCircle />
                  )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue/10"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingDetailsModal;