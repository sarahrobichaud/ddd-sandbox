import { Button } from "@cavok/ui/core/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@cavok/ui/core/card";
import { Input } from "@cavok/ui/core/input";
import { Label } from "@cavok/ui/core/label";
import { redirect, useFetcher } from "react-router";
import { LoaderIcon } from "@cavok/ui/icons";
import { useState } from "react";
import { getActions } from "~/data/store/auth-store";
import { signIn } from "~/data/api/auth-queries";

const { setAccessToken, setRefreshToken, setSessionId, setUsername } = getActions();

export const clientAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return {
      error: "Invalid Values",
    };
  }

  const result = await signIn({
    email,
    password,
  });

  if (!result) {
    return {
      error: "Error with login",
    };
  }

  console.log({ result });
  setAccessToken(result.tokens.access_token);
  setSessionId(result.identity.sessionId);
  setUsername(result.identity.username);
  throw redirect("/");
};

export default function LoginForm() {
  const fetcher = useFetcher();

  const [email, setEmail] = useState("dev@horizon-fs.app");
  const [password, setPassword] = useState("Secret123!");

  return (
    <Card className="w-full my-4 min-w-md">
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <fetcher.Form method="post">
        <CardContent>
          {fetcher.data?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {fetcher.data.error}
            </div>
          )}
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                placeholder="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 my-4">
          <Button
            type="submit"
            className="w-full flex items-center gap-2 hover:cursor-pointer"
            disabled={fetcher.state !== "idle"}
          >
            {fetcher.state !== "idle" ? <LoaderIcon className="w-4 h-4 animate-spin" /> : null}
            {fetcher.state !== "idle" ? "Authenticating..." : "Sign in"}
          </Button>
        </CardFooter>
      </fetcher.Form>
    </Card>
  );
}
