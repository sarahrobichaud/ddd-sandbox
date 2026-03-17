import { PrimaryHeading, SecondaryHeading } from '@cavok/ui/typography';
import { Link, Outlet, useLocation, useOutlet, useOutletContext } from 'react-router';
import { Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { Button } from '@cavok/ui/core/button';
import { ArrowLeft, List, Plus } from '@cavok/ui/icons';
import type { EntityName } from '~/modules/crud/constants';
import { useTranslation } from 'react-i18next';
import { entities } from '@cavok/core/domain/shared/entities.values';

export type CrudAction = {
  to: string;
  label: ReactNode | string;
  key: string;
  variant?: 'secondary' | 'ghost';
};

export type AvailableActions = CrudAction[];

export type CrudViewMode = 'browse' | 'entity' | 'create' | 'edit';

export type EntityCrudViewContext = {
  entity?: EntityName;
  action?: string;
};

// export function useEntityCrudView() {
//   return useOutletContext<EntityCrudViewContext>();
// }

export default function EntityCRUDRoute() {
  const outlet = useOutlet();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  const { entity, action } = useMemo(() => {
    const parts = pathname.split('/');
    parts.shift();
    parts.shift();
    const [entity, action] = parts as [EntityName, string];

    return { entity, action };
  }, [pathname]);

  useEffect(() => {
    console.log({ entity, action, pathname });
  }, [entity, action, pathname]);

  const mode = useMemo(() => {
    if (!entity && !action) {
      return 'browse';
    }

    if (entity && !action) {
      return 'entity';
    }

    if (entity && action) {
      return action;
    }
  }, [entity, action]);

  const title = useMemo(() => {
    if (mode === 'browse') {
      return t('modules.admin.dataBrowser.entityBrowser.dataBrowser');
    }

    if (mode === 'entity') {
      return t('action.manageEntity', {
        entity: t(`entity.${entity}.name`, { count: 2 }),
      });
    }

    if (mode === 'create') {
      return t('action.createEntity', {
        entity: t(`entity.${entity}.name`, { count: 1 }),
      });
    }

    if (mode === 'edit') {
      return t('action.editEntity', {
        entity: t(`entity.${entity}.name`, { count: 1 }),
      });
    }

    return 'Unknown mode';
  }, [mode, i18n.language]);

  const availableActions = useMemo((): AvailableActions => {
    if (mode === 'create' || mode === 'edit') {
      return [
        {
          to: `/e/${entity}`,
          key: 'edit-action',
          label: (
            <span className="flex gap-2 items-center">
              {t('modules.admin.dataBrowser.backToEntityList', {
                entity: t(`entity.${entity}.name`, { count: 2 }),
              })}{' '}
              <List />
            </span>
          ),
          variant: 'ghost',
        },
      ];
    }

    if (mode === 'entity') {
      return [
        {
          to: `/e/${entity}/create`,
          key: 'create-action',
          label: (
            <span className="flex gap-2 items-center">
              {t('modules.admin.dataBrowser.createEntity', {
                entity: t(`entity.${entity}.name`, { count: 1 }),
              })}{' '}
              <Plus />
            </span>
          ),
        },
      ];
    }

    return [];
  }, [mode, i18n.language]);

  return (
    <Suspense fallback={<h1>lOading</h1>}>
      <div className="max-w-[1000px] mx-auto w-full py-4">
        <div className="flex justify-between items-end pb-8">
          <div className="">
            {entity && (
              <Button asChild variant="ghost">
                <Link to="/e">
                  <ArrowLeft />
                  {t('modules.admin.dataBrowser.entityBrowser.backToEntities')}
                </Link>
              </Button>
            )}
            <PrimaryHeading>{title}</PrimaryHeading>
          </div>
          <div>
            {availableActions.map((action) => (
              <Button key={action.key} asChild variant={action.variant || undefined}>
                <Link to={action.to} className="font-serif">
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {!outlet && (
          <div className="py-8">
            <SecondaryHeading>
              {t('modules.admin.dataBrowser.entityBrowser.coreEntities')}
            </SecondaryHeading>
            <ul className="list-disc underline text-primary">
              {entities.map((entity) => {
                return (
                  <li>
                    <Link to={`/e/${entity}`}>{t(`entity.${entity}.name`, { count: 2 })}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {outlet && <Outlet context={{ entity, action }} />}
      </div>
    </Suspense>
  );
}
