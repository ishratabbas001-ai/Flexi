import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

interface InstallPromptProps {
  onClose?: () => void;
  variant?: 'card' | 'banner' | 'button';
  className?: string;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ 
  onClose, 
  variant = 'card',
  className = '' 
}) => {
  const { canInstall, installApp, isStandalone, getInstallInstructions } = usePWA();

  const handleInstall = async () => {
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
        onClose?.();
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

  // Don't show if already installed or not installable
  // Show button even if not installable for manual instructions
  if (isStandalone) {
    return null; // Don't show if already installed
  }

  if (variant === 'button') {
    return (
      <Button 
        onClick={handleInstall}
        className={`flex items-center space-x-2 bg-white hover:bg-gray-50 border-2 border-gray-200 shadow-sm w-full sm:w-auto ${className}`}
        variant="outline"
        size="sm"
      >
        <img 
          src="" 
          alt="" 
          className="h-6 sm:h-8 w-auto"
        />
        <span className="font-medium text-gray-800 text-sm sm:text-base">Download App</span>
      </Button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-primary text-primary-foreground p-4 ${className}`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Download className="w-5 h-5" />
            <div>
              <p className="font-medium">Install FlexiFee App</p>
              <p className="text-sm opacity-90">Get the full app experience</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleInstall}
            >
              Install
            </Button>
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Install FlexiFee App</span>
        </CardTitle>
        <CardDescription>
          Get the full app experience with offline access and native features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Mobile friendly</span>
          </div>
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Desktop support</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            {canInstall ? 'Install App' : 'Get App'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallPrompt;