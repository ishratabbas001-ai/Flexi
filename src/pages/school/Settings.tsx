import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw,
  School,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  CreditCard,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const SchoolSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // School Information
    schoolName: 'Green Valley School',
    principalName: 'Dr. Ahmad Hassan',
    email: 'school@greenvalley.edu',
    phone: '+92-300-1234567',
    address: '123 Education Street, Lahore, Pakistan',
    website: 'www.greenvalley.edu',
    
    // BNPL Settings
    enableBNPL: true,
    defaultDownPayment: 25,
    maxInstallments: 12,
    autoApproveLimit: 50000,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: true,
    reminderDays: 3,
    
    // Security Settings
    requireParentVerification: true,
    allowOnlinePayments: true,
    twoFactorAuth: false,
    
    // Academic Settings
    academicYear: '2024-2025',
    feeStructure: 'semester',
    lateFeePercentage: 5,
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings to localStorage for demo
      localStorage.setItem('school_settings', JSON.stringify(settings));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      schoolName: 'Green Valley School',
      principalName: 'Dr. Ahmad Hassan',
      email: 'school@greenvalley.edu',
      phone: '+92-300-1234567',
      address: '123 Education Street, Lahore, Pakistan',
      website: 'www.greenvalley.edu',
      enableBNPL: true,
      defaultDownPayment: 25,
      maxInstallments: 12,
      autoApproveLimit: 50000,
      emailNotifications: true,
      smsNotifications: false,
      paymentReminders: true,
      reminderDays: 3,
      requireParentVerification: true,
      allowOnlinePayments: true,
      twoFactorAuth: false,
      academicYear: '2024-2025',
      feeStructure: 'semester',
      lateFeePercentage: 5,
    });
    toast.success('Settings reset to defaults');
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Settings</h1>
          <p className="text-muted-foreground">
            Configure your school preferences and BNPL settings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* School Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <School className="mr-2 h-5 w-5" />
              School Information
            </CardTitle>
            <CardDescription>
              Basic information about your school
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={settings.schoolName}
                  onChange={(e) => updateSetting('schoolName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="principalName">Principal Name</Label>
                <Input
                  id="principalName"
                  value={settings.principalName}
                  onChange={(e) => updateSetting('principalName', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => updateSetting('phone', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.website}
                  onChange={(e) => updateSetting('website', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={settings.academicYear}
                  onChange={(e) => updateSetting('academicYear', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => updateSetting('address', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* BNPL Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              BNPL Configuration
            </CardTitle>
            <CardDescription>
              Configure Buy Now Pay Later settings for your school
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable BNPL</Label>
                <p className="text-sm text-muted-foreground">
                  Allow parents to apply for Buy Now Pay Later plans
                </p>
              </div>
              <Switch
                checked={settings.enableBNPL}
                onCheckedChange={(checked) => updateSetting('enableBNPL', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="downPayment">Default Down Payment (%)</Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={settings.defaultDownPayment}
                  onChange={(e) => updateSetting('defaultDownPayment', parseInt(e.target.value))}
                  min="10"
                  max="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxInstallments">Maximum Installments</Label>
                <Input
                  id="maxInstallments"
                  type="number"
                  value={settings.maxInstallments}
                  onChange={(e) => updateSetting('maxInstallments', parseInt(e.target.value))}
                  min="3"
                  max="24"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="autoApproveLimit">Auto-approve Limit (₨)</Label>
              <Input
                id="autoApproveLimit"
                type="number"
                value={settings.autoApproveLimit}
                onChange={(e) => updateSetting('autoApproveLimit', parseInt(e.target.value))}
                min="0"
              />
              <p className="text-sm text-muted-foreground">
                Applications below this amount will be auto-approved
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send automatic payment reminders to parents
                </p>
              </div>
              <Switch
                checked={settings.paymentReminders}
                onCheckedChange={(checked) => updateSetting('paymentReminders', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminderDays">Reminder Days Before Due Date</Label>
              <Input
                id="reminderDays"
                type="number"
                value={settings.reminderDays}
                onChange={(e) => updateSetting('reminderDays', parseInt(e.target.value))}
                min="1"
                max="30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security and verification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Parent Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require document verification for BNPL applications
                </p>
              </div>
              <Switch
                checked={settings.requireParentVerification}
                onCheckedChange={(checked) => updateSetting('requireParentVerification', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Online Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Enable online payment processing
                </p>
              </div>
              <Switch
                checked={settings.allowOnlinePayments}
                onCheckedChange={(checked) => updateSetting('allowOnlinePayments', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Enable 2FA for enhanced security
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                />
                {settings.twoFactorAuth && (
                  <Badge variant="secondary">Enabled</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Fee Structure
            </CardTitle>
            <CardDescription>
              Configure fee collection and late payment settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feeStructure">Fee Structure</Label>
                <select
                  id="feeStructure"
                  value={settings.feeStructure}
                  onChange={(e) => updateSetting('feeStructure', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="annual">Annual</option>
                  <option value="semester">Semester</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateFee">Late Fee Percentage (%)</Label>
                <Input
                  id="lateFee"
                  type="number"
                  value={settings.lateFeePercentage}
                  onChange={(e) => updateSetting('lateFeePercentage', parseInt(e.target.value))}
                  min="0"
                  max="25"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolSettings;