import { useTransition } from "react";
import type { Route } from "./+types/home";
import { useTranslation } from "react-i18next";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home" },
    {
      name: "description",
      content: "Real-time flight simulator data from FSUIPC",
    },
  ];
}

function HomeContent() {
  const {t } = useTranslation(undefined, {keyPrefix: 'action'})
  return (
    <div className="h-[600px] w-full flex items-center justify-center">
      <h1>Hello {t('editEntity', {entity: 'fesaf'})}</h1>
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
