import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventSignupView } from '@/components/events/event-signup-view';
import { getRequestCountryIso } from '@/lib/request-country-code';
import { fetchCountries, fetchPublicEvent } from '@/utils/api';

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchPublicEvent(slug);
  return { title: event?.name ?? 'Event signup' };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const [event, countries, suggestedCountryIso] = await Promise.all([
    fetchPublicEvent(slug),
    fetchCountries().catch(() => []),
    getRequestCountryIso(),
  ]);

  if (!event) {
    notFound();
  }

  return <EventSignupView event={event} countries={countries} suggestedCountryIso={suggestedCountryIso} />;
}
