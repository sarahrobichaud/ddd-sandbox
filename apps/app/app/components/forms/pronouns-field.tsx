import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@cavok/ui/core/input-group";
import { Label } from "@cavok/ui/core/label";
import { X } from "@cavok/ui/icons";
import { useFieldContext, useFormContext } from "~/utils/form-utils";
import { FieldLabel } from "./field-label";
interface PronounsFieldProps {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  hint?: string;
}

export function PronounsField({ placeholder, required, label, name }: PronounsFieldProps) {
  const field = useFieldContext<string>();

  const options = ["he/him", "she/her", "they/them"];
  const showSuggestions = field.state.value.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel text={label} htmlFor={field.name} required={required} />
      <InputGroup>
        <InputGroupInput
          aria-invalid={!!field.state.meta.errors.length}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          placeholder={placeholder}
          required={required}
          type={"text"}
        />
        {showSuggestions &&
          options
            .filter((option) => field.state.value !== option)
            .map((option) => {
              return (
                <InputGroupAddon key={option} align="inline-end">
                  <InputGroupButton onClick={() => field.handleChange(option)} title={`Apply ${option}`}>
                    {option}
                  </InputGroupButton>
                </InputGroupAddon>
              );
            })}
        {!!field.state.value.length && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={() => field.handleChange("")} title="Clear">
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  );
}
