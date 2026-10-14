const fs = require('fs');

const minX = 1144.04065;
const minY = 2424.177;
function p(x, y) {
  return (x - minX).toFixed(1) + ' ' + (y - minY).toFixed(1);
}

const rect = `M ${p(1331.54, 2424.18)} L ${p(1990.75, 2424.18)} C ${p(2040.47, 2424.18)} ${p(2088.17, 2443.93)} ${p(2123.33, 2479.09)} C ${p(2158.49, 2514.26)} ${p(2178.25, 2561.95)} ${p(2178.25, 2611.68)} L ${p(2178.25, 3270.88)} C ${p(2178.25, 3320.61)} ${p(2158.49, 3368.30)} ${p(2123.33, 3403.46)} C ${p(2088.17, 3438.63)} ${p(2040.47, 3458.38)} ${p(1990.75, 3458.38)} L ${p(1331.54, 3458.38)} C ${p(1227.99, 3458.38)} ${p(1144.04, 3374.44)} ${p(1144.04, 3270.88)} L ${p(1144.04, 2611.68)} C ${p(1144.04, 2508.12)} ${p(1227.99, 2424.18)} ${p(1331.54, 2424.18)} Z`;

const cut1 = `M ${p(2277.96, 3538.87)} C ${p(2226.10, 3590.73)} ${p(2142.02, 3590.73)} ${p(2090.16, 3538.87)} L ${p(1609.62, 3058.33)} C ${p(1557.76, 3006.47)} ${p(1557.76, 2922.39)} ${p(1609.62, 2870.53)} C ${p(1661.48, 2818.67)} ${p(1745.56, 2818.67)} ${p(1797.41, 2870.53)} L ${p(2277.96, 3351.08)} C ${p(2329.82, 3402.93)} ${p(2329.82, 3487.01)} ${p(2277.96, 3538.87)} Z`;

const cut2 = `M ${p(1240.62, 3238.29)} C ${p(1187.28, 3184.96)} ${p(1187.28, 3098.48)} ${p(1240.62, 3045.15)} L ${p(1911.93, 2373.83)} C ${p(1965.27, 2320.50)} ${p(2051.74, 2320.50)} ${p(2105.08, 2373.83)} C ${p(2158.42, 2427.17)} ${p(2158.42, 2513.64)} ${p(2105.08, 2566.98)} L ${p(1433.76, 3238.29)} C ${p(1380.43, 3291.63)} ${p(1293.95, 3291.63)} ${p(1240.62, 3238.29)} Z`;

console.log('RECT:', rect);
console.log('CUT1:', cut1);
console.log('CUT2:', cut2);

const fontBase64 = fs.readFileSync('client/src/assets/tickza-font.ttf').toString('base64');

// Create standalone SVG with embedded font
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3600 1100" width="100%" height="100%">
  <defs>
    <style>
      @font-face {
        font-family: 'TickzaBrand';
        src: url('data:font/truetype;charset=utf-8;base64,${fontBase64}') format('truetype');
        font-weight: 800;
        font-style: normal;
      }
      .tickza-text {
        font-family: 'TickzaBrand', sans-serif;
        font-size: 820px;
        font-weight: 800;
        letter-spacing: -15px;
      }
    </style>
    <mask id="tickza-cut-mask">
      <!-- White reveals, black cuts out -->
      <rect x="-100" y="-100" width="1300" height="1300" fill="white" />
      <path d="${cut1}" fill="black" />
      <path d="${cut2}" fill="black" />
    </mask>
  </defs>

  <!-- The Icon Mark (Masked so it is transparent behind the cuts) -->
  <g transform="translate(40, 30)">
    <path d="${rect}" fill="currentColor" mask="url(#tickza-cut-mask)" />
  </g>

  <!-- The Wordmark -->
  <text x="1200" y="850" class="tickza-text" fill="currentColor">Tickza</text>
</svg>`;

fs.writeFileSync('client/src/assets/tickza-logo.svg', svgContent);
console.log('Created client/src/assets/tickza-logo.svg');
