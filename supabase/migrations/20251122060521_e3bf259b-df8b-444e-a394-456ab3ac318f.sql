-- Enable pg_trgm extension for better text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add unique constraint on SKU
ALTER TABLE public.products 
ADD CONSTRAINT products_sku_unique UNIQUE (sku);

-- Add unique constraint on warehouse code
ALTER TABLE public.warehouses 
ADD CONSTRAINT warehouses_code_unique UNIQUE (code);

-- Add unique constraint on location code within warehouse
ALTER TABLE public.locations 
ADD CONSTRAINT locations_code_warehouse_unique UNIQUE (code, warehouse_id);

-- Add indexes for search fields
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(name gin_trgm_ops);

-- Add indexes for document numbers
CREATE INDEX IF NOT EXISTS idx_receipts_number ON public.receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_number ON public.deliveries(delivery_number);
CREATE INDEX IF NOT EXISTS idx_transfers_number ON public.transfers(transfer_number);
CREATE INDEX IF NOT EXISTS idx_adjustments_number ON public.adjustments(adjustment_number);

-- Add indexes for status and warehouse filters
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_warehouse ON public.receipts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_warehouse ON public.deliveries(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.transfers(status);
CREATE INDEX IF NOT EXISTS idx_adjustments_status ON public.adjustments(status);
CREATE INDEX IF NOT EXISTS idx_adjustments_warehouse ON public.adjustments(warehouse_id);

-- Add indexes for stock ledger queries
CREATE INDEX IF NOT EXISTS idx_stock_ledger_product ON public.stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_created_at ON public.stock_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_type ON public.stock_ledger(movement_type);

-- Add indexes for stock levels
CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON public.stock_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_location ON public.stock_levels(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_product_location ON public.stock_levels(product_id, location_id);

-- Update foreign keys with CASCADE for line items
ALTER TABLE public.receipt_lines
DROP CONSTRAINT IF EXISTS receipt_lines_receipt_id_fkey,
ADD CONSTRAINT receipt_lines_receipt_id_fkey 
  FOREIGN KEY (receipt_id) REFERENCES public.receipts(id) ON DELETE CASCADE;

ALTER TABLE public.delivery_lines
DROP CONSTRAINT IF EXISTS delivery_lines_delivery_id_fkey,
ADD CONSTRAINT delivery_lines_delivery_id_fkey 
  FOREIGN KEY (delivery_id) REFERENCES public.deliveries(id) ON DELETE CASCADE;

ALTER TABLE public.transfer_lines
DROP CONSTRAINT IF EXISTS transfer_lines_transfer_id_fkey,
ADD CONSTRAINT transfer_lines_transfer_id_fkey 
  FOREIGN KEY (transfer_id) REFERENCES public.transfers(id) ON DELETE CASCADE;

ALTER TABLE public.adjustment_lines
DROP CONSTRAINT IF EXISTS adjustment_lines_adjustment_id_fkey,
ADD CONSTRAINT adjustment_lines_adjustment_id_fkey 
  FOREIGN KEY (adjustment_id) REFERENCES public.adjustments(id) ON DELETE CASCADE;