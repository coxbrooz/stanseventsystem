export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  ministry: string;
  attendance: number;
  createdAt: string;
}

export interface DashboardStats {
  totalEvents: number;
  totalAttendance: number;
  ministryCounts: { [key: string]: number };
  upcomingCount: number;
}
