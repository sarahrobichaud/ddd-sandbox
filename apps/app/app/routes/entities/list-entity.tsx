import { Outlet, useOutlet, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queries } from '~/data/api/queries';
import type { EntityName } from '@cavok/core/domain/shared/entities.values';
import { HorizonFSTable } from '@cavok/ui/components/tables/table';
import { useTranslation } from 'react-i18next';
import { useEntityCrudView } from './use-entity-view';
import { entities } from '@cavok/core/domain/shared/entities.values';
import { useColumnBuilder } from '@cavok/ui/components/tables/column-builder';
import { tableRegistry } from '~/modules/crud/table-registry';
import { TableActions } from '~/modules/crud/components/table-actions';
import { useCallback } from 'react';

export const clientLoader = ({ request, params }: LoaderFunctionArgs) => {
  const { entity } = params;

  if (!entity) {
    throw new Error('No entity provided');
  }

  if (!entities.includes(entity as unknown as EntityName)) {
    throw new Error('Invalid entity');
  }

  return {
    entity: entity as EntityName,
  };
};

export default function EntityListRoute() {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const { entity } = useLoaderData<typeof clientLoader>();
  const outlet = useOutlet();
  const viewContext = useEntityCrudView();

  const { data, isPending } = useQuery({
    queryKey: [entity, 'list'],
    queryFn: queries[entity].all,
  });

  const columnDefs = tableRegistry[entity].useDetailsColumns();

  const columns = useColumnBuilder<any>({
    selectable: false,
    translations: {},
    columns: columnDefs,
  });

  const mutation = useMutation({
    mutationKey: [entity, 'delete'],
    mutationFn: queries[entity].delete,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [entity, 'list'] });
    },
  });

  const renderActions = useCallback(
    (id: string) => {
      return (
        <TableActions
          onDelete={() => mutation.mutate({ id })}
          editLink={`/e/${entity}/edit/${id}`}
        />
      );
    },
    [i18n.language]
  );

  if (!data) {
    return null;
  }

  if (outlet) {
    return <Outlet context={viewContext} />;
  }

  return (
    <div>
      {!isPending && (
        <HorizonFSTable
          data={data}
          entity={entity}
          columns={columns}
          view="entityList"
          selectable={false}
          renderActions={renderActions}
        ></HorizonFSTable>
      )}
    </div>
  );
}
