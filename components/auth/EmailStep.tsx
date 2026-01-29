import { TextInput } from "@/components/ui/TextInput";
import { BrutalButton } from "@/components/ui/BrutalButton";

type Props = {
  email: string;
  setEmail: (v: string) => void;
  onContinue: () => void;
  onSignup: () => void;
};

export function EmailStep({
  email,
  setEmail,
  onContinue,
  onSignup,
}: Props) {
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onContinue();
      }}
    >
      <TextInput
        label="Your Email"
        name="email"
        required
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={setEmail}
      />

      {/* Browser validation runs automatically */}
      <BrutalButton type="submit">
        CONTINUE →
      </BrutalButton>

      <button
        type="button"
        className="w-full text-sm underline underline-offset-2 hover:underline-offset-4 text-center transition-all"
        onClick={onSignup}
      >
        CREATE ACCOUNT
      </button>
    </form>
  );
}