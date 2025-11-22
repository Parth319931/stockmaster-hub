-- Create enums for various status types
CREATE TYPE public.document_status AS ENUM ('draft', 'waiting', 'ready', 'done', 'cancelled');
CREATE TYPE public.stock_movement_type AS ENUM ('receipt', 'delivery', 'transfer', 'adjustment');
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default 'staff' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create warehouses table
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

-- Create locations table (storage locations within warehouses)
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  aisle TEXT,
  rack TEXT,
  shelf TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(warehouse_id, code)
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  uom TEXT NOT NULL DEFAULT 'Unit',
  reorder_level INTEGER NOT NULL DEFAULT 10,
  unit_cost DECIMAL(10, 2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create stock levels table
CREATE TABLE public.stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, location_id)
);

ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;

-- Create receipts table (incoming stock)
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  status document_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID
);

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Create receipt lines table
CREATE TABLE public.receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.receipt_lines ENABLE ROW LEVEL SECURITY;

-- Create deliveries table (outgoing stock)
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  status document_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID
);

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Create delivery lines table
CREATE TABLE public.delivery_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_lines ENABLE ROW LEVEL SECURITY;

-- Create transfers table (internal stock movements)
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number TEXT NOT NULL UNIQUE,
  from_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  to_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  status document_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID,
  CHECK (from_warehouse_id != to_warehouse_id)
);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Create transfer lines table
CREATE TABLE public.transfer_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  from_location_id UUID NOT NULL REFERENCES public.locations(id),
  to_location_id UUID NOT NULL REFERENCES public.locations(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transfer_lines ENABLE ROW LEVEL SECURITY;

-- Create adjustments table (inventory corrections)
CREATE TABLE public.adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_number TEXT NOT NULL UNIQUE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  status document_status NOT NULL DEFAULT 'draft',
  reason TEXT NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID
);

ALTER TABLE public.adjustments ENABLE ROW LEVEL SECURITY;

-- Create adjustment lines table
CREATE TABLE public.adjustment_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_id UUID NOT NULL REFERENCES public.adjustments(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  system_quantity INTEGER NOT NULL,
  physical_quantity INTEGER NOT NULL,
  difference INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.adjustment_lines ENABLE ROW LEVEL SECURITY;

-- Create stock ledger table (audit trail)
CREATE TABLE public.stock_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_type stock_movement_type NOT NULL,
  from_location_id UUID REFERENCES public.locations(id),
  to_location_id UUID REFERENCES public.locations(id),
  quantity INTEGER NOT NULL,
  reference_doc_type TEXT NOT NULL,
  reference_doc_id UUID NOT NULL,
  reference_doc_number TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_ledger ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_stock_levels_product ON public.stock_levels(product_id);
CREATE INDEX idx_stock_levels_location ON public.stock_levels(location_id);
CREATE INDEX idx_stock_ledger_product ON public.stock_ledger(product_id);
CREATE INDEX idx_stock_ledger_created ON public.stock_ledger(created_at DESC);
CREATE INDEX idx_receipts_status ON public.receipts(status);
CREATE INDEX idx_deliveries_status ON public.deliveries(status);
CREATE INDEX idx_transfers_status ON public.transfers(status);
CREATE INDEX idx_adjustments_status ON public.adjustments(status);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Anyone can view roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for warehouses (admin/manager can manage, all can view)
CREATE POLICY "All users can view warehouses" ON public.warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage warehouses" ON public.warehouses FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- RLS Policies for locations
CREATE POLICY "All users can view locations" ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- RLS Policies for products
CREATE POLICY "All users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- RLS Policies for stock_levels
CREATE POLICY "All users can view stock levels" ON public.stock_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can update stock levels" ON public.stock_levels FOR ALL TO authenticated USING (true);

-- RLS Policies for receipts
CREATE POLICY "All users can view receipts" ON public.receipts FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can create receipts" ON public.receipts FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own draft receipts" ON public.receipts FOR UPDATE TO authenticated 
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete receipts" ON public.receipts FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for receipt_lines
CREATE POLICY "All users can view receipt lines" ON public.receipt_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can manage receipt lines" ON public.receipt_lines FOR ALL TO authenticated USING (true);

-- RLS Policies for deliveries
CREATE POLICY "All users can view deliveries" ON public.deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can create deliveries" ON public.deliveries FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update deliveries" ON public.deliveries FOR UPDATE TO authenticated 
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete deliveries" ON public.deliveries FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for delivery_lines
CREATE POLICY "All users can view delivery lines" ON public.delivery_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can manage delivery lines" ON public.delivery_lines FOR ALL TO authenticated USING (true);

-- RLS Policies for transfers
CREATE POLICY "All users can view transfers" ON public.transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can create transfers" ON public.transfers FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update transfers" ON public.transfers FOR UPDATE TO authenticated 
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete transfers" ON public.transfers FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for transfer_lines
CREATE POLICY "All users can view transfer lines" ON public.transfer_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can manage transfer lines" ON public.transfer_lines FOR ALL TO authenticated USING (true);

-- RLS Policies for adjustments
CREATE POLICY "All users can view adjustments" ON public.adjustments FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can create adjustments" ON public.adjustments FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update adjustments" ON public.adjustments FOR UPDATE TO authenticated 
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete adjustments" ON public.adjustments FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for adjustment_lines
CREATE POLICY "All users can view adjustment lines" ON public.adjustment_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "All users can manage adjustment lines" ON public.adjustment_lines FOR ALL TO authenticated USING (true);

-- RLS Policies for stock_ledger
CREATE POLICY "All users can view stock ledger" ON public.stock_ledger FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert stock ledger" ON public.stock_ledger FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON public.stock_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();