import React, { useEffect } from 'react';
import { Platform } from 'react-native';

export default function VLibrasWeb() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Create VLibras containers
    const container = document.createElement('div');
    container.setAttribute('vw', '');
    container.className = 'enabled';

    const accessBtn = document.createElement('div');
    accessBtn.setAttribute('vw-access-button', '');
    accessBtn.className = 'active';

    const wrapper = document.createElement('div');
    wrapper.setAttribute('vw-plugin-wrapper', '');

    const topWrapper = document.createElement('div');
    topWrapper.className = 'vw-plugin-top-wrapper';

    wrapper.appendChild(topWrapper);
    container.appendChild(accessBtn);
    container.appendChild(wrapper);
    document.body.appendChild(container);

    // Inject VLibras script
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      try {
        // incializa o widget VLibras
        new window.VLibras.Widget('https://vlibras.gov.br/app');
      } catch (e) {
        console.warn('VLibras init error:', e);
      }
    };
    document.body.appendChild(script);

    return () => {
      try {
        if (script.parentNode) script.parentNode.removeChild(script);
        if (container.parentNode) container.parentNode.removeChild(container);
      } catch {}
    };
  }, []);

  return null;
}
