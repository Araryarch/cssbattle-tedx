"use client";

import { Zap, Github, Twitter, Linkedin, Youtube, Flame, Trophy, Users, MessageCircle } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Challenges", href: "/battle" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Contests", href: "/contests" },
    { label: "Tutorials", href: "/tutorials" },
  ],
  community: [
    { label: "Discord", href: "https://discord.gg/stylewars" },
    { label: "Forum", href: "/forum" },
    { label: "Blog", href: "/blog" },
    { label: "Events", href: "/events" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API", href: "/api" },
    { label: "Changelog", href: "/changelog" },
    { label: "Status", href: "/status" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press Kit", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
};

const socialLinks = [
  { icon: Github, href: "https://github.com/stylewars", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/stylewars", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/stylewars", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@stylewars", label: "YouTube" },
  { icon: MessageCircle, href: "https://discord.gg/stylewars", label: "Discord" },
];

const stats = [
  { icon: Flame, value: "10K+", label: "Developers" },
  { icon: Trophy, value: "500+", label: "Challenges" },
  { icon: Users, value: "50K+", label: "Submissions" },
];

export default function Footer() {
  return (
    <footer className="py-16 border-t border-white/5 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 py-8 border-b border-white/5 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-primary mb-1">
                <stat.icon className="w-5 h-5" />
                <span className="text-2xl font-black">{stat.value}</span>
              </div>
              <span className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-black text-2xl tracking-tight text-white">
                Style<span className="text-primary">Wars</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm mb-4">
              The ultimate CSS battle platform. Compete, learn, and master your frontend skills.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:bg-primary hover:text-white transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-white/40 hover:text-primary text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Community</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-white/40 hover:text-primary text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-white/40 hover:text-primary text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-white/5 rounded-xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white mb-1">Stay in the loop</h4>
            <p className="text-white/40 text-sm">Get the latest challenges and updates delivered to your inbox.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary w-full md:w-64"
            />
            <button className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5">
          <p className="font-mono text-xs text-white/30">
            © 2024 StyleWars. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-wider">
            <a href="#" className="text-white/30 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/30 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white/30 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
          <div className="flex items-center gap-2 text-white/30 text-xs">
            <span>Built with</span>
            <span className="text-red-500">♥</span>
            <span>for developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
