/*
  # Create savings and financial tables

  1. New Tables
    - `savings_products` - Available savings products
    - `savings_accounts` - Individual user savings accounts
    - `savings_transactions` - Transaction history for savings accounts
    - `interest_calculations` - Interest calculation logs
    - `transactions` - General transaction history

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for users and admins

  3. Functions
    - Interest calculation functions
    - Account number generation
*/

-- Create savings products table
CREATE TABLE IF NOT EXISTS savings_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  interest_rate numeric NOT NULL CHECK (interest_rate >= 0),
  min_balance numeric DEFAULT 0 CHECK (min_balance >= 0),
  max_balance numeric CHECK (max_balance IS NULL OR max_balance > min_balance),
  compound_period text DEFAULT 'monthly' CHECK (compound_period IN ('daily', 'monthly', 'quarterly', 'annually')),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create savings accounts table
CREATE TABLE IF NOT EXISTS savings_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES savings_products(id) ON DELETE RESTRICT NOT NULL,
  account_number text UNIQUE NOT NULL,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  interest_accrued numeric DEFAULT 0 CHECK (interest_accrued >= 0),
  last_interest_calculation timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'dormant', 'closed')),
  open_date timestamptz DEFAULT now(),
  close_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create savings transactions table
CREATE TABLE IF NOT EXISTS savings_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES savings_accounts(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'interest', 'fee')),
  amount numeric NOT NULL CHECK (amount > 0),
  balance_before numeric NOT NULL CHECK (balance_before >= 0),
  balance_after numeric NOT NULL CHECK (balance_after >= 0),
  description text,
  reference text,
  processed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interest calculations table
CREATE TABLE IF NOT EXISTS interest_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES savings_accounts(id) ON DELETE CASCADE NOT NULL,
  calculation_date timestamptz NOT NULL,
  principal_amount numeric NOT NULL CHECK (principal_amount >= 0),
  interest_rate numeric NOT NULL CHECK (interest_rate >= 0),
  days_calculated numeric NOT NULL CHECK (days_calculated > 0),
  interest_amount numeric NOT NULL CHECK (interest_amount >= 0),
  status text DEFAULT 'calculated' CHECK (status IN ('calculated', 'applied')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create general transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  order_id text UNIQUE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'expired')),
  type text NOT NULL,
  transaction_id text,
  payment_type text,
  snap_token text,
  snap_redirect_url text,
  expiry_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE savings_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for savings_products
CREATE POLICY "Anyone can read active savings products"
  ON savings_products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage savings products"
  ON savings_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for savings_accounts
CREATE POLICY "Users can read own savings accounts"
  ON savings_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own savings accounts"
  ON savings_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all savings accounts"
  ON savings_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for savings_transactions
CREATE POLICY "Users can read own savings transactions"
  ON savings_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM savings_accounts 
      WHERE id = account_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can create savings transactions"
  ON savings_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM savings_accounts 
      WHERE id = account_id AND user_id = auth.uid()
    )
  );

-- Policies for interest_calculations
CREATE POLICY "Users can read own interest calculations"
  ON interest_calculations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM savings_accounts 
      WHERE id = account_id AND user_id = auth.uid()
    )
  );

-- Policies for transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to generate account number
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS text AS $$
BEGIN
  RETURN 'SAV' || EXTRACT(EPOCH FROM now())::bigint || upper(substr(md5(random()::text), 1, 4));
END;
$$ LANGUAGE plpgsql;

-- Function to calculate interest for an account
CREATE OR REPLACE FUNCTION calculate_account_interest(account_uuid uuid, minutes_passed integer DEFAULT 1)
RETURNS numeric AS $$
DECLARE
  account_record savings_accounts%ROWTYPE;
  product_record savings_products%ROWTYPE;
  annual_rate numeric;
  minute_rate numeric;
  interest_amount numeric;
BEGIN
  -- Get account details
  SELECT * INTO account_record FROM savings_accounts WHERE id = account_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found';
  END IF;
  
  -- Get product details
  SELECT * INTO product_record FROM savings_products WHERE id = account_record.product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  -- Calculate interest
  annual_rate := product_record.interest_rate / 100.0;
  minute_rate := annual_rate / (365.0 * 24.0 * 60.0); -- Convert to per-minute rate
  interest_amount := account_record.balance * minute_rate * minutes_passed;
  
  RETURN interest_amount;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS savings_accounts_user_id_idx ON savings_accounts(user_id);
CREATE INDEX IF NOT EXISTS savings_accounts_status_idx ON savings_accounts(status);
CREATE INDEX IF NOT EXISTS savings_transactions_account_id_idx ON savings_transactions(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS interest_calculations_account_id_idx ON interest_calculations(account_id, calculation_date DESC);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_order_id_idx ON transactions(order_id);

-- Add updated_at triggers for all tables
CREATE TRIGGER update_savings_products_updated_at
  BEFORE UPDATE ON savings_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_accounts_updated_at
  BEFORE UPDATE ON savings_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_transactions_updated_at
  BEFORE UPDATE ON savings_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interest_calculations_updated_at
  BEFORE UPDATE ON interest_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();