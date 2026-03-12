import type { Identity } from "@cavok/core/contracts/auth.contracts";
import { AccountDisplay } from "@cavok/widgets/components/account-display";
import { Button } from "@cavok/ui/core/button";
import { IconText } from "@cavok/ui/core/layout/icon-text";
import {
  Cog,
  Book,
  Currency,
  DollarSign,
  Home,
  LayoutDashboard,
  List,
  Map,
  Package,
  Plane,
  Store,
  User,
  Globe,
  LogOut,
  Shield,
} from "@cavok/ui/icons";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Form, Link, Links, useFetcher } from "react-router";
import { queries } from "~/data/api/queries";

export const useAccountDisplayLinks = (isOnboarded: boolean) => [
  {
    label: "Account ",
    disabled: !isOnboarded,
    href: "/settings/account",
    external: false,
    icon: <Cog />,
  },
  {
    label: "Presence",
    disabled: !isOnboarded,
    href: "/settings/presence",
    external: false,
    icon: <User />,
  },
  {
    label: "Logout",
    disabled: false,
    href: "/logout",
    external: false,
    icon: <LogOut />,
  },
];

export function WebHeader({
  user,
  isOnboarded,
  isLoading,
}: {
  user: Identity;
  isOnboarded: boolean;
  isLoading: boolean;
}) {
  const { t, i18n } = useTranslation();

  const links = useMemo(() => {
    if (!isOnboarded) {
      return [];
    }

    return [
      {
        label: t("modules.navigation.home"),
        href: "/",
        external: false,
        icon: <LayoutDashboard />,
      },
      {
        label: t("modules.navigation.world"),
        href: "/w",
        external: false,
        icon: <Globe />,
      },
      {
        label: t("modules.navigation.career"),
        href: "/c",
        external: false,
        icon: <Globe />,
      },
      {
        label: t("modules.navigation.profile"),
        href: "/me",
        external: false,
        icon: <User />,
      },
      {
        label: t("modules.navigation.admin"),
        href: "/e",
        external: false,
        icon: <Cog />,
      },
    ];
  }, [i18n.language, isOnboarded]);

  const accountDisplayLinks = useAccountDisplayLinks(isOnboarded);

  const navItems = useMemo(
    () =>
      links.map((item) => {
        if (item.external) {
          return (
            <a key={item.href} href={item.href} className="whitespace-nowrap">
              {/* <IconText icon={item.icon} text={item.label} /> */}
              {item.label}
            </a>
          );
        }
        return (
          <Link key={item.href} to={item.href} className="whitespace-nowrap">
            {/* <IconText icon={item.icon} text={item.label} /> */}
            {item.label}
          </Link>
        );
      }),
    [i18n.language, links]
  );

  return (
    <header className="flex justify-between items-center border-b border-border">
      <div className="container mx-auto flex justify-between items-center py-2">
        <Link className="block" to="/">
          <span className="text-4xl font-bold">
            {t('app.name.short')}<span className="text-primary">FS</span>
          </span>
        </Link>
        <div>
          link1 
        </div>
        <div>
          <AccountDisplay
            username={user.username}
            links={accountDisplayLinks
              .filter((link) => !link.disabled)
              .map((link) => {
                return {
                  key: link.href,
                  component: (
                    <Link key={link.href} to={link.href} className="flex items-center gap-2">
                      {" "}
                      {link.icon} {link.label}
                    </Link>
                  ),
                };
              })}
          />
        </div>
      </div>
    </header>
  );
}
