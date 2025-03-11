import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './libs/store';
import { Provider } from 'react-redux';
import ContextCartProvider from './Context/ContextCart';
import ContextPayProvider from './Context/ContextPay'; 


const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ContextCartProvider>
        <ContextPayProvider>
          <App />
        </ContextPayProvider>
      </ContextCartProvider>
    </QueryClientProvider>
  </Provider>
);