class PWAManager {
    constructor() {
        this.init();
    }

    init() {
        // Only attempt service worker if supported and in production
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            window.addEventListener('load', () => {
                this.registerServiceWorker().catch(this.handleServiceWorkerError);
            });
        }
    }

    async registerServiceWorker() {
        try {
            // Unregister any existing service workers first
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }

            // Timeout for service worker registration
            const registrationPromise = navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            // Add a timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Service worker registration timed out')), 5000)
            );

            const registration = await Promise.race([registrationPromise, timeoutPromise]);
            
            console.log('ServiceWorker registration successful:', registration.scope);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.notifyUpdate();
                        }
                    });
                }
            });

            return registration;
        } catch (error) {
            this.handleServiceWorkerError(error);
        }
    }

    handleServiceWorkerError(error) {
        console.warn('ServiceWorker registration failed or skipped:', error);
        // Optionally, you can add more robust error handling here
        // For example, logging to a service or showing a user-friendly message
    }

    handleInstallation() {
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            // Store the event for later use
            window.deferredPrompt = event;
            this.showInstallButton();
        });
    }

    notifyUpdate() {
        console.log('A new service worker is available. Please refresh.');
        // Optionally show a toast or prompt to reload
    }

    showInstallButton() {
        // Implementation for showing install button
        console.log('PWA install prompt is ready');
    }

    cleanup() {
        // Remove any event listeners or perform cleanup
        console.log('PWA Manager cleanup');
    }

    // Method to check if the app is running in standalone mode (installed)
    isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }

    async installPWA() {
        const deferredPrompt = window.deferredPrompt;
        if (!deferredPrompt) {
            return;
        }

        try {
            const result = await deferredPrompt.prompt();
            console.log('Install prompt result:', result);
            window.deferredPrompt = null;
            
            const installButton = document.getElementById('pwa-install-btn');
            if (installButton) {
                installButton.style.display = 'none';
            }
        } catch (error) {
            console.error('Error installing PWA:', error);
        }
    }
}

export default PWAManager;
