import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

const PaymentForm = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment</h1>
        <p className="text-muted-foreground">
           Secure payment via GoPayFast gateway
         <p className="text-muted-foreground">The payment form will be implemented here</p>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Form
          </CardTitle>
          <CardDescription>
            Secure payment via GoPayFast gateway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Payment form will be implemented here</p>
            <Button className="mt-4">Coming Soon</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentForm;