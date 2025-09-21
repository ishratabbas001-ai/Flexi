import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  School, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Schools',
      value: '24',
      change: '+2 this month',
      icon: School,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active BNPL Students',
      value: '1,247',
      change: '+15% from last month',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Collections',
      value: '₨ 2,45,000',
      change: '+8% from last month',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pending Applications',
      value: '18',
      change: '5 new today',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const recentApplications = [
    { id: 1, school: 'Green Valley School', student: 'Ahmad Ali', amount: '₨ 25,000', status: 'approved' },
    { id: 2, school: 'City Public School', student: 'Sara Khan', amount: '₨ 18,000', status: 'approved' },
    { id: 3, school: 'Sunrise Academy', student: 'Hassan Ahmed', amount: '₨ 22,000', status: 'pending' },
    { id: 4, school: 'Elite School', student: 'Fatima Sheikh', amount: '₨ 30,000', status: 'rejected' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage schools, users, and BNPL applications
          </p>
        </div>
        <Button onClick={() => navigate('/reports')}>
          <TrendingUp className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-md transition-shadow ${
              stat.title === 'Total Schools' ? 'bg-[#dcebfe66]' :
              stat.title === 'Active BNPL Students' ? 'bg-[#defce966]' :
              stat.title === 'Total Collections' ? 'bg-[#f2e5ff66]' :
              stat.title === 'Pending Applications' ? 'bg-[#ffedd666]' : ''
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent BNPL Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Recent BNPL Applications
            </CardTitle>
            <CardDescription>
              Latest applications requiring approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{app.student}</p>
                    <p className="text-sm text-muted-foreground">{app.school}</p>
                    <p className="text-sm font-medium">{app.amount}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(app.status)}
                    {app.status === 'pending' && (
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>BNPL Configuration</CardTitle>
            <CardDescription>
              Current system settings and rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Default Down Payment</p>
                <p className="text-sm text-muted-foreground">Minimum required payment</p>
              </div>
              <Badge variant="secondary">25%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Maximum Installments</p>
                <p className="text-sm text-muted-foreground">Per BNPL plan</p>
              </div>
              <Badge variant="secondary">12 months</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Active Schools</p>
                <p className="text-sm text-muted-foreground">Registered institutions</p>
              </div>
              <Badge variant="secondary">24</Badge>
            </div>
            
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configure Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;