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
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  CreditCard,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ParentSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Personal Information
    fullName: 'Muhammad Ali Khan',
    email: 'parent@example.com',
    phone: '+92-310-1111111',
    cnic: '12345-6789012-3',
    address: '123 Parent Street, Lahore, Pakistan',
    occupation: 'Software Engineer',
    monthlyIncome: '150000',
    
    // Notification Preferences
    emailNotifications: true,
    smsNotifications: true,
    paymentReminders: true,
    applicationUpdates: true,
    reminderDays: 3,
    
    // Privacy Settings
    shareDataWithSchool: true,
    allowMarketingEmails: false,
    profileVisibility: 'private',
    
    // Payment Preferences
    preferredPaymentMethod: 'card',
    autoPayEnabled: false,
    savePaymentMethods: true,
    
    // Security Settings
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: 30,
  });

  const [loading, setLoading] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings to localStorage for demo
      localStorage.setItem('parent_settings', JSON.stringify(settings));
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
      fullName: 'Muhammad Ali Khan',
      email: 'parent@example.com',
      phone: '+92-310-1111111',
      cnic: '12345-6789012-3',
      address: '123 Parent Street, Lahore, Pakistan',
      occupation: 'Software Engineer',
      monthlyIncome: '150000',
      emailNotifications: true,
      smsNotifications: true,
      paymentReminders: true,
      applicationUpdates: true,
      reminderDays: 3,
      shareDataWithSchool: true,
      allowMarketingEmails: false,
      profileVisibility: 'private',
      preferredPaymentMethod: 'card',
      autoPayEnabled: false,
      savePaymentMethods: true,
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30,
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
          <h1 className="text-3xl font-bold">Parent Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and notification settings
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
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={settings.fullName}
                  onChange={(e) => updateSetting('fullName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting('email', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => updateSetting('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC Number</Label>
                <div className="relative">
                  <Input
                    id="cnic"
                    type={showSensitiveInfo ? 'text' : 'password'}
                    value={settings.cnic}
                    onChange={(e) => updateSetting('cnic', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                  >
                    {showSensitiveInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={settings.occupation}
                  onChange={(e) => updateSetting('occupation', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income (₨)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={settings.monthlyIncome}
                  onChange={(e) => updateSetting('monthlyIncome', e.target.value)}
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

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
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
                  Get reminders before payment due dates
                </p>
              </div>
              <Switch
                checked={settings.paymentReminders}
                onCheckedChange={(checked) => updateSetting('paymentReminders', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Application Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about BNPL application status changes
                </p>
              </div>
              <Switch
                checked={settings.applicationUpdates}
                onCheckedChange={(checked) => updateSetting('applicationUpdates', checked)}
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

        {/* Payment Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Preferences
            </CardTitle>
            <CardDescription>
              Configure your payment settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
              <select
                id="paymentMethod"
                value={settings.preferredPaymentMethod}
                onChange={(e) => updateSetting('preferredPaymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="jazzcash">JazzCash</option>
              </select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Pay</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically pay installments when due
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.autoPayEnabled}
                  onCheckedChange={(checked) => updateSetting('autoPayEnabled', checked)}
                />
                {settings.autoPayEnabled && (
                  <Badge variant="secondary">Enabled</Badge>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Save Payment Methods</Label>
                <p className="text-sm text-muted-foreground">
                  Securely save payment methods for faster checkout
                </p>
              </div>
              <Switch
                checked={settings.savePaymentMethods}
                onCheckedChange={(checked) => updateSetting('savePaymentMethods', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your privacy and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Share Data with School</Label>
                <p className="text-sm text-muted-foreground">
                  Allow schools to access your profile information
                </p>
              </div>
              <Switch
                checked={settings.shareDataWithSchool}
                onCheckedChange={(checked) => updateSetting('shareDataWithSchool', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional emails and offers
                </p>
              </div>
              <Switch
                checked={settings.allowMarketingEmails}
                onCheckedChange={(checked) => updateSetting('allowMarketingEmails', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                />
                {settings.twoFactorAuth && (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Login Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone logs into your account
                </p>
              </div>
              <Switch
                checked={settings.loginNotifications}
                onCheckedChange={(checked) => updateSetting('loginNotifications', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="120"
              />
              <p className="text-sm text-muted-foreground">
                Automatically log out after this period of inactivity
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentSettings;