import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { client } from '@/lib/api/client';
import type { Session } from '@support-desk/contracts';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, LifeBuoy, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
export const AuthScreen = ({
  onSession,
}: {
  onSession: (session: Session) => void;
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useMutation({
    mutationFn: (action: 'login' | 'register' | 'demo') =>
      client.authenticate(action, email, password),
    onSuccess: onSession,
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!auth.isPending) auth.mutate(mode);
  };
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 p-6 lg:flex-row lg:gap-20">
      <div className="flex max-w-md flex-col gap-5">
        <div className="flex items-center gap-2">
          <LifeBuoy className="size-7 text-primary" />
          <span className="text-xl font-semibold">Support Desk</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Helpful answers.
          <br />
          Evidence you can check.
        </h1>
        <p className="text-muted-foreground">
          Resolve customer requests with answers grounded in your help articles.
          Review every source, edit the draft, and make the final decision.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4" />
          Synthetic customers. No emails sent.
        </div>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Open your support workspace</CardTitle>
          <CardDescription>
            Try an isolated demo, or sign in to keep your work.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Button
            size="lg"
            disabled={auth.isPending}
            onClick={() => auth.mutate('demo')}
          >
            Try the demo
            <ArrowRight data-icon="inline-end" />
          </Button>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">
              or use your account
            </span>
            <Separator className="flex-1" />
          </div>
          <Tabs
            value={mode}
            onValueChange={(value) => {
              if (auth.isPending) return;
              setMode(value === 'register' ? 'register' : 'login');
              auth.reset();
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger disabled={auth.isPending} value="login">
                Sign in
              </TabsTrigger>
              <TabsTrigger disabled={auth.isPending} value="register">
                Create account
              </TabsTrigger>
            </TabsList>
            <TabsContent value={mode} className="flex flex-col gap-5">
              {auth.error && (
                <Alert variant="destructive">
                  <AlertTitle>Could not continue</AlertTitle>
                  <AlertDescription>{auth.error.message}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={submit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={
                        mode === 'register'
                          ? 'new-password'
                          : 'current-password'
                      }
                      required
                      minLength={12}
                      maxLength={128}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <FieldDescription>
                      At least 12 characters. Use a password unique to this
                      demo.
                    </FieldDescription>
                  </Field>
                  <Button type="submit" disabled={auth.isPending}>
                    {auth.isPending && (
                      <LoaderCircle
                        data-icon="inline-start"
                        className="animate-spin"
                      />
                    )}
                    {mode === 'register' ? 'Create account' : 'Sign in'}
                  </Button>
                </FieldGroup>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Demo work expires after 24 hours. Account work persists. Email
            verification and password recovery are not available in this
            portfolio demo.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
};
