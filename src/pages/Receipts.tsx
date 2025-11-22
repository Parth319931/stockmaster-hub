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

interface Receipt {
  id: string;
  receipt_number: string;
  supplier_name: string;
  status: string;
  created_at: string;
  warehouse_id: string;
  warehouses?: { name: string };
}

const Receipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { search, setSearch, filters, updateFilter, clearFilters } = useFilters({
    initialFilters: { status: null, warehouse: null },
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchReceipts();
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

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('receipts')
        .select('*, warehouses(name)')
        .order('created_at', { ascending: false });

      if (search.trim()) {
        query = query.or(
          `receipt_number.ilike.%${search.trim()}%,supplier_name.ilike.%${search.trim()}%`
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
      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
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
        <p className="text-muted-foreground">Loading receipts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Receipts</h2>
          <p className="text-muted-foreground">
            Manage incoming stock from suppliers
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Receipt
        </Button>
      </div>

      <Card>
        <CardHeader>
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by receipt number or supplier..."
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
                <TableHead>Receipt #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No receipts found
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">
                      {receipt.receipt_number}
                    </TableCell>
                    <TableCell>{receipt.supplier_name}</TableCell>
                    <TableCell>{receipt.warehouses?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(receipt.status)}>
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(receipt.created_at), 'MMM dd, yyyy')}
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

export default Receipts;
