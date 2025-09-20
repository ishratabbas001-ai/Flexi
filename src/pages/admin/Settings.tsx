import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw,
  CreditCard,
  Mail,
  Shield,
  Bell,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [settings, setSettings] = useState({
    // BNPL Configuration
    defaultDownPayment: 25,
    maxInstallments: 12,
    interestRate: 0,
    processingFee: 500,
    
    // Email Configuration
    smtpHost: 'smtp.flexifee.com',
    smtpPort: 587,
    smtpUsername: 'noreply@flexifee.com',
    smtpPassword: '',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    reminderDays: 3,
    
    // Security Settings
    requireDocumentVerification: true,
    autoApproveApplications: false,
    maxApplicationAmount: 100000,
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings to localStorage for demo
      localStorage.setItem('admin_settings', JSON.stringify(settings));
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
      defaultDownPayment: 25,
      maxInstallments: 12,
      interestRate: 0,
      processingFee: 500,
      smtpHost: 'smtp.flexifee.com',
      smtpPort: 587,
      smtpUsername: 'noreply@flexifee.com',
      smtpPassword: '',
      emailNotifications: true,
      smsNotifications: false,
      reminderDays: 3,
      requireDocumentVerification: true,
      autoApproveApplications: false,
      maxApplicationAmount: 100000,
      maintenanceMode: false,
      debugMode: false,
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
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure BNPL system parameters and preferences
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
        {/* BNPL Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              BNPL Configuration
            </CardTitle>
            <CardDescription>
              Configure Buy Now Pay Later plan parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  value={settings.interestRate}
                  onChange={(e) => updateSetting('interestRate', parseFloat(e.target.value))}
                  min="0"
                  max="25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processingFee">Processing Fee (₨)</Label>
                <Input
                  id="processingFee"
                  type="number"
                  value={settings.processingFee}
                  onChange={(e) => updateSetting('processingFee', parseInt(e.target.value))}
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure SMTP settings for email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) => updateSetting('smtpHost', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpUsername">SMTP Username</Label>
                <Input
                  id="smtpUsername"
                  value={settings.smtpUsername}
                  onChange={(e) => updateSetting('smtpUsername', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                  placeholder="Enter SMTP password"
                />
              </div>
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
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for applications and payments
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
                  Send SMS notifications for payment reminders
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminderDays">Payment Reminder Days</Label>
              <Input
                id="reminderDays"
                type="number"
                value={settings.reminderDays}
                onChange={(e) => updateSetting('reminderDays', parseInt(e.target.value))}
                min="1"
                max="30"
              />
              <p className="text-sm text-muted-foreground">
                Send payment reminders this many days before due date
              </p>
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
              Configure security and approval settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Document Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Applications must have all documents verified before approval
                </p>
              </div>
              <Switch
                checked={settings.requireDocumentVerification}
                onCheckedChange={(checked) => updateSetting('requireDocumentVerification', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve Applications</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve applications that meet criteria
                </p>
              </div>
              <Switch
                checked={settings.autoApproveApplications}
                onCheckedChange={(checked) => updateSetting('autoApproveApplications', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Maximum Application Amount (₨)</Label>
              <Input
                id="maxAmount"
                type="number"
                value={settings.maxApplicationAmount}
                onChange={(e) => updateSetting('maxApplicationAmount', parseInt(e.target.value))}
                min="10000"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              System-wide configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the system in maintenance mode
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                />
                {settings.maintenanceMode && (
                  <Badge variant="destructive">Active</Badge>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Debug Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable debug logging and error details
                </p>
              </div>
              <Switch
                checked={settings.debugMode}
                onCheckedChange={(checked) => updateSetting('debugMode', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;