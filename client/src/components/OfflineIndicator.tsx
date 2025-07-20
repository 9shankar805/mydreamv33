import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNetworkStatus } from '@/lib/pwaUtils';

const OfflineIndicator = () => {
  const isOnline = useNetworkStatus();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
      setShowOnlineAlert(false);
    } else {
      // Show "back online" message briefly if we were offline
      if (showOfflineAlert) {
        setShowOnlineAlert(true);
        setShowOfflineAlert(false);
        const timer = setTimeout(() => {
          setShowOnlineAlert(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, showOfflineAlert]);

  if (showOfflineAlert) {
    return (
      <div className="fixed top-16 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
          <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-300">
            You're offline. Some features may not work.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showOnlineAlert) {
    return (
      <div className="fixed top-16 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300">
            You're back online!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
};

export default OfflineIndicator;