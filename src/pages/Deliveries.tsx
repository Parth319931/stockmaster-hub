import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Deliveries = () => {
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
          <CardTitle>Delivery List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Delivery management interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deliveries;
