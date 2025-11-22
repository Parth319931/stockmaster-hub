-- Create efficient KPI calculation functions

-- Function to get total active products count
CREATE OR REPLACE FUNCTION get_total_products_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM products
  WHERE is_active = true;
$$;

-- Function to get low stock items count
-- Products where total stock across all locations is <= reorder_level
CREATE OR REPLACE FUNCTION get_low_stock_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM (
    SELECT p.id
    FROM products p
    WHERE p.is_active = true
      AND COALESCE(
        (SELECT SUM(sl.quantity) FROM stock_levels sl WHERE sl.product_id = p.id),
        0
      ) <= p.reorder_level
  ) AS low_stock_products;
$$;

-- Function to get pending receipts count
CREATE OR REPLACE FUNCTION get_pending_receipts_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM receipts
  WHERE status IN ('draft', 'waiting', 'ready');
$$;

-- Function to get pending deliveries count
CREATE OR REPLACE FUNCTION get_pending_deliveries_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM deliveries
  WHERE status IN ('draft', 'waiting', 'ready');
$$;

-- Function to get pending transfers count
CREATE OR REPLACE FUNCTION get_pending_transfers_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM transfers
  WHERE status IN ('draft', 'waiting', 'ready');
$$;