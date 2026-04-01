import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.jobnow.app',
    appName: 'JobNow',
    webDir: 'dist',
    server: {
        // Dùng app được build local (dist/)
        // Nếu muốn dùng Firebase Hosting URL (live update), thay bằng:
        // url: 'https://jobnow-80037.web.app',
        // cleartext: true,
        androidScheme: 'https',
    },
    android: {
        buildOptions: {
            keystorePath: undefined,
            keystoreAlias: undefined,
        },
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#1565C0',
            androidSplashResourceName: 'splash',
            showSpinner: false,
        },
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert'],
        },
    },
};

export default config;
