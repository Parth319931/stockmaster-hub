import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Transfers = () => {
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
          <CardTitle>Transfer List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Transfer management interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transfers;
