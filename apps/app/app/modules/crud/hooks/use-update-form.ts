import { useForm } from '@tanstack/react-form';
import type { ClientUpdateCommandMap } from '~/types/client-command';
import { formRegistry } from '../forms/formRegistry';
import type { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

type EntityChanges<E extends keyof ClientUpdateCommandMap> = ClientUpdateCommandMap[E]['changes'];
type UpdateVariables<E extends keyof ClientUpdateCommandMap> = {
  id: string;
  changes: EntityChanges<E>;
};

type UpdateMutation<E extends keyof ClientUpdateCommandMap> = UseMutationResult<
  unknown,
  Error,
  UpdateVariables<E>,
  unknown
>;

export function useUpdateForm<E extends keyof ClientUpdateCommandMap>(params: {
  id: string;
  entity: E;
  defaultValues: EntityChanges<E>;
  mutation: UpdateMutation<E>;
}) {
  const { t } = useTranslation();
  const { entity, defaultValues, mutation, id } = params;

  const form = useForm({
    defaultValues: defaultValues as EntityChanges<E>,
    validators: {
      onSubmit: formRegistry[entity](t).schema.update,
    },
    onSubmit: async ({ value }) => {
      console.log({ value, mutation });
      mutation.mutate({
        // you can parameterize this too if needed
        id,
        changes: value,
      });
    },
  });

  return form;
}
