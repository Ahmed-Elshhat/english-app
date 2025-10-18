"use client";

import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import store from "@/Redux/app/store";
import WindowProvider from "@/context/windowContext";
import MenuProvider from "@/context/MenuContext";
import { Toaster } from "react-hot-toast";
import { fetchUsers } from "@/Redux/feature/userSlice/userSlice";
import { useAppDispatch } from "@/Redux/app/hooks";
import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// Wrapper داخلي للتعامل مع الـ dispatch بعد تحميل الـ Provider
function InnerClientProviders({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: "linear-gradient(135deg, #0f9d58, #34a853)",
              color: "#fff",
              borderRadius: "10px",
              padding: "12px 16px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            },
            iconTheme: { primary: "#fff", secondary: "#34a853" },
          },
          error: {
            style: {
              background: "linear-gradient(135deg, #d93025, #ea4335)",
              color: "#fff",
              borderRadius: "10px",
              padding: "9px 16px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            },
            iconTheme: { primary: "#fff", secondary: "#ea4335" },
          },
        }}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <WindowProvider>
        <MenuProvider>
          <InnerClientProviders>{children}</InnerClientProviders>
        </MenuProvider>
      </WindowProvider>
    </Provider>
  );
}
