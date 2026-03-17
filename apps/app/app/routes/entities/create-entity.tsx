import { CrudForm } from '@cavok/ui/components/forms/crud-form';
import { useFetcher, useLocation, useNavigate, useParams } from 'react-router';
import { Button } from '@cavok/ui/core/button';
import { useForm } from '@tanstack/react-form';
import { queries } from '~/data/api/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formRegistry } from '~/modules/crud/forms/formRegistry';
import type { ClientCreatePlaneCommand } from 'node_modules/@cavok/core/lib/src/application/plane/commands';
import { useEntityCrudView } from './use-entity-view';
import { BottomActions } from '~/modules/crud/components/form-bottom-actions';
import { useTranslation } from 'react-i18next';

export default function ActionEntityRoute() {
  const { t } = useTranslation();
  const { entity, action } = useEntityCrudView();
  const queryClient = useQueryClient();

  if (!entity) {
    throw new Error('No entity');
  }

  const navigate = useNavigate();
  const { schema, fields } = formRegistry[entity](t);

  const mutation = useMutation({
    mutationKey: ['plane', 'create'],
    mutationFn: queries[entity].create,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [entity, 'list'] });
      navigate(`/e/${entity}`);
    },
  });

  const form = useForm({
    defaultValues: {
      category: 'dual_prop',
      name: '',
      registration: '',
    } as ClientCreatePlaneCommand,
    validators: {
      onChange: schema.create,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <div className="">
      <CrudForm
        form={form}
        serverErrors={[]}
        bottomActions={
          <BottomActions mode="create" onReset={form.reset} onSubmit={form.handleSubmit} />
        }
        fields={fields}
      />
    </div>
  );
}
