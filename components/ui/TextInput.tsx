type Props = {
  type?: string;
  label?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  name?: string;
};

export function TextInput({
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  required,
  name,
}: Props) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs uppercase tracking-wide text-gray-600">
          {label}
        </label>
      )}
      <input
        name={name}
        required={required}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-[1.5px] p-4 outline-none focus:border-black"
      />
    </div>
  );
} 