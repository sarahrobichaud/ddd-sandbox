import { Button } from '@cavok/ui/core/button';
import { useTranslation } from 'react-i18next';

export type BottomActionsProps = {
  onReset: () => void;
  onSubmit: () => void;
  mode: 'create' | 'edit';
};

export const BottomActions = ({ onReset, onSubmit, mode }: BottomActionsProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex w-full justify-end gap-4">
      <Button type="button" variant={'secondary'} onClick={onReset}>
        {t('common.reset')}
      </Button>
      <Button type="button" onClick={onSubmit}>
        {mode === 'create' ? t('common.create') : t('common.save')}
      </Button>
    </div>
  );
};
