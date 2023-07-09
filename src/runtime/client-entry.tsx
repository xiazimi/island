import { createRoot } from 'react-dom/client';
import { App } from './App';

function renderInBrowser() {
  const containerEl = document.getElementById('root');
  if (!containerEl) {
    throw new Error('#root element not found');
  }
  console.log(124, '===');

  createRoot(containerEl).render(<App />);
}

renderInBrowser();
