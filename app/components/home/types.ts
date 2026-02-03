export type Ticket = {
  _id: string;
  key: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  service: string;
  updatedAt: number;
  summary: string;
};

export type UpdateItem = {
  _id: string;
  ticketKey: string;
  ticketTitle: string;
  status: string;
  priority: string;
  assignee: string;
  message: string;
  createdAt: number;
};

export type TicketStats = {
  openCount: number;
  inProgressCount: number;
  criticalCount: number;
};
