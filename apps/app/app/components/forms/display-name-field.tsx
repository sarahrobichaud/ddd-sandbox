import { Label } from "@cavok/ui/components/shad/label";
import { Input } from "@cavok/ui/components/shad/input";
import { useFieldContext } from "~/utils/form-utils";
import { InputGroup, InputGroupButton, InputGroupAddon, InputGroupInput } from "@cavok/ui/core/input-group";
import { Copy } from "@cavok/ui/icons";
import { FieldError } from "./field-error";
import { FieldLabel } from "./field-label";
import { useTranslation } from "react-i18next";

interface DisplayNameFieldProps {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: string;
  errors: string[];
  hint: string;
  username: {
    copy: () => void;
    value: string;
  };
}

export function DisplayNameField({
  label,
  placeholder,
  required,
  type,
  errors,
  hint,
  username,
}: DisplayNameFieldProps) {
  const field = useFieldContext<string>();
  const {t} = useTranslation(undefined, {keyPrefix: 'form.fields'})

  const showCopyButton = username.value !== field.state.value;

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
          type={type}
        />
        {showCopyButton && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={username.copy} title={t('displayName.useTitle', {username: username.value})}>
              <Copy className="h-3.5 w-3.5" />
              {username.value}
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <FieldError error={field.state.meta} />
    </div>
  );
}
