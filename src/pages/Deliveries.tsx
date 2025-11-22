import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { FilterBar } from '@/components/filters/FilterBar';
import { useFilters } from '@/hooks/useFilters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Delivery {
  id: string;
  delivery_number: string;
  customer_name: string;
  status: string;
  created_at: string;
  warehouse_id: string;
  warehouses?: { name: string };
}

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { search, setSearch, filters, updateFilter, clearFilters } = useFilters({
    initialFilters: { status: null, warehouse: null },
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [search, filters]);

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('deliveries')
        .select('*, warehouses(name)')
        .order('created_at', { ascending: false });

      if (search.trim()) {
        query = query.or(
          `delivery_number.ilike.%${search.trim()}%,customer_name.ilike.%${search.trim()}%`
        );
      }

      if (filters.status) {
        query = query.eq('status', filters.status as any);
      }

      if (filters.warehouse) {
        query = query.eq('warehouse_id', filters.warehouse);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'waiting':
        return 'outline';
      case 'ready':
        return 'default';
      case 'done':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading deliveries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deliveries</h2>
          <p className="text-muted-foreground">
            Manage outgoing stock to customers
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Delivery
        </Button>
      </div>

      <Card>
        <CardHeader>
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by delivery number or customer..."
            filters={[
              {
                label: 'Status',
                value: filters.status,
                options: [
                  { label: 'Draft', value: 'draft' },
                  { label: 'Waiting', value: 'waiting' },
                  { label: 'Ready', value: 'ready' },
                  { label: 'Done', value: 'done' },
                  { label: 'Cancelled', value: 'cancelled' },
                ],
                onChange: (value) => updateFilter('status', value),
                placeholder: 'All Status',
              },
              {
                label: 'Warehouse',
                value: filters.warehouse,
                options: warehouses.map((w) => ({ label: w.name, value: w.id })),
                onChange: (value) => updateFilter('warehouse', value),
                placeholder: 'All Warehouses',
              },
            ]}
            onClearFilters={clearFilters}
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No deliveries found
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">
                      {delivery.delivery_number}
                    </TableCell>
                    <TableCell>{delivery.customer_name}</TableCell>
                    <TableCell>{delivery.warehouses?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(delivery.status)}>
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(delivery.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deliveries;
