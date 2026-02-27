import { createRootRoute, createRoute } from '@tanstack/react-router';

export const rootRoute = createRootRoute();

export const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
        <div>
        <h1>JobNow Web App</ h1 >
    <p>Welcome to JobNow </p>
</div>
),
});

export const routeTree = rootRoute.addChildren([indexRoute]);
