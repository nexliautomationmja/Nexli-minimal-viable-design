'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Menu, X } from 'lucide-react';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import { linkProps } from '../../lib/firm-sites/links';
import { FIRM_SITE_SECTIONS, toFirmBrandConfig } from '../../lib/firm-sites/types';
import ThemeToggle from './ThemeToggle';

/**
 * Client-site navbar. Same visual language as components/portfolio/FirmNavbar
 * (glass / solid / minimal treatments, pill links, mobile sheet) rendered from
 * toFirmBrandConfig(cfg), but with real anchors and the firm's two CTAs
 * instead of the portfolio's "Back to Nexli" chrome.
 */
const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Services', href: `#${FIRM_SITE_SECTIONS.services}` },
  { label: 'Client Portal', href: `#${FIRM_SITE_SECTIONS.portal}` },
  { label: 'About', href: `#${FIRM_SITE_SECTIONS.about}` },
  { label: 'Contact', href: `#${FIRM_SITE_SECTIONS.contact}` },
];

export default function FirmNav({ cfg }: { cfg: FirmSiteConfig }) {
  const brand = toFirmBrandConfig(cfg);
  const { fonts, style } = brand;
  // "glass" is the Nexli look: the nav sits on the (theme-switchable) canvas,
  // so it reads the --fs-* vars instead of the fixed brand-derived colours.
  const themed = style === 'glass';
  // "solid" sits on the brand primary, which differs per theme. toFirmBrandConfig
  // only ever reads cfg.colors (the LIGHT palette), so read the live --fs-* vars
  // instead; otherwise the nav is one fixed colour in both themes and the theme
  // toggle (color: inherit) goes near-black on deep green in light mode.
  const onPrimary = style === 'solid';
  const colors = themed
    ? {
        ...brand.colors,
        navBg: 'rgba(var(--fs-bg-rgb), 0.82)',
        text: 'var(--fs-text)',
        textMuted: 'var(--fs-text-muted)',
        border: 'var(--fs-border)',
      }
    : onPrimary
      ? {
          ...brand.colors,
          // Match the hero gradient's first stop so the nav and the hero read
          // as one surface instead of a lighter band sitting on top.
          navBg: 'var(--fs-primary-deep)',
          text: 'var(--fs-on-primary)',
          textMuted: 'rgba(255,255,255,0.65)',
          border: 'rgba(255,255,255,0.14)',
        }
      : brand.colors;
  const hasToggle = !!cfg.darkColors;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const navStyle: React.CSSProperties = {
    background: colors.navBg,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: scrolled ? '0 1px 0 rgba(var(--fs-accent-rgb),0.35), 0 8px 30px -22px rgba(0,0,0,0.5)' : 'none',
    ...(style === 'glass'
      ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }
      : {}),
  };

  const isOnPrimary = style !== 'minimal' && !themed;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-shadow duration-300" style={navStyle}>
      <nav aria-label="Primary" className="fs-container">
        <div className="flex items-center justify-between h-16 md:h-[4.5rem] gap-4">
          {/* Brand */}
          <a href="#top" className="flex items-center gap-3 shrink-0 min-w-0" aria-label={`${cfg.firmName} home`}>
            {cfg.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cfg.logo.src}
                alt={cfg.logo.alt}
                width={cfg.logo.width ?? 140}
                height={36}
                className={`fs-logo h-8 md:h-9 w-auto${cfg.logo.ink ? ` fs-logo--${cfg.logo.ink}-ink` : ''}`}
              />
            ) : (
              <span
                className="text-base sm:text-lg md:text-xl font-semibold tracking-tight truncate"
                style={{ color: colors.text, fontFamily: fonts.heading }}
              >
                {cfg.firmName}
              </span>
            )}
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{ color: colors.text, fontFamily: fonts.body }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `rgba(var(--fs-accent-rgb), 0.14)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {hasToggle && <ThemeToggle slug={cfg.slug} className="mr-1" />}
            <a
              href={cfg.portalUrl}
              {...linkProps(cfg.portalUrl)}
              className={`fs-btn ${isOnPrimary ? 'fs-btn-outline-light' : 'fs-btn-outline'}`}
              style={{ padding: '0.625rem 1.125rem', fontSize: '0.8125rem' }}
            >
              <Lock size={14} aria-hidden="true" />
              Client login
            </a>
            <a
              href={cfg.bookingUrl}
              {...linkProps(cfg.bookingUrl)}
              className="fs-btn fs-btn-accent"
              style={{ padding: '0.625rem 1.125rem', fontSize: '0.8125rem' }}
            >
              Book a consultation
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>

          {/* Mobile: theme toggle + menu */}
          {hasToggle && (
            <span className="md:hidden ml-auto inline-flex">
              <ThemeToggle slug={cfg.slug} />
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 -mr-2 rounded-lg"
            style={{ color: colors.text }}
            aria-expanded={open}
            aria-controls="firm-mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="firm-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: `1px solid ${colors.border}`, background: colors.navBg }}
          >
            <div className="fs-container py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-3 px-4 rounded-xl text-base font-medium border"
                  style={{ color: colors.text, borderColor: colors.border, fontFamily: fonts.body }}
                >
                  {link.label}
                  <ArrowRight size={14} aria-hidden="true" style={{ opacity: 0.4 }} />
                </a>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <a
                  href={cfg.portalUrl}
                  {...linkProps(cfg.portalUrl)}
                  onClick={() => setOpen(false)}
                  className={`fs-btn ${isOnPrimary ? 'fs-btn-outline-light' : 'fs-btn-outline'}`}
                >
                  <Lock size={14} aria-hidden="true" />
                  Client portal login
                </a>
                <a href={cfg.bookingUrl} {...linkProps(cfg.bookingUrl)} onClick={() => setOpen(false)} className="fs-btn fs-btn-accent">
                  Book a consultation
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
