import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

import { Montserrat } from "next/font/google";
import { QueryClientWrapper } from "../contexts/query-client";
import StackProvider from "../contexts/stack";
import RootLayoutWrapper from "../layouts/root-layout-wrapper";
const montserrat = Montserrat({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <QueryClientWrapper>
          <StackProvider>
            <RootLayoutWrapper>{children}</RootLayoutWrapper>
          </StackProvider>
        </QueryClientWrapper>
      </body>
    </html>
  );
}
