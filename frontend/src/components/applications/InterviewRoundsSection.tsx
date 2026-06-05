"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { BsPlusCircle, BsTrash } from "react-icons/bs";
import z from "zod";

import { Application, Interview } from "@/types";
import { applicationAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const outcomeLabels = {
  pending: "Pending",
  passed: "Passed",
  failed: "Failed",
};

const interviewSchema = z.object({
  round: z.string().min(1, "Round name is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  outcome: z.enum(["pending", "passed", "failed"]),
});

type InterviewFormValues = z.infer<typeof interviewSchema>;

interface InterviewRoundsSectionProps {
  application: Application;
  onRefresh: () => Promise<void>;
  onUpdate: (id: string, data: Partial<Application>) => Promise<void>;
}

export default function InterviewRoundsSection({
  application,
  onRefresh,
  onUpdate,
}: InterviewRoundsSectionProps) {
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [deletingInterviewId, setDeletingInterviewId] = useState<string | null>(
    null,
  );
  const [addingInterview, setAddingInterview] = useState(false);

  const interviewForm = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      round: "",
      date: "",
      notes: "",
      outcome: "pending",
    },
  });

  const sortedInterviews = [...(application.interviews || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const handleAddInterview = async (data: InterviewFormValues) => {
    try {
      setAddingInterview(true);
      await applicationAPI.addInterview(application._id, data);
      await onRefresh();
      interviewForm.reset();
      setShowInterviewForm(false);
    } finally {
      setAddingInterview(false);
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (!confirm("Delete this interview round?")) return;

    try {
      setDeletingInterviewId(interviewId);
      const updatedInterviews = application.interviews.filter(
        (interview) => interview._id !== interviewId,
      );
      await onUpdate(application._id, { interviews: updatedInterviews });
      await onRefresh();
    } finally {
      setDeletingInterviewId(null);
    }
  };

  const handleOutcomeChange = async (
    interview: Interview,
    outcome: Interview["outcome"],
  ) => {
    const updatedInterviews = application.interviews.map((item) =>
      item._id === interview._id ? { ...item, outcome } : item,
    );

    await onUpdate(application._id, { interviews: updatedInterviews });
    await onRefresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Interview Rounds</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInterviewForm(!showInterviewForm)}
          className="text-slate-500"
        >
          <BsPlusCircle className="w-4 h-4 mr-1" />
          Add Round
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showInterviewForm && (
          <Form {...interviewForm}>
            <form
              onSubmit={interviewForm.handleSubmit(handleAddInterview)}
              className="border rounded-lg p-4 space-y-3 bg-slate-50"
            >
              <FormField
                control={interviewForm.control}
                name="round"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Round Name *</FormLabel>
                    <FormControl>
                      <input
                        className="w-full border rounded px-3 py-2 text-sm bg-white"
                        placeholder="e.g. Technical 1, HR, Final"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={interviewForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Date *</FormLabel>
                    <FormControl>
                      <input
                        className="w-full border rounded px-3 py-2 text-sm bg-white"
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={interviewForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes about this round..."
                        className="resize-none text-sm min-h-16"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={interviewForm.control}
                name="outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Outcome</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="text-sm">
                          <SelectValue>
                            {outcomeLabels[field.value as keyof typeof outcomeLabels]}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={addingInterview}
                  className="flex-1"
                >
                  {addingInterview ? "Adding..." : "Add Round"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowInterviewForm(false);
                    interviewForm.reset();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}

        {application.interviews?.length > 0 ? (
          <div className="space-y-3">
            {sortedInterviews.map((interview) => (
              <div
                key={interview._id}
                className="flex items-start justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {interview.round}
                  </p>
                  {interview.date && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(interview.date), "dd MMM yyyy")}
                    </p>
                  )}
                  {interview.notes && (
                    <p className="text-xs text-slate-600 mt-1">
                      {interview.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-3">
                  <Select
                    value={interview.outcome}
                    onValueChange={(val) =>
                      handleOutcomeChange(
                        interview,
                        val as "pending" | "passed" | "failed",
                      )
                    }
                  >
                    <SelectTrigger className="w-28 h-7 text-xs">
                      <SelectValue>{outcomeLabels[interview.outcome]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingInterviewId === interview._id}
                    onClick={() => handleDeleteInterview(interview._id)}
                    className="h-7 w-7 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50"
                  >
                    <BsTrash className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">
            No interview rounds yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
