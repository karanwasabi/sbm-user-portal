import { readUtmAttributionFromCookie } from '@/lib/utm-attribution';

export const RENEWAL_LANDING_PATH = '/renewal';
export const RENEW_CHECKOUT_PATH = '/renew';

export const RENEWAL_LANDING_INTRO =
  'It is lovely to see you back! We have spent the last few months turning SBM into something that actually holds your hand through the slow work, and a lot has changed since you were last here. Three things in particular we think you are going to love.';

export const RENEWAL_LANDING_FEATURES = [
  'The first is that your goals are now personalised for you every single week and set from wherever you currently are. You only ever look at the small, doable step in front of you, and when life gets in the way, when you travel or fall sick or have a rough week, the goals adjust so that you are always working on tiny improvements.',
  'The second is that your coaches are so much closer now. You will hear from us every day, there are separate Q&A spaces for nutrition and fitness, you can message your coach and get prompt replies, and you can book 1:1 time whenever something needs a proper conversation. If you go quiet, we will reach out. You will not be doing this alone.',
  'The third is that the whole SBM system now lives in one super powerful app now, and it is a far warmer, less glitchy and a more interactive place to be. Everything sits together, your plan, your coaching, your tracking, and your progress. And there are stars. ⭐ For the effort you put in and the milestones you cross, you collect them, and each one is worth something. I will not tell you what just yet, come back in and find out for yourself, all we can say is, they are a little addictive!',
];

export const RENEWAL_LANDING_VALIDATION =
  'As a small business we have tried to improve with every batch, but I can safely call our current system a big leap from where we were. And this is not a promise we are making blind. We have already run a full month with a mix of new and returning members on this exact program, and we are only hearing good, exciting things 🙂!  Now we would love for you to come in and feel it for yourself.';

export const RENEWAL_LANDING_PRICING_INTRO =
  'The membership durations are the same 1, 3, 6 and 12 month options you know, and here is your pricing:';

export const RENEWAL_LANDING_PRICING = [
  { label: '1 month', amount: '₹1,500 + taxes' },
  { label: '3 months', amount: '₹3,999 + taxes' },
  { label: '6 months', amount: '₹7,499 + taxes' },
  { label: '12 months', amount: '₹13,499 + taxes' },
];

export const RENEWAL_LANDING_CTA_LEAD_IN = 'You can sign up here';
export const RENEWAL_LANDING_CTA_LABEL = 'Sign up here';
export const RENEWAL_LANDING_CLOSING = 'Come back in and see how much has changed.';

export function buildRenewCheckoutHref(searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return query ? `${RENEW_CHECKOUT_PATH}?${query}` : RENEW_CHECKOUT_PATH;
}

export function renewalAnalyticsBase() {
  const utm = readUtmAttributionFromCookie();
  return {
    page_path: RENEWAL_LANDING_PATH,
    utm_source: utm?.utm_source,
    utm_medium: utm?.utm_medium,
    utm_campaign: utm?.utm_campaign,
    utm_content: utm?.utm_content,
    utm_term: utm?.utm_term,
  };
}
