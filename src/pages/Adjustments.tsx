import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Adjustments = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock Adjustments</h2>
          <p className="text-muted-foreground">
            Correct inventory discrepancies
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Adjustment management interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Adjustments;
