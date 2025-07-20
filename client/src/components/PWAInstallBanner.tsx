import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWAInstall } from '@/lib/pwaUtils';

const PWAInstallBanner = () => {
  const { canInstall, showInstallPrompt, isInstalled } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    setDismissed(isDismissed);
    
    // Show banner if app can be installed and hasn't been dismissed
    if (canInstall && !isInstalled && !isDismissed) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const getDeviceIcon = () => {
    const userAgent = navigator.userAgent;
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return <Smartphone className="w-6 h-6" />;
    }
    return <Monitor className="w-6 h-6" />;
  };

  if (!isVisible || dismissed || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
              {getDeviceIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-1">
                Install Siraha Bazaar
              </h3>
              <p className="text-xs text-white/90 mb-3">
                Get faster access and offline shopping with our app
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-white/90 flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Install</span>
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  Later
                </Button>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallBanner;