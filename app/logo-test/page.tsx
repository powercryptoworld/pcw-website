"use client";
import React, { useState } from "react";

const TOKENS = [
  { chainId: 56, addr: "0x9370a51C9F2Ae6B23719ab74f05261891C609A23", label: "PCW (56)" },
  { chainId: 56, addr: "0xD955c9bA56Fb1AB30e34766e252A97ccCE3D31A6", label: "XPIN (56)" },
];

function One({ chainId, addr, label }: { chainId: number; addr: string; label: string }) {
  const lower = addr.toLowerCase();
  const [src, setSrc] = useState<string>(`/token-logos/${chainId}/${lower}.svg`);
  const [step, setStep] = useState<number>(0);

  const next = () => {
    const tries = [
      `/token-logos/${chainId}/${lower}.svg`,
      `/token-logos/${chainId}/${lower}.png`,
      `/api/evm-logo?chainId=${chainId}&address=${addr}`,
    ];
    const n = step + 1;
    if (n < tries.length) {
      setStep(n);
      setSrc(tries[n]);
    }
  };

  return (
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
      <div style={{width:24,height:24,display:"inline-flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,overflow:"hidden"}}>
        <img
          src={src}
          width={22}
          height={22}
          alt="logo"
          onError={next}
          style={{display:"block"}}
        />
      </div>
      <div style={{color:"#fff"}}>
        <div>{label}</div>
        <div style={{fontSize:12,opacity:0.8}}>{addr}</div>
        <div style={{fontSize:11,opacity:0.7}}>src: {src}</div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div style={{padding:24}}>
      <h1 style={{color:"#fff",fontSize:22,marginBottom:12}}>Logo Test</h1>
      <p style={{color:"#ddd",fontSize:14,marginBottom:16}}>This page tries local override → PNG → /api/evm-logo.</p>
      {TOKENS.map(t => <One key={t.addr} {...t} />)}
    </div>
  );
}
