export const COLORS = {
  학원수: "#F28C6A",
  회원수: "#6FCF97",
  결제내역: "#6AA7F9",
} as const;

export type DataKey = keyof typeof COLORS;
export type MonthKey = "이번 달" | "지난 달";
export type WeekKey = "이번주" | "지난주";
export type CategoryKey = "최근 검색" | "방문 통계";

export interface DataPoint {
  x: string;
  y: number;
}

export interface ChartData {
  id: DataKey;
  color: string;
  data: DataPoint[];
}

export interface UserCountData {
  registerDate: string;
  totalUserCount: number;
}

export interface CostCountData {
  registerDate: string;
  academyCostCount: number;
}

export interface SearchInfo {
  tagCount: number;
  tagName: string;
  totalTagCount: number;
}

export interface BoardItem {
  boardId: number;
  userId: number;
  boardName: string;
  createdAt: string;
  name: string;
  totalCount: number;
}

export interface CostInfo {
  costCount: number;
  sumFee: number;
  saleRate: number;
}

export interface PieChartData {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  pieData: PieChartData[];
}
