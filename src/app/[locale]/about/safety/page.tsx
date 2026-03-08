"use client";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: "easeOut" },
  }),
};

interface PolicyItem {
  heading: string;
  body: string;
}

interface PolicySection {
  icon: string;
  title: string;
  color: string;
  items: PolicyItem[];
}

const sections: PolicySection[] = [
  {
    icon: "📜",
    title: "Platform Code of Conduct",
    color: "from-gold-50 to-amber-50 border-gold-200",
    items: [
      {
        heading: "Respectful communication only",
        body: "All messages, profile content, and interactions must be respectful and family-appropriate. Harassment, hate speech, threats, or inappropriate language will result in immediate account suspension.",
      },
      {
        heading: "Accurate information required",
        body: "You must provide truthful information — age, marital status, location, and intent. Misrepresentation is grounds for permanent removal.",
      },
      {
        heading: "No solicitation or spam",
        body: "Commercial solicitation, advertising, fundraising, or spamming other members is strictly prohibited.",
      },
      {
        heading: "One account per person",
        body: "Creating multiple accounts to evade bans or misrepresent yourself is not allowed.",
      },
      {
        heading: "No explicit content",
        body: "Uploading, sharing, or requesting explicit photos or inappropriate content in any form is a zero-tolerance violation.",
      },
    ],
  },
  {
    icon: "🔒",
    title: "Privacy & Data Protection",
    color: "from-teal-50 to-cyan-50 border-teal-200",
    items: [
      {
        heading: "Your contact details stay private",
        body: "Your phone and email are never displayed publicly. They are only shared with matches you explicitly approve or bureaus facilitating your match.",
      },
      {
        heading: "Photos are protected",
        body: "Profile photos are visible only to registered, verified members. We do not allow downloading or sharing of member photos.",
      },
      {
        heading: "Verification documents are secure",
        body: "ID/CNIC documents submitted for verification are encrypted and reviewed only by authorised staff. They are never shared with third parties.",
      },
      {
        heading: "Right to deletion",
        body: "Request full deletion of your account and all data at any time by emailing privacy@internationalrishta.com. We action all deletion requests within 7 days.",
      },
      {
        heading: "No data selling",
        body: "We never sell, rent, or trade your personal data to advertisers, brokers, or third-party marketers. Ever.",
      },
    ],
  },
  {
    icon: "🛡️",
    title: "Reporting & Blocking",
    color: "from-purple-50 to-violet-50 border-purple-200",
    items: [
      {
        heading: "Report any concern immediately",
        body: "Use the Report button on any profile or message to flag suspicious behaviour, fake profiles, or inappropriate conduct. All reports are reviewed within 24 hours.",
      },
      {
        heading: "Block without consequence",
        body: "Block any member instantly from their profile. Blocking is completely private — the blocked person is never notified.",
      },
      {
        heading: "Zero-tolerance offences",
        body: "These result in immediate permanent ban with no appeal: sharing explicit content, fraud or impersonation, threats of violence, and any involvement with minors.",
      },
      {
        heading: "Whistleblower protection",
        body: "Your identity is fully protected when you report a violation. We never disclose who filed a report.",
      },
    ],
  },
  {
    icon: "💬",
    title: "Safe Messaging Guidelines",
    color: "from-blue-50 to-sky-50 border-blue-200",
    items: [
      {
        heading: "Keep early conversations on-platform",
        body: "Use our secure in-app messaging and video call features before moving to external communication. In-app messages are moderated for your protection.",
      },
      {
        heading: "Never share financial information",
        body: "Do not share bank details, credit card numbers, or Easypaisa/JazzCash account information with any match.",
      },
      {
        heading: "Be cautious of urgency",
        body: "Scammers create artificial urgency ('emergency', 'travel money needed', 'family crisis'). If a match asks for money or gifts, report immediately.",
      },
      {
        heading: "Video verify before meeting",
        body: "Always conduct at least one video call through the platform before agreeing to meet in person. This confirms the person matches their profile photos.",
      },
    ],
  },
  {
    icon: "🤝",
    title: "Meeting in Person",
    color: "from-green-50 to-emerald-50 border-green-200",
    items: [
      {
        heading: "Always meet in public first",
        body: "First meetings must be in busy, public locations — cafes, restaurants, shopping centres. Never meet for the first time at a private residence.",
      },
      {
        heading: "Bring a family member or friend",
        body: "We strongly encourage bringing a trusted family member or friend, especially for first meetings. Bureau-facilitated meetings should always include a guardian for female members.",
      },
      {
        heading: "Share your plans",
        body: "Inform a trusted person of where you are going, who you are meeting, and when you expect to return. Share the venue address and your match's profile link.",
      },
      {
        heading: "Verify bureau agents",
        body: "Authorised agents carry a verifiable IR Agent ID. Confirm the agent's identity with the bureau office beforehand.",
      },
      {
        heading: "Trust your instincts",
        body: "If anything feels wrong, leave. You are never obligated to proceed with a meeting. Contact our safety team at any time.",
      },
    ],
  },
  {
    icon: "🏛️",
    title: "Bureau & Agent Verification",
    color: "from-orange-50 to-amber-50 border-orange-200",
    items: [
      {
        heading: "All bureaus are background-checked",
        body: "Every registered marriage bureau undergoes identity verification, business registration check, and manual review before approval.",
      },
      {
        heading: "Licensed agents only",
        body: "Bureau agents facilitating in-person meetings must carry a valid IR Agent License, verifiable at internationalrishta.com/verify.",
      },
      {
        heading: "Fee transparency",
        body: "All facilitation fees are disclosed upfront through the platform. No agent or bureau may charge undisclosed fees. The standard facilitation fee is PKR 20,000, of which PKR 16,000 goes to the bureau.",
      },
      {
        heading: "Bureau misconduct",
        body: "Report any bureau demanding extra payments, behaving inappropriately, or sharing your data without consent to bureaucomplaints@internationalrishta.com immediately.",
      },
    ],
  },
  {
    icon: "⚠️",
    title: "Scam Prevention",
    color: "from-red-50 to-rose-50 border-red-200",
    items: [
      {
        heading: "Common scam patterns to watch",
        body: "Be alert to: unusually professional photos, rapid declarations of love, avoiding video calls, claiming to work abroad, and eventually requesting money for travel, medical emergencies, or customs fees.",
      },
      {
        heading: "Verify independently",
        body: "Reverse image search profile photos using Google Images. Ask specific questions about their city, family, or neighbourhood that are hard to fake.",
      },
      {
        heading: "We will never ask you for money",
        body: "International Rishta will never ask you — or instruct a match to ask you — for money. Any such request is a scam.",
      },
      {
        heading: "Report romance fraud",
        body: "If you believe you have been defrauded, report to us at safety@internationalrishta.com AND to the FIA Cyber Crime Wing at nia.gov.pk or call 9911.",
      },
    ],
  },
];

const stats = [
  { value: "< 2 hrs", label: "Avg. report response" },
  { value: "100%", label: "Bureau background-checked" },
  { value: "0 tolerance", label: "For fraud or explicit content" },
  { value: "7 days", label: "Data deletion turnaround" },
];

export default function SafetyPage() {
  const locale = useLocale();

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gold-50/30 to-teal-50/30">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 start-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 end-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-400/40 px-4 py-1.5 rounded-pill text-gold-300 text-sm font-semibold mb-6">
              🛡️ Safety Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Your safety is our{" "}
              <span className="bg-gradient-to-r from-gold-400 to-teal-400 bg-clip-text text-transparent">
                highest priority
              </span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              International Rishta is built on respect, transparency, and trust.
              These policies protect every member — please read them carefully
              and follow them in every interaction.
            </p>
            <p className="mt-3 text-sm text-gray-400">
              Last updated: March 2026 · Effective immediately
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-gold-400">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className={`rounded-card border bg-gradient-to-br p-8 ${section.color}`}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">{section.icon}</span>
                {section.title}
              </h2>
              <div className="space-y-5">
                {section.items.map((item) => (
                  <div key={item.heading}>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.heading}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Emergency Support */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={8}
            variants={fadeUp}
            className="rounded-card border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              Emergency Support
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  In-app reporting
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Use the Report button on any profile or conversation. Our
                  moderation team responds within 2 hours.
                </p>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Safety email
                </h3>
                <a
                  href="mailto:safety@internationalrishta.com"
                  className="text-red-700 font-medium text-sm hover:underline"
                >
                  safety@internationalrishta.com
                </a>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Pakistan emergency numbers
                </h3>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  <li>
                    Police: <strong>15</strong>
                  </li>
                  <li>
                    Rescue / Ambulance: <strong>1122</strong>
                  </li>
                  <li>
                    FIA Cyber Crime (fraud): <strong>9911</strong>
                  </li>
                  <li>
                    Women Helpline: <strong>1099</strong>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={9}
            variants={fadeUp}
            className="rounded-card bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-3">Questions about safety?</h2>
            <p className="text-gray-300 mb-6 text-sm">
              Our team is here to help.{" "}
              <a
                href="mailto:safety@internationalrishta.com"
                className="text-gold-400 hover:text-gold-300 underline"
              >
                safety@internationalrishta.com
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${locale}/contact`}
                className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-pill font-semibold transition-all text-sm"
              >
                Contact Support
              </Link>
              <Link
                href={`/${locale}/privacy`}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-pill font-semibold transition-all text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-pill font-semibold transition-all text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
