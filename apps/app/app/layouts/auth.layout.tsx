import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { LanguageSwitch } from '~/components/i18n/language-switch';

export default function AuthLayout() {
  const {t} = useTranslation()
  return (
    <div className="h-screen flex justify-center items-center">
      <div>
        <header>
          <h1 className="text-4xl font-bold">{t('app.name.short')}<span className='text-primary'>FS</span></h1>
        </header>
        <Outlet />
      <LanguageSwitch/>
      </div>
    </div>
  );
}
