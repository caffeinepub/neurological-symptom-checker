import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Layout } from './components/Layout';
import { TodaySchedulePage } from './pages/TodaySchedulePage';
import { MedicationsPage } from './pages/MedicationsPage';
import { HistoryPage } from './pages/HistoryPage';

// Root route with Layout
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Child routes
const todayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: TodaySchedulePage,
});

const medicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/medications',
  component: MedicationsPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
});

const routeTree = rootRoute.addChildren([todayRoute, medicationsRoute, historyRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
