"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("common.footer");

  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/assets/logo-golden.png"
                alt="International Rishta"
                width={160}
                height={53}
                className="h-12 w-auto"
              />
              <span className="text-base font-semibold text-white tracking-tight">
                Internationalrishta.com
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting hearts worldwide through verified profiles and
              meaningful relationships.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">
              Contact Us
            </h3>
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium text-gray-300">Email:</span>{" "}
                <a
                  href="mailto:info@internationalrishta.com"
                  className="hover:text-gold-400 transition-colors"
                >
                  info@internationalrishta.com
                </a>
              </p>
              <p className="text-gray-400 leading-relaxed">
                8 The Green STE A<br />
                Dover, DE 19901
                <br />
                United States
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-gold-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-gold-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-gold-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-gold-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2024 International Rishta — All rights reserved</p>
            <p>
              A project by{" "}
              <a
                href="https://imjd.asia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300 transition-colors font-medium"
              >
                IMJD Your Digital Media Partner
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
