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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trimmedEmail = email.trim();
  const trimmedName = name.trim();

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setLoading(false);

    if (signInErr) setError(signInErr.message);
    else router.push("/missions");
  }

  async function handleSignup() {
    if (!trimmedName) {
      setError("Name is required");
      return;
    }

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    // 1) Create auth user (+ store name in user_metadata for convenience)
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { name: trimmedName },
      },
    });

    if (signUpErr) {
      setLoading(false);
      setError(signUpErr.message);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setLoading(false);
      setError(
        "Signup succeeded, but no user returned. Check email confirmation settings."
      );
      return;
    }

    // 2) Insert/upsert into profiles (store BOTH name + email)
    const { error: profileErr } = await supabase.from("profiles").upsert(
      {
        id: userId,
        name: trimmedName,
        email: trimmedEmail,
        // if you have updated_at default/trigger you can omit it
        // updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileErr) {
      setLoading(false);
      setError(profileErr.message);
      return;
    }

    setLoading(false);
    router.push("/missions");
  }

  function goToEmail() {
    setStep("email");
    setError(null);
    setPassword("");
    setConfirmPassword("");
    setName("");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-7xl font-black tracking-tight">MISSION</h1>
          <p className="text-2xl text-gray-500">Track. Progress. Achieve.</p>
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
            name={name}
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            setName={(v) => {
              setName(v);
              if (error) setError(null);
            }}
            setEmail={(v) => {
              setEmail(v);
              if (error) setError(null);
            }}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}
            onSignup={handleSignup}
            onBackToEmail={goToEmail}
          />
        )}

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {loading && <p className="text-xs text-gray-500 text-center">Loading…</p>}
      </div>
    </main>
  );
}