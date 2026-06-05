export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  ownerId: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  title: string;
  boardId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  _id: string;
  title: string;
  description?: string;
  columnId: string;
  boardId: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  dueDate?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Filter {
  page: number;
  limit: number;
  totalRecords: number;
  sort: string;
  search?: string;
  sortType: 1 | -1;
}
