import type { ReactNode } from 'react';
import { type StandardSchemaV1Issue } from '@tanstack/react-form';
import type { CrudFormConfig } from '@cavok/ui/forms/entities/plane.form';
import { Input } from '../shad/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../shad/select';

export type CrudFormProps = {
  fields: CrudFormConfig['fields'];
  submitLabel?: string;
  serverErrors: Record<string, any>;
  bottomActions: ReactNode;
  form: any;
};

export function CrudForm<T>({ fields, serverErrors, bottomActions, form }: CrudFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {fields.map((field) => (
        <form.Field key={field.name} name={field.name}>
          {(fieldApi: any) => {
            const clientError = fieldApi.state.meta.errors?.[0];
            const serverError = serverErrors[field.name];

            if (field.type === 'hidden') {
              return (
                <Input
                  type="hidden"
                  name={field.name}
                  value={fieldApi.state.value ?? ''}
                  onChange={(e) => fieldApi.handleChange(e.target.value)}
                />
              );
            }

            if (field.type === 'select') {
              return (
                <div style={{ marginBottom: 12 }}>
                  <label>{field.label}</label>
                  <Select
                    value={fieldApi.state.value ?? ''}
                    onValueChange={(value) => fieldApi.handleChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a plane type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Type</SelectLabel>
                        {field.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldErrors clientError={clientError} serverError={serverError} />
                </div>
              );
            }

            return (
              <div style={{ marginBottom: 12 }}>
                <label>
                  {field.label}
                  <Input
                    name={field.name}
                    type={field.type ?? 'text'}
                    value={fieldApi.state.value ?? ''}
                    placeholder={field.placeholder}
                    onChange={(e) => fieldApi.handleChange(e.target.value)}
                  />
                </label>
                <FieldErrors clientError={clientError} serverError={serverError} />
              </div>
            );
          }}
        </form.Field>
      ))}
      {bottomActions}
    </form>
  );
}

function FieldErrors({
  clientError,
  serverError,
}: {
  clientError?: StandardSchemaV1Issue;
  serverError?: string;
}) {
  if (!clientError && !serverError) return null;
  return <p style={{ color: 'red' }}>{serverError ?? clientError?.message}</p>;
}
