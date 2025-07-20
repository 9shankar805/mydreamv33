import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const AppUpdateNotification = () => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdateNotification(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = () => {
    // Reload the page to get the latest version
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdateNotification(false);
  };

  if (!showUpdateNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-800/50 rounded-full">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Update Available
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                A new version of Siraha Bazaar is ready to install
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Now
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-800/50"
                >
                  Later
                </Button>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-800/50 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppUpdateNotification;