"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Instagram, Twitter, Linkedin } from "lucide-react";

const footerLinks = [
  {
    title: "Experiences",
    links: [
      { name: "All Experiences", href: "/experiences" },
      { name: "Adventure", href: "/experiences?category=Adventure" },
      { name: "Dining", href: "/experiences?category=Dining" },
      { name: "Wellness", href: "/experiences?category=Wellness" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about-us" },
      { name: "Testimonials", href: "/testimonials" },
      { name: "Press", href: "/press" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
    ],
  },
];

const socialLinks = [
  { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/slashsocials" },
  { name: "Twitter", icon: Twitter, url: "https://x.com/social_slashexp" },
  { name: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/company/slash-adbc/" },
];

export default function Footer() {
  return (
    <footer className="bg-secondary/30 pt-16 pb-8">
      <div className="container max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/assets/5c4b2b72-9668-4671-9be9-84c7371c459a.png" alt="Slash" className="h-8 w-8" />
              <span className="font-medium text-xl">Slash</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Curated experience gifts that create lasting memories. We believe in the power of experiences over material possessions.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="font-medium mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-muted-foreground">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Slash. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
