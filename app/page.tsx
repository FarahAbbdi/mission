"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { EmailStep } from "@/components/auth/EmailStep";
import { LoginStep } from "@/components/auth/LoginStep";
import { SignupStep } from "@/components/auth/SignupStep";

type AuthStep = "email" | "login" | "signup";

export default function AuthPage() {
  const router = useRouter();

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trimmedEmail = email.trim();

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setLoading(false);

    if (error) setError(error.message);
    else router.push("/missions");
  }

  async function handleSignup() {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    setLoading(false);

    if (error) setError(error.message);
    else router.push("/missions");
  }

  function goToEmail() {
    setStep("email");
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-7xl font-black tracking-tight">MISSION</h1>
          <p className="text-[18px] text-gray-500">Track. Progress. Achieve.</p>
        </div>

        {step === "email" && (
          <EmailStep
            email={email}
            setEmail={(v) => {
              setEmail(v);
              if (error) setError(null);
            }}
            onContinue={() => {
              setError(null);
              setStep("login");
            }}
            onSignup={() => {
              setError(null);
              setStep("signup");
            }}
          />
        )}

        {step === "login" && (
          <LoginStep
            email={trimmedEmail}
            password={password}
            setPassword={setPassword}
            onChangeEmail={goToEmail}
            onLogin={handleLogin}
          />
        )}

        {step === "signup" && (
          <SignupStep
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            setEmail={setEmail}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}
            onSignup={handleSignup}
            onBackToEmail={goToEmail}
          />
        )}

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        {loading && (
          <p className="text-xs text-gray-500 text-center">Loading…</p>
        )}
      </div>
    </main>
  );
}