import { createBrowserRouter } from "react-router";
import Landinglayout from "../layouts/Landinglayout";
import LandingPage from "../pages/LandingPage";
import Authlayout from "../layouts/Authlayout";
import Admin from "../pages/Admin";
import Shopproducts from "../pages/Shopproducts";
import ShopDashboard from "../pages/ShopDashboard";
import SignUp from "../pages/SignUp";
import ProtectedAuth from "../components/ProtectedAuth";
import RequestSeller from "../pages/RequestShop";
import ProtectRoleSelection from "../components/ProtectRoleSelection";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrdersPage from "../pages/OrdersPage";
import ProtectAdmin from "../components/ProtectAdmin";
import ProtectPages from "../components/ProtectPages";
import ProtectedShopDashboard from "../components/ProtectedShopDashboard";
import NotFound from "../pages/NotFound";
import SignIn from '../pages/SignIn'

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Landinglayout />,
        children: [
            {
                path: "",
                element: <LandingPage />
            },
            {
                path: "shopes",
                element: <Shopproducts />
            },
            {
                path: "shopDashboard",
                element: <ProtectedShopDashboard>
                    <ShopDashboard />
                </ProtectedShopDashboard>
            },
            {
                path: "requestshop",
                element: <ProtectRoleSelection>
                    <RequestSeller />
                </ProtectRoleSelection>
            },
            {
                path: "/cartitem",
                element: <ProtectPages>
                    <CartPage />
                </ProtectPages>
            }, {
                path: "/checkout",
                element: <ProtectPages>
                    <CheckoutPage />
                </ProtectPages>
            }, {
                path: "/orders",
                element: <ProtectPages>
                    <OrdersPage />
                </ProtectPages>
            }
        ]
    },
    {
        path: "/auth",
        element: <Authlayout />,
        children: [
            {
                path: "signup",
                element: <ProtectedAuth>
                    <SignUp />
                </ProtectedAuth>
            },
            {
                path: "signin",
                element: <ProtectedAuth>
                    <SignIn />
                </ProtectedAuth>
            },

        ]
    },
    {
        path: "/admin",
        element: <ProtectAdmin>
            <Admin />
        </ProtectAdmin>
    },
    {
        path: "*",
        element:<NotFound/>
    }
])