import { createBrowserRouter } from "react-router";
import AuthLayout from "./layouts/auth-layout";
import SignInPage from "./pages/auth/sign-in";
import ForgetPasswordPage from "./pages/auth/forget-password";
import MainLayout from "./layouts/main-layout";
import ResetPasswordPage from "./pages/auth/reset-password";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        path: "auth",
        Component: AuthLayout,
        children: [
          {
            path: "sign-in",
            Component: SignInPage,
          },
          {
            path: "forget-password",
            Component: ForgetPasswordPage,
          },
          {
            path: "reset-password",
            Component: ResetPasswordPage,
          },
        ],
      },
    ],
  },
]);
