import { useState, useEffect } from 'react';
import { Download, Trash2, RefreshCw, Smartphone, Monitor, Wifi, WifiOff, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePWAInstall, useNetworkStatus, pwaManager } from '@/lib/pwaUtils';

const PWASettings = () => {
  const { canInstall, showInstallPrompt, isInstalled } = usePWAInstall();
  const isOnline = useNetworkStatus();
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isClearing, setIsClearing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Get cache size
    pwaManager.getCacheSize().then(setCacheSize);
    
    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleInstallApp = async () => {
    await showInstallPrompt();
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await pwaManager.clearCache();
      setCacheSize(0);
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const formatCacheSize = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PWA Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your Progressive Web App preferences and settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Installation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getDeviceType() === 'mobile' ? (
                  <Smartphone className="w-5 h-5" />
                ) : (
                  <Monitor className="w-5 h-5" />
                )}
                <span>Installation Status</span>
              </CardTitle>
              <CardDescription>
                Install Siraha Bazaar as an app on your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isInstalled ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      App Installed
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      You're using the installed app
                    </span>
                  </div>
                ) : canInstall ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Install Siraha Bazaar for a better experience
                    </p>
                    <Button onClick={handleInstallApp} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Your browser doesn't support PWA installation or the app is already installed.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Network Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-orange-600" />
                )}
                <span>Network Status</span>
              </CardTitle>
              <CardDescription>
                Your current connection status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Connection
                  </span>
                  <Badge variant={isOnline ? "default" : "secondary"}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                {!isOnline && (
                  <Alert>
                    <AlertDescription>
                      You're offline. Some features may not work properly.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cache Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Cache Management</span>
              </CardTitle>
              <CardDescription>
                Manage app cache and storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Cache Size
                  </span>
                  <Badge variant="outline">
                    {formatCacheSize(cacheSize)}
                  </Badge>
                </div>
                <Button
                  onClick={handleClearCache}
                  variant="outline"
                  className="w-full"
                  disabled={isClearing}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isClearing ? 'Clearing...' : 'Clear Cache'}
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This will remove all cached data and reload the app
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Manage push notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationToggle}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get notified about order updates, delivery status, and special offers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PWA Features */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>PWA Features</CardTitle>
            <CardDescription>
              Features available in this Progressive Web App
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">✅ Available Features</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Offline browsing</li>
                  <li>• Push notifications</li>
                  <li>• App-like experience</li>
                  <li>• Fast loading</li>
                  <li>• Background sync</li>
                  <li>• Home screen installation</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">🚀 Enhanced Features</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Smart caching</li>
                  <li>• Automatic updates</li>
                  <li>• Cross-platform compatibility</li>
                  <li>• Responsive design</li>
                  <li>• Secure HTTPS</li>
                  <li>• App shortcuts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PWASettings;