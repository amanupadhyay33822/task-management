// app/layout.tsx
"use client";
import * as React from "react";
import "./globals.css";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// app/layout.tsx


const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Task Management</title>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ToastContainer position="top-right" />
        </QueryClientProvider>
      </body>
    </html>
  );
}
