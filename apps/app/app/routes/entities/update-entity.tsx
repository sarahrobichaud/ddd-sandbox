import { CrudForm } from "@cavok/ui/components/forms/crud-form";
import { useNavigate, useParams } from "react-router";
import { queries } from "~/data/api/queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formRegistry } from "~/modules/crud/forms/formRegistry";
import type { EntityName } from "@cavok/core/domain/shared/entities.values";
import type { ReactNode } from "react";
import type { PlaneDetails } from "@cavok/core/contracts/plane.contracts";
import { useUpdateForm } from "~/modules/crud/hooks/use-update-form";
import { useEntityCrudView } from "./use-entity-view";
import { useTranslation } from "react-i18next";
import { BottomActions } from "~/modules/crud/components/form-bottom-actions";

export default function ActionEntityRoute() {
  const { uuid } = useParams();

  const { entity } = useEntityCrudView();

  if (!uuid) {
    throw new Error("No UUID!");
  }

  const { data } = useQuery({
    queryKey: ["plane", uuid],
    queryFn: () => queries.plane.getDetails({ planeId: uuid }),
  });

  if (!entity) {
    throw new Error("No entity");
  }

  if (!data) {
    return <h1>fdas</h1>;
  }

  return (
    <div className="">
      <EditForm defaultValues={data} entity={entity} />
    </div>
  );
}

export function EditForm({ defaultValues, entity }: { defaultValues: PlaneDetails; entity: EntityName }): ReactNode {
  const { t } = useTranslation();
  const { schema, fields } = formRegistry[entity](t);

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationKey: ["plane", "update"],
    mutationFn: queries[entity].update,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [entity, "list"] });
      navigate(`/e/${entity}`);
    },
  });

  const form = useUpdateForm<EntityName>({
    id: defaultValues.id,
    defaultValues: {
      name: defaultValues.name ?? null,
      registration: defaultValues.registration ?? null,
      category: defaultValues.category,
    },
    entity: entity,
    mutation: mutation,
  });

  return (
    <CrudForm
      form={form}
      serverErrors={[]}
      bottomActions={<BottomActions mode="edit" onReset={form.reset} onSubmit={form.handleSubmit} />}
      fields={fields}
    />
  );
}
