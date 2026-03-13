import { useFieldContext } from "~/utils/form-utils";
import { Label } from "@cavok/ui/components/shad/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@cavok/ui/components/shad/select";
import { FieldError } from "./field-error";
import { FieldLabel } from "./field-label";

export interface SelectFieldOption {
  value: string;
  label: string;
}
export interface SelectFieldProps<T extends readonly SelectFieldOption[] = SelectFieldOption[], V = T[number]['value']>{
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: T;
  hint?: string | ((value: V) => string);
}

export function SelectField<T extends readonly SelectFieldOption[] = SelectFieldOption[], V = T[number]['value']>({ name, label, placeholder, required, options, hint }: SelectFieldProps<T, V>) {
  const field = useFieldContext<V>();

  const hintIsFn = hint && typeof hint === 'function'
  const dynamicHint = typeof hint === 'string' ? hint : hintIsFn && hint(field.state.value as V)

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor={field.name} text={label} required={required}/>
      <Select value={field.state.value as string ?? ""} onValueChange={(value) => field.handleChange(value as V)} required={required}>
        <SelectTrigger id={field.name} name={field.name} aria-invalid={!field.state.meta.isValid} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && <p className="text-sm text-muted-foreground">{dynamicHint}</p>}
      <FieldError error={field.state.meta} />
    </div>
  );
}