import { Route, Redirect } from "wouter";
import { isAuthenticated } from "@/auth";

interface PrivateRouteProps {
    component: React.FC;
    path: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, path }) => (
    <Route
        path={path}
        component={(params) =>
            isAuthenticated() ? <Component {...(params as any)} /> : <Redirect to="/signup" />
        }
    />
);

export default PrivateRoute;