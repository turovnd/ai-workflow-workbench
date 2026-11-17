import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PageLoading } from '@/components/layout';
import { authRoutes } from './routes-auth';
import { mainRoutes } from './routes-main';
import { RouteError } from './route-error';

const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      ...authRoutes,
      ...mainRoutes,
      { path: '*', element: <RouteError /> },
    ],
  },
]);

export const Router = () => (
  <Suspense fallback={<PageLoading label="Opening page" />}>
    <RouterProvider router={router} />
  </Suspense>
);
