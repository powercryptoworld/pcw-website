const fs = require('fs');
const file = 'app/page.tsx';
let s = fs.readFileSync(file, 'utf8');

function replaceHeaderBeforeTokenRow(titleNeedle, makeBlock) {
  const tokenIdx = s.indexOf(`title="${titleNeedle}"`);
  if (tokenIdx < 0) return false;

  // Walk backwards to the nearest header <div className="flex items-center ... mb-1">
  const hdrSig = '<div className="flex items-center';
  let start = s.lastIndexOf(hdrSig, tokenIdx);
  if (start < 0) return false;

  // Find the end of that header block (first closing </div> after start)
  const end = s.indexOf('</div>', start);
  if (end < 0 || end > tokenIdx) return false;

  const headerBlock = s.slice(start, end + 6); // include </div>
  // Sanity guard: only touch if the header mentions the small label ("You pay"/"You receive") OR has justify-between mb-1
  if (!/You (pay|receive)|justify-between/.test(headerBlock)) return false;

  const replacement = makeBlock();
  s = s.slice(0, start) + replacement + s.slice(end + 6);
  return true;
}

const payBlock = () => `
<div className="flex items-center gap-2 mb-1">
  {solPay ? (
    <TokenChip family="sol" symbol={solPay?.symbol} name={solPay?.name} mint={solPay?.mint} onClear={() => setSolPay(null)} />
  ) : (
    <TokenChip family="evm" chainId={payToken.chainId} address={payToken.address} symbol={payToken.symbol} name={payToken.name} logoURI={payToken.logoURI} />
  )}
  <button
    onClick={() => setPicker("pay")}
    className="text-xs px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10"
  >
    Pay token
  </button>
</div>
`.trim();

const recvBlock = () => `
<div className="flex items-center gap-2 mb-1">
  {solReceive ? (
    <TokenChip family="sol" symbol={solReceive?.symbol} name={solReceive?.name} mint={solReceive?.mint} onClear={() => setSolReceive(null)} />
  ) : (
    <TokenChip family="evm" chainId={receiveToken.chainId} address={receiveToken.address} symbol={receiveToken.symbol} name={receiveToken.name} logoURI={receiveToken.logoURI} />
  )}
  <button
    onClick={() => setPicker("receive")}
    className="text-xs px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10"
  >
    Receive token
  </button>
</div>
`.trim();

const ok1 = replaceHeaderBeforeTokenRow('You pay', payBlock);
const ok2 = replaceHeaderBeforeTokenRow('You receive', recvBlock);

if (!ok1 && !ok2) {
  console.error('No header blocks replaced (structure differs).');
  process.exit(2);
}
fs.writeFileSync(file, s);
console.log(`Replaced: ${ok1 ? 'pay' : '-'} ${ok2 ? 'receive' : '-'}`);
