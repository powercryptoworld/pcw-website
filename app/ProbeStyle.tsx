export default function ProbeStyle() {
  return (
    <style
      id="pcw-probe"
      // This makes sure NextJS treats it as CSS, not JSX
      dangerouslySetInnerHTML={{
        __html: `
/* PROBE — highlight all swap pills/buttons so we KNOW styles are loaded */
.theme-future .glass.swapCard :is(button,.pill,.speed-pill,.px-3,[role="button"],[class*="pill"],[class*="speed"]){
  outline: 2px solid #00ffea !important;
  box-shadow: 0 0 0 2px #00ffea inset !important;
}
`}}
    />
  );
}
