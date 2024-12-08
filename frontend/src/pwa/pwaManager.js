class PWAManager {
    constructor() {
        this.init();
    }

    init() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                this.registerServiceWorker();
                this.handleInstallation();
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

            // Register the new service worker
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });
            
            console.log('ServiceWorker registration successful:', registration.scope);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.notifyUpdate();
                    }
                });
            });
        } catch (error) {
            console.error('ServiceWorker registration failed:', error);
        }
    }

    handleInstallation() {
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            // Store the event for later use
            window.deferredPrompt = event;
            this.showInstallButton();
        });
    }

    showInstallButton() {
        const installButton = document.getElementById('pwa-install-btn');
        if (installButton) {
            installButton.style.display = 'block';
            installButton.addEventListener('click', this.installPWA.bind(this));
        }
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

    notifyUpdate() {
        // You can implement your own update notification UI here
        console.log('New version available! Please refresh the page to update.');
    }

    // Method to check if the app is running in standalone mode (installed)
    isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }
}

export default PWAManager;
