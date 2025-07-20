import { Download, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePWAInstall, useNetworkStatus } from '@/lib/pwaUtils';

const PWAStatus = () => {
  const { canInstall, showInstallPrompt, isInstalled } = usePWAInstall();
  const isOnline = useNetworkStatus();

  const handleInstallClick = async () => {
    await showInstallPrompt();
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Network Status */}
      {isOnline ? (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <Wifi className="w-3 h-3 mr-1" />
          Online
        </Badge>
      ) : (
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          <WifiOff className="w-3 h-3 mr-1" />
          Offline
        </Badge>
      )}

      {/* Install Status */}
      {isInstalled && (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          App Installed
        </Badge>
      )}

      {/* Install Button */}
      {canInstall && !isInstalled && (
        <Button
          onClick={handleInstallClick}
          size="sm"
          variant="outline"
          className="hidden md:flex items-center space-x-1 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </Button>
      )}
    </div>
  );
};

export default PWAStatus;