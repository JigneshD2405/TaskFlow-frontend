
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
  members: string[];
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