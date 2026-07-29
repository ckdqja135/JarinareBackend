import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '../index.css';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { Analytics } from '@vercel/analytics/react';

const queryClient = new QueryClient();

// 리렌더링 되어도 로컬에 저장하여 데이터를 즉각적으로 가져온다.
const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <App />
      <Analytics />
    </PersistQueryClientProvider>
  </StrictMode>,
);
