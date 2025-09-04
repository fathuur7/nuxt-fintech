/*
  # Seed initial savings products

  1. Data
    - Insert sample savings products with different interest rates
    - Create products for regular savings, premium savings, and Islamic savings

  2. Products
    - Regular Savings (3.5% annual)
    - Premium Savings (5.0% annual)
    - Islamic Savings (4.0% annual)
    - Education Savings (4.5% annual)
*/

-- Insert sample savings products
INSERT INTO savings_products (name, interest_rate, min_balance, max_balance, compound_period, description, is_active)
VALUES 
  (
    'Tabungan Reguler',
    3.5,
    50000,
    NULL,
    'monthly',
    'Tabungan dengan bunga kompetitif untuk kebutuhan sehari-hari',
    true
  ),
  (
    'Tabungan Premium',
    5.0,
    1000000,
    100000000,
    'monthly',
    'Tabungan dengan bunga tinggi untuk nasabah premium',
    true
  ),
  (
    'Tabungan Syariah',
    4.0,
    100000,
    NULL,
    'monthly',
    'Tabungan berdasarkan prinsip syariah dengan sistem bagi hasil',
    true
  ),
  (
    'Tabungan Pendidikan',
    4.5,
    250000,
    50000000,
    'monthly',
    'Tabungan khusus untuk dana pendidikan dengan bunga menarik',
    true
  ),
  (
    'Tabungan Hari Tua',
    5.5,
    500000,
    NULL,
    'monthly',
    'Tabungan jangka panjang untuk persiapan masa pensiun',
    true
  )
ON CONFLICT (name) DO NOTHING;