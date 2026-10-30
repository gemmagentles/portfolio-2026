// Makes the home page's "Responsive, accessible and future-proof." devices picture (partials/work-browser.html): two
// plain black monitors at the back, angled in towards each other, and a MacBook in front in the middle, all
// following one feature, Nueva Gold's Services section:
// - left monitor: its ACF repeater fields being edited in WordPress
// - MacBook: its WordPress template in VS Code, with Claude Code beside it and the build in the terminal
// - right monitor: the live site in Chrome with DevTools open, checking it at phone size (device toolbar on, iPhone 12
//   Pro), the hero heading highlighted and its mobile styles in the Styles pane
// No desk, like a product shot: they stand on the white page, tied together by one soft pool of shadow, with a
// contact shadow under each and a faint reflection under the MacBook, so nothing floats.
//
// WordPress, Chrome and VS Code are drawn here in HTML and CSS (illustrations, not screenshots); Chrome's phone view
// wraps Nueva Gold's phone capture (work/nueva-gold/pages/phone.webp, 390 x 844). They're saved in
// public/images/workflow/ as imac-left.webp, imac-right.webp and laptop.webp; any of them can be replaced with a real
// screenshot of the same name. Then the devices are drawn around them as public/images/workflow/devices.webp
// (1480 x 850, see-through).
//
// Run:  node scripts/workflow-mockup.js          (redraws the screens, then the devices)
//       node scripts/workflow-mockup.js --keep   (keeps the screens already there, e.g. real screenshots)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const CHROME = process.env.CHROME_PATH || 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const dir = path.join(root, 'public', 'images', 'workflow');
const WIDTH = 1480; // the scene is laid out 1600 wide, then 60px of empty space is trimmed off each side
const HEIGHT = 850; // room below the MacBook (y 787) for its shadow and reflection to fade out

const PURPLE = '#a66be3'; // --purple-color: VS Code's status bar
const base = `* { box-sizing: border-box; margin: 0; padding: 0; } html, body { overflow: hidden; }
  body { font: 11px/1.4 'Segoe UI', system-ui, sans-serif; }`;
const dataUrl = (file) => `data:image/webp;base64,${fs.readFileSync(file).toString('base64')}`;

// Right monitor screen (955 x 530): Chrome with DevTools docked on the right and the device toolbar on, showing
// nuevagold.com as an iPhone 12 Pro (390 x 844) would. The hero heading is being inspected: highlighted on the page,
// selected in the Elements tree, and its phone-size rule (inside a max-width media query) shown in Styles.
const imacRight = (phoneUrl) => `<!doctype html><meta charset="utf-8"><style>${base}
  body { width: 955px; height: 530px; display: grid; grid-template: 28px 30px 1fr / 1fr 372px; background: #fff; color: #1f1f1f; }
  .tabs { grid-column: 1 / -1; background: #dfe3e8; display: flex; align-items: flex-end; gap: 6px; padding: 0 10px; }
  .tabs i { width: 9px; height: 9px; border-radius: 50%; background: #c4c7cc; align-self: center; }
  .tabs i:nth-child(3) { margin-right: 8px; }
  .tab { background: #fff; border-radius: 8px 8px 0 0; padding: 6px 12px; font-size: 10px; display: flex; align-items: center; gap: 6px; width: 170px; }
  .tab b { width: 10px; height: 10px; border-radius: 2px; background: #1c2447; border-right: 3px solid #c19a3e; }
  .tab span { margin-left: auto; color: #777; }
  .tab--off { background: none; color: #555; }
  .bar { grid-column: 1 / -1; display: flex; align-items: center; gap: 12px; padding: 0 10px; border-bottom: 1px solid #dadce0; color: #5f6368; font-size: 12px; }
  .url { flex: 1; background: #f1f3f4; border-radius: 12px; padding: 4px 12px; font-size: 10.5px; color: #1f1f1f; }
  .url em { font-style: normal; color: #5f6368; }
  .view { display: grid; grid-template-rows: 24px 1fr; background: #f1f1f1; min-width: 0; }
  .device-bar { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 9.5px; color: #3c3c3c; background: #fff; border-bottom: 1px solid #dadce0; }
  .device-bar span { padding: 2px 6px; border-radius: 3px; } .device-bar .drop::after { content: ' ▾'; color: #777; }
  .device-bar .num { border: 1px solid #dadce0; padding: 1px 6px; }
  .stage { position: relative; display: grid; place-items: center; }
  .phone { position: relative; width: 196px; height: 424px; background: url('${phoneUrl}') 0 0 / 100% auto no-repeat; box-shadow: 0 0 0 1px #c9c9c9, 0 4px 14px rgb(0 0 0 / 0.12); }
  .hl { position: absolute; left: 10px; right: 10px; top: 138px; height: 72px; background: rgb(111 168 220 / 0.55); box-shadow: 0 0 0 1px rgb(26 115 232 / 0.6); }
  .tip { position: absolute; left: 10px; top: 108px; background: #fff; border-radius: 3px; padding: 4px 7px; font: 9px Consolas, monospace; box-shadow: 0 1px 5px rgb(0 0 0 / 0.25); white-space: nowrap; }
  .tip b { color: #881280; font-weight: 400; } .tip i { color: #1a1aa6; font-style: normal; } .tip span { color: #777; margin-left: 8px; }
  .dev { border-left: 1px solid #cbcdd1; display: grid; grid-template-rows: 26px 1fr 1fr; font-size: 9.5px; min-width: 0; }
  .dev__tabs { display: flex; align-items: stretch; border-bottom: 1px solid #dadce0; background: #f3f3f3; }
  .dev__tabs span { display: flex; align-items: center; padding: 0 8px; color: #555; }
  .dev__tabs .icon { padding: 0 6px; } .dev__tabs .icon i { width: 11px; height: 11px; border: 1.5px solid #666; border-radius: 2px; }
  .dev__tabs .icon.on i { border-color: #1a73e8; width: 8px; height: 13px; border-radius: 2px; }
  .dev__tabs .on-tab { color: #1f1f1f; box-shadow: inset 0 -2px #1a73e8; }
  .tree { padding: 6px 0; font: 9.5px/1.65 Consolas, monospace; color: #1f1f1f; overflow: hidden; white-space: nowrap; border-bottom: 1px solid #dadce0; }
  .tree div { padding-left: calc(10px + var(--d, 0) * 12px); }
  .tree .sel { background: #cfe8fc; }
  .t { color: #881280; } .a { color: #994500; } .v { color: #1a1aa6; } .c { color: #777; }
  .styles { display: grid; grid-template-rows: 22px 1fr; overflow: hidden; }
  .styles__tabs { display: flex; gap: 12px; align-items: center; padding: 0 10px; background: #f3f3f3; border-bottom: 1px solid #dadce0; color: #555; }
  .styles__tabs b { color: #1f1f1f; font-weight: 400; box-shadow: 0 5px 0 -3px #1a73e8; }
  .rules { padding: 6px 10px; font: 9.5px/1.6 Consolas, monospace; overflow: hidden; }
  .rule { padding-bottom: 6px; margin-bottom: 6px; border-bottom: 1px solid #eee; }
  .rule .src { float: right; color: #1a73e8; text-decoration: underline; font-family: 'Segoe UI', sans-serif; font-size: 8.5px; }
  .media { color: #555; } .p { color: #c80000; } .x { text-decoration: line-through; color: #999; }
  .rule div { padding-left: 14px; }
</style>
<div class="tabs"><i></i><i></i><i></i><div class="tab"><b></b>Nueva Gold<span>✕</span></div><div class="tab tab--off">Services · Nueva Gold</div></div>
<div class="bar"><span>←</span><span>→</span><span>↻</span><div class="url"><em>🔒 </em>nuevagold.com</div><span>☆</span><span>⋮</span></div>
<div class="view">
  <div class="device-bar"><span class="drop">Dimensions: iPhone 12 Pro</span><span class="num">390</span>×<span class="num">844</span><span class="drop">100%</span><span class="drop">No throttling</span></div>
  <div class="stage">
    <div class="phone">
      <div class="hl"></div>
      <div class="tip"><b>h1</b><i>.hero__title</i><span>350 × 136</span></div>
    </div>
  </div>
</div>
<div class="dev">
  <div class="dev__tabs"><span class="icon"><i></i></span><span class="icon on"><i></i></span><span class="on-tab">Elements</span><span>Console</span><span>Sources</span><span>Network</span><span>Lighthouse</span></div>
  <div class="tree">
    <div><span class="t">&lt;body</span> <span class="a">class</span>=<span class="v">"home page"</span><span class="t">&gt;</span></div>
    <div style="--d:1">▸ <span class="t">&lt;header</span> <span class="a">class</span>=<span class="v">"site-header"</span><span class="t">&gt;</span>…<span class="t">&lt;/header&gt;</span></div>
    <div style="--d:1">▾ <span class="t">&lt;main&gt;</span></div>
    <div style="--d:2">▾ <span class="t">&lt;section</span> <span class="a">class</span>=<span class="v">"hero"</span><span class="t">&gt;</span></div>
    <div style="--d:3">▸ <span class="t">&lt;div</span> <span class="a">class</span>=<span class="v">"hero__stars"</span><span class="t">&gt;</span>…<span class="t">&lt;/div&gt;</span></div>
    <div style="--d:3" class="sel"><span class="t">&lt;h1</span> <span class="a">class</span>=<span class="v">"hero__title"</span><span class="t">&gt;</span>Turning Ambition…<span class="t">&lt;/h1&gt;</span> <span class="c">== $0</span></div>
    <div style="--d:3"><span class="t">&lt;p</span> <span class="a">class</span>=<span class="v">"hero__text"</span><span class="t">&gt;</span>…<span class="t">&lt;/p&gt;</span></div>
    <div style="--d:3"><span class="t">&lt;a</span> <span class="a">class</span>=<span class="v">"button"</span> <span class="a">href</span>=<span class="v">"/contact/"</span><span class="t">&gt;</span>…<span class="t">&lt;/a&gt;</span></div>
    <div style="--d:2">▸ <span class="t">&lt;section</span> <span class="a">class</span>=<span class="v">"services"</span><span class="t">&gt;</span>…<span class="t">&lt;/section&gt;</span></div>
  </div>
  <div class="styles">
    <div class="styles__tabs"><b>Styles</b><span>Computed</span><span>Layout</span><span>Accessibility</span></div>
    <div class="rules">
      <div class="rule"><span class="src">_hero.scss:42</span><span class="media">@media (max-width: 767px) {</span><div>.hero__title {</div><div><span class="p">font-size</span>: clamp(2.5rem, 10vw, 3rem);</div><div><span class="p">line-height</span>: 1.1;</div><div>}</div>}</div>
      <div class="rule"><span class="src">_hero.scss:18</span>.hero__title {<div><span class="x"><span class="p">font-size</span>: 5rem;</span></div><div><span class="p">font-family</span>: Cormorant, serif;</div><div><span class="p">color</span>: <span class="v">#fff</span>;</div>}</div>
    </div>
  </div>
</div>`;

// MacBook screen (643 x 395): the Services template in VS Code, the build in the terminal, and Claude Code beside it.
const laptop = () => `<!doctype html><meta charset="utf-8"><style>${base}
  body { width: 643px; height: 395px; background: #1e1e1e; color: #ccc; display: grid; grid-template: 22px 1fr 18px / 34px 118px 1fr 196px; }
  .title { grid-column: 1 / -1; background: #323233; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #aaa; }
  .act { background: #333; display: grid; align-content: start; gap: 14px; padding-top: 10px; justify-items: center; }
  .act i { width: 16px; height: 16px; border: 2px solid #858585; border-radius: 3px; } .act i:first-child { border-color: #fff; }
  .tree { background: #252526; padding: 6px 0; font-size: 10px; }
  .tree p { padding: 2px 10px; white-space: nowrap; } .tree .h { font-size: 9px; letter-spacing: 0.06em; color: #bbb; padding-bottom: 6px; }
  .tree .d { color: #ccc; } .tree .f { padding-left: 22px; color: #c5c5c5; } .tree .on { background: #37373d; color: #fff; }
  .ed { background: #1e1e1e; overflow: hidden; display: grid; grid-template-rows: 22px 1fr 108px; }
  .tab { background: #252526; height: 22px; display: flex; } .tab span { background: #1e1e1e; color: #fff; padding: 4px 10px; font-size: 10px; }
  .code { font: 9.5px/1.55 Consolas, monospace; padding: 5px 0 0; counter-reset: l; overflow: hidden; }
  .code div { padding-left: 30px; position: relative; white-space: pre; }
  .code div::before { counter-increment: l; content: counter(l); position: absolute; left: 0; width: 20px; text-align: right; color: #6e7681; }
  .t { color: #569cd6; } .a { color: #9cdcfe; } .s { color: #ce9178; } .fn { color: #dcdcaa; } .k { color: #c586c0; }
  .term { border-top: 1px solid #3c3c3c; padding: 0 10px; font: 9.5px/1.5 Consolas, monospace; color: #ccc; overflow: hidden; }
  .term h4 { font: 600 8.5px 'Segoe UI', sans-serif; letter-spacing: 0.06em; color: #e7e7e7; padding: 5px 0 3px; display: flex; gap: 12px; }
  .term h4 span { color: #8b8b8b; } .term h4 b { border-bottom: 1px solid #e7e7e7; padding-bottom: 2px; font-weight: 600; }
  .term .pr { color: #4ec9b0; } .term .ok { color: #89d185; } .term .dim { color: #8b8b8b; }
  .term .cur { display: inline-block; width: 6px; height: 10px; background: #ccc; vertical-align: -1px; }
  .ai { background: #252526; border-left: 1px solid #3c3c3c; padding: 8px; display: grid; align-content: start; gap: 7px; font-size: 9.5px; }
  .ai h3 { font-size: 10px; color: #fff; font-weight: 600; display: flex; align-items: center; gap: 6px; } .ai h3 i { width: 10px; height: 10px; border-radius: 3px; background: #d97757; }
  .msg { background: #37373d; border-radius: 6px; padding: 6px 7px; color: #ddd; } .me { background: #2b3a4a; }
  .tool { border: 1px solid #3c3c3c; border-radius: 5px; padding: 4px 7px; color: #9cdcfe; font-family: Consolas, monospace; font-size: 9px; }
  .tool b { color: #4ec9b0; font-weight: 400; }
  .box { border: 1px solid #555; border-radius: 6px; padding: 6px 7px; color: #888; }
  .status { grid-column: 1 / -1; background: ${PURPLE}; color: #fff; font-size: 9.5px; display: flex; gap: 14px; align-items: center; padding: 0 8px; }
</style>
<div class="title">services.php — nueva-gold</div>
<div class="act"><i></i><i></i><i></i><i></i></div>
<div class="tree"><p class="h">EXPLORER</p><p class="d">▾ nueva-gold</p><p class="d" style="padding-left:16px">▾ template-parts</p><p class="f">hero.php</p><p class="f on">services.php</p><p class="f">contact-form.php</p><p class="d" style="padding-left:16px">▾ scss</p><p class="f">_hero.scss</p><p class="f">_services.scss</p><p class="d" style="padding-left:16px">▸ acf-json</p><p class="f" style="padding-left:16px">functions.php</p><p class="f" style="padding-left:16px">package.json</p></div>
<div class="ed"><div class="tab"><span>services.php</span></div><div class="code"><div><span class="t">&lt;?php</span> <span class="k">if</span> (<span class="fn">have_rows</span>(<span class="s">'services'</span>)) : <span class="t">?&gt;</span></div><div>&lt;<span class="t">section</span> <span class="a">class</span>=<span class="s">"services"</span>&gt;</div><div>  &lt;<span class="t">h2</span>&gt;<span class="t">&lt;?=</span> <span class="fn">get_field</span>(<span class="s">'heading'</span>) <span class="t">?&gt;</span>&lt;/<span class="t">h2</span>&gt;</div><div>  &lt;<span class="t">div</span> <span class="a">class</span>=<span class="s">"services__grid"</span>&gt;</div><div>  <span class="t">&lt;?php</span> <span class="k">while</span> (<span class="fn">have_rows</span>(<span class="s">'services'</span>)) :</div><div>    <span class="fn">the_row</span>(); <span class="t">?&gt;</span></div><div>    &lt;<span class="t">article</span> <span class="a">class</span>=<span class="s">"service-card"</span>&gt;</div><div>      <span class="t">&lt;?=</span> <span class="fn">wp_get_attachment_image</span>(</div><div>        <span class="fn">get_sub_field</span>(<span class="s">'image'</span>), <span class="s">'large'</span>) <span class="t">?&gt;</span></div><div>      &lt;<span class="t">h3</span>&gt;<span class="t">&lt;?=</span> <span class="fn">get_sub_field</span>(<span class="s">'title'</span>) <span class="t">?&gt;</span>&lt;/<span class="t">h3</span>&gt;</div><div>      &lt;<span class="t">p</span>&gt;<span class="t">&lt;?=</span> <span class="fn">get_sub_field</span>(<span class="s">'text'</span>) <span class="t">?&gt;</span>&lt;/<span class="t">p</span>&gt;</div><div>    &lt;/<span class="t">article</span>&gt;</div><div>  <span class="t">&lt;?php</span> <span class="k">endwhile</span>; <span class="t">?&gt;</span></div><div>  &lt;/<span class="t">div</span>&gt;</div><div>&lt;/<span class="t">section</span>&gt;</div><div><span class="t">&lt;?php</span> <span class="k">endif</span>; <span class="t">?&gt;</span></div></div><div class="term"><h4><span>PROBLEMS</span><span>OUTPUT</span><b>TERMINAL</b></h4><div><span class="pr">$</span> npm run build</div><div class="dim">&gt; sass scss/main.scss dist/main.css</div><div class="ok">✓ Compiled in 0.42s</div><div><span class="pr">$</span> git commit -m "NG-21 Services repeater"</div><div class="dim">[feature/NG-21 9c1e4b2] 2 files changed</div><div><span class="pr">$</span> <span class="cur"></span></div></div></div>
<div class="ai"><h3><i></i>Claude Code</h3>
  <div class="msg me">Build the Services block from the ACF repeater (NG-21)</div>
  <div class="msg">I'll loop the rows into cards, using the image, title and text fields.</div>
  <div class="tool"><b>Edit</b> template-parts/services.php</div>
  <div class="tool"><b>Edit</b> scss/_services.scss</div>
  <div class="tool"><b>Bash</b> npm run build</div>
  <div class="msg">Three cards render from ACF. Checked at 1440 and 390.</div>
  <div class="box">Reply…</div>
</div>
<div class="status"><span>● feature/NG-21-services</span><span>✓ 0 problems</span><span style="margin-left:auto">PHP</span></div>`;

// Left monitor screen (955 x 530): WordPress, editing the home page's Services repeater.
const imacLeft = () => `<!doctype html><meta charset="utf-8"><style>${base}
  body { width: 955px; height: 530px; display: grid; grid-template-columns: 130px 1fr; grid-template-rows: 24px 1fr; background: #f0f0f1; color: #1d2327; }
  .bar { grid-column: 1 / -1; background: #1d2327; color: #f0f0f1; display: flex; align-items: center; gap: 16px; padding: 0 12px; font-size: 10.5px; }
  .bar b { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #c3c4c7; }
  .menu { background: #1d2327; color: #f0f0f1; padding-top: 6px; font-size: 11px; }
  .menu div { padding: 7px 12px; } .menu .on { background: #2271b1; } .menu .sub { color: #72aee6; padding-left: 22px; font-size: 10.5px; }
  .main { display: grid; grid-template-columns: 1fr 200px; gap: 14px; padding: 14px 16px; align-content: start; }
  h1 { grid-column: 1 / -1; font-size: 18px; font-weight: 400; }
  .box { background: #fff; border: 1px solid #c3c4c7; margin-bottom: 10px; }
  .box h2 { font-size: 12px; font-weight: 600; padding: 8px 12px; display: flex; justify-content: space-between; }
  .box.open h2 { border-bottom: 1px solid #dcdcde; } .box.closed h2 { color: #50575e; }
  .field { padding: 8px 12px 9px; }
  .field label { display: block; font-weight: 600; font-size: 10.5px; margin-bottom: 5px; }
  .input { border: 1px solid #8c8f94; border-radius: 3px; padding: 5px 7px; font-size: 11px; background: #fff; }
  .rep { border: 1px solid #dcdcde; font-size: 10.5px; }
  .rep div { display: grid; grid-template-columns: 22px 46px minmax(0, 1fr) minmax(0, 1.6fr); align-items: center; border-top: 1px solid #dcdcde; }
  .rep div:first-child { border-top: 0; background: #f6f7f7; font-weight: 600; font-size: 10px; }
  .rep span { padding: 6px 7px; } .rep span:first-child { text-align: center; color: #50575e; }
  .rep i { display: block; width: 32px; height: 26px; background: #1c2447; border-left: 6px solid #c19a3e; border-radius: 1px; }
  .rep em { font-style: normal; color: #50575e; display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .btn { display: inline-block; background: #2271b1; color: #fff; padding: 6px 14px; border-radius: 3px; font-size: 11px; }
  .ghost { background: #f6f7f7; color: #2271b1; border: 1px solid #2271b1; margin-top: 7px; }
  .side .box div { padding: 9px 12px; font-size: 10.5px; border-top: 1px solid #f0f0f1; }
  .side .box div:last-child { display: flex; justify-content: space-between; align-items: center; background: #f6f7f7; }
  .side a { color: #b32d2e; }
</style>
<div class="bar"><b></b><span>Nueva Gold</span><span>+ New</span><span>View Page</span><span style="margin-left:auto">Howdy, Gemma</span></div>
<div class="menu"><div>Dashboard</div><div>Posts</div><div>Media</div><div class="on">Pages</div><div class="sub">All Pages</div><div class="sub">Add New Page</div><div>Comments</div><div>Appearance</div><div>Plugins</div><div>Users</div><div>ACF</div><div>Settings</div></div>
<div class="main">
  <h1>Edit Page: Home</h1>
  <div>
    <div class="box closed"><h2>Home · Hero <span>▸</span></h2></div>
    <div class="box open"><h2>Home · Services <span>▾</span></h2>
      <div class="field"><label>Heading</label><div class="input">The Transformation Begins With Our Services</div></div>
      <div class="field"><label>Services (repeater)</label>
        <div class="rep">
          <div><span></span><span>Image</span><span>Title</span><span>Text</span></div>
          <div><span>1</span><span><i></i></span><span>Brand Strategy &amp; Management</span><span><em>We make people obsess over your brand the way you do.</em></span></div>
          <div><span>2</span><span><i></i></span><span>Content and Social</span><span><em>Let the world see your true power.</em></span></div>
          <div><span>3</span><span><i></i></span><span>Performance</span><span><em>A brand as bold as yours deserves a digital strategy just as powerful.</em></span></div>
        </div>
        <span class="btn ghost">Add Row</span>
      </div>
    </div>
  </div>
  <div class="side">
    <div class="box"><h2>Publish</h2><div>Status: <b>Published</b></div><div>Visibility: <b>Public</b></div><div><a>Move to Trash</a><span class="btn">Update</span></div></div>
    <div class="box"><h2>Page Attributes</h2><div>Template: Front Page</div></div>
  </div>
</div>`;

// The scene: two plain black monitors at the back, each turned 10° in towards the other (outer edges forward) with a
// 10px gap between them, and the MacBook (85% size) in front in the middle, its top 38px over the monitors' bottom
// edges. No desk: one wide, very soft pool of shadow sits under the whole group (so they share a floor), each monitor
// base and the MacBook have a darker contact shadow, and the MacBook has a faint reflection below it.
const scene = (s) => `<!doctype html><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  /* Positions below are on a 1600-wide layout; the page (WIDTH) shows it from x 60 to 1540, trimming the empty sides. */
  html { width: ${WIDTH}px; height: ${HEIGHT}px; background: transparent; overflow: hidden; }
  body { position: relative; left: -60px; width: 1600px; height: ${HEIGHT}px; background: transparent; overflow: hidden; }
  .device { position: absolute; }
  .screen { position: relative; overflow: hidden; background: #fff; }
  .screen img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }
  .screen::after { content: ''; position: absolute; inset: 0; background: linear-gradient(115deg, rgb(255 255 255 / 0.1) 0%, rgb(255 255 255 / 0) 38%); }
  .silver { background: linear-gradient(180deg, #5d5d62 0%, #48484c 55%, #36363a 100%); } /* space grey */
  .shadow::after { content: ''; position: absolute; left: 2%; right: 2%; bottom: -16px; height: 30px; z-index: -1; background: radial-gradient(closest-side, rgb(0 0 0 / 0.26), transparent); filter: blur(4px); }

  /* Monitors: a thin black bezel all round, a slim black neck and a flat black base. */
  .monitor { top: 40px; width: 680px; }
  /* Turned on their inner edges, which stay put: 795px and 805px, 10px apart either side of the middle (800px). */
  .monitor--left { left: 115px; transform: perspective(2200px) rotateY(10deg); transform-origin: right center; }
  .monitor--right { left: 805px; transform: perspective(2200px) rotateY(-10deg); transform-origin: left center; }
  .monitor__front { padding: 12px; border-radius: 12px; background: #111; box-shadow: inset 0 0 0 1.5px #2a2a2a, 0 26px 50px rgb(0 0 0 / 0.14); }
  .monitor__front .screen { aspect-ratio: 955 / 530; border-radius: 3px; }
  .monitor__neck { width: 64px; height: 110px; margin-inline: auto; background: linear-gradient(90deg, #0d0d0d, #2a2a2a 45%, #151515); }
  .monitor__base { position: relative; width: 210px; height: 12px; margin-inline: auto; border-radius: 4px 4px 7px 7px; background: linear-gradient(180deg, #2b2b2b, #111); }
  .monitor__base::after { content: ''; position: absolute; left: -18%; right: -18%; bottom: -14px; height: 26px; z-index: -1; background: radial-gradient(closest-side, rgb(0 0 0 / 0.32), transparent); filter: blur(2px); }

  .macbook { left: 466px; top: 400px; width: 786px; z-index: 1; transform: scale(0.85); transform-origin: top left; } /* 668 x 387 */
  .macbook__lid { width: 679px; margin-inline: auto; padding: 17px 18px 19px; border-radius: 20px 20px 0 0; background: #141414; box-shadow: inset 0 0 0 2px #2c2c2c; }
  .macbook__lid .screen { height: 395px; border-radius: 3px; }
  .macbook__base { position: relative; height: 24px; border-radius: 3px 3px 22px 22px / 3px 3px 14px 14px; box-shadow: 0 30px 70px rgb(0 0 0 / 0.14), 0 8px 16px rgb(0 0 0 / 0.07); }
  .macbook__base::before { content: ''; position: absolute; left: 50%; top: 0; width: 128px; height: 8px; translate: -50% 0; border-radius: 0 0 8px 8px; background: linear-gradient(180deg, #2c2c30, #424246); }

  /* The shared floor shadow, and the MacBook's reflection (a fading strip just below its base). */
  .ground { position: absolute; left: 60px; right: 60px; top: 520px; height: 330px; background: radial-gradient(closest-side, rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.03) 60%, transparent); filter: blur(14px); }
  .reflection { position: absolute; left: 500px; right: 500px; top: 790px; height: 40px; background: linear-gradient(180deg, rgb(54 54 58 / 0.14), transparent); filter: blur(3px); border-radius: 0 0 50% 50%; }
</style>
<div class="ground"></div><div class="reflection"></div>
<div class="device monitor monitor--left">
  <div class="monitor__front"><div class="screen"><img src="${s.imacLeft}" alt=""></div></div>
  <div class="monitor__neck"></div><div class="monitor__base"></div>
</div>
<div class="device monitor monitor--right">
  <div class="monitor__front"><div class="screen"><img src="${s.imacRight}" alt=""></div></div>
  <div class="monitor__neck"></div><div class="monitor__base"></div>
</div>
<div class="device macbook shadow">
  <div class="macbook__lid"><div class="screen"><img src="${s.laptop}" alt=""></div></div>
  <div class="macbook__base silver"></div>
</div>`;

// Renders an HTML screen at twice its size (sharper once the devices shrink it) and saves it as WebP.
async function shoot(browser, html, width, height, file) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(dir, file), type: 'webp', quality: 92 });
  } finally {
    await page.close();
  }
}

const keep = process.argv.includes('--keep');
fs.mkdirSync(dir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME });
try {
  if (!keep) {
    await shoot(browser, imacLeft(), 955, 530, 'imac-left.webp');
    await shoot(browser, imacRight(dataUrl(path.join(root, 'public', 'images', 'work', 'nueva-gold', 'pages', 'phone.webp'))), 955, 530, 'imac-right.webp');
    await shoot(browser, laptop(), 643, 395, 'laptop.webp');
  }
  const screens = Object.fromEntries(['imacLeft', 'imacRight', 'laptop'].map((key) => {
    const file = { imacLeft: 'imac-left.webp', imacRight: 'imac-right.webp', laptop: 'laptop.webp' }[key];
    return [key, dataUrl(path.join(dir, file))];
  }));
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    await page.setContent(scene(screens), { waitUntil: 'load' });
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
    await page.screenshot({ path: path.join(dir, 'devices.webp'), type: 'webp', quality: 90, omitBackground: true });
  } finally {
    await page.close();
  }
  console.log('Saved public/images/workflow/devices.webp');
} finally {
  await browser.close();
}
