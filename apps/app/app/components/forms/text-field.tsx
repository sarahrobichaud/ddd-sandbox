import { useFieldContext } from "~/utils/form-utils";
import { Input } from "@cavok/ui/components/shad/input";
import { Label } from "@cavok/ui/core/label";
import { FieldError } from "./field-error";
import { FieldLabel } from "./field-label";

interface InputFieldProps {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: string;
  errors: string[];
}

export function TextField({ name, label, placeholder, required, type, errors }: InputFieldProps) {
  const field = useFieldContext<string>();

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor={name} text={label} required={required}></FieldLabel>

      <Input
        name={name}
        aria-invalid={!!field.state.meta.errors.length}
        placeholder={placeholder}
        required={required}
        type={type}
        value={field.state.value ?? ""}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      <FieldError error={field.state.meta} />
    </div>
  );
}
