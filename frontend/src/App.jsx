import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import AppShell from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import InvoicePreview from "./components/InvoicePreview";
import BusinessProfile from "./pages/BusinessProfile";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public auth routes */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected app routes */}
        <Route
          element={
            <>
              <SignedIn>
                <AppShell />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id/preview" element={<InvoicePreview />} />
          <Route path="/invoices/:id/edit" element={<CreateInvoice />} />
          <Route path="/invoices/:id" element={<InvoicePreview />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/business-profile" element={<BusinessProfile />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
}
