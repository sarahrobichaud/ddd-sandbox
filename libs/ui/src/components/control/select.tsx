import { HTMLProps } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../shad/select";


export interface SelectOption {
  value: string;
  label: string;
}

export type SelectProps<T extends readonly SelectOption[] = SelectOption[], V = T[number]['value']> = {
  name: string;
  placeholder: string;
  value: V;
  required: boolean;
  isInvalid?: boolean;
  onValueChange: (value:V) => void;
  options: T;
  hint?: string | ((value: V) => string);
} & HTMLProps<HTMLSelectElement>

export function SelectControl<T extends readonly SelectOption[] = SelectOption[], V = T[number]['value']>({ name,  placeholder, required, options, hint ,value, onValueChange, isInvalid,...props}: SelectProps<T, V>) {

  const hintIsFn = hint && typeof hint === 'function'
  const dynamicHint = typeof hint === 'string' ? hint : hintIsFn && hint(value as V)

  return (
    <div>

      <Select value={value as string ?? ""} onValueChange={(value) => onValueChange(value as V)} required={required} >
        <SelectTrigger id={name} name={name} aria-invalid={isInvalid} className="w-full">
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
    </div>
  );
}