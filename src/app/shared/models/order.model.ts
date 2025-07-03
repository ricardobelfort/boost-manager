export interface Order {
  id?: string;
  order_number?: string;
  booster?: string;
  service_type?: string;
  supplier?: string;
  account_email?: string;
  account_password?: string;
  recovery_code?: string;
  recovery_email?: string;
  platform?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  total_value?: number;
  booster_value?: number;
  observation?: string;
  weapon_quantity?: number;
  created_at?: string;
  currency?: string;
  booster_currency?: string;
}