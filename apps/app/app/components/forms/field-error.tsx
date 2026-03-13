import type { AnyFieldMeta } from "@tanstack/react-form";
import { useFieldContext } from "~/utils/form-utils";

export interface FieldErrorProps {
  error: AnyFieldMeta;
}

export function FieldError({ error }: FieldErrorProps) {
  console.log(error.errors);
  return (
    <div>
      {error.errors.map((error, index) => (
        <p key={`${error.message}-${index}`} className="text-sm text-destructive">
          {error.message}
        </p>
      ))}
    </div>
  );
}
