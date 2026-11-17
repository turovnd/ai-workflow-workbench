import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { client } from '@/api';
import { useAuth } from '@/hooks';

export const useAuthForm = (register: boolean) => {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const account = useMutation({
    mutationFn: () =>
      client.authenticate(register ? 'register' : 'login', email, password),
    onSuccess: auth.signIn,
  });
  const demo = useMutation({
    mutationFn: () => client.authenticate('demo'),
    onSuccess: auth.signIn,
  });
  return {
    email,
    setEmail,
    password,
    setPassword,
    account,
    demo,
    pending: account.isPending || demo.isPending,
  };
};
