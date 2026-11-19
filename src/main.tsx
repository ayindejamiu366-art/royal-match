import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { soundEngine } from './audio/soundEngine';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

if (typeof (window as any).Capacitor !== 'undefined') {
  const Capacitor = (window as any).Capacitor;
  const { App: CapApp, SplashScreen, StatusBar, Keyboard } = Capacitor.Plugins;

  StatusBar.setBackgroundColor({ color: '#020617' });
  StatusBar.setStyle({ style: 'DARK' });
  Keyboard.setResize({ mode: 'body' });
  Keyboard.setStyle({ style: 'DARK' });

  CapApp.addListener('appStateChange', (isActive: boolean) => {
    if (!isActive) {
      soundEngine.stopMusic();
    } else {
      soundEngine.unlock();
    }
  });

  CapApp.addListener('backButton', () => {
    const rootEl = document.querySelector('[data-capacitor-screen]');
    const activeScreen = rootEl ? rootEl.getAttribute('data-capacitor-screen') : null;
    if (activeScreen === 'TITLE' || activeScreen === 'MAP') {
      CapApp.exitApp();
    }
  });

  setTimeout(() => {
    SplashScreen.hide().catch(() => {});
  }, 1500);
}
