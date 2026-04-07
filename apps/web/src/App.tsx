import { TooltipProvider } from "./components/ui/tooltip";
import QueryProvider from "./providers/query-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { RouterProvider } from "react-router/dom";
import { router } from "./routes";
import AuthProvider from "./providers/auth-provider";
import { Toaster } from "./components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/react";

function App() {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <RouterProvider router={router} />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </NuqsAdapter>
  );
}

export default App;
