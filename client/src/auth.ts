import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
    username: string;
    userId?: number;
    email? : string;
    exp? : number;
    [key: string]: any;
}

export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const logout = (): void => {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

export const getUserFromToken = (): TokenPayload | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
}
