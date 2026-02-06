import { TextInput } from "@/components/ui/TextInput";
import { BrutalButton } from "@/components/ui/BrutalButton";

type Props = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;

  setName: (v: string) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;

  onSignup: () => void;
  onBackToEmail: () => void;
};

export function SignupStep({
  name,
  email,
  password,
  confirmPassword,
  setName,
  setEmail,
  setPassword,
  setConfirmPassword,
  onSignup,
  onBackToEmail,
}: Props) {
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSignup();
      }}
    >
      <TextInput
        label="Your Name"
        placeholder="Enter your name"
        value={name}
        onChange={setName}
      />

      <TextInput
        label="Your Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={setEmail}
      />

      <TextInput
        label="Your Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={setPassword}
      />

      <TextInput
        label="Repeat Password"
        type="password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

      <BrutalButton type="submit">SIGN UP →</BrutalButton>

      <button
        type="button"
        className="w-full text-sm underline underline-offset-2 hover:underline-offset-4 text-center transition-all"
        onClick={onBackToEmail}
      >
        ALREADY HAVE AN ACCOUNT?
      </button>
    </form>
  );
}