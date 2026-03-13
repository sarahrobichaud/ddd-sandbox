import { Label } from "@cavok/ui/core/label";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

export type FieldLabelProps = {
  required?: boolean;
  text: string;
  htmlFor: string;
};
export function FieldLabel({ text, required, htmlFor }: FieldLabelProps) {
  const {t} = useTranslation(undefined, {keyPrefix: 'form.components'})
  const suffix = required ? "*" : ` (${t('label.optional')})`;

  return (
    <Label htmlFor={htmlFor}>
      {text}
      <span
        className={clsx("font-light", {
          "text-primary": required,
        })}
      >
        {suffix}
      </span>
    </Label>
  );
}
