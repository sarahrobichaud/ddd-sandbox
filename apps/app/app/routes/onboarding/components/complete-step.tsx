import { CheckCircle2 } from "@cavok/ui/icons";
import { PrimaryHeading } from "@cavok/ui/typography";
import { useTranslation } from "react-i18next";

export interface CompleteStepProps {
  title?: string;
  description?: string;
}

export function CompleteStep({
  title = "You're All Set!",
  description = "Your profile has been created successfully. You can now start your flight simulation journey.",
}: CompleteStepProps) {

  const {t} = useTranslation(undefined, {keyPrefix: 'modules.onboarding.completeStep.content'})
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8">
      <div className="rounded-full bg-primary/10 p-6">
        <CheckCircle2 className="h-16 w-16 text-primary" />
      </div>

      <div className="text-center space-y-2">
        <PrimaryHeading>{t('title')}</PrimaryHeading>
        <p className="text-lg text-muted-foreground max-w-md">{t('description')}</p>
      </div>
    </div>
  );
}
