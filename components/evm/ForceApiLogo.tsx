"use client";
import { useEffect } from "react";

function chooseAnchor(row: HTMLElement): HTMLElement {
  const leaves = Array.from(row.querySelectorAll<HTMLElement>('*')).filter(el => el.childElementCount === 0);
  const dashLeaf = leaves.find(el => /—/.test(el.textContent ?? ''));
  if (dashLeaf?.parentElement) return dashLeaf.parentElement as HTMLElement;

  const addrLeaf = leaves.find(el => /0x[a-f0-9]{6,}/i.test(el.textContent ?? ''));
  if (addrLeaf?.parentElement?.previousElementSibling) {
    const prev = addrLeaf.parentElement.previousElementSibling as HTMLElement;
    const txt = (prev.textContent ?? "").trim();
    if (txt && !/0x[a-f0-9]{6,}/i.test(txt)) return prev;
  }
  const firstText = leaves.find(el => (el.textContent ?? "").trim());
  return firstText?.parentElement ?? row;
}

export default function ForceApiLogo() {
  useEffect(() => {
    const scan = () => {
      const rows = document.querySelectorAll<HTMLElement>('[data-chain-id][data-address]');
      rows.forEach((row) => {
        const chainId = row.getAttribute('data-chain-id')?.trim();
        const address = row.getAttribute('data-address')?.trim()?.toLowerCase();
        if (!chainId || !address) return;

        // If we've already forced one in, skip
        if (row.querySelector('img.pcw-force-api-logo')) return;

        const anchor = chooseAnchor(row);
        const img = document.createElement('img');
        img.className = 'pcw-force-api-logo';
        img.alt = 'token logo';
        img.src = `/api/evm-logo?chainId=${encodeURIComponent(chainId)}&address=${encodeURIComponent(address)}`;
        Object.assign(img.style, {
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          verticalAlign: 'middle',
          marginRight: '8px',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.15) inset',
          display: 'inline-block',
          pointerEvents: 'none',
        } as CSSStyleDeclaration);

        img.onerror = () => { img.style.display = 'none'; }; // hide if truly missing
        anchor.insertBefore(img, anchor.firstChild);
      });
    };

    scan();
    const id = window.setInterval(scan, 800);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
