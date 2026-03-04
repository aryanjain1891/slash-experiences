"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Instagram, Twitter, Linkedin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const footerLinks = [
  {
    title: "Experiences",
    links: [
      { name: "All Experiences", href: "/experiences" },
      { name: "Adventure", href: "/experiences?category=adventure" },
      { name: "Dining", href: "/experiences?category=dining" },
      { name: "Wellness", href: "/experiences?category=wellness" },
      { name: "Luxury", href: "/experiences?category=luxury" },
      { name: "Learning", href: "/experiences?category=learning" },
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
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://www.instagram.com/slashsocials",
  },
  {
    name: "Twitter",
    icon: Twitter,
    url: "https://x.com/social_slashexp?t=2hMgiF7n9Z-6px4AIhXhgA&s=09",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    url: "https://www.linkedin.com/company/slash-adbc/",
  },
];

export default function Footer() {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    scrollToTop();
    router.push(`/experiences?category=${encodeURIComponent(category)}`);
  };

  const handleAllExperiencesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTop();
    router.push("/experiences");
  };

  return (
    <footer className="pt-16 pb-8 bg-secondary/30">
      <div className="container max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo and About */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center space-x-2 mb-6"
              onClick={scrollToTop}
            >
              <img
                src="/assets/5c4b2b72-9668-4671-9be9-84c7371c459a.png"
                alt="Slash logo"
                className="h-8 w-8"
              />
              <span className="font-medium text-xl">Slash</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Curated experience gifts that create lasting memories. We believe in the
              power of experiences over material possessions.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <TooltipProvider key={social.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <social.icon className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{social.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4 className="font-medium mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => {
                  if (link.name === "All Experiences") {
                    return (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          onClick={handleAllExperiencesClick}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    );
                  }

                  const categoryMatch = link.href.match(/category=(.+)/);
                  if (categoryMatch) {
                    return (
                      <li key={link.name}>
                        <button
                          onClick={() => handleCategoryClick(categoryMatch[1])}
                          className="text-muted-foreground hover:text-foreground transition-colors text-left"
                        >
                          {link.name}
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        onClick={scrollToTop}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
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
            <Link
              href="/privacy"
              onClick={scrollToTop}
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              onClick={scrollToTop}
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookie-policy"
              onClick={scrollToTop}
              className="hover:text-foreground transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
