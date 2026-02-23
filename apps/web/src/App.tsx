import { TooltipProvider } from "./components/ui/tooltip";
import QueryProvider from "./providers/query-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { RouterProvider } from "react-router/dom";
import { router } from "./routes";
import AuthProvider from "./providers/auth-provider";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
