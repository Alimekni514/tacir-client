import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  Award,
  CheckCircle,
  MapPin,
  User,
  BookOpen,
  Star,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getBirthDate,
  getPhoneNumber,
  getProjectTitle,
  displayText,
} from "./participantDataUtils";
import { typeConfig } from "@/features/trainings/components/style.config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BilingualDisplay } from "@/utils/BilingualText";
export default function ParticipantDetailModal({ participant, onClose }) {
  const trainingType = typeConfig[participant.trainingType] || {
    textColor: "text-tacir-gray",
    bgColor: "bg-tacir-darkblue/10",
    title: participant.trainingType,
  };

  // Extract submission data
  const submission = participant.submission;
  const answers = participant.answers || [];
  const files = participant.files || [];
  const mentorEvaluations = submission?.mentorEvaluations || [];
  const mentorFeedbacks = submission?.mentorFeedbacks || [];
  const preselectionEvaluations = submission?.preselectionEvaluations || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl mx-4 border-tacir-lightblue">
        <CardHeader className="relative border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${trainingType.bgColor}`}>
                <User className={`w-6 h-6 ${trainingType.textColor}`} />
              </div>
              <div>
                <CardTitle className="text-tacir-darkblue">
                  {participant.user?.firstName} {participant.user?.lastName}
                </CardTitle>
                <CardDescription className="mt-2 flex gap-2">
                  <Badge variant="secondary" className={trainingType.bgColor}>
                    {trainingType.title}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {displayText(participant.region?.name)}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="application">Candidature</TabsTrigger>
              <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-tacir-lightblue" />
                    <h3 className="font-medium text-tacir-darkblue">
                      Informations de contact
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <InfoRow
                      icon={<Mail className="w-5 h-5 text-tacir-lightblue" />}
                      label="Email"
                      value={participant.user?.email}
                    />
                    <InfoRow
                      icon={<Phone className="w-5 h-5 text-tacir-lightblue" />}
                      label="Téléphone"
                      value={getPhoneNumber(participant)}
                    />
                    <InfoRow
                      icon={
                        <Calendar className="w-5 h-5 text-tacir-lightblue" />
                      }
                      label="Date de naissance"
                      value={getBirthDate(participant)}
                    />
                    <InfoRow
                      icon={<Clock className="w-5 h-5 text-tacir-lightblue" />}
                      label="Inscrit le"
                      value={new Date(participant.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-tacir-green" />
                    <h3 className="font-medium text-tacir-darkblue">
                      Détails du projet
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Titre du projet
                      </p>
                      <p className="font-medium">
                        {getProjectTitle(participant) || "Non spécifié"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Formation suivie
                      </p>
                      <p className="font-medium">
                        {participant.relatedTraining?.title || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge className="bg-tacir-green/10 text-tacir-green hover:bg-tacir-green/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Actif
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Application Tab */}
            <TabsContent value="application" className="pt-6">
              <div className="space-y-6">
                {/* Form Answers Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-tacir-lightblue" />
                    <h3 className="font-medium text-tacir-darkblue">
                      Réponses du formulaire
                    </h3>
                  </div>

                  {answers.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="max-h-[250px] overflow-y-auto p-4 space-y-6">
                        {answers.map((answer, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-tacir-lightblue/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-tacir-darkblue">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                {answer.field?.label ? (
                                  <div className="">
                                    <h4 className="font-medium text-tacir-darkblue">
                                      {answer.field.label.fr}
                                    </h4>
                                    {answer.field.label.ar && (
                                      <h4
                                        className="font-medium text-tacir-darkblue text-sm "
                                        dir="rtl"
                                      >
                                        {answer.field.label.ar}
                                      </h4>
                                    )}
                                  </div>
                                ) : (
                                  <h4 className="font-medium text-tacir-darkblue">
                                    Question {index + 1}
                                  </h4>
                                )}

                                {answer.value ? (
                                  <div className="mt-1 p-2 bg-white rounded-md border border-gray-200">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                      {answer.value}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic mt-2">
                                    Pas de réponse fournie
                                  </p>
                                )}
                              </div>
                            </div>
                            {index < answers.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                      <p className="text-muted-foreground">
                        Aucune réponse disponible
                      </p>
                    </div>
                  )}
                </div>

                {/* Attached Files Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-tacir-lightblue" />
                    <h3 className="font-medium text-tacir-darkblue">
                      Fichiers joints
                    </h3>
                  </div>

                  {files.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                        >
                          <div className="space-y-2">
                            {file.field?.label ? (
                              <div className="space-y-1">
                                <h4 className="font-medium text-tacir-darkblue">
                                  {file.field.label.fr}
                                </h4>
                                {file.field.label.ar && (
                                  <h4
                                    className="font-medium text-tacir-darkblue text-sm"
                                    dir="rtl"
                                  >
                                    {file.field.label.ar}
                                  </h4>
                                )}
                              </div>
                            ) : (
                              <h4 className="font-medium text-tacir-darkblue">
                                Fichier {index + 1}
                              </h4>
                            )}

                            <div className="space-y-2 mt-2">
                              {file.urls.map((url, urlIndex) => (
                                <a
                                  key={urlIndex}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                  <FileText className="w-4 h-4 text-tacir-lightblue flex-shrink-0" />
                                  <span className="text-sm text-tacir-darkblue truncate">
                                    Document {urlIndex + 1}
                                  </span>
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    Ouvrir
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                      <p className="text-muted-foreground">
                        Aucun fichier joint disponible
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            {/* Evaluations Tab */}
            {/* Evaluations Tab */}
            <TabsContent value="evaluations" className="pt-6">
              <div className="space-y-6">
                {/* Mentor Evaluations */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-tacir-yellow" />
                    <h3 className="font-medium text-tacir-darkblue">
                      Évaluations du mentor
                    </h3>
                  </div>

                  {mentorEvaluations.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="max-h-[300px] min-h-[100px] overflow-y-auto p-4 space-y-4">
                        {mentorEvaluations.map((evalItem, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-tacir-yellow/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-tacir-yellow" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {evalItem.mentorId?.firstName}{" "}
                                    {evalItem.mentorId?.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(evalItem.date).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white">
                                {evalItem.evaluation}
                              </Badge>
                            </div>

                            {evalItem.comment && (
                              <div className="ml-11 pl-1">
                                <div className="p-3 bg-white rounded-md border border-gray-200">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {evalItem.comment}
                                  </p>
                                </div>
                              </div>
                            )}

                            {index < mentorEvaluations.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                      <p className="text-muted-foreground">
                        Aucune évaluation de mentor disponible
                      </p>
                    </div>
                  )}
                </div>

                {/* Mentor Feedbacks */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-tacir-blue" />
                    <h3 className="font-medium text-tacir-darkblue">
                      Commentaires du mentor
                    </h3>
                  </div>

                  {mentorFeedbacks.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="max-h-[300px] min-h-[100px] overflow-y-auto p-4 space-y-4">
                        {mentorFeedbacks.map((feedback, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-tacir-blue/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-tacir-blue" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {feedback.mentorId?.firstName}{" "}
                                  {feedback.mentorId?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(feedback.date).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="ml-11 pl-1">
                              <div className="p-3 bg-white rounded-md border border-gray-200">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {feedback.content}
                                </p>
                              </div>
                            </div>

                            {index < mentorFeedbacks.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                      <p className="text-muted-foreground">
                        Aucun commentaire de mentor disponible
                      </p>
                    </div>
                  )}
                </div>

                {/* Preselection Evaluations */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-tacir-purple" />
                    <h3 className="font-medium text-tacir-darkblue">
                      Évaluations de présélection
                    </h3>
                  </div>

                  {preselectionEvaluations.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="max-h-[300px] min-h-[100px] overflow-y-auto p-4 space-y-4">
                        {preselectionEvaluations.map((evalItem, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-tacir-purple/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-tacir-purple" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {evalItem.coordinatorId?.firstName}{" "}
                                    {evalItem.coordinatorId?.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(evalItem.date).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white">
                                {evalItem.evaluation}
                              </Badge>
                            </div>

                            {index < preselectionEvaluations.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                      <p className="text-muted-foreground">
                        Aucune évaluation de présélection disponible
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  const displayValue =
    value && typeof value === "object" && "fr" in value ? (
      <BilingualDisplay text={value} />
    ) : (
      <div>{value || "Non spécifié"}</div>
    );

  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-tacir-lightblue/10">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium">{displayValue}</div>
      </div>
    </div>
  );
}
