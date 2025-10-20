"use client";
import React from "react";

export default function LogoProbe() {
  const src = `/api/evm-logo?chainId=56&address=0xd955c9ba56fb1ab30e34766e252a97ccce3d31a6`;
  return (
    <div style={{marginBottom: 12, padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.06)"}}>
      <div style={{fontSize:12, opacity:0.8, marginBottom:6}}>Dev Logo Probe (XPIN on BNB-56)</div>
      <img src={src} alt="XPIN" width="24" height="24" style={{display:"inline-block", verticalAlign:"middle"}} />
      <code style={{marginLeft:8, fontSize:12, opacity:0.8}}>{src}</code>
    </div>
  );
}
