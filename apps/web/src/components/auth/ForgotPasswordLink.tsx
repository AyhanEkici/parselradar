import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  className?: string;
};

export default function ForgotPasswordLink({ className }: Props) {
  return (
    <Link to="/forgot-password" className={className || 'text-sm text-blue-600 hover:underline'}>
      Wachtwoord vergeten?
    </Link>
  );
}
