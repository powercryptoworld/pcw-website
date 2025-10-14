"use client";
import React from "react";

export default function ContactDock() {
  return (
    <aside className="contact-dock" role="complementary" aria-label="Get Connected">
      <span className="label">GET CONNECTED</span>
      <a
        className="contact-btn"
        href="mailto:pcw@powercryptoworld.com"
        aria-label="Contact Power Crypto World via email"
      >
        Contact
      </a>
    </aside>
  );
}
