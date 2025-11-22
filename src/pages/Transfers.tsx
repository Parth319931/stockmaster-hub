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

interface Transfer {
  id: string;
  transfer_number: string;
  status: string;
  created_at: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  from_warehouse?: { name: string };
  to_warehouse?: { name: string };
}

const Transfers = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { search, setSearch, filters, updateFilter, clearFilters } = useFilters({
    initialFilters: { status: null, warehouse: null },
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchTransfers();
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

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('transfers')
        .select(`
          *,
          from_warehouse:warehouses!from_warehouse_id(name),
          to_warehouse:warehouses!to_warehouse_id(name)
        `)
        .order('created_at', { ascending: false });

      if (search.trim()) {
        query = query.ilike('transfer_number', `%${search.trim()}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status as any);
      }

      if (filters.warehouse) {
        query = query.or(
          `from_warehouse_id.eq.${filters.warehouse},to_warehouse_id.eq.${filters.warehouse}`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
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
        <p className="text-muted-foreground">Loading transfers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Internal Transfers</h2>
          <p className="text-muted-foreground">
            Move stock between warehouses and locations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by transfer number..."
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
                <TableHead>Transfer #</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No transfers found
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">
                      {transfer.transfer_number}
                    </TableCell>
                    <TableCell>{transfer.from_warehouse?.name || '-'}</TableCell>
                    <TableCell>{transfer.to_warehouse?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(transfer.status)}>
                        {transfer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(transfer.created_at), 'MMM dd, yyyy')}
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

export default Transfers;
