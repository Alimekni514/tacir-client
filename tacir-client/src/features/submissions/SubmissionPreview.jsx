"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Download,
  FileText,
  MessageSquare,
  Star,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Plus,
  Edit3,
} from "lucide-react";
import { EVALUATION_OPTIONS, getEvaluationConfig } from "./evaluationConfig";
import {
  leaveFeedbackOnSubmission,
  changeSubmissionStatus,
  addOrUpdatePreselectionEvaluation,
} from "@/services/forms/submissionService";
import { formatEvaluationText } from "./evaluationConfig";

const statusVariants = {
  submitted: "bg-tacir-yellow/20 text-tacir-yellow border-tacir-yellow/30",
  under_review: "bg-tacir-blue/20 text-tacir-blue border-tacir-blue/30",
  accepted: "bg-tacir-green/20 text-tacir-green border-tacir-green/30",
  acceptedAfterCreathon:
    "bg-tacir-lightblue/20 text-tacir-lightblue border-tacir-lightblue/30",
  rejected: "bg-tacir-pink/20 text-tacir-pink border-tacir-pink/30",
};

const statusIcons = {
  submitted: <Clock className="h-4 w-4" />,
  under_review: <Filter className="h-4 w-4" />,
  accepted: <CheckCircle className="h-4 w-4" />,
  acceptedAfterCreathon: <Star className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

export default function SubmissionPreview({
  submission,
  onClose,
  currentUserId,
}) {
  const queryClient = useQueryClient();
  const [newFeedback, setNewFeedback] = useState("");
  const [status, setStatus] = useState(submission?.status || "submitted");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("answers");

  useEffect(() => {
    if (submission) {
      setEvaluations(submission.preselectionEvaluations || []);
      setFeedbacks(submission.feedbacks || []);
      setStatus(submission.status || "submitted");
    }
  }, [submission]);

  const handleEvaluationChange = async (coordinatorId, evaluationText) => {
    try {
      const formattedText = formatEvaluationText(evaluationText);

      setEvaluations((prevEvals) => {
        const existingIndex = prevEvals.findIndex(
          (e) =>
            e.coordinatorId === coordinatorId ||
            e.coordinatorId?._id === coordinatorId
        );

        if (existingIndex !== -1) {
          const updated = [...prevEvals];
          updated[existingIndex] = {
            ...updated[existingIndex],
            evaluationText: formattedText,
            date: new Date().toISOString(),
          };
          return updated;
        }

        return [
          ...prevEvals,
          {
            coordinatorId,
            evaluationText: formattedText,
            date: new Date().toISOString(),
          },
        ];
      });

      const updatedEvaluations = await addOrUpdatePreselectionEvaluation(
        submission._id,
        formattedText
      );

      setEvaluations(updatedEvaluations);
      toast.success("Évaluation mise à jour !");
      await queryClient.invalidateQueries(["submissions"]);
    } catch (err) {
      console.error("Evaluation error:", err);
      toast.error(
        err.message || "Erreur lors de la mise à jour de l'évaluation"
      );
    }
  };

  const handleAddFeedback = async () => {
    if (!newFeedback.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      const tempFeedback = {
        content: newFeedback,
        date: new Date().toISOString(),
        _id: `temp-${Date.now()}`,
      };

      setFeedbacks((prev) => [...prev, tempFeedback]);
      setNewFeedback("");

      const updatedFeedbacks = await leaveFeedbackOnSubmission(
        submission._id,
        newFeedback
      );

      setFeedbacks(updatedFeedbacks);
      toast.success("Feedback ajouté !");
      await queryClient.invalidateQueries(["submissions"]);
    } catch (err) {
      console.error(err);
      setFeedbacks(submission.feedbacks || []);
      toast.error("Erreur lors de l'ajout du feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const filteredAnswers = submission?.answers?.filter(
    (ans) =>
      ans.field?.label?.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(ans.value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!submission) return null;

  return (
    <Dialog open={!!submission} onOpenChange={onClose}>
      <DialogContent className="w-full !max-w-xl h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-tacir-lightgray/30">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-tacir-darkblue flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Détails de la Candidature
              </DialogTitle>
              <DialogDescription className="text-tacir-darkgray mt-1">
                Consultez et gérez tous les détails de cette soumission
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`px-3 py-1 rounded-full flex items-center gap-1 ${statusVariants[status]}`}
              >
                {statusIcons[status]}
                <span className="capitalize">{status}</span>
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center self-center h-full overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="px-4 pt-4"
          >
            <TabsList className="grid w-full self-center grid-cols-4  max-w-lg mb-4">
              <TabsTrigger value="answ&ers" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Réponses
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Fichiers
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger
                value="evaluations"
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Évaluations
              </TabsTrigger>
            </TabsList>

            <div className="h-[calc(90vh-180px)] overflow-hidden">
              <TabsContent
                value="answers"
                className="h-full overflow-hidden mt-0"
              >
                <Card className="h-full border-0 shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Réponses du formulaire
                      </CardTitle>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tacir-darkgray h-4 w-4" />
                        <Input
                          placeholder="Rechercher dans les réponses..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)] overflow-auto">
                    <div className="grid grid-cols-1 gap-3">
                      {filteredAnswers?.map((ans, i) => (
                        <div
                          key={i}
                          className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                        >
                          <Label className="text-sm font-semibold text-tacir-darkblue flex items-center gap-2">
                            <span className="bg-tacir-lightblue/20 p-1 rounded">
                              {i + 1}
                            </span>
                            {ans.field?.label?.fr}
                          </Label>
                          <div className="mt-2 text-sm text-tacir-darkgray p-2 bg-tacir-lightgray/30 rounded">
                            {String(ans.value) || (
                              <span className="text-tacir-darkgray/50">
                                Non renseigné
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="files"
                className="h-full overflow-hidden mt-0"
              >
                <Card className="h-full border-0 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg">Fichiers joints</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)] overflow-auto">
                    <div className="space-y-3">
                      {submission.files.map((file, i) =>
                        file.urls.map((url, j) => (
                          <div
                            key={`${i}-${j}`}
                            className="flex items-center justify-between p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-tacir-lightblue/20 rounded">
                                <FileText className="h-5 w-5 text-tacir-lightblue" />
                              </div>
                              <div>
                                <p className="font-medium text-tacir-darkblue">
                                  {file.field?.label?.fr || "Fichier"} #{j + 1}
                                </p>
                                <p className="text-sm text-tacir-darkgray">
                                  {url.split("/").pop()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(url, "_blank")}
                              className="gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Ouvrir
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="feedback"
                className="h-full overflow-hidden mt-0"
              >
                <Card className="h-full border-0 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Avis des Coordinateurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)] overflow-auto space-y-4">
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {feedbacks.length === 0 ? (
                          <div className="text-center py-8 text-tacir-darkgray">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>Aucun feedback pour le moment.</p>
                          </div>
                        ) : (
                          feedbacks.map((fb) => (
                            <div
                              key={fb._id}
                              className="rounded-lg border bg-white p-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-tacir-lightblue/20 rounded-full">
                                  <User className="h-4 w-4 text-tacir-lightblue" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm mb-2 text-tacir-darkgray">
                                    {fb.content}
                                  </div>
                                  <div className="text-xs text-tacir-darkgray/70 flex items-center gap-2">
                                    <span>Coord. : {fb.user || "Inconnu"}</span>
                                    <span>•</span>
                                    <Calendar className="h-3 w-3" />
                                    {fb.date
                                      ? new Date(fb.date).toLocaleDateString(
                                          "fr-FR"
                                        )
                                      : "Date inconnue"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-tacir-darkblue">
                        Ajouter un feedback
                      </Label>
                      <Textarea
                        value={newFeedback}
                        onChange={(e) => setNewFeedback(e.target.value)}
                        placeholder="Partagez votre retour sur cette candidature..."
                        className="min-h-[100px]"
                      />
                      <Button
                        onClick={handleAddFeedback}
                        disabled={isSubmittingFeedback || !newFeedback.trim()}
                        className="gap-2 bg-tacir-blue hover:bg-tacir-darkblue"
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <Clock className="h-4 w-4 animate-spin" />
                            Ajout...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Ajouter le feedback
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent
                value="evaluations"
                className="h-full overflow-hidden mt-0"
              >
                <Card className="h-full border-0 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Évaluations des coordinateurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)] overflow-auto space-y-4">
                    <div className="space-y-4">
                      {evaluations.length === 0 ? (
                        <div className="text-center py-8 text-tacir-darkgray">
                          <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          <p>Aucune évaluation pour le moment.</p>
                        </div>
                      ) : (
                        evaluations.map((evaluation, idx) => {
                          const config = getEvaluationConfig(
                            evaluation.evaluationText
                          );
                          const isOwner =
                            evaluation.coordinatorId === currentUserId ||
                            evaluation.coordinatorId?._id === currentUserId;

                          return (
                            <div
                              key={idx}
                              className="rounded-lg border bg-white p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`p-2 rounded-full ${config.bgColor}`}
                                  >
                                    <span className="text-lg">
                                      {config.icon}
                                    </span>
                                  </div>
                                  <div>
                                    <div
                                      className={`font-semibold ${config.textColor} mb-1`}
                                    >
                                      {evaluation.evaluationText}
                                    </div>
                                    {evaluation.comment && (
                                      <div className="text-sm text-tacir-darkgray mb-2">
                                        {evaluation.comment}
                                      </div>
                                    )}
                                    <div className="text-xs text-tacir-darkgray/70 flex items-center gap-2">
                                      <User className="h-3 w-3" />
                                      {evaluation.coordinator ||
                                        "Coordinateur inconnu"}
                                      <span>•</span>
                                      <Calendar className="h-3 w-3" />
                                      {evaluation.date
                                        ? new Date(
                                            evaluation.date
                                          ).toLocaleDateString("fr-FR")
                                        : "Date inconnue"}
                                    </div>
                                  </div>
                                </div>
                                {isOwner && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                        Modifier
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-72">
                                      <div className="space-y-2 p-2">
                                        <h4 className="font-medium text-sm text-tacir-darkblue">
                                          Modifier l'évaluation
                                        </h4>
                                        {EVALUATION_OPTIONS.map((option) => (
                                          <DropdownMenuItem
                                            key={option.text}
                                            onClick={() =>
                                              handleEvaluationChange(
                                                currentUserId,
                                                option.value
                                              )
                                            }
                                            className="flex items-start gap-3 p-2 cursor-pointer hover:bg-tacir-lightgray/30"
                                          >
                                            <span className="text-lg mt-0.5">
                                              {option.icon}
                                            </span>
                                            <div>
                                              <p className="font-medium text-sm">
                                                {option.text}
                                              </p>
                                              <p className="text-xs text-tacir-darkgray mt-1">
                                                {option.description}
                                              </p>
                                            </div>
                                          </DropdownMenuItem>
                                        ))}
                                      </div>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {!evaluations.some(
                      (e) =>
                        e.coordinatorId === currentUserId ||
                        e.coordinatorId?._id === currentUserId
                    ) && (
                      <div className="border-2 border-dashed border-tacir-lightgray rounded-lg p-6 text-center">
                        <Star className="h-8 w-8 mx-auto mb-3 text-tacir-darkgray/50" />
                        <p className="text-tacir-darkgray mb-3">
                          Vous n'avez pas encore évalué cette candidature
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="gap-2 bg-tacir-blue hover:bg-tacir-darkblue">
                              <Plus className="h-4 w-4" />
                              Ajouter une évaluation
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-72">
                            <div className="space-y-2 p-2">
                              <h4 className="font-medium text-sm text-tacir-darkblue">
                                Sélectionnez une évaluation
                              </h4>
                              {EVALUATION_OPTIONS.map((option) => (
                                <DropdownMenuItem
                                  key={option.text}
                                  onClick={() =>
                                    handleEvaluationChange(
                                      currentUserId,
                                      option.value
                                    )
                                  }
                                  className="flex items-start gap-3 p-2 cursor-pointer hover:bg-tacir-lightgray/30"
                                >
                                  <span className="text-lg mt-0.5">
                                    {option.icon}
                                  </span>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {option.text}
                                    </p>
                                    <p className="text-xs text-tacir-darkgray mt-1">
                                      {option.description}
                                    </p>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
