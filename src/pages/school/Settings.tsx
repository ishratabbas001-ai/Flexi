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
    <div className="space-y-6 px-4 sm:px-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl font-bold">School Settings</h1>
          <p className="text-muted-foreground">
            Configure your school preferences and payment settings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:space-x-2">
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto whitespace-nowrap">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto whitespace-nowrap">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 w-full">
        {/* School Information */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <School className="mr-2 h-5 w-5" />
              School Information
            </CardTitle>
            <CardDescription>
              Basic information about your school
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 w-full">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 w-full">
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
              Configure settings for your school
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Enable Flexi Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow parents to apply for plans
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Switch
                  checked={settings.enableBNPL}
                  onCheckedChange={(checked) => updateSetting('enableBNPL', checked)}
                  className="h-1 w-15 data-[state=checked]:bg-[#074e8e] dark:data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                />
                <span className="text-xs font-medium text-[#0d1026] dark:text-muted-foreground">
                  {settings.enableBNPL ? 'Enabled' : 'Disabled'}
                </span>
              </div>
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
            <div className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  className="h-1 w-15 data-[state=checked]:bg-[#074e8e] dark:data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                />
                <span className="text-xs font-medium text-[#0d1026] dark:text-muted-foreground">
                  {settings.emailNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  className="h-1 w-15 data-[state=checked]:bg-[#074e8e] dark:data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                />
                <span className="text-xs font-medium text-[#0d1026] dark:text-muted-foreground">
                  {settings.smsNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send automatic payment reminders to parents
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Switch
                  checked={settings.paymentReminders}
                  onCheckedChange={(checked) => updateSetting('paymentReminders', checked)}
                  className="h-1 w-15 data-[state=checked]:bg-[#074e8e] dark:data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                />
                <span className="text-xs font-medium text-[#0d1026] dark:text-muted-foreground">
                  {settings.paymentReminders ? 'Enabled' : 'Disabled'}
                </span>
              </div>
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
            <div className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Require Parent Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require document verification for applications
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Switch
                  checked={settings.requireParentVerification}
                  onCheckedChange={(checked) => updateSetting('requireParentVerification', checked)}
                  className="h-1 w-15 data-[state=checked]:bg-[#074e8e] dark:data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                />
                <span className="text-xs font-medium text-[#0d1026] dark:text-muted-foreground">
                  {settings.requireParentVerification ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Allow Online Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Enable online payment processing
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Switch
                  checked={settings.allowOnlinePayments}
                  onCheckedChange={(checked) => updateSetting('allowOnlinePayments', checked)}
                  className="h-1 w-15 data-[state=checked]:bg-[#074e8e] dark:data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                />
                <span className="text-xs font-medium text-[#0d1026] dark:text-muted-foreground">
                  {settings.allowOnlinePayments ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Enable 2FA for enhanced security
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                  className="h-1 w-15 data-[state=checked]:bg-[#074e8e] dark:data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
                />
                <span className="text-xs font-medium text-[#0d1026] dark:text-muted-foreground">
                  {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                </span>
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