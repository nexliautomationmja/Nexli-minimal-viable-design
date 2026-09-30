import React from 'react';
import { Clock, Facebook, Linkedin, Lock, Mail, MapPin, Phone, Star } from 'lucide-react';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import { linkProps } from '../../lib/firm-sites/links';
import { FIRM_SITE_SECTIONS } from '../../lib/firm-sites/types';

const NEXLI_URL = 'https://www.nexli.net';

export default function Footer({ cfg }: { cfg: FirmSiteConfig }) {
  const { contact, social } = cfg;
  const year = new Date().getFullYear();
  const phoneHref = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, '')}` : undefined;
  const mapsHref = contact.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`
    : undefined;

  const muted = { color: 'rgba(255,255,255,0.62)' } as const;

  return (
    <footer
      id={FIRM_SITE_SECTIONS.contact}
      className="scroll-mt-20"
      style={{ background: 'var(--fs-primary-deep)', color: 'var(--fs-on-primary)' }}
    >
      <div className="fs-container pt-16 pb-10 md:pt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 lg:gap-12">
          {/* Brand */}
          <div>
            {cfg.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cfg.logo.src}
                alt={cfg.logo.alt}
                width={cfg.logo.width ?? 140}
                height={36}
                className={`fs-logo h-9 w-auto${cfg.logo.ink ? ` fs-logo--${cfg.logo.ink}-ink` : ''}`}
              />
            ) : (
              <p className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--fs-font-heading)' }}>
                {cfg.firmName}
              </p>
            )}
            <p className="mt-3 text-sm leading-relaxed max-w-sm" style={muted}>
              {cfg.tagline}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href={cfg.bookingUrl} {...linkProps(cfg.bookingUrl)} className="fs-btn fs-btn-accent" style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}>
                Book a consultation
              </a>
              <a href={cfg.portalUrl} {...linkProps(cfg.portalUrl)} className="fs-btn fs-btn-outline-light" style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}>
                <Lock size={14} aria-hidden="true" />
                Client portal
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--fs-accent)', fontFamily: 'var(--fs-font-body)' }}>
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm list-none p-0 m-0">
              {contact.phone && (
                <li className="flex gap-3">
                  <Phone size={16} className="shrink-0 mt-0.5" style={muted} aria-hidden="true" />
                  <a href={phoneHref} className="hover:underline underline-offset-4">
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex gap-3">
                  <Mail size={16} className="shrink-0 mt-0.5" style={muted} aria-hidden="true" />
                  <a href={`mailto:${contact.email}`} className="hover:underline underline-offset-4" style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}>
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.address && (
                <li className="flex gap-3">
                  <MapPin size={16} className="shrink-0 mt-0.5" style={muted} aria-hidden="true" />
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 leading-relaxed">
                    {contact.address}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--fs-accent)', fontFamily: 'var(--fs-font-body)' }}>
              Hours
            </h2>
            <ul className="mt-4 space-y-3 text-sm list-none p-0 m-0">
              <li className="flex gap-3">
                <Clock size={16} className="shrink-0 mt-0.5" style={muted} aria-hidden="true" />
                <span className="leading-relaxed">{contact.hours ?? 'By appointment'}</span>
              </li>
              <li className="text-sm leading-relaxed" style={muted}>
                Existing clients can message us any time through the portal.
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--fs-accent)', fontFamily: 'var(--fs-font-body)' }}>
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm list-none p-0 m-0">
              <li><a href={`#${FIRM_SITE_SECTIONS.services}`} className="hover:underline underline-offset-4">Services</a></li>
              <li><a href={`#${FIRM_SITE_SECTIONS.portal}`} className="hover:underline underline-offset-4">Client portal</a></li>
              <li><a href={`#${FIRM_SITE_SECTIONS.about}`} className="hover:underline underline-offset-4">About</a></li>
              <li><a href={cfg.bookingUrl} {...linkProps(cfg.bookingUrl)} className="hover:underline underline-offset-4">Book a consultation</a></li>
            </ul>
            {social && (social.linkedin || social.facebook || social.google) && (
              <div className="mt-5 flex items-center gap-2">
                {social.linkedin && (
                  <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <Linkedin size={16} aria-hidden="true" />
                  </a>
                )}
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <Facebook size={16} aria-hidden="true" />
                  </a>
                )}
                {social.google && (
                  <a href={social.google} target="_blank" rel="noopener noreferrer" aria-label="Google reviews" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <Star size={16} aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className="mt-14 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}
        >
          <p>&copy; {year} {cfg.firmName}. All rights reserved.</p>
          <p>
            Website by{' '}
            <a href={NEXLI_URL} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline underline-offset-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Nexli
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
