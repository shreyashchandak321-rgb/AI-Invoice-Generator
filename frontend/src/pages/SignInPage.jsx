import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ── Brand panel ── */}
      <div className="lg:w-1/2 flex flex-col justify-center px-8 py-12 lg:px-16 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="relative max-w-md mx-auto lg:mx-0">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl">📄</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              InvoiceAI
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Welcome back
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to track your invoicing performance, manage clients, and
            create stunning invoices in seconds.
          </p>
        </div>
      </div>

      {/* ── Auth form ── */}
      <div className="lg:w-1/2 flex items-center justify-center px-4 py-12">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        />
      </div>
    </div>
  );
}
