"use client";

import type { CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

const networkPaths = [
  "M80 760 C220 650 310 590 470 530 C610 475 720 400 850 330",
  "M310 800 C420 650 520 590 675 530 C810 475 940 420 1080 340",
  "M610 810 C690 690 770 610 930 545 C1080 485 1230 435 1435 365",
  "M920 815 C980 700 1070 615 1215 555 C1360 495 1480 450 1600 410",
  "M25 625 C260 605 410 590 575 560 C800 520 1040 500 1260 485 C1430 474 1545 455 1600 430",
  "M0 710 C220 690 430 670 670 650 C950 625 1240 610 1600 575",
  "M160 540 C340 525 520 510 700 490 C930 465 1170 445 1450 435",
];

const nodePoints = [
  [105, 742], [235, 655], [375, 590], [505, 530], [645, 462], [840, 340],
  [330, 778], [455, 650], [615, 566], [760, 500], [910, 438], [1080, 340],
  [620, 788], [730, 668], [865, 590], [1030, 520], [1210, 455], [1435, 365],
  [930, 792], [1040, 680], [1165, 598], [1315, 535], [1465, 470], [1575, 418],
  [160, 616], [440, 585], [720, 540], [1010, 505], [1280, 482], [1510, 446],
];

export function ElectricNetworkBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="chargenext-network-root" aria-hidden="true">
      <div className="chargenext-network-sky" />
      <div className="chargenext-network-clouds" />
      <div className="chargenext-network-lightning chargenext-network-lightning-one" />
      <div className="chargenext-network-lightning chargenext-network-lightning-two" />
      <div className="chargenext-network-horizon-glow" />

      <svg className="chargenext-network-scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.05" />
            <stop offset="55%" stopColor="#0ea5e9" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="energyStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.15" />
            <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.35" />
          </linearGradient>
          <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="strongGlow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="nodeRing">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="1" />
            <stop offset="22%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="52%" stopColor="#0284c7" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="chargenext-network-skyline" fill="#020817" stroke="#075985" strokeOpacity="0.36">
          <path d="M0 376 L65 376 L65 350 L92 350 L92 365 L126 365 L126 320 L158 320 L158 363 L198 363 L198 335 L222 335 L222 370 L265 370 L265 300 L288 300 L288 267 L310 267 L310 367 L347 367 L347 325 L377 325 L377 365 L420 365 L420 285 L444 285 L444 248 L469 248 L469 360 L505 360 L505 318 L532 318 L532 367 L568 367 L568 292 L595 292 L595 340 L630 340 L630 270 L652 270 L652 225 L675 225 L675 352 L710 352 L710 305 L742 305 L742 365 L786 365 L786 276 L812 276 L812 235 L837 235 L837 359 L882 359 L882 320 L910 320 L910 365 L945 365 L945 250 L972 250 L972 285 L1002 285 L1002 360 L1038 360 L1038 310 L1064 310 L1064 342 L1104 342 L1104 238 L1132 238 L1132 205 L1155 205 L1155 355 L1192 355 L1192 290 L1220 290 L1220 364 L1260 364 L1260 315 L1288 315 L1288 349 L1325 349 L1325 274 L1352 274 L1352 357 L1390 357 L1390 300 L1418 300 L1418 365 L1458 365 L1458 255 L1484 255 L1484 224 L1508 224 L1508 356 L1542 356 L1542 295 L1572 295 L1572 374 L1600 374 L1600 420 L0 420 Z" />
          {Array.from({ length: 34 }).map((_, i) => (
            <rect key={i} x={35 + i * 46} y={292 + (i % 4) * 17} width="5" height="7" fill="#38bdf8" opacity={(i % 3 + 1) * 0.18} />
          ))}
        </g>

        <g className="chargenext-network-grid" stroke="url(#gridFade)" fill="none">
          {Array.from({ length: 19 }).map((_, i) => {
            const x = 800 + (i - 9) * 86;
            return <path key={`v-${i}`} d={`M800 365 L${x} 900`} strokeWidth={i % 3 === 0 ? 1.4 : 0.8} />;
          })}
          {[405, 445, 490, 542, 600, 665, 740, 825].map((y, i) => (
            <path key={`h-${y}`} d={`M${670 - i * 95} ${y} L${930 + i * 95} ${y}`} strokeWidth={i % 2 === 0 ? 1.2 : 0.75} />
          ))}
        </g>

        <g className="chargenext-network-paths" fill="none" strokeLinecap="round">
          {networkPaths.map((path, i) => (
            <g key={path}>
              <path d={path} stroke="#0284c7" strokeOpacity="0.2" strokeWidth="14" filter="url(#strongGlow)" />
              <path d={path} stroke="url(#energyStroke)" strokeWidth={i % 2 === 0 ? 3 : 2.2} filter="url(#softGlow)" />
              {!reducedMotion && (
                <path
                  d={path}
                  className={`chargenext-network-travel chargenext-network-travel-${(i % 3) + 1}`}
                  stroke="#e0f2fe"
                  strokeWidth="4"
                  strokeDasharray="3 180"
                  fill="none"
                  filter="url(#strongGlow)"
                />
              )}
            </g>
          ))}
        </g>

        <g className="chargenext-network-nodes">
          {nodePoints.map(([x, y], i) => (
            <g key={`${x}-${y}`} className={`chargenext-network-node chargenext-network-node-${(i % 4) + 1}`}>
              <circle cx={x} cy={y} r={i % 5 === 0 ? 42 : 26} fill="url(#nodeRing)" />
              <circle cx={x} cy={y} r={i % 5 === 0 ? 14 : 8} fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.75" />
              <circle cx={x} cy={y} r={i % 5 === 0 ? 4.6 : 3.2} fill="#e0f2fe" filter="url(#softGlow)" />
            </g>
          ))}
        </g>

        {!reducedMotion && (
          <g className="chargenext-network-powerup" fill="none" stroke="#f0f9ff" strokeWidth="6" strokeLinecap="round" filter="url(#strongGlow)">
            <path d="M800 365 C820 440 760 515 675 530 C520 560 320 650 80 760" />
          </g>
        )}
      </svg>

      <div className="chargenext-network-fog chargenext-network-fog-one" />
      <div className="chargenext-network-fog chargenext-network-fog-two" />
      <div className="chargenext-network-particles">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            style={{
              "--particle-index": i,
              left: `${(i * 37) % 100}%`,
              top: `${32 + ((i * 29) % 60)}%`,
            } as CSSProperties}
          />
        ))}
      </div>
      <div className="chargenext-network-vignette" />
    </div>
  );
}
