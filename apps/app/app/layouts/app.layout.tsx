import { WebHeader } from "~/components/layout/web-header";
import { Navigate, Outlet, useLocation } from "react-router";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queries } from "~/data/api/queries";
import { LoaderIcon } from "@cavok/ui/icons";
import { useOnboardingStatus } from "~/data/api/onboarding-queries";
import { getUserId } from "~/data/store/auth-store";
import { LanguageSwitch } from "~/components/i18n/language-switch";
import SecondaryHeading from "@cavok/ui/components/typography/secondary-heading";
import { useTranslation } from "react-i18next";
import Lead from "@cavok/ui/components/typography/lead";

export default function AppLayout() {
  const { data, isPending, isFetching } = useQuery(queries.me.profile);
  const [ready, setReady] = useState(false);
  const location = useLocation();
  const userId = getUserId();

  const {t} = useTranslation()

  const { query: onboardingStatusQuery } = useOnboardingStatus({
    userId: userId,
    queryOptions: {
      // Poll every 2 seconds if onboarding is completed but not yet ready
      refetchInterval: (query) => {
        const data = query.state.data;
        if (data?.isCompleted && data?.currentStep !== "READY") {
          return 3000;
        }
        return false; // Stop polling when ready
      },
    },
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setReady(true);
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (!data || !onboardingStatusQuery.data) {
    return null;
  }

  const onboarding = onboardingStatusQuery.data;
  const user = data;

  if (onboarding.isCompleted && location.pathname === "/onboarding") {
    return <Navigate to="/" />;
  }

  if (
    !onboarding.isCompleted &&
    !onboarding.isAccountSetup &&
    location.pathname !== "/onboarding" &&
    location.pathname !== "/logout" &&
    location.pathname !== "/auth"
  ) {
    return <Navigate to="/onboarding" />;
  }

  const isAccountSetup = onboarding.isCompleted && onboarding.isAccountSetup;
  const isReady = onboarding.isCompleted && onboarding.isAccountSetupCompleted && !!ready && !!user;

  const showRoutes = isReady || location.pathname === "/logout" || location.pathname === "/onboarding";

  return (
    <div>
      <WebHeader user={user} isOnboarded={isReady} isLoading={!ready || !data} />
      {showRoutes ? (
        <Outlet />
      ) : isAccountSetup ? (
        <div className="h-screen flex flex-col justify-center items-center gap-4">
          <LoaderIcon className="w-10 h-10 animate-spin" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Setting up your account...</p>
            <p className="text-sm text-muted-foreground">We're creating your profile and setting up your workspace.</p>
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col justify-center items-center gap-4">
          <LoaderIcon className="w-10 h-10 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading HorizonFS...</p>
        </div>
      )}
      <footer className="py-8 border-t border-neutral">
        <div className="container mx-auto flex justify-between">

        <div>
          <Lead>{t('app.name.networkFull')}</Lead>
          <p className="text-muted">Built with 💖 by loveliieee</p>
        </div>
        <LanguageSwitch/>

        </div>
      </footer>
    </div>
  );
}
