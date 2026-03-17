import { Button } from '@cavok/ui/core/button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export type TableActionsProps = {
  onDelete: () => void;
  editLink: string;
};

export function TableActions({ onDelete, editLink }: TableActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 justify-end">
      <Button size={'sm'} variant="outline" asChild>
        <Link to={editLink}>{t('common.edit')}</Link>
      </Button>
      <Button size={'sm'} variant="ghost" onClick={onDelete}>
        {t('common.delete')}
      </Button>
    </div>
  );
}
