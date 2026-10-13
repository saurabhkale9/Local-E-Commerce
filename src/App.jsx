import { RouterProvider } from "react-router";
import { routes } from "./routes/routes";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        borderRadius: "10px",
                        background: "#111",
                        color: "#fff",
                    },
                }}
            />

            <RouterProvider router={routes} />
        </>
    );
}

export default App;