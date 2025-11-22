import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

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
      // Call efficient backend functions for KPIs
      const [
        { data: totalProducts, error: e1 },
        { data: lowStockItems, error: e2 },
        { data: pendingReceipts, error: e3 },
        { data: pendingDeliveries, error: e4 },
        { data: pendingTransfers, error: e5 }
      ] = await Promise.all([
        supabase.rpc('get_total_products_count'),
        supabase.rpc('get_low_stock_count'),
        supabase.rpc('get_pending_receipts_count'),
        supabase.rpc('get_pending_deliveries_count'),
        supabase.rpc('get_pending_transfers_count')
      ]);

      const errors = [e1, e2, e3, e4, e5].filter(Boolean);
      if (errors.length > 0) {
        throw new Error('Failed to fetch some KPI data');
      }

      setKpiData({
        totalProducts: totalProducts || 0,
        lowStockItems: lowStockItems || 0,
        pendingReceipts: pendingReceipts || 0,
        pendingDeliveries: pendingDeliveries || 0,
        pendingTransfers: pendingTransfers || 0,
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      toast.error('Failed to load dashboard data');
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
    return <LoadingPage message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your inventory.
          </p>
        </div>
      </div>

      <TooltipProvider>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Tooltip key={kpi.title}>
                <TooltipTrigger asChild>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 hover:scale-105" style={{ borderLeftColor: `hsl(var(--${kpi.color.replace('text-', '')}))` }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {kpi.title}
                      </CardTitle>
                      <div className={`p-2 rounded-full bg-${kpi.color.replace('text-', '')}/10`}>
                        <Icon className={`h-5 w-5 ${kpi.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{kpi.value}</div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View {kpi.title.toLowerCase()} details</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Use the sidebar navigation to manage products, create receipts, deliveries, transfers, and adjustments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
