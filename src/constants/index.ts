export { ROUTES } from "./routes";

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  totalRecords: 0,
  sort: "createdAt",
  sortType: -1 as 1 | -1,
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  URGENT: "#7c3aed",
};

export const PRIORITY_OPTIONS = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];
