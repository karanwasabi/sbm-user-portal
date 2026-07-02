import { redirect } from 'next/navigation';
import { PORTAL_HOME_PATH } from '@/lib/routes';

export default function HomePage() {
  redirect(PORTAL_HOME_PATH);
}
