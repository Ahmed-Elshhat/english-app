// With Images
// import Header from "@/components/Header/Header";
// import Image from "next/image";
// import "./seasons&episodes.scss";
// import Link from "next/link";

// function SeasonsAndEpisodesPage() {
//   return (
//     <div className="Seasons_And_Episodes">
//       <Header />
//       <div className="content">
//         <h2 className="title">The Witcher</h2>

//         <div className="seasons">
//           <h3>Seasons</h3>
//           <div className="season_list">
//             <div className="season_card">
//               <Image
//                 src="/images/flash_card_img.jpeg"
//                 alt="Season 1"
//                 width={200}
//                 height={120}
//               />
//               <span>Season 1</span>
//             </div>
//             <div className="season_card">
//               <Image
//                 src="/images/flash_card_img.jpeg"
//                 alt="Season 2"
//                 width={200}
//                 height={120}
//               />
//               <span>Season 2</span>
//             </div>
//           </div>
//         </div>

//         <div className="episodes">
//           <h3>Episodes</h3>
//           <div className="episode_list">
//             <Link href={`/watch/1`}>
//               <div className="episode_card">
//                 <Image
//                   src="/images/flash_card_img.jpeg"
//                   alt="Episode 1"
//                   width={250}
//                   height={140}
//                 />
//                 <div className="info">
//                   <h4>Episode 1</h4>
//                   <p>The Beginning</p>
//                 </div>
//               </div>
//             </Link>
//             <Link href={`/watch/2`}>
//               <div className="episode_card">
//                 <Image
//                   src="/images/flash_card_img.jpeg"
//                   alt="Episode 2"
//                   width={250}
//                   height={140}
//                 />
//                 <div className="info">
//                   <h4>Episode 2</h4>
//                   <p>Battle at Dawn</p>
//                 </div>
//               </div>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SeasonsAndEpisodesPage;

// Without Images
// import Header from "@/components/Header/Header";
// import "./seasons&episodes.scss";
// import { FaPlay } from "react-icons/fa";

// function SeasonsAndEpisodesPage() {
//   return (
//     <div className="Seasons_And_Episodes">
//       <Header />
//       <h2>Playlists</h2>
//       <div className="content">
//         {/* Season Block */}
//         <div className="season">
//           <h3 className="season-title">Season 1 (10 Episodes)</h3>
//           <ul className="episodes-list">
//             <li className="episode">
//               <span className="ep-number">E1</span>
//               <span className="ep-title">The Beginning</span>
//               <span className="ep-duration">42m</span>
//               <button className="play-btn">
//                 <FaPlay />
//               </button>
//             </li>
//             <li className="episode">
//               <span className="ep-number">E2</span>
//               <span className="ep-title">Unexpected Journey</span>
//               <span className="ep-duration">39m</span>
//               <button className="play-btn">
//                 <FaPlay />
//               </button>
//             </li>
//             <li className="episode">
//               <span className="ep-number">E3</span>
//               <span className="ep-title">Secrets Revealed</span>
//               <span className="ep-duration">45m</span>
//               <button className="play-btn">
//                 <FaPlay />
//               </button>
//             </li>
//           </ul>
//         </div>

//         {/* Season Block */}
//         <div className="season">
//           <h3 className="season-title">Season 2 (8 Episodes)</h3>
//           <ul className="episodes-list">
//             <li className="episode">
//               <span className="ep-number">E1</span>
//               <span className="ep-title">Return</span>
//               <span className="ep-duration">50m</span>
//               <button className="play-btn">
//                 <FaPlay />
//               </button>
//             </li>
//             <li className="episode">
//               <span className="ep-number">E2</span>
//               <span className="ep-title">New Challenges</span>
//               <span className="ep-duration">48m</span>
//               <button className="play-btn">
//                 <FaPlay />
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SeasonsAndEpisodesPage;

// V2
// "use client";
// import Header from "@/components/Header/Header";
// import "./seasons&episodes.scss";
// import { FaPlay } from "react-icons/fa";
// import { useState } from "react";
// import Link from "next/link";

// function SeasonsAndEpisodesPage() {
//   // البيانات (ممكن تجي من API بدل كده)
//   const seasonsData = [
//     {
//       id: 1,
//       title: "Season 1 (10 Episodes)",
//       episodes: [
//         { number: "E1", title: "The Beginning", duration: "42m" },
//         { number: "E2", title: "Unexpected Journey", duration: "39m" },
//         { number: "E3", title: "Secrets Revealed", duration: "45m" },
//       ],
//     },
//     {
//       id: 2,
//       title: "Season 2 (8 Episodes)",
//       episodes: [
//         { number: "E1", title: "Return", duration: "50m" },
//         { number: "E2", title: "New Challenges", duration: "48m" },
//       ],
//     },
//     {
//       id: 3,
//       title: "Season 2 (8 Episodes)",
//       episodes: [
//         { number: "E1", title: "Return", duration: "50m" },
//         { number: "E2", title: "New Challenges", duration: "48m" },
//       ],
//     },
//     {
//       id: 4,
//       title: "Season 2 (8 Episodes)",
//       episodes: [
//         { number: "E1", title: "Return", duration: "50m" },
//         { number: "E2", title: "New Challenges", duration: "48m" },
//       ],
//     },
//     {
//       id: 5,
//       title: "Season 2 (8 Episodes)",
//       episodes: [
//         { number: "E1", title: "Return", duration: "50m" },
//         { number: "E2", title: "New Challenges", duration: "48m" },
//       ],
//     },
//     {
//       id: 6,
//       title: "Season 2 (8 Episodes)",
//       episodes: [
//         { number: "E1", title: "Return", duration: "50m" },
//         { number: "E2", title: "New Challenges", duration: "48m" },
//       ],
//     },
//     {
//       id: 7,
//       title: "Season 2 (8 Episodes)",
//       episodes: [
//         { number: "E1", title: "Return", duration: "50m" },
//         { number: "E2", title: "New Challenges", duration: "48m" },
//       ],
//     },
//     {
//       id: 8,
//       title: "Season 2 (8 Episodes)",
//       episodes: [
//         { number: "E1", title: "Return", duration: "50m" },
//         { number: "E2", title: "New Challenges", duration: "48m" },
//       ],
//     },
//     {
//       id: 9,
//       title: "Season 2 (8 Episodes)",
//       episodes: [
//         { number: "E1", title: "Return", duration: "50m" },
//         { number: "E2", title: "New Challenges", duration: "48m" },
//       ],
//     },
//     {
//       id: 10,
//       title: "Season 2 (8 Episodes)",
//       episodes: [
//         { number: "E1", title: "Return", duration: "50m" },
//         { number: "E2", title: "New Challenges", duration: "48m" },
//       ],
//     },
//   ];

//   const [activeSeason, setActiveSeason] = useState(seasonsData[0]); // الافتراضي الموسم الأول

//   return (
//     <div className="Seasons_And_Episodes">
//       <Header />
//       <h2>Playlists</h2>

//       <div className="seasons-nav">
//         {seasonsData.map((season) => (
//           <button
//             key={season.id}
//             className={`season-btn ${
//               activeSeason.id === season.id ? "active" : ""
//             }`}
//             onClick={() => setActiveSeason(season)}
//           >
//             {season.title}
//           </button>
//         ))}
//       </div>

//       <div className="episodes-section">
//         <h3 className="season-title">{activeSeason.title}</h3>
//         <ul className="episodes-list">
//           {activeSeason.episodes.map((ep, index) => (
//             <Link href={`/watch/${index + 1}`} key={index}>
//               <li className="episode">
//                 <span className="ep-number">{ep.number}</span>
//                 <span className="ep-title">{ep.title}</span>
//                 <span className="ep-duration">{ep.duration}</span>
//                 <button className="play-btn">
//                   <FaPlay />
//                 </button>
//               </li>
//             </Link>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

// export default SeasonsAndEpisodesPage;

// V3
"use client";
import { useState } from "react";
import Header from "@/components/Header/Header";
import { FaPlay } from "react-icons/fa";
import "./seasons&episodes.scss";
import Link from "next/link";

const seasonsData = [
  {
    id: 1,
    title: "Season 1",
    episodes: [
      { id: 1, title: "The Beginning", duration: "42m" },
      { id: 2, title: "Unexpected Journey", duration: "39m" },
      { id: 3, title: "Secrets Revealed", duration: "45m" },
      { id: 4, title: "Twist of Fate", duration: "41m" },
    ],
  },
  {
    id: 2,
    title: "Season 2",
    episodes: [
      { id: 1, title: "Return", duration: "50m" },
      { id: 2, title: "New Challenges", duration: "48m" },
      { id: 3, title: "Clash", duration: "46m" },
    ],
  },
  {
    id: 3,
    title: "Season 3",
    episodes: [
      { id: 1, title: "Another Start", duration: "40m" },
      { id: 2, title: "Deeper Secrets", duration: "44m" },
      { id: 3, title: "Confrontation", duration: "47m" },
      { id: 4, title: "Betrayal", duration: "43m" },
      { id: 5, title: "Resolution", duration: "49m" },
    ],
  },
  {
    id: 4,
    title: "Season 4",
    episodes: [
      { id: 1, title: "Shadows Rising", duration: "52m" },
      { id: 2, title: "Crossroads", duration: "41m" },
    ],
  },
  {
    id: 5,
    title: "Season 5",
    episodes: [
      { id: 1, title: "Reunion", duration: "39m" },
      { id: 2, title: "Bitter Truth", duration: "44m" },
      { id: 3, title: "Hope", duration: "42m" },
      { id: 4, title: "The Fall", duration: "46m" },
    ],
  },
  {
    id: 6,
    title: "Season 6",
    episodes: [
      { id: 1, title: "Awakening", duration: "50m" },
      { id: 2, title: "Unexpected Ally", duration: "47m" },
      { id: 3, title: "The Lost Path", duration: "49m" },
    ],
  },
  {
    id: 7,
    title: "Season 7",
    episodes: [
      { id: 1, title: "Rebellion", duration: "42m" },
      { id: 2, title: "Breaking Chains", duration: "45m" },
      { id: 3, title: "Into Darkness", duration: "43m" },
      { id: 4, title: "Final Hour", duration: "48m" },
    ],
  },
  {
    id: 8,
    title: "Season 8",
    episodes: [
      { id: 1, title: "New Dawn", duration: "51m" },
      { id: 2, title: "Sacrifice", duration: "47m" },
      { id: 3, title: "Legacy", duration: "49m" },
      { id: 4, title: "The Last Stand", duration: "55m" },
      { id: 5, title: "Epilogue", duration: "42m" },
    ],
  },
];

function SeasonsAndEpisodesPage() {
  const [activeSeason, setActiveSeason] = useState(seasonsData[0]);

  return (
    <div className="Seasons_And_Episodes">
      <Header />
      <h2>Seasons & Episodes</h2>

      {/* ✅ المواسم */}
      <div className="seasons-nav">
        {seasonsData.map((season) => (
          <div
            key={season.id}
            className={`season-card ${
              activeSeason.id === season.id ? "active" : ""
            }`}
            onClick={() => setActiveSeason(season)}
          >
            <h4>{season.title}</h4>
            <p>{season.episodes.length} Episodes</p>
          </div>
        ))}
      </div>

      {/* ✅ الحلقات الخاصة بالموسم النشط */}
      <div className="episodes-list">
        {activeSeason.episodes.map((ep) => (
          <Link href={`/watch/${ep.id}`} key={ep.id}>
            <div className="episode">
              <span className="ep-number">E{ep.id}</span>
              <span className="ep-title">{ep.title}</span>
              <span className="ep-duration">{ep.duration}</span>
              <button className="play-btn">
                <FaPlay />
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SeasonsAndEpisodesPage;

// V4
// "use client";
// import { useState } from "react";
// import { FaPlay } from "react-icons/fa";
// import "./seasons&episodes.scss";
// import Header from "@/components/Header/Header";
// import Link from "next/link";

// const seasonsData = [
//   {
//     id: 1,
//     title: "Season 1",
//     episodes: [
//       { id: 1, title: "The Awakening", duration: "42m" },
//       { id: 2, title: "Shattered Bonds", duration: "45m" },
//       { id: 3, title: "Whispers in the Dark", duration: "47m" },
//     ],
//   },
//   {
//     id: 2,
//     title: "Season 2",
//     episodes: [
//       { id: 1, title: "Return of Shadows", duration: "52m" },
//       { id: 2, title: "Bloodlines", duration: "48m" },
//     ],
//   },
//   {
//     id: 3,
//     title: "Season 3",
//     episodes: [
//       { id: 1, title: "Ashes and Fire", duration: "41m" },
//       { id: 2, title: "The Forgotten Path", duration: "44m" },
//       { id: 3, title: "Chains of Destiny", duration: "49m" },
//       { id: 4, title: "The Siege", duration: "53m" },
//     ],
//   },
//   // ... كمل باقي الـ 8 مواسم بنفس الفكرة
// ];

// export default function SeasonsAndEpisodesPage() {
//   const [activeSeason, setActiveSeason] = useState(seasonsData[0]);

//   return (
//     <div className="Seasons_And_Episodes">
//       <Header />
//       <h2>Seasons & Episodes</h2>

//       {/* Seasons Nav */}
//       <div className="seasons-nav">
//         {seasonsData.map((season) => (
//           <div
//             key={season.id}
//             className={`season-card ${
//               activeSeason.id === season.id ? "active" : ""
//             }`}
//             onClick={() => setActiveSeason(season)}
//           >
//             <div className="season-bg"></div>
//             <h4>{season.title}</h4>
//             <p>{season.episodes.length} Episodes</p>
//           </div>
//         ))}
//       </div>

//       {/* Episodes List */}
//       <div className="episodes-list">
//         {activeSeason.episodes.map((ep) => (
//           <Link href={`/watch/${ep.id}`} key={ep.id}>
//             <div className="episode">
//               <div className="ep-info">
//                 <span className="ep-number">E{ep.id}</span>
//                 <span className="ep-title">{ep.title}</span>
//               </div>
//               <div className="ep-meta">
//                 <span className="ep-duration">{ep.duration}</span>
//                 <button className="play-btn">
//                   <FaPlay />
//                 </button>
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }
