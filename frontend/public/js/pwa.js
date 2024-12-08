// PWA Installation and Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful:', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}

// Handle PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button if available
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', installPWA);
    }
});

async function installPWA() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
        console.log('PWA installed successfully');
    }
    
    deferredPrompt = null;
}
