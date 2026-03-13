import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { AirportField } from "~/components/forms/airport-field";
import { DisplayNameField } from "~/components/forms/display-name-field";
import { PronounsField } from "~/components/forms/pronouns-field";
import { SelectField } from "~/components/forms/select-field";
import { TextField } from "~/components/forms/text-field";

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    InputField: TextField,
    AirportField: AirportField,
    DisplayNameField: DisplayNameField,
    SelectField: SelectField,
    PronounsField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});
