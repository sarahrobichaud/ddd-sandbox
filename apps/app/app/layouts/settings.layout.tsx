import { Outlet } from "react-router";

export default function SettingsLayout() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Outlet />
    </div>
  );
}
