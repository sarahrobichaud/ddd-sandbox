import { useFieldContext } from "~/utils/form-utils";
import { Label } from "@cavok/ui/components/shad/label";
import { Input } from "@cavok/ui/components/shad/input";
import { FieldError } from "./field-error";
import { FieldLabel } from "./field-label";

interface AirportFieldProps {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: string;
  errors: string[];
  hint: string;
}

export function AirportField({ name, label, placeholder, required, type, errors, hint }: AirportFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel text={label} required={required} htmlFor={field.name}/>
      <Input
        className="font-mono"
        name={field.name}
        aria-invalid={!field.state.meta.isValid}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        type={type}
      />
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <FieldError error={field.state.meta} />
    </div>
  );
}
