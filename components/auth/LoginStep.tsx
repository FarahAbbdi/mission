import { TextInput } from "@/components/ui/TextInput";
import { BrutalButton } from "@/components/ui/BrutalButton";

type Props = {
  email: string;
  password: string;
  setPassword: (v: string) => void;
  onChangeEmail: () => void;
  onLogin: () => void;
};

export function LoginStep({
  email,
  password,
  setPassword,
  onChangeEmail,
  onLogin,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Email (locked) */}
      <div className="space-y-1">
        <label className="text-xs uppercase tracking-wide text-gray-600">
          Your Email
        </label>

        <div className="border bg-gray-100 px-6 py-5 flex justify-between items-center">
          <span className="text-sm truncate">{email}</span>
          <button
            type="button"
            className="text-sm underline underline-offset-2 hover:underline-offset-4"
            onClick={onChangeEmail}
          >
            CHANGE
          </button>
        </div>
      </div>

      {/* Password input */}
      <TextInput
        label="Your Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={setPassword}
      />

      {/* Login button */}
      <BrutalButton onClick={onLogin}>
        LOGIN →
      </BrutalButton>
    </div>
  );
}