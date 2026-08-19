import Image from "next/image";
import Link from "next/link";
import {
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
} from "@/components/ui/Icons";
import { services, siteConfig } from "@/lib/site";
import type { CategoryDef } from "@/lib/types";

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "All Products" },
  { href: "/contact", label: "Contact" },
  { href: "/search", label: "Search" },
];

const SOCIALS = [
  { href: siteConfig.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: siteConfig.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: siteConfig.social.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
];

export function Footer({ categories }: { categories: CategoryDef[] }) {
  const { contact, address } = { contact: siteConfig.contact, address: siteConfig.contact.address };

  return (
    <footer className="gradient-dark mt-auto text-ink-300">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/brand/logo.png"
                alt={siteConfig.name}
                width={1280}
                height={853}
                className="h-14 w-auto rounded-lg ring-1 ring-white/10"
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-400">
              {siteConfig.legalName} builds and supplies next-generation UAV systems — agricultural
              spraying drones, surveillance and firefighting platforms, plus the frames, motors,
              controllers and nozzles that keep them flying.
            </p>

            <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-500">
              Serving {contact.serviceAreas.join(" & ")}
            </p>

            <div className="mt-5 flex gap-2.5">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${siteConfig.name} on ${label}`}
                  className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-ink-300 transition-all hover:border-brand-400/40 hover:bg-brand-700 hover:text-white"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <nav className="lg:col-span-3" aria-labelledby="footer-shop">
            <h2 id="footer-shop" className="text-sm font-semibold text-white">
              Shop
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-ink-400 transition-colors hover:text-brand-300"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company + services */}
          <nav className="lg:col-span-2" aria-labelledby="footer-company">
            <h2 id="footer-company" className="text-sm font-semibold text-white">
              Company
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-400 transition-colors hover:text-brand-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-8 text-sm font-semibold text-white">Services</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.slice(0, 4).map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services#${service.slug}`}
                    className="text-ink-400 transition-colors hover:text-brand-300"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold text-white">Get in touch</h2>
            <address className="mt-4 space-y-4 text-sm not-italic">
              <div className="flex gap-3">
                <PinIcon className="mt-0.5 size-4.5 shrink-0 text-brand-400" />
                <span className="text-ink-400">
                  {address.street}, {address.locality}
                  <br />
                  {address.region} {address.postalCode}, {address.countryName}
                </span>
              </div>
              <div className="flex gap-3">
                <PhoneIcon className="mt-0.5 size-4.5 shrink-0 text-brand-400" />
                <a
                  href={`tel:${contact.phone}`}
                  className="text-ink-400 transition-colors hover:text-brand-300"
                >
                  {contact.phoneDisplay}
                </a>
              </div>
              <div className="flex gap-3">
                <MailIcon className="mt-0.5 size-4.5 shrink-0 text-brand-400" />
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all text-ink-400 transition-colors hover:text-brand-300"
                >
                  {contact.email}
                </a>
              </div>
              <div className="flex gap-3">
                <ClockIcon className="mt-0.5 size-4.5 shrink-0 text-brand-400" />
                <span className="text-ink-400">{contact.hours}</span>
              </div>
            </address>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <p>
              Founded by {siteConfig.founder}, {siteConfig.founderRole}
            </p>
            {/* Staff entry point. Unauthenticated visitors only ever see the
                login form; robots.ts and the admin metadata keep it unindexed. */}
            <Link
              href="/admin"
              rel="nofollow"
              className="shrink-0 text-ink-500 transition-colors hover:text-brand-300"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
