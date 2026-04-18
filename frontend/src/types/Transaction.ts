export type Transaction = {
  id: number;
  text: string;
  amount: number;
  type: string;
  category: string;
  created_at: string; // ✅ ADD THIS
};