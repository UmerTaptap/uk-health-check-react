import { Route, Redirect } from "wouter";
import { isAuthenticated } from "@/auth";

interface PublicRouteProps {
    component: React.FC;
    path: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ component: Component, path }) => (
    <Route
        path={path}
        component={(params) =>
            isAuthenticated() ? <Redirect to="/dashboard" /> : <Component {...(params as any)} />
        }
    />
);

export default PublicRoute;