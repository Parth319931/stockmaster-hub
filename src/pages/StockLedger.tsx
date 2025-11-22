import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StockLedger = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Stock Ledger</h2>
        <p className="text-muted-foreground">
          Complete audit trail of all stock movements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Stock ledger interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockLedger;
