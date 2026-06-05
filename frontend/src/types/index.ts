export type Status =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";

export interface Interview {
  _id: string;
  round: string;
  date: string;
  notes: string;
  outcome: "pending" | "passed" | "failed";
}

export interface Application {
  _id: string;
  company: string;
  role: string;
  status: Status;
  jobDescriptionUrl?: string;
  jobDescriptionText?: string;
  appliedDate: string;
  interviews: Interview[];
  notes?: string;
  salary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface DashboardStats {
  total: number;
  byStatus: { _id: Status; count: number }[];
  recent: Pick<Application,
    "_id" | "company" | "role" | "status" | "appliedDate"
  >[];
}