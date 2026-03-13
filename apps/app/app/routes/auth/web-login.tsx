import { redirect } from 'react-router';
import LoginForm, { clientAction } from '../../components/auth/login-form';
import { userContext } from '~/context';
import type { Route } from './+types/web-login';

export { clientAction };

export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  const user = context.get(userContext);
  if (user) {
    throw redirect('/');
  }
  return null;
}

export default function LoginRoute() {
  return (
    <div className="flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
