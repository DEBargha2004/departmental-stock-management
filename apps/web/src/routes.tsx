import { createBrowserRouter } from "react-router";
import AuthLayout from "./layouts/auth-layout";
import SignInPage from "./pages/auth/sign-in";
import ForgetPasswordPage from "./pages/auth/forget-password";
import MainLayout from "./layouts/main-layout";
import ResetPasswordPage from "./pages/auth/reset-password";
import DashboardPage from "./pages/dashboard";
import AppLayout from "./layouts/app-layout";
import UsersPage from "./pages/users/index";
import CategoriesPage from "./pages/categories";
import ProductsPage from "./pages/products";
import VendorsPage from "./pages/vendors/index";
import ActivityLogPage from "./pages/activity-log";

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
      {
        Component: AppLayout,
        children: [
          {
            path: "/",
            Component: DashboardPage,
          },
          {
            path: "/users",
            Component: UsersPage,
          },
          {
            path: "/categories",
            Component: CategoriesPage,
          },
          {
            path: "/products",
            Component: ProductsPage,
          },
          {
            path: "/vendors",
            Component: VendorsPage,
          },
          {
            path: "/activity-log",
            Component: ActivityLogPage,
          },
        ],
      },
    ],
  },
]);
