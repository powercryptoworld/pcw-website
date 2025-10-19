const fs = require('fs');
const p = 'components/SwapCard.tsx';
let s = fs.readFileSync(p, 'utf8');

// Remove an em-dash right before our button group in the fee row
// (e.g., "… (fallback)) — <BuildTxButton />")
s = s.replace(/—\s*(?=<\s*BuildTxButton)/, '');
// Also handle the case where EstimateFeeButton appears first
s = s.replace(/—\s*(?=<\s*EstimateFeeButton)/, '');

fs.writeFileSync(p, s);
console.log('Cleaned em-dash before fee buttons.');
