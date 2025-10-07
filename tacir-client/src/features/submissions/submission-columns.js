import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  Eye,
  UserX,
  Ban,
  CheckCircle,
  Clock,
  UserCheck,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { statusOptions } from "@/utils/constants";
import { EVALUATION_OPTIONS, getEvaluationConfig } from "./evaluationConfig";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useState } from "react";
const EvaluationStatus = ({ hasEvaluation, config, evaluationText }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          hasEvaluation
            ? `${config.borderColor || "border-gray-200"} ${
                config.bgColor || "bg-gray-50"
              }`
            : "border-dashed border-amber-300 bg-amber-50"
        } ${isHovered ? "ring-2 ring-blue-200 ring-opacity-50" : ""}`}
      >
        {hasEvaluation ? (
          <>
            <span className={`text-lg ${config.textColor || "text-gray-700"}`}>
              {config.icon}
            </span>
            <span
              className={`text-sm font-medium ${
                config.textColor || "text-gray-700"
              }`}
            >
              {evaluationText}
            </span>
          </>
        ) : (
          <>
            <HelpCircle className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">
              Évaluation requise
            </span>
          </>
        )}

        <ChevronDown
          className={`h-4 w-4 ml-2 transition-transform duration-200 ${
            isHovered ? "text-tacir-blue" : "text-gray-400"
          }`}
        />
      </div>

      {/* Pulsing indicator for unevaluated items */}
      {!hasEvaluation && (
        <div className="absolute -top-1 -right-1">
          <div className="relative">
            <div className="h-3 w-3 bg-amber-500 rounded-full animate-ping absolute"></div>
            <div className="h-3 w-3 bg-amber-500 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export const getSubmissionColumns = (
  onPreview,
  onStatusUpdate,
  onEvaluationChange,
  onWithdrawal
) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="data-[state=checked]:bg-tacir-lightblue data-[state=checked]:border-tacir-lightblue/10"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="data-[state=checked]:bg-tacir-lightblue data-[state=checked]:border-tacir-lightblue/10"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
    maxSize: 60,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 font-medium text-white hover:bg-gray-100"
      >
        Statut
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status || "submitted";
      const isWithdrawn =
        status === "rejected" && row.original.attendanceStatus === "declined";
      const config = isWithdrawn
        ? {
            label: "Désisté",
            badgeVariant: "destructive",
            icon: <UserX className="h-3 w-3 mr-1" />,
          }
        : statusOptions[status] || statusOptions.submitted;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-2 font-normal text-white hover:bg-gray-100"
            >
              <Badge
                variant={config.badgeVariant}
                className="flex items-center py-1"
              >
                {config.icon}
                {config.label}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(statusOptions).map(([key, { label, icon }]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => onStatusUpdate(row.original._id, key)}
                className={`flex items-center gap-2 cursor-pointer ${
                  key === status ? "font-semibold bg-blue-50 text-blue-700" : ""
                }`}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 140,
    maxSize: 160,
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 font-medium text-white hover:bg-gray-100"
      >
        Date Soumission
        <ArrowUpDown className="h-3 w-3 ml-1" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {new Date(row.original.submittedAt).toLocaleDateString("fr-FR")}
      </span>
    ),
    size: 130,
    maxSize: 140,
  },
  {
    accessorKey: "preselectionEvaluations",
    header: () => (
      <div className="flex items-center gap-2">
        <span>Évaluation</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-3 bg-white border border-gray-200 shadow-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Comment évaluer
              </p>
              <p className="text-xs text-gray-600">
                Cliquez sur l'évaluation pour choisir une option. Les candidats
                non évalués sont marqués en orange.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    cell: ({ row }) => {
      const evaluations = row.original.preselectionEvaluations || [];
      const latestEvaluation =
        evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;
      const config = latestEvaluation
        ? getEvaluationConfig(latestEvaluation.evaluationText)
        : {};
      const hasEvaluation = !!latestEvaluation;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto p-0 font-normal hover:bg-transparent"
            >
              <EvaluationStatus
                hasEvaluation={hasEvaluation}
                config={config}
                evaluationText={latestEvaluation?.evaluationText}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-3">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  Évaluation de présélection
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez une option pour évaluer ce candidat
                </p>
              </div>

              <DropdownMenuSeparator />

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {EVALUATION_OPTIONS.map((option) => {
                  const optionConfig = getEvaluationConfig(option.text);
                  return (
                    <DropdownMenuItem
                      key={option.text}
                      onClick={() =>
                        onEvaluationChange(row.original._id, option.value)
                      }
                      className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                        latestEvaluation?.evaluationText === option.text
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`text-lg mt-0.5 ${
                          optionConfig.textColor || "text-gray-600"
                        }`}
                      >
                        {option.icon}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {option.text}
                          </p>
                          {latestEvaluation?.evaluationText === option.text && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                            >
                              Actuel
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5">
                          {option.description}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 220,
    maxSize: 240,
  },
  {
    accessorKey: "attendanceStatus",
    header: "Statut de présence",
    cell: ({ row }) => {
      const status = row.original.attendanceStatus || "pending";

      const statusConfig = {
        pending: {
          label: "En attente",
          variant: "outline",
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: <Clock className="h-3 w-3 mr-1" />,
        },
        present: {
          label: "Présent",
          variant: "success",
          color: "text-green-700",
          bg: "bg-green-50",
          border: "border-green-200",
          icon: <UserCheck className="h-3 w-3 mr-1" />,
        },
        absent: {
          label: "Absent",
          variant: "destructive",
          color: "text-red-700",
          bg: "bg-red-50",
          border: "border-red-200",
          icon: <Ban className="h-3 w-3 mr-1" />,
        },
        declined: {
          label: "Refusé",
          variant: "destructive",
          color: "text-amber-700",
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: <UserX className="h-3 w-3 mr-1" />,
        },
      };

      const currentConfig = statusConfig[status] || statusConfig.pending;

      return (
        <div className="flex items-center">
          <Badge
            variant={currentConfig.variant}
            className={`px-2 py-1 rounded-full text-xs font-medium ${currentConfig.bg} ${currentConfig.color} ${currentConfig.border} flex items-center`}
          >
            {currentConfig.icon}
            {currentConfig.label}
          </Badge>
        </div>
      );
    },
    size: 150,
    maxSize: 160,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const submission = row.original;
      const isWithdrawn =
        submission.status === "rejected" &&
        submission.attendanceStatus === "declined";

      return (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPreview(submission)}
                  className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-gray-900 text-white text-xs"
              >
                Voir les détails
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {submission.status === "accepted" && !isWithdrawn && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onWithdrawal(submission)}
                    className="h-8 w-8 hover:bg-red-100 hover:text-red-700"
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 text-white text-xs"
                >
                  Désistement
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isWithdrawn && (
            <TooltipProvider>
              <Tooltip>
                <div className="cursor-help">
                  <Ban className="h-4 w-4 text-gray-400" />
                </div>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 text-white text-xs"
                >
                  Candidat désisté
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {submission.isReplacement && (
            <TooltipProvider>
              <Tooltip>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 px-2 py-1 text-xs flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  <span>Remplaçant</span>
                </Badge>
                <TooltipContent
                  side="top"
                  className="bg-gray-900 text-white text-xs"
                >
                  Candidat remplaçant
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
    size: 120,
    maxSize: 130,
    enableSorting: false,
  },
];
