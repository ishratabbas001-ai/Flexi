import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Download, 
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentHistory {
  id: string;
  amount: number;
  payment_type: string;
  installment_number: number;
  due_date: string;
  paid_date?: string;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  student_name: string;
  bnpl_application_id: string;
}

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedPayments = data?.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        payment_type: payment.payment_type,
        installment_number: payment.installment_number,
        due_date: new Date(payment.due_date).toLocaleDateString(),
        paid_date: payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : undefined,
        status: payment.status,
        payment_method: payment.payment_method,
        transaction_id: payment.transaction_id,
        student_name: payment.student?.name || 'Unknown Student',
        bnpl_application_id: payment.bnpl_application_id
      })) || [];

      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error loading payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.payment_method?.toLowerCase().includes(methodFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

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

  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return <DollarSign className="w-4 h-4" />;
    
    if (method.toLowerCase().includes('card') || method.toLowerCase().includes('credit') || method.toLowerCase().includes('debit')) {
      return <CreditCard className="w-4 h-4" />;
    }
    if (method.toLowerCase().includes('bank')) {
      return <Banknote className="w-4 h-4" />;
    }
    if (method.toLowerCase().includes('easypaisa') || method.toLowerCase().includes('jazzcash')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <DollarSign className="w-4 h-4" />;
  };

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Student', 'Payment Type', 'Amount', 'Status', 'Method', 'Transaction ID'].join(','),
      ...filteredPayments.map(payment => [
        payment.paid_date || payment.due_date,
        payment.student_name,
        getPaymentTypeLabel(payment.payment_type, payment.installment_number),
        payment.amount,
        payment.status,
        payment.payment_method || 'N/A',
        payment.transaction_id || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Payment history exported successfully!');
  };

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'paid').length,
    pending: payments.filter(p => p.status === 'pending').length,
    totalAmount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground">
            Complete record of all your BNPL payments
          </p>
        </div>
        <Button onClick={exportHistory}>
          <Download className="mr-2 h-4 w-4" />
          Export History
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨ {stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, transaction ID or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Payment Records
          </CardTitle>
          <CardDescription>
            Detailed history of all your payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' 
                  ? 'No payments found matching filter criteria' 
                  : 'No payment history available'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-lg">
                      {getPaymentMethodIcon(payment.payment_method)}
                    </div>
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
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due: {payment.due_date}
                        </span>
                        {payment.paid_date && (
                          <span className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid: {payment.paid_date}
                          </span>
                        )}
                      </div>
                      {payment.payment_method && (
                        <p className="text-xs text-muted-foreground">
                          Method: {payment.payment_method}
                        </p>
                      )}
                      {payment.transaction_id && (
                        <p className="text-xs text-muted-foreground">
                          Transaction ID: {payment.transaction_id}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold">₨ {payment.amount.toLocaleString()}</p>
                    {payment.status === 'paid' && (
                      <Button variant="outline" size="sm" className="mt-2">
                        <Download className="w-3 h-3 mr-1" />
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;