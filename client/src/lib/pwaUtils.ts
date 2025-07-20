/**
 * PWA Utilities for Siraha Bazaar
 * Handles service worker registration, install prompts, and offline functionality
 */

import { useState, useEffect } from 'react';

// PWA Install Prompt Interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstallable = false;
  private isInstalled = false;
  private installPromptCallback: ((canInstall: boolean) => void) | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Check if app is already installed
    this.checkInstallStatus();
    
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.isInstallable = true;
      this.notifyInstallPromptCallback();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.isInstallable = false;
      this.deferredPrompt = null;
      this.notifyInstallPromptCallback();
    });

    // Register service worker
    this.registerServiceWorker();
  }

  private checkInstallStatus() {
    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
    
    // Check if running in PWA mode on iOS
    if ((window.navigator as any).standalone) {
      this.isInstalled = true;
    }
  }

  private notifyInstallPromptCallback() {
    if (this.installPromptCallback) {
      this.installPromptCallback(this.isInstallable);
    }
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                this.showUpdateNotification();
              }
            });
          }
        });

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  private showUpdateNotification() {
    // Create a custom event for app update
    const updateEvent = new CustomEvent('pwa-update-available', {
      detail: { message: 'A new version of Siraha Bazaar is available!' }
    });
    window.dispatchEvent(updateEvent);
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.isInstallable = false;
        this.deferredPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  onInstallPromptChange(callback: (canInstall: boolean) => void) {
    this.installPromptCallback = callback;
    // Call immediately with current state
    callback(this.isInstallable);
  }

  get canInstall(): boolean {
    return this.isInstallable && !this.isInstalled;
  }

  get isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Cache management utilities
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  async getCacheSize(): Promise<number> {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }

  // Network status detection
  isOnline(): boolean {
    return navigator.onLine;
  }

  onNetworkChange(callback: (isOnline: boolean) => void) {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// Utility functions for React components
export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  
  useEffect(() => {
    pwaManager.onInstallPromptChange(setCanInstall);
  }, []);
  
  const showInstallPrompt = async () => {
    return await pwaManager.showInstallPrompt();
  };
  
  return { canInstall, showInstallPrompt, isInstalled: pwaManager.isAppInstalled };
};

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const cleanup = pwaManager.onNetworkChange(setIsOnline);
    return cleanup;
  }, []);
  
  return isOnline;
};

// Export for global use
export default pwaManager;