import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Warehouses = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Warehouses</h2>
          <p className="text-muted-foreground">
            Manage warehouses and storage locations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Warehouse management interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Warehouses;
