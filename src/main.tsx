//src/main.tsx
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { routes } from './Router';
import './index.css';

// 🔐 MUHIM: Interceptors ni import qilish (auto token management)
import './services/interceptors';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={routes} />
);