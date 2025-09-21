import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { 
  GraduationCap, 
  CreditCard, 
  Shield, 
  Users, 
  BarChart3, 
  Mail,
  CheckCircle,
  ArrowRight,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { canInstall, installApp, isInstalled, isStandalone, getInstallInstructions } = usePWA();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  const handleInstallApp = async () => {
    // Check if already installed
    if (isStandalone) {
      toast.info("App is already installed on this device");
      return;
    }

    // Try PWA installation first
    if (canInstall) {
      console.log('Attempting PWA installation...');
      const success = await installApp();
      if (success) {
        toast.success('App installed successfully!');
        return;
      } else {
        console.log('PWA installation failed, showing manual instructions');
      }
    }
    
    // Fallback: Show manual installation instructions
    const instructions = getInstallInstructions();
    toast.info(`To install: ${instructions}`, {
      duration: 8000,
    });
  };

  const features = [
    {
      icon: CreditCard,
      title: 'Flexible Payment Plans',
      description: 'Allow parents to pay school fees in convenient installments with just 25% down payment.',
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Integrated with multi payment methods for secure and reliable payment processing.',
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Separate dashboards for admins, schools, and parents with role-based permissions.',
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Reports',
      description: 'Detailed analytics and reporting with visual charts for better insights.',
    },
    {
      icon: Mail,
      title: 'Smart Notifications',
      description: 'Automated email reminders and confirmations via Flexifee SMTP system.',
    },
    {
      icon: GraduationCap,
      title: 'Student Management',
      description: 'Complete student enrollment and fee management system.',
    },
  ];

  const benefits = [
    'Reduce payment defaults with automatic reminders',
    'Improve cash flow with structured payment plans',
    'Increase enrollment by making fees more affordable',
    'Real-time tracking and reporting',
    'Mobile-friendly PWA application',
    'Seamless integration with existing systems',
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl sm:text-2xl font-bold">FlexiFee</span>
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')} size="sm" className="sm:size-default">
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            Financing Your Education
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Make Education More Accessible
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
            Flexible payment solutions for schools and parents.
Empowering education with smarter, simpler payment solutions — making learning accessible for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8" onClick={() => navigate('/register')}>
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Everything you need to efficiently manage school payments
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 bg-muted/50">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              FlexiFee kyun choose karein?
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg">{benefit}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-8" onClick={() => navigate('/register')}>
              Get Started Today
            </Button>
          </div>
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Collection</span>
                  <Badge variant="secondary">+15%</Badge>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full w-3/4"></div>
                </div>
                <div className="text-2xl font-bold">₨ 2,45,000</div>
                <div className="text-sm text-green-600">↑ 15% from last month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 px-4">
            Are you ready to transform your school’s payment system?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 px-4">
            Hundreds of schools are already using FlexiFee to improve fee collection and make education accessible for everyone.
          </p>
          <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8" onClick={() => navigate('/register')}>
            Get Started Now!
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-base sm:text-lg font-semibold">FlexiFee</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {!isStandalone && (
                <Button 
                  onClick={handleInstallApp}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 w-full sm:w-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>{canInstall ? '📥 Install App' : '📥 Get App'}</span>
                </Button>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                © 2025 FlexiFee. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;