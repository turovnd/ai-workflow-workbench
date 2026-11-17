import { useEffect } from 'react';
import { ArrowRight, Check, LifeBuoy } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Path } from '@/router/paths';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  Button,
  Separator,
} from '@/components/ui';
import { AuthForm } from './auth-form';
import { useAuthForm } from './use-auth-form';

export const AuthPage = () => {
  const auth = useAuth();
  const location = useLocation();
  const register = location.pathname === Path.Register;
  const form = useAuthForm(register);
  const from: unknown = location.state?.from;
  const destination =
    typeof from === 'string' && /^\/tickets(?:[/?]|$)/.test(from)
      ? from
      : Path.Tickets;

  useEffect(() => {
    document.title = `${register ? 'Create account' : 'Sign in'} · Support Desk`;
  }, [register]);
  if (auth.session)
    return (
      <Navigate to={auth.session.demo ? Path.Tickets : destination} replace />
    );

  return (
    <main className="min-h-svh bg-background">
      <header className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-7">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LifeBuoy className="size-5" />
        </span>
        <span className="font-semibold tracking-tight">Support Desk</span>
      </header>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-12 pt-5 lg:min-h-[75svh] lg:grid-cols-2 lg:gap-20">
        <section className="flex flex-col items-start gap-6">
          <Badge variant="secondary">
            From customer request to reviewed reply
          </Badge>
          <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
            Answer with confidence.
            <br />
            Keep the final say.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Prepare a reply from your help articles. Check the sources, make it
            your own and approve the exact response.
          </p>
          <Button
            size="lg"
            disabled={form.pending}
            onClick={() => form.demo.mutate()}
          >
            {form.demo.isPending ? 'Opening your demo…' : 'Try the demo'}
            <ArrowRight data-icon="inline-end" />
          </Button>
          <p className="text-sm text-muted-foreground">
            Sample requests. No account needed. No emails sent.
          </p>
          {form.demo.error && (
            <Alert variant="destructive">
              <AlertTitle>Couldn’t open demo</AlertTitle>
              <AlertDescription>{form.demo.error.message}</AlertDescription>
            </Alert>
          )}
          <Separator className="max-w-md" />
          <ul className="flex flex-col gap-3 text-sm">
            {[
              'Choose a customer request',
              'Prepare an AI reply and inspect its sources',
              'Edit, approve and find the saved response',
            ].map((text) => (
              <li className="flex items-center gap-3" key={text}>
                <Check className="size-4 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </section>
        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <AuthForm
            register={register}
            form={form}
            returnState={location.state}
          />
        </div>
      </div>
    </main>
  );
};
