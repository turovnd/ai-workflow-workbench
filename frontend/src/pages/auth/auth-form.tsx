import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { Path } from '@/router/paths';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  Input,
} from '@/components/ui';
import type { useAuthForm } from './use-auth-form';

export const AuthForm = ({
  register,
  form,
  returnState,
}: {
  register: boolean;
  form: ReturnType<typeof useAuthForm>;
  returnState: unknown;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>
        {register ? 'Create your workspace' : 'Welcome back'}
      </CardTitle>
      <CardDescription>
        {register
          ? 'Keep your reviewed replies in one place.'
          : 'Sign in to your Support Desk workspace.'}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.pending) form.account.mutate();
        }}
      >
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
              value={form.email}
              disabled={form.pending}
              onChange={(event) => form.setEmail(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              required
              minLength={12}
              maxLength={128}
              value={form.password}
              disabled={form.pending}
              onChange={(event) => form.setPassword(event.target.value)}
            />
            {register && (
              <FieldDescription>At least 12 characters.</FieldDescription>
            )}
          </Field>
          {form.account.error && (
            <Alert variant="destructive">
              <AlertTitle>Couldn’t sign in</AlertTitle>
              <AlertDescription>{form.account.error.message}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={form.pending}>
            {form.account.isPending && (
              <LoaderCircle className="animate-spin" data-icon="inline-start" />
            )}
            {register ? 'Create account' : 'Sign in'}
          </Button>
        </FieldGroup>
      </form>
    </CardContent>
    <CardFooter>
      <p className="text-sm text-muted-foreground">
        {register ? 'Already have an account? ' : 'New to Support Desk? '}
        <Link
          className="text-foreground underline underline-offset-4"
          to={register ? Path.Login : Path.Register}
          state={returnState}
        >
          {register ? 'Sign in' : 'Create account'}
        </Link>
      </p>
    </CardFooter>
  </Card>
);
