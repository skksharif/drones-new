import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContactForm } from "@/components/contact/ContactForm";
import { ExternalButtonLink } from "@/components/ui/Button";
import {
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { pageMetadata } from "@/lib/seo";
import { siteConfig, whatsappLink } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact Us — AgroSky Drone Aspirant, Vuyyuru",
  description: `Contact ${siteConfig.legalName} in ${siteConfig.contact.address.locality}, ${siteConfig.contact.address.region}. Call ${siteConfig.contact.phoneDisplay}, email ${siteConfig.contact.email}, or message us on WhatsApp for drone sales, spares and services.`,
  path: "/contact",
  keywords: [
    "AgroSky contact",
    "drone shop Vuyyuru",
    "agriculture drone dealer Andhra Pradesh",
    "drone spare parts contact India",
  ],
});

const SOCIALS = [
  { href: siteConfig.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: siteConfig.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: siteConfig.social.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
];

export default function ContactPage() {
  const { contact } = siteConfig;

  const CHANNELS = [
    {
      Icon: PhoneIcon,
      label: "Phone",
      value: contact.phoneDisplay,
      href: `tel:${contact.phone}`,
      note: "Fastest for stock and compatibility questions",
    },
    {
      Icon: MailIcon,
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
      note: "Best for quotes and bulk orders",
    },
    {
      Icon: PinIcon,
      label: "Address",
      value: `${contact.address.street}, ${contact.address.locality}, ${contact.address.region} ${contact.address.postalCode}`,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${contact.address.street}, ${contact.address.locality}, ${contact.address.region}`,
      )}`,
      note: "Visit our workshop",
      external: true,
    },
    {
      Icon: ClockIcon,
      label: "Hours",
      value: contact.hours,
      note: `Serving ${contact.serviceAreas.join(" & ")}`,
    },
  ];

  return (
    <div className="bg-white">
      <div className="border-b border-ink-100 bg-surface-muted">
        <div className="container-page py-6 sm:py-10">
          <Breadcrumbs crumbs={[{ name: "Contact", path: "/contact" }]} className="mb-4" />
          <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Contact us</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500 sm:text-base">
            Questions about a part, a build or a spraying job? Send us your airframe and payload and
            we&apos;ll tell you exactly what fits.
          </p>
        </div>
      </div>

      <div className="container-page py-8 sm:py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={80} className="space-y-4">
            <ExternalButtonLink
              href={whatsappLink(`Hi ${siteConfig.name}, I have a question.`)}
              variant="whatsapp"
              size="lg"
              fullWidth
            >
              <WhatsAppIcon className="size-5" />
              Chat on WhatsApp
            </ExternalButtonLink>

            <ul className="divide-y divide-ink-100 overflow-hidden rounded-[var(--radius-card)] border border-ink-200/70 bg-white">
              {CHANNELS.map((channel) => {
                const body = (
                  <div className="flex gap-3.5 p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl gradient-brand-soft text-brand-700">
                      <channel.Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-400">
                        {channel.label}
                      </span>
                      <span className="mt-1 block break-words text-sm font-medium text-ink-800">
                        {channel.value}
                      </span>
                      {channel.note ? (
                        <span className="mt-1 block text-xs text-ink-400">{channel.note}</span>
                      ) : null}
                    </span>
                  </div>
                );

                return (
                  <li key={channel.label}>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        {...(channel.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="block transition-colors hover:bg-brand-50/60"
                      >
                        {body}
                      </a>
                    ) : (
                      body
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-5">
              <h2 className="text-sm font-semibold">Follow us</h2>
              <div className="mt-3.5 flex gap-2.5">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${siteConfig.name} on ${label}`}
                    className="flex size-11 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-all hover:border-brand-700/40 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Icon className="size-5" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
