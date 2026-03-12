import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("layouts/app.layout.tsx", [
    index("routes/home.tsx"),
    route("/logout", "routes/actions/logout.tsx"),
    route("/onboarding", "routes/onboarding/index.tsx"),
    layout("layouts/settings.layout.tsx", [
      route("/settings/account", "routes/settings/account.tsx"),
      route("/settings/presence", "routes/settings/presence.tsx"),
    ]),
    // route("/e", "routes/entities/index.tsx", [
    //   route(":entity", "routes/entities/list-entity.tsx", [
    //     route("create", "routes/entities/create-entity.tsx"),
    //     route("edit/:uuid", "routes/entities/update-entity.tsx"),
    //   ]),
    // ]),
  ]),

  layout("layouts/auth.layout.tsx", [route("/auth", "routes/auth/web-login.tsx")]),
] satisfies RouteConfig;
