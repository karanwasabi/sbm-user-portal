'use client';

import { Button } from '@/components/ui/button';
import { GoogleG } from '@/components/icons/google-g';

type GoogleSignInButtonProps = {
  onClick?: () => void;
};

export function GoogleSignInButton({ onClick }: GoogleSignInButtonProps) {
  return (
    <Button variant="light" size="lg" fullWidth leftIcon={<GoogleG />} onClick={onClick}>
      Continue with Google
    </Button>
  );
}
