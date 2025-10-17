import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import store from './reducer/store.js';
import { Provider } from 'react-redux';
import ToggleThemeProvider from './context/themeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ToggleThemeProvider>
        <App />
      </ToggleThemeProvider>
    </Provider>
  </StrictMode>
);
