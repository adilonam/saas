"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import ApexHeroMedia from "components/ApexHeroMedia";
import { Button } from "@/components/ui/button";
import {
  SparklesIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  CodeBracketIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import {
  SiUpwork,
  SiFreelancer,
  SiFiverr,
  SiWhatsapp,
  SiTelegram,
} from "react-icons/si";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import { LEGAL_BUSINESS_NAME } from "@/lib/business";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function trackApexEvent(payload: {
  event: string;
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
  [key: string]: unknown;
}) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push(payload);
  }
}

const AGENCY_RATING = 4.8;

const PLATFORMS = [
  {
    name: "Upwork",
    href: "https://www.upwork.com/freelancers/adila77?mp_source=share",
    handle: "adila77",
    rating: 4.8,
    icon: SiUpwork,
    iconClass: "text-[#14A800]",
    bgClass: "bg-[#14a800]/20",
  },
  {
    name: "Freelancer.com",
    href: "https://www.freelancer.com/u/ail5a9f298b597ed",
    handle: "ail5a9f298b597ed",
    rating: 4.7,
    icon: SiFreelancer,
    iconClass: "text-[#29B2FE]",
    bgClass: "bg-[#29b2fe]/20",
  },
  {
    name: "Fiverr",
    href: "https://www.fiverr.com/s/9d2xLGx",
    handle: "9d2xLGx",
    rating: 4.8,
    icon: SiFiverr,
    iconClass: "text-[#1DBF73]",
    bgClass: "bg-[#00b22d]/20",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/adilonam",
    handle: "@adilonam",
    rating: 4.8,
    icon: SiWhatsapp,
    iconClass: "text-[#25D366]",
    bgClass: "bg-[#25D366]/20",
  },
  {
    name: "Telegram",
    href: "https://t.me/adilonam",
    handle: "@adilonam",
    rating: 4.7,
    icon: SiTelegram,
    iconClass: "text-[#26A5E4]",
    bgClass: "bg-[#0088cc]/20",
  },
  {
    name: "Email",
    href: "mailto:adil.abbadi.1996@gmail.com",
    handle: "adil.abbadi.1996@gmail.com",
    rating: 4.8,
    icon: EnvelopeIcon,
    iconClass: "text-[#adc6ff]",
    bgClass: "bg-[#adc6ff]/20",
  },
] as const;

const SERVICES = [
  {
    title: "Web & Mobile Apps",
    description: "Custom web and mobile apps powered by AI",
    icon: CodeBracketIcon,
    accent: "primary" as const,
  },
  {
    title: "AI & Automation",
    description: "LLM integrations, chatbots, and automation workflows",
    icon: SparklesIcon,
    accent: "tertiary" as const,
  },
  {
    title: "Full-stack SaaS",
    description: "Full-stack SaaS products from MVP to production",
    icon: RocketLaunchIcon,
    accent: "secondary" as const,
  },
  {
    title: "Cloud Architecture",
    description: "API design, deployment, and cloud-ready architecture",
    icon: CloudIcon,
    accent: "primary" as const,
  },
];

const FEATURES = [
  {
    icon: CpuChipIcon,
    title: "AI-first",
    description: "LLMs, agents, and smart workflows baked into every build.",
    iconClass: "text-[#adc6ff]",
    bgClass: "bg-[#adc6ff]/10",
  },
  {
    icon: RocketLaunchIcon,
    title: "Ship fast",
    description: "From prototype to production with modern stacks.",
    iconClass: "text-[#d1bcff]",
    bgClass: "bg-[#d1bcff]/10",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Trusted partner",
    description: `${AGENCY_RATING}★ average rating across freelance platforms.`,
    iconClass: "text-[#00dbe9]",
    bgClass: "bg-[#00dbe9]/10",
  },
];

function StarRating({ rating, compact = false }: { rating: number; compact?: boolean }) {
  const fullStars = Math.floor(rating);
  const fraction = rating - fullStars;
  const starSize = compact ? "size-3" : "size-5";

  return (
    <div className="flex items-center gap-2" aria-label={`${rating} out of 5 stars`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => {
          if (index < fullStars) {
            return (
              <StarIcon key={index} className={`${starSize} text-amber-400`} />
            );
          }
          if (index === fullStars && fraction > 0) {
            return (
              <span key={index} className={`relative inline-block ${starSize}`}>
                <StarIcon className={`absolute inset-0 ${starSize} text-[#414755]`} />
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fraction * 100}%` }}
                >
                  <StarIcon className={`${starSize} text-amber-400`} />
                </span>
              </span>
            );
          }
          return (
            <StarIcon key={index} className={`${starSize} text-[#414755]`} />
          );
        })}
      </div>
      {!compact && (
        <span className="text-sm font-semibold text-[#e4e1e9]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[rgba(139,144,160,0.2)] bg-[rgba(19,19,24,0.4)] backdrop-blur-[20px] ${className}`}
    >
      {children}
    </div>
  );
}

export default function ApexRidgeLyticsPage() {
  const { assertAccess, status } = useSubscribedToolAccess("/apexridgelytics");
  const [projectBrief, setProjectBrief] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollToInquiry = () => {
    document.getElementById("project-inquiry")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlatformClick = (name: string, href: string) => {
    trackApexEvent({
      event: "apexridgelytics_platform_click",
      eventCategory: "ApexRidgeLytics",
      eventAction: "Platform Click",
      eventLabel: name,
      platform: name,
      platformUrl: href,
    });
  };

  const handleSubmit = async () => {
    trackApexEvent({
      event: "apexridgelytics_inquiry_submit",
      eventCategory: "ApexRidgeLytics",
      eventAction: "Submit Inquiry",
      eventLabel: "Project Brief",
    });

    if (!assertAccess()) return;

    const trimmed = projectBrief.trim();
    if (!trimmed) {
      setError("Please describe your project before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/apexridgelytics-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="relative -mx-4 -mt-4 overflow-hidden rounded-2xl sm:-mx-6 lg:-mx-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,40,92,0.15)_0%,rgba(19,19,24,1)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 top-20 size-96 rounded-full bg-[#4b8eff]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-32 bottom-40 size-80 rounded-full bg-[#7000ff]/10 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-6xl space-y-16 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Hero */}
          <section className="flex flex-col items-center gap-10 md:flex-row md:gap-12">
            <div className="z-10 flex w-full flex-col gap-6 md:w-1/2">
              <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#adc6ff]">
                AI Software Agency
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-[#adc6ff] sm:text-4xl lg:text-5xl">
                {LEGAL_BUSINESS_NAME}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#c1c6d7] sm:text-lg">
                Agency specialized in building software apps with AI — from MVPs and
                SaaS platforms to intelligent automation and production-ready products.{" "}
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#adc6ff]/30 bg-[rgba(19,19,24,0.4)] px-2.5 py-0.5 text-sm font-medium text-[#e4e1e9] align-middle backdrop-blur-[20px]"
                  aria-label="Wyoming, USA LLC"
                >
                  <span aria-hidden className="text-base leading-none">
                    🇺🇸
                  </span>
                  Wyoming, USA LLC
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <StarRating rating={AGENCY_RATING} />
                <span className="rounded-full border border-[#adc6ff]/30 bg-[rgba(19,19,24,0.4)] px-4 py-2 text-xs font-bold text-[#e4e1e9] backdrop-blur-[20px]">
                  Global Agency Rating: {AGENCY_RATING}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4">
                <Button
                  onClick={scrollToInquiry}
                  className="gap-2 rounded-full bg-[#4b8eff] px-8 py-6 text-sm font-medium text-[#00285c] shadow-[0_0_20px_rgba(173,198,255,0.15)] hover:bg-[#4b8eff]/90"
                  size="lg"
                >
                  Start Project
                  <ArrowTopRightOnSquareIcon className="size-4" />
                </Button>
              </div>
            </div>

            <ApexHeroMedia />
          </section>

          {/* Platforms */}
          <section id="platforms">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-semibold text-[#e4e1e9] sm:text-3xl">
                  Connect With Us
                </h2>
                <p className="mt-2 text-[#c1c6d7]">Find us across global platforms.</p>
              </div>
              <GlassPanel className="flex items-center gap-2 rounded-full border-[#adc6ff]/30 px-4 py-2">
                <StarIcon className="size-4 text-amber-400" />
                <span className="text-xs font-bold text-[#e4e1e9]">
                  Rated across multiple platforms
                </span>
              </GlassPanel>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {PLATFORMS.map(
                ({ name, href, handle, rating, icon: Icon, iconClass, bgClass }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                    onClick={() => handlePlatformClick(name, href)}
                  >
                    <GlassPanel className="flex flex-col items-center justify-center gap-3 p-4 transition-colors hover:bg-[#2a292f]/60">
                      <div
                        className={`flex size-10 items-center justify-center rounded-full ${bgClass}`}
                      >
                        <Icon className={`size-5 ${iconClass}`} aria-hidden />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-[#e4e1e9]">{name}</div>
                        <div className="mt-1 max-w-28 truncate text-[10px] text-[#c1c6d7]">
                          {handle}
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-amber-400">
                          <StarIcon className="size-2.5" />
                          {rating.toFixed(1)}
                        </div>
                      </div>
                    </GlassPanel>
                  </a>
                ),
              )}
            </div>
          </section>

          {/* Services */}
          <section id="services">
            <div className="mb-10 flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-[#e4e1e9] sm:text-3xl">
                What we build
              </h2>
              <div className="h-1 w-16 rounded-full bg-[#adc6ff]" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map(({ title, description, icon: Icon, accent }) => {
                const accentColors = {
                  primary: { icon: "text-[#adc6ff]", bg: "bg-[#adc6ff]/10" },
                  tertiary: { icon: "text-[#00dbe9]", bg: "bg-[#00dbe9]/10" },
                  secondary: { icon: "text-[#d1bcff]", bg: "bg-[#d1bcff]/10" },
                }[accent];

                return (
                  <GlassPanel
                    key={title}
                    className="flex flex-col gap-4 p-6 transition-transform duration-300 hover:-translate-y-2"
                  >
                    <div
                      className={`flex size-12 items-center justify-center rounded-lg ${accentColors.bg}`}
                    >
                      <Icon className={`size-7 ${accentColors.icon}`} aria-hidden />
                    </div>
                    <h3 className="text-lg font-bold text-[#e4e1e9]">{title}</h3>
                    <p className="text-sm text-[#c1c6d7]">{description}</p>
                  </GlassPanel>
                );
              })}
            </div>
          </section>

          {/* Feature highlights */}
          <section>
            <div className="grid gap-4 sm:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description, iconClass, bgClass }) => (
                <GlassPanel
                  key={title}
                  className="p-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className={`flex size-12 items-center justify-center rounded-lg ${bgClass}`}>
                    <Icon className={`size-8 ${iconClass}`} aria-hidden />
                  </div>
                  <h3 className="mt-4 font-bold text-[#e4e1e9]">{title}</h3>
                  <p className="mt-1 text-sm text-[#c1c6d7]">{description}</p>
                </GlassPanel>
              ))}
            </div>
          </section>

          {/* Project inquiry */}
          <section id="project-inquiry" className="mx-auto max-w-3xl pb-8">
            <GlassPanel className="relative overflow-hidden rounded-2xl border-[#adc6ff]/20 p-8 sm:p-12">
              <div
                className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[#adc6ff]/10 blur-3xl"
                aria-hidden
              />
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[#adc6ff]/10 text-[#adc6ff]">
                    <SparklesIcon className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#e4e1e9] sm:text-2xl">
                      Start your project
                    </h2>
                    <p className="text-sm text-[#c1c6d7]">
                      Describe your idea and connect with us
                    </p>
                  </div>
                </div>

                {submitted ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-xl border border-[#00dbe9]/30 bg-[#00dbe9]/10 p-4">
                      <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-[#00dbe9]" />
                      <div>
                        <p className="font-semibold text-[#e4e1e9]">Inquiry received</p>
                        <p className="mt-1 text-sm text-[#c1c6d7]">
                          Reach out directly on any platform above — WhatsApp and
                          Telegram are the fastest way to get a reply.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-[rgba(139,144,160,0.2)] bg-[rgba(19,19,24,0.4)] text-[#e4e1e9] backdrop-blur-[20px] hover:bg-[#2a292f]/60"
                      >
                        <a
                          href="https://wa.me/adilonam"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <SiWhatsapp className="size-4 text-[#25D366]" />
                          WhatsApp
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-[rgba(139,144,160,0.2)] bg-[rgba(19,19,24,0.4)] text-[#e4e1e9] backdrop-blur-[20px] hover:bg-[#2a292f]/60"
                      >
                        <a
                          href="https://t.me/adilonam"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <SiTelegram className="size-4 text-[#26A5E4]" />
                          Telegram
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-[rgba(139,144,160,0.2)] bg-[rgba(19,19,24,0.4)] text-[#e4e1e9] backdrop-blur-[20px] hover:bg-[#2a292f]/60"
                      >
                        <a href="mailto:adil.abbadi.1996@gmail.com">
                          <EnvelopeIcon className="size-4 text-[#adc6ff]" />
                          Email
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label
                      htmlFor="project-brief"
                      className="text-xs font-medium uppercase tracking-wider text-[#c1c6d7]"
                    >
                      Project brief
                    </label>
                    <textarea
                      id="project-brief"
                      className="mt-2 w-full min-h-[140px] resize-none rounded-lg border border-[rgba(65,71,85,0.3)] bg-[#131318]/50 px-3 py-3 text-sm text-[#e4e1e9] outline-none placeholder:text-[#8b90a0]/50 focus:border-[#adc6ff] focus:ring-1 focus:ring-[#adc6ff]"
                      placeholder="Tell us about your app idea, timeline, and budget…"
                      value={projectBrief}
                      onChange={(e) => setProjectBrief(e.target.value)}
                      disabled={isSubmitting || status === "loading"}
                    />
                    <p className="mt-2 text-xs text-[#8b90a0]">
                      Sign in with an active subscription to submit your inquiry.
                    </p>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || status === "loading"}
                      className="mt-4 w-full gap-2 rounded-lg bg-[#adc6ff] text-[#002e69] hover:bg-[#4b8eff] hover:text-[#00285c] sm:w-auto"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="size-5" />
                          Submit inquiry
                        </>
                      )}
                    </Button>
                  </>
                )}

                {error && (
                  <p className="mt-3 text-sm text-[#ffb4ab]" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </GlassPanel>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
