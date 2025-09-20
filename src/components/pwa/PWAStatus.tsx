import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Monitor, Wifi, WifiOff, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWAStatus: React.FC = () => {
  const { isInstalled, isStandalone, canInstall } = usePWA();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5" />
          <span>PWA Status</span>
        </CardTitle>
        <CardDescription>
          Progressive Web App information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Installation Status</span>
          <Badge variant={isInstalled ? "default" : "secondary"}>
            {isInstalled ? "Installed" : "Not Installed"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">App Mode</span>
          <Badge variant={isStandalone ? "default" : "secondary"}>
            {isStandalone ? "Standalone" : "Browser"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Connection</span>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>
        
        {canInstall && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Installable</span>
            <Badge variant="outline">
              <Download className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PWAStatus;