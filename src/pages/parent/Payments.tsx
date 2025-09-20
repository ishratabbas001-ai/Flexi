import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CreditCard, 
  Banknote, 
  Smartphone,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingPayment {
  id: string;
  amount: number;
  payment_type: string;
  installment_number: number;
  due_date: string;
  status: string;
  student_name: string;
  bnpl_application_id: string;
}

interface PaymentFormData {
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  cardholder_name: string;
  payment_method: string;
  bank_name?: string;
  account_number?: string;
  mobile_number?: string;
}

const Payments = () => {
  const { user } = useAuth();
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    cardholder_name: '',
    payment_method: 'card',
    bank_name: '',
    account_number: '',
    mobile_number: ''
  });

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          student:students(name),
          bnpl_application:bnpl_applications(*)
        `)
        .eq('parent_id', user.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (error) throw error;

      const transformedPayments = data?.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        payment_type: payment.payment_type,
        installment_number: payment.installment_number,
        due_date: new Date(payment.due_date).toLocaleDateString(),
        status: payment.status,
        student_name: payment.student?.name || 'Unknown Student',
        bnpl_application_id: payment.bnpl_application_id
      })) || [];

      setPendingPayments(transformedPayments);
    } catch (error) {
      console.error('Error loading pending payments:', error);
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPayment) return;

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update payment status
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
          payment_method: formData.payment_method === 'card' ? 'Credit/Debit Card' : 
                         formData.payment_method === 'bank' ? 'Bank Transfer' :
                         formData.payment_method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash',
          transaction_id: `TXN${Date.now()}`
        })
        .eq('id', selectedPayment.id);

      if (error) throw error;

      toast.success('Payment processed successfully!');
      setPaymentDialogOpen(false);
      setSelectedPayment(null);
      resetForm();
      loadPendingPayments();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      card_number: '',
      expiry_month: '',
      expiry_year: '',
      cvv: '',
      cardholder_name: '',
      payment_method: 'card',
      bank_name: '',
      account_number: '',
      mobile_number: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, card_number: formatted }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentTypeLabel = (type: string, installmentNumber: number) => {
    return type === 'down_payment' ? 'Down Payment' : `Installment ${installmentNumber}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          Manage your BNPL payments with flexible payment options
        </p>
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Pending Payments
          </CardTitle>
          <CardDescription>
            Your upcoming and overdue payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <p className="text-muted-foreground">No pending payments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        {getPaymentTypeLabel(payment.payment_type, payment.installment_number)}
                      </p>
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Student: {payment.student_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {payment.due_date}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold">₨ {payment.amount.toLocaleString()}</p>
                    <Dialog open={paymentDialogOpen && selectedPayment?.id === payment.id} onOpenChange={(open) => {
                      setPaymentDialogOpen(open);
                      if (!open) {
                        setSelectedPayment(null);
                        resetForm();
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedPayment(payment)}
                          className="w-full"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Make Payment</DialogTitle>
                          <DialogDescription>
                            Pay ₨ {payment.amount.toLocaleString()} for {getPaymentTypeLabel(payment.payment_type, payment.installment_number)}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handlePaymentSubmit} className="space-y-6">
                          <Tabs value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="card">Automatic Payment</TabsTrigger>
                              <TabsTrigger value="manual">Manual Payment</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="card" className="space-y-4">
                              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <CreditCard className="w-5 h-5 text-blue-600" />
                                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Credit/Debit Card Payment</h4>
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  Secure payment via GoPayFast gateway
                                </p>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="cardholder_name">Cardholder Name</Label>
                                  <Input
                                    id="cardholder_name"
                                    name="cardholder_name"
                                    value={formData.cardholder_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter cardholder name"
                                    required
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="card_number">Card Number</Label>
                                  <div className="relative">
                                    <Input
                                      id="card_number"
                                      name="card_number"
                                      value={formData.card_number}
                                      onChange={handleCardNumberChange}
                                      placeholder="1234 5678 9012 3456"
                                      maxLength={19}
                                      required
                                    />
                                    <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="expiry_month">Month</Label>
                                    <Select value={formData.expiry_month} onValueChange={(value) => setFormData(prev => ({ ...prev, expiry_month: value }))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="MM" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (
                                          <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                            {String(i + 1).padStart(2, '0')}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="expiry_year">Year</Label>
                                    <Select value={formData.expiry_year} onValueChange={(value) => setFormData(prev => ({ ...prev, expiry_year: value }))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="YY" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Array.from({ length: 10 }, (_, i) => (
                                          <SelectItem key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                                            {String(new Date().getFullYear() + i).slice(-2)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <div className="relative">
                                      <Input
                                        id="cvv"
                                        name="cvv"
                                        type={showCardDetails ? 'text' : 'password'}
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        maxLength={4}
                                        required
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                        onClick={() => setShowCardDetails(!showCardDetails)}
                                      >
                                        {showCardDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="manual" className="space-y-4">
                              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Banknote className="w-5 h-5 text-green-600" />
                                  <h4 className="font-semibold text-green-800 dark:text-green-200">Manual Payment Options</h4>
                                </div>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                  Choose your preferred manual payment method
                                </p>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Payment Method</Label>
                                  <div className="grid grid-cols-1 gap-3">
                                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                      <input
                                        type="radio"
                                        name="manual_method"
                                        value="bank"
                                        checked={formData.payment_method === 'bank'}
                                        onChange={() => setFormData(prev => ({ ...prev, payment_method: 'bank' }))}
                                      />
                                      <Banknote className="w-5 h-5 text-blue-600" />
                                      <div>
                                        <p className="font-medium">Bank Transfer</p>
                                        <p className="text-sm text-muted-foreground">Direct bank account transfer</p>
                                      </div>
                                    </label>
                                    
                                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                      <input
                                        type="radio"
                                        name="manual_method"
                                        value="easypaisa"
                                        checked={formData.payment_method === 'easypaisa'}
                                        onChange={() => setFormData(prev => ({ ...prev, payment_method: 'easypaisa' }))}
                                      />
                                      <Smartphone className="w-5 h-5 text-green-600" />
                                      <div>
                                        <p className="font-medium">EasyPaisa</p>
                                        <p className="text-sm text-muted-foreground">Mobile wallet payment</p>
                                      </div>
                                    </label>
                                    
                                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                                      <input
                                        type="radio"
                                        name="manual_method"
                                        value="jazzcash"
                                        checked={formData.payment_method === 'jazzcash'}
                                        onChange={() => setFormData(prev => ({ ...prev, payment_method: 'jazzcash' }))}
                                      />
                                      <Smartphone className="w-5 h-5 text-purple-600" />
                                      <div>
                                        <p className="font-medium">JazzCash</p>
                                        <p className="text-sm text-muted-foreground">Mobile wallet payment</p>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                                
                                {formData.payment_method === 'bank' && (
                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="bank_name">Bank Name</Label>
                                      <Input
                                        id="bank_name"
                                        name="bank_name"
                                        value={formData.bank_name}
                                        onChange={handleInputChange}
                                        placeholder="Enter bank name"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="account_number">Account Number</Label>
                                      <Input
                                        id="account_number"
                                        name="account_number"
                                        value={formData.account_number}
                                        onChange={handleInputChange}
                                        placeholder="Enter account number"
                                        required
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {(formData.payment_method === 'easypaisa' || formData.payment_method === 'jazzcash') && (
                                  <div className="space-y-2">
                                    <Label htmlFor="mobile_number">Mobile Number</Label>
                                    <Input
                                      id="mobile_number"
                                      name="mobile_number"
                                      value={formData.mobile_number}
                                      onChange={handleInputChange}
                                      placeholder="+92-300-1234567"
                                      required
                                    />
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                          
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setPaymentDialogOpen(false)}
                              disabled={processing}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                              {processing ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Pay ₨ {selectedPayment?.amount.toLocaleString()}
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Automatic Payment
            </CardTitle>
            <CardDescription>
              Quick and secure card payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Instant payment processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Secure GoPayFast gateway</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Supports all major cards</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Automatic receipt generation</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Banknote className="mr-2 h-5 w-5" />
              Manual Payment
            </CardTitle>
            <CardDescription>
              Traditional payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Bank Transfer</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">EasyPaisa wallet</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">JazzCash wallet</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">Manual verification required</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;