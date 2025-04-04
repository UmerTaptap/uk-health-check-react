import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  data?: any;
}

export async function apiRequest(
  url: string,
  options?: ApiRequestOptions
): Promise<any> {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: options?.data instanceof FormData
        ? { ...options.headers }
        : options?.data
          ? { "Content-Type": "application/json", ...options?.headers }
          : options?.headers || {},
      body: options?.data instanceof FormData
        ? options.data
        : options?.data
          ? JSON.stringify(options.data)
          : undefined,
    });

    await throwIfResNotOk(res);
    
    // For empty responses (like 204 No Content), just return true
    if (res.status === 204) {
      return true;
    }
    
    // Parse the response as JSON
    try {
      const data = await res.json();
      return data;
    } catch (parseError) {
      console.warn('Failed to parse response as JSON:', parseError);
      return true; // Return something truthy to indicate success
    }
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
