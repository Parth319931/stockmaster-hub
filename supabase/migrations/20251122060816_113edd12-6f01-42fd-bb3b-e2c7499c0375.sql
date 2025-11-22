-- Function to validate and process receipt
CREATE OR REPLACE FUNCTION public.validate_receipt(receipt_id_param uuid, validator_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  line_record RECORD;
  receipt_record RECORD;
BEGIN
  -- Get receipt details
  SELECT * INTO receipt_record FROM receipts WHERE id = receipt_id_param;
  
  IF receipt_record.status != 'draft' AND receipt_record.status != 'waiting' THEN
    RAISE EXCEPTION 'Receipt can only be validated from draft or waiting status';
  END IF;
  
  -- Process each receipt line
  FOR line_record IN 
    SELECT * FROM receipt_lines WHERE receipt_id = receipt_id_param
  LOOP
    -- Update or insert stock level
    INSERT INTO stock_levels (product_id, location_id, quantity)
    VALUES (line_record.product_id, line_record.location_id, line_record.quantity)
    ON CONFLICT (product_id, location_id) 
    DO UPDATE SET 
      quantity = stock_levels.quantity + EXCLUDED.quantity,
      updated_at = now();
    
    -- Add stock ledger entry
    INSERT INTO stock_ledger (
      product_id,
      movement_type,
      quantity,
      from_location_id,
      to_location_id,
      reference_doc_type,
      reference_doc_id,
      reference_doc_number,
      created_by
    ) VALUES (
      line_record.product_id,
      'receipt',
      line_record.quantity,
      NULL,
      line_record.location_id,
      'receipt',
      receipt_id_param,
      receipt_record.receipt_number,
      validator_id
    );
  END LOOP;
  
  -- Update receipt status
  UPDATE receipts 
  SET 
    status = 'done',
    validated_at = now(),
    validated_by = validator_id
  WHERE id = receipt_id_param;
END;
$$;

-- Function to validate and process delivery
CREATE OR REPLACE FUNCTION public.validate_delivery(delivery_id_param uuid, validator_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  line_record RECORD;
  delivery_record RECORD;
  current_stock INTEGER;
BEGIN
  -- Get delivery details
  SELECT * INTO delivery_record FROM deliveries WHERE id = delivery_id_param;
  
  IF delivery_record.status != 'draft' AND delivery_record.status != 'waiting' THEN
    RAISE EXCEPTION 'Delivery can only be validated from draft or waiting status';
  END IF;
  
  -- Process each delivery line
  FOR line_record IN 
    SELECT * FROM delivery_lines WHERE delivery_id = delivery_id_param
  LOOP
    -- Check if sufficient stock exists
    SELECT COALESCE(quantity, 0) INTO current_stock 
    FROM stock_levels 
    WHERE product_id = line_record.product_id 
      AND location_id = line_record.location_id;
    
    IF current_stock < line_record.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product % at location %. Available: %, Required: %', 
        line_record.product_id, line_record.location_id, current_stock, line_record.quantity;
    END IF;
    
    -- Update stock level
    UPDATE stock_levels 
    SET 
      quantity = quantity - line_record.quantity,
      updated_at = now()
    WHERE product_id = line_record.product_id 
      AND location_id = line_record.location_id;
    
    -- Add stock ledger entry
    INSERT INTO stock_ledger (
      product_id,
      movement_type,
      quantity,
      from_location_id,
      to_location_id,
      reference_doc_type,
      reference_doc_id,
      reference_doc_number,
      created_by
    ) VALUES (
      line_record.product_id,
      'delivery',
      line_record.quantity,
      line_record.location_id,
      NULL,
      'delivery',
      delivery_id_param,
      delivery_record.delivery_number,
      validator_id
    );
  END LOOP;
  
  -- Update delivery status
  UPDATE deliveries 
  SET 
    status = 'done',
    validated_at = now(),
    validated_by = validator_id
  WHERE id = delivery_id_param;
END;
$$;

-- Function to validate and process transfer
CREATE OR REPLACE FUNCTION public.validate_transfer(transfer_id_param uuid, validator_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  line_record RECORD;
  transfer_record RECORD;
  current_stock INTEGER;
BEGIN
  -- Get transfer details
  SELECT * INTO transfer_record FROM transfers WHERE id = transfer_id_param;
  
  IF transfer_record.status != 'draft' AND transfer_record.status != 'waiting' THEN
    RAISE EXCEPTION 'Transfer can only be validated from draft or waiting status';
  END IF;
  
  -- Process each transfer line
  FOR line_record IN 
    SELECT * FROM transfer_lines WHERE transfer_id = transfer_id_param
  LOOP
    -- Check if sufficient stock exists at source
    SELECT COALESCE(quantity, 0) INTO current_stock 
    FROM stock_levels 
    WHERE product_id = line_record.product_id 
      AND location_id = line_record.from_location_id;
    
    IF current_stock < line_record.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product % at source location %. Available: %, Required: %', 
        line_record.product_id, line_record.from_location_id, current_stock, line_record.quantity;
    END IF;
    
    -- Decrease stock at source location
    UPDATE stock_levels 
    SET 
      quantity = quantity - line_record.quantity,
      updated_at = now()
    WHERE product_id = line_record.product_id 
      AND location_id = line_record.from_location_id;
    
    -- Increase stock at destination location
    INSERT INTO stock_levels (product_id, location_id, quantity)
    VALUES (line_record.product_id, line_record.to_location_id, line_record.quantity)
    ON CONFLICT (product_id, location_id) 
    DO UPDATE SET 
      quantity = stock_levels.quantity + EXCLUDED.quantity,
      updated_at = now();
    
    -- Add stock ledger entry
    INSERT INTO stock_ledger (
      product_id,
      movement_type,
      quantity,
      from_location_id,
      to_location_id,
      reference_doc_type,
      reference_doc_id,
      reference_doc_number,
      created_by
    ) VALUES (
      line_record.product_id,
      'transfer',
      line_record.quantity,
      line_record.from_location_id,
      line_record.to_location_id,
      'transfer',
      transfer_id_param,
      transfer_record.transfer_number,
      validator_id
    );
  END LOOP;
  
  -- Update transfer status
  UPDATE transfers 
  SET 
    status = 'done',
    validated_at = now(),
    validated_by = validator_id
  WHERE id = transfer_id_param;
END;
$$;

-- Function to validate and process adjustment
CREATE OR REPLACE FUNCTION public.validate_adjustment(adjustment_id_param uuid, validator_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  line_record RECORD;
  adjustment_record RECORD;
BEGIN
  -- Get adjustment details
  SELECT * INTO adjustment_record FROM adjustments WHERE id = adjustment_id_param;
  
  IF adjustment_record.status != 'draft' AND adjustment_record.status != 'waiting' THEN
    RAISE EXCEPTION 'Adjustment can only be validated from draft or waiting status';
  END IF;
  
  -- Process each adjustment line
  FOR line_record IN 
    SELECT * FROM adjustment_lines WHERE adjustment_id = adjustment_id_param
  LOOP
    -- Check for negative stock
    IF line_record.physical_quantity < 0 THEN
      RAISE EXCEPTION 'Physical quantity cannot be negative for product % at location %', 
        line_record.product_id, line_record.location_id;
    END IF;
    
    -- Update stock level to physical quantity
    INSERT INTO stock_levels (product_id, location_id, quantity)
    VALUES (line_record.product_id, line_record.location_id, line_record.physical_quantity)
    ON CONFLICT (product_id, location_id) 
    DO UPDATE SET 
      quantity = EXCLUDED.quantity,
      updated_at = now();
    
    -- Add stock ledger entry (use difference as quantity)
    INSERT INTO stock_ledger (
      product_id,
      movement_type,
      quantity,
      from_location_id,
      to_location_id,
      reference_doc_type,
      reference_doc_id,
      reference_doc_number,
      created_by
    ) VALUES (
      line_record.product_id,
      'adjustment',
      line_record.difference,
      CASE WHEN line_record.difference < 0 THEN line_record.location_id ELSE NULL END,
      CASE WHEN line_record.difference > 0 THEN line_record.location_id ELSE NULL END,
      'adjustment',
      adjustment_id_param,
      adjustment_record.adjustment_number,
      validator_id
    );
  END LOOP;
  
  -- Update adjustment status
  UPDATE adjustments 
  SET 
    status = 'done',
    validated_at = now(),
    validated_by = validator_id
  WHERE id = adjustment_id_param;
END;
$$;

-- Add unique constraint to prevent duplicate stock levels
ALTER TABLE public.stock_levels
DROP CONSTRAINT IF EXISTS stock_levels_product_location_unique,
ADD CONSTRAINT stock_levels_product_location_unique UNIQUE (product_id, location_id);