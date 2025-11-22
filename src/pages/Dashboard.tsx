import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface KPIData {
  totalProducts: number;
  lowStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  pendingTransfers: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [kpiData, setKpiData] = useState<KPIData>({
    totalProducts: 0,
    lowStockItems: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    pendingTransfers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      // Get total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get low stock items
      const { data: products } = await supabase
        .from('products')
        .select('id, reorder_level');

      let lowStockCount = 0;
      if (products) {
        for (const product of products) {
          const { data: stockLevels } = await supabase
            .from('stock_levels')
            .select('quantity')
            .eq('product_id', product.id);

          const totalQuantity = stockLevels?.reduce((sum, level) => sum + level.quantity, 0) || 0;
          if (totalQuantity <= product.reorder_level) {
            lowStockCount++;
          }
        }
      }

      // Get pending receipts
      const { count: pendingReceiptsCount } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .in('status', ['draft', 'waiting', 'ready']);

      // Get pending deliveries
      const { count: pendingDeliveriesCount } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .in('status', ['draft', 'waiting', 'ready']);

      // Get pending transfers
      const { count: pendingTransfersCount } = await supabase
        .from('transfers')
        .select('*', { count: 'exact', head: true })
        .in('status', ['draft', 'waiting', 'ready']);

      setKpiData({
        totalProducts: productsCount || 0,
        lowStockItems: lowStockCount,
        pendingReceipts: pendingReceiptsCount || 0,
        pendingDeliveries: pendingDeliveriesCount || 0,
        pendingTransfers: pendingTransfersCount || 0,
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Products',
      value: kpiData.totalProducts,
      icon: Package,
      color: 'text-primary',
    },
    {
      title: 'Low Stock Items',
      value: kpiData.lowStockItems,
      icon: AlertTriangle,
      color: 'text-warning',
    },
    {
      title: 'Pending Receipts',
      value: kpiData.pendingReceipts,
      icon: ArrowDownToLine,
      color: 'text-success',
    },
    {
      title: 'Pending Deliveries',
      value: kpiData.pendingDeliveries,
      icon: ArrowUpFromLine,
      color: 'text-destructive',
    },
    {
      title: 'Pending Transfers',
      value: kpiData.pendingTransfers,
      icon: ArrowLeftRight,
      color: 'text-accent',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your inventory.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the sidebar navigation to manage products, create receipts, deliveries, transfers, and adjustments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
