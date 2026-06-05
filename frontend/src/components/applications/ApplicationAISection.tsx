"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { BsRobot, BsClipboard, BsCheckCircle } from "react-icons/bs";

import { Application } from "@/types";
import { applicationAPI, streamAIRequest } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";

interface ApplicationAISectionProps {
  application: Application;
}

export default function ApplicationAISection({
  application,
}: ApplicationAISectionProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiType, setAiType] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!aiResult) return;
    await navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAI = async (type: string) => {
    try {
      setAiLoading(type);
      setAiResult("");
      setAiType(type);

      const endpointMap: Record<string, string> = {
        cold_email: "/ai/cold-email",
        followup: "/ai/followup",
        questions: "/ai/questions",
      };

      await streamAIRequest(
        endpointMap[type],
        { applicationId: application._id },
        (chunk) => {
          setAiResult((prev) => (prev ?? "") + chunk);
        },
        () => {
          setAiLoading(null);
        },
      );
    } catch (error) {
      setAiResult(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setAiLoading(null);
    }
  };

  const handleResumeFeedback = async () => {
    if (!resumeFile) return;

    try {
      setAiLoading("resume");
      setAiResult(null);
      setAiType("resume");
      setResumeDialogOpen(false);

      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append(
        "jobDescription",
        application.jobDescriptionText || application.role,
      );

      const res = await applicationAPI.uploadResume(formData);
      setAiResult(res.data.result);
    } catch (error) {
      setAiResult(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BsRobot className="w-4 h-4" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-400">
            {application.jobDescriptionText
              ? "JD detected - AI features ready"
              : "Paste a job description when adding to unlock better AI results"}
          </p>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              className="justify-start text-sm"
              onClick={() => handleAI("cold_email")}
              disabled={!!aiLoading}
            >
              {aiLoading === "cold_email"
                ? "Generating..."
                : "✉️ Generate Cold Email"}
            </Button>
            <Button
              variant="outline"
              className="justify-start text-sm"
              onClick={() => handleAI("followup")}
              disabled={!!aiLoading}
            >
              {aiLoading === "followup"
                ? "Generating..."
                : "📩 Generate Follow-up Email"}
            </Button>
            <Button
              variant="outline"
              className="justify-start text-sm"
              onClick={() => handleAI("questions")}
              disabled={!!aiLoading}
            >
              {aiLoading === "questions"
                ? "Generating..."
                : "🎯 Generate Interview Questions"}
            </Button>
            <Dialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-sm"
                  disabled={!!aiLoading}
                >
                  {aiLoading === "resume" ? "Analyzing..." : "📄 Resume Feedback"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Resume Feedback</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    Upload your resume PDF. AI will compare it against the{" "}
                    <span className="font-medium text-slate-700">
                      {application.company}
                    </span>{" "}
                    job description.
                  </p>

                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 transition-colors hover:border-slate-400 hover:bg-slate-50">
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setResumeFile(file);
                      }}
                    />
                    {resumeFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">PDF</span>
                        <p className="text-sm font-medium text-slate-700">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(resumeFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-sm text-slate-500">Click to upload PDF</p>
                        <p className="text-xs text-slate-400">Max 5MB</p>
                      </div>
                    )}
                  </label>

                  {!application.jobDescriptionText && (
                    <p className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-600">
                      No job description found. AI will use the role name only.
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setResumeDialogOpen(false);
                        setResumeFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleResumeFeedback}
                      disabled={!resumeFile}
                      className="flex-1"
                    >
                      Analyze Resume
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          {aiResult !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                  {aiType === "cold_email" && "Cold Email"}
                  {aiType === "followup" && "Follow-up Email"}
                  {aiType === "questions" && "Interview Questions"}
                  {aiType === "resume" && "Resume Feedback"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-auto p-1 text-slate-400 hover:text-slate-700"
                >
                  {copied ? (
                    <BsCheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <BsClipboard className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto rounded-lg bg-slate-50 p-4 text-sm text-slate-700 prose prose-sm prose-slate max-w-none">
                <ReactMarkdown>{aiResult}</ReactMarkdown>
                {aiLoading && aiType && (
                  <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-slate-400" />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
