import { SecondaryHeading } from "@cavok/ui/typography";
import { useTranslation } from "react-i18next";


export function WelcomeStep() {

  const {t} = useTranslation()

  return (
    <div className="space-y-4">
      <div>

      <SecondaryHeading>{t('modules.onboarding.welcomeStep.content.title', {appName: t('app.name.networkFull')})}</SecondaryHeading>
      <p className="text-lg text-muted-foreground">{t('modules.onboarding.welcomeStep.content.description')}</p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            1
          </div>
          <div>
            <h3 className="font-semibold">{t('modules.onboarding.welcomeStep.content.step1.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('modules.onboarding.welcomeStep.content.step1.description')}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            2
          </div>
          <div>
            <h3 className="font-semibold">{t('modules.onboarding.welcomeStep.content.step2.title')}</h3>
            <p className="text-sm text-muted-foreground">{t("modules.onboarding.welcomeStep.content.step2.description")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
