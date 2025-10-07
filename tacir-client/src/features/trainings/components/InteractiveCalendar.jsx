"use client";
import React, { useState } from "react";
import {
  format,
  parseISO,
  isSameDay,
  isWithinInterval,
  isToday,
  isValid,
  addMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  MapPin,
  Users,
  Calendar as CalendarIcon,
  ExternalLink,
} from "lucide-react";
import { typeConfig } from "./style.config";

const InteractiveCalendar = ({ events = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Safe date parsing with validation
  const safeParseISO = (dateString) => {
    if (!dateString) return null;
    try {
      const date = parseISO(dateString);
      return isValid(date) ? date : null;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  // Check if event is active on given date
  const eventIsActiveOnDate = (date, event) => {
    if (!event?.startDate) return false;

    const startDate = safeParseISO(event.startDate);
    const endDate = event.endDate ? safeParseISO(event.endDate) : startDate;

    if (!startDate || (event.endDate && !endDate)) return false;

    return isWithinInterval(date, {
      start: startDate,
      end: endDate,
    });
  };

  // Check if day has any events
  const dayHasEvents = (date) => {
    return events.some((event) => eventIsActiveOnDate(date, event));
  };

  // Get events for specific date
  const getEventsForDate = (date) => {
    return events.filter((event) => eventIsActiveOnDate(date, event));
  };

  // Get styling config for event type
  const getEventTypeConfig = (type) => {
    return (
      typeConfig[type] || {
        title: "Autre",
        bgColor: "bg-tacir-darkgray",
        textColor: "text-tacir-darkgray",
        lightBg: "bg-gray-100",
        icon: CalendarIcon,
      }
    );
  };

  // Get badge styling for status
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-tacir-green text-white";
      case "pending":
        return "bg-tacir-yellow text-white";
      case "rejected":
        return "bg-tacir-pink text-white";
      case "rescheduled":
        return "bg-tacir-orange text-white";
      default:
        return "bg-tacir-darkgray text-white";
    }
  };

  // Get label for status
  const getStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return "Approuvé";
      case "pending":
        return "En attente";
      case "rejected":
        return "Rejeté";
      case "rescheduled":
        return "Reprogrammé";
      default:
        return status;
    }
  };

  // Format event time display
  const formatEventTime = (event) => {
    if (!event?.startDate) return "Heure non définie";

    const startDate = safeParseISO(event.startDate);
    if (!startDate) return "Heure non définie";

    return `${format(startDate, "HH:mm")} - ${event.duration || "?"} min`;
  };

  // Get events for selected date
  const dayEvents = getEventsForDate(selectedDate);

  // Render a calendar day cell
  const renderCalendarDay = (day, index) => {
    if (!day) {
      return (
        <div
          key={`empty-${index}`}
          className="p-2 h-28 border border-tacir-lightgray/30"
        />
      );
    }

    const eventsForDay = getEventsForDate(day);
    const isSelected = isSameDay(day, selectedDate);
    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
    const isCurrentDay = isToday(day);

    return (
      <div
        key={day.toISOString()}
        onClick={() => setSelectedDate(day)}
        className={`p-2 h-28 border cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md ${
          isSelected
            ? "border-tacir-blue border-2 bg-tacir-blue/5 shadow-md"
            : isCurrentDay
            ? "border-tacir-darkblue bg-tacir-darkblue/5"
            : "border-gray-400 hover:border-tacir-lightgray"
        } ${
          !isCurrentMonth
            ? "text-tacir-darkgray/50 bg-gray-50/50"
            : "text-tacir-darkblue bg-white"
        }`}
      >
        <div
          className={`text-right font-semibold text-sm mb-1 ${
            isCurrentDay ? "text-tacir-darkblue" : ""
          }`}
        >
          {format(day, "d")}
          {isCurrentDay && (
            <div className="w-1 h-1 bg-tacir-blue rounded-full ml-auto mt-0.5"></div>
          )}
        </div>

        {dayHasEvents(day) && (
          <div className="space-y-1">
            {eventsForDay.slice(0, 3).map((event, idx) => {
              const config = getEventTypeConfig(event.type);
              const startDate = safeParseISO(event.startDate);
              const endDate = event.endDate
                ? safeParseISO(event.endDate)
                : startDate;

              const isFirstDay = startDate && isSameDay(day, startDate);
              const isLastDay = endDate && isSameDay(day, endDate);

              return (
                <div
                  key={`${event._id}-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                  }}
                  className={`text-xs p-1.5 rounded-md text-white font-medium cursor-pointer hover:opacity-90 transition-opacity ${
                    config.bgColor
                  } ${!isFirstDay && !isLastDay ? "rounded-none" : ""} ${
                    isFirstDay && !isLastDay ? "rounded-r-none" : ""
                  } ${isLastDay && !isFirstDay ? "rounded-l-none" : ""}`}
                  title={event.title}
                >
                  <div className="flex items-center gap-1">
                    {isFirstDay && (
                      <config.icon className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {isFirstDay ? event.title : "●"}
                    </span>
                  </div>
                </div>
              );
            })}
            {eventsForDay.length > 3 && (
              <div className="text-xs text-tacir-darkgray bg-tacir-lightgray px-2 py-1 rounded text-center">
                +{eventsForDay.length - 3} autres
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Navigate between months
  const navigateMonth = (direction) => {
    setCurrentMonth(addMonths(currentMonth, direction));
  };

  // Go to current date
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Generate calendar days for current month
  const getCalendarDays = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const days = [];

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }

    // Add empty cells to complete the last week
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(null);
      }
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <Card className="lg:col-span-2 p-6 shadow-lg border-tacir-lightgray">
          {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-tacir-blue to-tacir-darkblue flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-tacir-darkblue">
                  Calendrier des Formations
                </h2>
                <p className="text-sm text-tacir-darkgray">
                  {events.length} événement{events.length !== 1 ? "s" : ""} au
                  total
                </p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(-1)}
                className="p-2 border-tacir-lightgray hover:bg-tacir-lightgray"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                onClick={goToToday}
                className="px-4 py-2 text-tacir-darkblue border-tacir-lightgray hover:bg-tacir-lightgray font-medium"
              >
                {format(currentMonth, "MMMM yyyy", { locale: fr })}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(1)}
                className="p-2 border-tacir-lightgray hover:bg-tacir-lightgray"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-tacir-darkgray py-3 text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {getCalendarDays(currentMonth).map(renderCalendarDay)}
          </div>

          {/* Legend */}
          <div className="border-t border-tacir-lightgray pt-4">
            <h3 className="font-semibold text-tacir-darkblue mb-3 text-sm">
              Légende
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(typeConfig).map(([type, config]) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${config.bgColor}`}
                  ></div>
                  <span className="text-sm text-tacir-darkgray">
                    {config.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Selected Date Events */}
        <Card className="p-6 shadow-lg border-tacir-lightgray">
          <div className="border-b border-tacir-lightgray pb-4 mb-4">
            <h3 className="font-bold text-tacir-darkblue text-lg">
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </h3>
            <p className="text-sm text-tacir-darkgray mt-1">
              {dayEvents.length} événement{dayEvents.length !== 1 ? "s" : ""}
            </p>
          </div>

          {dayEvents.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dayEvents.map((event) => {
                const config = getEventTypeConfig(event.type);
                return (
                  <div
                    key={event._id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-4 border border-tacir-lightgray rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 hover:border-tacir-blue group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${config.bgColor} group-hover:scale-110 transition-transform`}
                      >
                        <config.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-tacir-darkblue truncate">
                            {event.title}
                          </h4>
                          <Badge
                            className={`${getStatusBadge(
                              event.status
                            )} text-xs px-2 py-1 flex-shrink-0`}
                          >
                            {getStatusLabel(event.status)}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-tacir-darkgray">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{formatEventTime(event)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {event.sessionType === "online"
                                ? "En ligne"
                                : event.proposedLocation || "Lieu à définir"}
                            </span>
                          </div>

                          {event.cohorts?.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">
                                {event.cohorts.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-tacir-lightgray mx-auto mb-3" />
              <p className="text-tacir-darkgray font-medium">
                Aucun événement programmé
              </p>
              <p className="text-sm text-tacir-darkgray/70 mt-1">
                Sélectionnez une autre date pour voir les événements
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                      getEventTypeConfig(selectedEvent.type).bgColor
                    }`}
                  >
                    {React.createElement(
                      getEventTypeConfig(selectedEvent.type).icon,
                      { className: "w-6 h-6" }
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-tacir-darkblue mb-1">
                      {selectedEvent.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getStatusBadge(
                          selectedEvent.status
                        )} text-xs`}
                      >
                        {getStatusLabel(selectedEvent.status)}
                      </Badge>
                      <span
                        className={`text-sm font-medium ${
                          getEventTypeConfig(selectedEvent.type).textColor
                        }`}
                      >
                        {getEventTypeConfig(selectedEvent.type).title}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-tacir-lightgray"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                {selectedEvent.description && (
                  <div>
                    <h3 className="font-semibold text-tacir-darkblue mb-2">
                      Description
                    </h3>
                    <p className="text-tacir-darkgray">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-tacir-blue" />
                      <div>
                        <p className="font-medium text-tacir-darkblue">Date</p>
                        <p className="text-sm text-tacir-darkgray">
                          {selectedEvent.startDate
                            ? format(
                                safeParseISO(selectedEvent.startDate) ||
                                  new Date(),
                                "dd/MM/yyyy"
                              )
                            : "Date non définie"}
                          {selectedEvent.endDate &&
                            ` - ${
                              selectedEvent.endDate
                                ? format(
                                    safeParseISO(selectedEvent.endDate) ||
                                      new Date(),
                                    "dd/MM/yyyy"
                                  )
                                : "Date non définie"
                            }`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-tacir-blue" />
                      <div>
                        <p className="font-medium text-tacir-darkblue">Heure</p>
                        <p className="text-sm text-tacir-darkgray">
                          {formatEventTime(selectedEvent)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-tacir-blue" />
                      <div>
                        <p className="font-medium text-tacir-darkblue">Lieu</p>
                        <p className="text-sm text-tacir-darkgray">
                          {selectedEvent.sessionType === "online"
                            ? "Formation en ligne"
                            : selectedEvent.proposedLocation || "À définir"}
                        </p>
                      </div>
                    </div>

                    {selectedEvent.cohorts?.length > 0 && (
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-tacir-blue" />
                        <div>
                          <p className="font-medium text-tacir-darkblue">
                            Cohortes
                          </p>
                          <p className="text-sm text-tacir-darkgray">
                            {selectedEvent.cohorts.join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedEvent.meetingLink &&
                  selectedEvent.sessionType === "online" && (
                    <div className="border-t border-tacir-lightgray pt-4">
                      <Button
                        onClick={() =>
                          window.open(selectedEvent.meetingLink, "_blank")
                        }
                        className="w-full bg-tacir-blue hover:bg-tacir-darkblue text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Rejoindre la session
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InteractiveCalendar;
