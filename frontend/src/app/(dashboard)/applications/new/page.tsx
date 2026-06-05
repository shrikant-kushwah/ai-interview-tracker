"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApplicationStore } from "@/store/applicationStore";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BsArrowLeft } from "react-icons/bs";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
};

const applicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.enum([
    "applied",
    "screening",
    "interview",
    "offer",
    "rejected",
    "ghosted",
  ]),
  jobDescriptionUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  jobDescriptionText: z.string().max(2500, "Max 2500 characters").optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
  appliedDate: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function NewApplicationPage() {
  const router = useRouter();
  const { createApplication } = useApplicationStore();
  const [loading, setLoading] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: "",
      role: "",
      status: "applied",
      jobDescriptionUrl: "",
      jobDescriptionText: "",
      salary: "",
      notes: "",
      appliedDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setLoading(true);
      await createApplication(data);
      router.push("/applications");
    } catch {
      toast.error("Failed to create application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-slate-500"
        >
          <BsArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Application</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Company + Role */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <FormControl>
                        <Input placeholder="Google" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <FormControl>
                        <Input placeholder="Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status + Date */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {field.value
                                ? statusLabels[field.value]
                                : "Select status"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="appliedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applied Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Salary */}
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Salary</FormLabel>
                    <FormControl>
                      <Input placeholder="15 LPA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* JD URL */}
              <FormField
                control={form.control}
                name="jobDescriptionUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/jobs/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* JD Text */}
              <FormField
                control={form.control}
                name="jobDescriptionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Job Description Text
                      <span className="text-slate-400 font-normal ml-1">
                        (paste for AI features)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full job description here..."
                        className="min-h-32 resize-none"
                        maxLength={2500}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-slate-400 text-right mt-1">
                      {form.watch("jobDescriptionText")?.length || 0} / 2500
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any personal notes about this application..."
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : "Save Application"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
