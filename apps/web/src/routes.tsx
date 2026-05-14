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
import ProductsPage from "./pages/products/index";
import VendorsPage from "./pages/vendors/index";
import ActivityLogPage from "./pages/activity-log/index";
import PurchaseOrdersPage from "./pages/purchase-orders/index";
import StockBatchesPage from "./pages/stock-batches/index";
import AuthorizationLayout from "./layouts/authorization-layout";
import IssueRequestsPage from "./pages/issue-requests/index";
import ReturnRequestsPage from "./pages/return-requests/index";
import WelcomePage from "./pages/welcome";

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
            index: true,
            Component: WelcomePage,
          },
          {
            path: "/dashboard",
            Component: () => (
              <AuthorizationLayout module="dashboard">
                <DashboardPage />
              </AuthorizationLayout>
            ),
          },
          {
            path: "/users",
            Component: () => (
              <AuthorizationLayout module="users">
                <UsersPage />
              </AuthorizationLayout>
            ),
          },
          {
            path: "/categories",
            Component: () => (
              <AuthorizationLayout module="categories">
                <CategoriesPage />
              </AuthorizationLayout>
            ),
          },
          {
            path: "/products",
            Component: () => (
              <AuthorizationLayout module="products">
                <ProductsPage />
              </AuthorizationLayout>
            ),
          },
          {
            path: "/vendors",
            Component: () => (
              <AuthorizationLayout module="vendors">
                <VendorsPage />
              </AuthorizationLayout>
            ),
          },
          {
            path: "/purchase-orders",
            Component: () => (
              <AuthorizationLayout module="purchase_orders">
                <PurchaseOrdersPage />
              </AuthorizationLayout>
            ),
          },
          {
            path: "/stock-batches",
            Component: () => (
              <AuthorizationLayout module="stock_batches">
                <StockBatchesPage />
              </AuthorizationLayout>
            ),
          },
          {
            path: "/activity-log",
            Component: () => (
              <AuthorizationLayout module="activity_log">
                <ActivityLogPage />
              </AuthorizationLayout>
            ),
          },
          {
            path: "/issue-requests",
            Component: () => (
              <AuthorizationLayout module="issue_requests">
                <IssueRequestsPage />
              </AuthorizationLayout>
            ),
          },
          {
            path: "/return-requests",
            Component: () => (
              <AuthorizationLayout module="return_requests">
                <ReturnRequestsPage />
              </AuthorizationLayout>
            ),
          },
        ],
      },
    ],
  },
]);
