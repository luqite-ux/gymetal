'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { MotionDiv } from '@/components/motion'

export function Footer() {
  const { t } = useLanguage()

  const navItems = [
    { href: '/', label: t.nav.home },
    { href: '/about', label: t.nav.about },
    { href: '/services', label: t.nav.services },
    { href: '/equipment', label: t.nav.equipment },
    { href: '/products', label: t.nav.products },
    { href: '/faq', label: t.nav.faq },
    { href: '/contact', label: t.nav.contact },
  ]

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/logo.png"
              alt="GY Metal Tech"
              width={120}
              height={120}
              className="h-20 w-auto brightness-0 invert"
            />
            <p className="text-sm text-primary-foreground/70">
              {t.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm text-primary-foreground/70 transition-all hover:text-primary-foreground hover:translate-x-1"
                  >
                    <span className="h-px w-0 bg-accent transition-all group-hover:w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t.footer.contactInfo}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-sm text-primary-foreground/70">
                  {t.contact.addressValue}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a
                  href="tel:+8613961808452"
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  +86 139 6180 8452
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a
                  href="mailto:support@gymetaltech.com"
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  support@gymetaltech.com
                </a>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              {t.about.certification}
            </h3>
            <div className="flex items-center gap-4">
              <div className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-primary-foreground/10 transition-all duration-300 hover:scale-110 hover:bg-accent/20">
                <span className="text-xs font-bold text-accent transition-transform group-hover:scale-110">ISO</span>
              </div>
              <div className="text-sm text-primary-foreground/70">
                <p className="font-medium text-primary-foreground">ISO 9001:2015</p>
                <p>Quality Management</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} {t.footer.company}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
