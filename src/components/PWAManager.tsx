import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';

export default function PWAManager() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    useEffect(() => {
        if (offlineReady) {
            toast.success('App is ready to work offline!', {
                description: 'You can now access ZeeQue even without an internet connection.',
            });
            setOfflineReady(false);
        }
    }, [offlineReady, setOfflineReady]);

    useEffect(() => {
        if (needRefresh) {
            toast('A new version is available!', {
                description: 'Update now to get the latest features and fixes.',
                action: {
                    label: 'Update',
                    onClick: () => updateServiceWorker(true),
                },
                duration: Infinity,
            });
        }
    }, [needRefresh, updateServiceWorker]);

    return null;
}
