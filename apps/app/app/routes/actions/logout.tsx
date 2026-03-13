import PrimaryHeading from "@cavok/ui/components/typography/primary-heading";
import SecondaryHeading from "@cavok/ui/components/typography/secondary-heading";
import { LoaderIcon } from "@cavok/ui/icons";
import { useEffect } from "react";
import { useFetcher } from "react-router";
import { getAccessToken, getSessionId } from "~/data/store/auth-store";

export const clientAction = async () => {
  const sessionId = getSessionId();
  const accessToken = getAccessToken();
  console.log({ sessionId });
  if (!sessionId) {
    return {
      error: "No session id found",
    };
  }
  await fetch(`http://localhost:8080/v1/identity/session/revoke/${sessionId}`, {
    method: "post",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  window.location.reload();
};

function LogoutRoute() {
  const fetch = useFetcher();

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch.submit(null, { method: "post", action: "/logout" });
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <SecondaryHeading className="flex items-center gap-2">
            <LoaderIcon className="animate-spin" />
            <span>Signing you out...</span>
          </SecondaryHeading>
        </div>
        <p className="text-sm text-muted-foreground">You will be redirected to the login page in a few seconds.</p>
      </div>
    </div>
  );
}

export default LogoutRoute;
