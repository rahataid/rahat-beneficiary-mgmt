export type CreateBenefComm = {
  name: string;
  groupUID: string;
  message: string;
  transportId: string;
  sessionId?: string;
  createdBy?: string;
};

export type ListBenefComm = {
  sort: string;
  order: 'asc' | 'desc';
  page: number;
  perPage: number;
  name?: string;
};

export type LogsPaginations = {
  page?: number;
  limit?: number;
};
