"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutUsPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white py-16 md:py-28">
        <div className="container max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Slash Experiences</h1>
          <p className="text-xl max-w-2xl">
            We&apos;re on a mission to revolutionize the way people gift experiences, creating memories that last a lifetime.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-xl overflow-hidden">
              <img
                src="/assets/5c4b2b72-9668-4671-9be9-84c7371c459a.png"
                alt="Slash Experiences"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-medium mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Founded in 2024, Slash Experiences began with a simple idea: what if gifts could create lasting memories instead of collecting dust?
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Our founder, after struggling to find meaningful gifts for loved ones, realized that experiences bring more joy and connection than material possessions.
              </p>
              <p className="text-lg text-muted-foreground">
                Today, we offer hundreds of unique experiences across the country, from adrenaline-pumping adventures to serene wellness retreats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 md:py-24 bg-secondary/10">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We believe in the power of experiences to transform lives, strengthen relationships, and create stories worth telling.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {[
                { num: "1", title: "Curate Excellence", desc: "We carefully select each experience for quality, uniqueness, and memorability." },
                { num: "2", title: "Connect People", desc: "We create opportunities for meaningful connections through shared experiences." },
                { num: "3", title: "Inspire Joy", desc: "We measure our success by the memories and moments of happiness we help create." },
              ].map((item) => (
                <div key={item.num} className="bg-background p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-primary text-xl font-bold">{item.num}</span>
                  </div>
                  <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8">Meet the Co-founders</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            {[
              { name: "Aryan Jain", role: "Co-founder", desc: "Product visionary and passionate about creating joyful gifting experiences." },
              { name: "Apoorv Kakar", role: "Co-founder", desc: "Tech lead, ensuring seamless and delightful user journeys." },
              { name: "Kaushal Rathi", role: "Co-founder", desc: "Operations and partnerships, making every experience possible." },
            ].map((person) => (
              <div key={person.name} className="bg-background rounded-xl shadow-lg p-6 flex flex-col items-center w-full max-w-xs">
                <img
                  src="/assets/5c4b2b72-9668-4671-9be9-84c7371c459a.png"
                  alt={person.name}
                  className="h-24 w-24 rounded-full object-cover mb-4 border-2 border-primary"
                />
                <h3 className="text-lg font-semibold">{person.name}</h3>
                <p className="text-primary text-sm font-medium mb-1">{person.role}</p>
                <p className="text-muted-foreground text-center text-sm">{person.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
