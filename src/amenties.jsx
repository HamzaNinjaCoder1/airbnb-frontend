import React from 'react';

// amenities.js

const amenities = [
  {
    name: "Kitchen",
    available: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="w-6 h-6">
        <path d="M26 1a5 5 0 0 1 5 5c0 6.39-1.6 13.19-4 14.7V31h-2V20.7c-2.36-1.48-3.94-8.07-4-14.36v-.56A5 5 0 0 1 26 1zm-9 0v18.12c2.32.55 4 3 4 5.88 0 3.27-2.18 6-5 6s-5-2.73-5-6c0-2.87 1.68-5.33 4-5.88V1zM2 1h1c4.47 0 6.93 6.37 7 18.5V21H4v10H2zm14 20c-1.6 0-3 1.75-3 4s1.4 4 3 4 3-1.75 3-4-1.4-4-3-4zM4 3.24V19h4l-.02-.96-.03-.95C7.67 9.16 6.24 4.62 4.22 3.36L4.1 3.3zm19 2.58v.49c.05 4.32 1.03 9.13 2 11.39V3.17a3 3 0 0 0-2 2.65zm4-2.65V17.7c.99-2.31 2-7.3 2-11.7a3 3 0 0 0-2-2.83z"></path>
      </svg>
    )
  },
  {
    name: "Wifi",
    available: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="w-6 h-6">
        <path d="M16 20.33a3.67 3.67 0 1 1 0 7.34 3.67 3.67 0 0 1 0-7.34zm0 2a1.67 1.67 0 1 0 0 3.34 1.67 1.67 0 0 0 0-3.34zM16 15a9 9 0 0 1 8.04 4.96l-1.51 1.51a7 7 0 0 0-13.06 0l-1.51-1.51A9 9 0 0 1 16 15zm0-5.33c4.98 0 9.37 2.54 11.94 6.4l-1.45 1.44a12.33 12.33 0 0 0-20.98 0l-1.45-1.45A14.32 14.32 0 0 1 16 9.66zm0-5.34c6.45 0 12.18 3.1 15.76 7.9l-1.43 1.44a17.64 17.64 0 0 0-28.66 0L.24 12.24c3.58-4.8 9.3-7.9 15.76-7.9z"></path>
      </svg>
    )
  },
  {
    name: "Free street parking",
    available: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="w-6 h-6">
        <path d="M9 29v-2h2v-2H6a5 5 0 0 1-5-4.78V8a5 5 0 0 1 4.78-5H26a5 5 0 0 1 5 4.78V20a5 5 0 0 1-4.78 5H21v2h2v2zm10-4h-6v2h6zm7-20H6a3 3 0 0 0-3 2.82V20a3 3 0 0 0 2.82 3H26a3 3 0 0 0 3-2.82V8a3 3 0 0 0-2.82-3z"></path>
      </svg>
    )
  },
  {
    name: "HDTV with Netflix",
    available: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="w-6 h-6">
        <path d="M30 1a1 1 0 0 1 1 .88V30a1 1 0 0 1-.88 1H2a1 1 0 0 1-1-.88V2a1 1 0 0 1 .88-1H2zM3 3v26h12V3zm7 9v6.58l1.8-1.79 1.4 1.42-3.5 3.5a1 1 0 0 1-1.31.08l-.1-.08-3.5-3.5 1.42-1.42L8 18.6V12zm12.39-1.5a1 1 0 0 1 1.22 0l.1.09 3.5 3.5-1.42 1.41L24 13.7V20h-2v-6.3l-1.8 1.8-1.4-1.41 3.5-3.5zM17 29h12V3H17z"></path>
      </svg>
    )
  },
  {
    name: "Elevator",
    available: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="w-6 h-6">
        <path d="M2.05 6.3 4 8.23V25a3 3 0 0 0 2.82 3h16.94l1.95 1.95c-.16.02-.33.04-.5.04L25 30H7a5 5 0 0 1-5-4.78V7c0-.24.02-.48.05-.7zm1.66-4 26 26-1.42 1.4-26-26 1.42-1.4zM25 2a5 5 0 0 1 5 4.78V25a5 5 0 0 1-.05.7L28 23.77V7a3 3 0 0 0-2.82-3H8.24L6.3 2.05c.16-.02.33-.04.5-.04L7 2h18zM11.1 17a5 5 0 0 0 3.9 3.9v2.03A7 7 0 0 1 9.07 17h2.03zm5.9 4.24 1.35 1.36a6.95 6.95 0 0 1-1.35.33v-1.69zM21.24 17h1.69c-.07.47-.18.92-.34 1.35L21.24 17zM17 9.07A7 7 0 0 1 22.93 15H20.9a5 5 0 0 0-3.9-3.9V9.07zm-7.6 4.58L10.76 15H9.07c.07-.47.18-.92.33-1.35zM15 9.07v1.69L13.65 9.4A6.95 6.95 0 0 1 15 9.07zM23 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>
      </svg>
    )
  },
  {
    name: "Air conditioning",
    available: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="w-6 h-6">
        <path d="M17 1v4.03l4.03-2.32 1 1.73L17 7.34v6.93l6-3.47V5h2v4.65l3.49-2.02 1 1.74L26 11.38l4.03 2.33-1 1.73-5.03-2.9L18 16l6 3.46 5.03-2.9 1 1.73L26 20.62l3.49 2.01-1 1.74L25 22.35V27h-2v-5.8l-6-3.47v6.93l5.03 2.9-1 1.73L17 26.97V31h-2v-4.03l-4.03 2.32-1-1.73 5.03-2.9v-6.93L9 21.2V27H7v-4.65l-3.49 2.02-1-1.74L6 20.62l-4.03-2.33 1-1.73L8 19.46 14 16l-6-3.46-5.03 2.9-1-1.73L6 11.38 2.51 9.37l1-1.74L7 9.65V5h2v5.8l6 3.47V7.34l-5.03-2.9 1-1.73L15 5.03V1z"></path>
      </svg>
    )
  },
  {
    name: "Dawlance refrigerator",
    available: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="w-6 h-6">
        <path d="M25 1a2 2 0 0 1 2 1.85V29a2 2 0 0 1-1.85 2H7a2 2 0 0 1-2-1.85V3a2 2 0 0 1 1.85-2H7zm0 10H7v18h18zm-15 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM25 3H7v6h18zM10 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>
      </svg>
    )
  },
  {
    name: "Exterior security cameras on property",
    available: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="w-6 h-6">
        <path d="M23 3a2 2 0 0 1 2 1.85v1.67l5-2v11.96l-5-2V16a2 2 0 0 1-1.85 2H16.9a5 5 0 0 1-3.98 3.92A5 5 0 0 1 8.22 26H4v4H2V20h2v4h4a3 3 0 0 0 2.87-2.13A5 5 0 0 1 7.1 18H4a2 2 0 0 1-2-1.85V5a2 2 0 0 1 1.85-2H4zM12 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm11-9H4v11h3.1a5 5 0 0 1 9.8 0H23zm5 2.48-3 1.2v3.64l3 1.2zM7 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>
      </svg>
    )
  },
  {
    name: "Carbon monoxide alarm",
    available: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="w-6 h-6">
        <path d="M2.05 6.3 4 8.23V25a3 3 0 0 0 2.82 3h16.94l1.95 1.95c-.16.02-.33.04-.5.04L25 30H7a5 5 0 0 1-5-4.78V7c0-.24.02-.48.05-.7zm1.66-4 26 26-1.42 1.4-26-26 1.42-1.4zM25 2a5 5 0 0 1 5 4.78V25a5 5 0 0 1-.05.7L28 23.77V7a3 3 0 0 0-2.82-3H8.24L6.3 2.05c.16-.02.33-.04.5-.04L7 2h18zM11.1 17a5 5 0 0 0 3.9 3.9v2.03A7 7 0 0 1 9.07 17h2.03zm5.9 4.24 1.35 1.36a6.95 6.95 0 0 1-1.35.33v-1.69zM21.24 17h1.69c-.07.47-.18.92-.34 1.35L21.24 17zM17 9.07A7 7 0 0 1 22.93 15H20.9a5 5 0 0 0-3.9-3.9V9.07zm-7.6 4.58L10.76 15H9.07c.07-.47.18-.92.33-1.35zM15 9.07v1.69L13.65 9.4A6.95 6.95 0 0 1 15 9.07zM23 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>
      </svg>
    )
  },
  {
    name: "Smoke alarm",
    available: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false" className="w-6 h-6">
        <path d="m3.49 7.73 1.44 1.44A12.94 12.94 0 0 0 3 16a13 13 0 0 0 19.82 11.07l1.45 1.44A14.93 14.93 0 0 1 16 31 15 15 0 0 1 3.49 7.73zm.22-5.44 26 26-1.42 1.42-26-26 1.42-1.42zM16 1a15 15 0 0 1 12.52 23.27l-1.45-1.45A12.94 12.94 0 0 0 29 16 13 13 0 0 0 16 3a12.94 12.94 0 0 0-6.83 1.93L7.74 3.5A14.93 14.93 0 0 1 16 1zm-4.9 16a5 5 0 0 0 3.9 3.9v2.03A7 7 0 0 1 9.07 17h2.03zm5.9 4.24 1.35 1.36a6.95 6.95 0 0 1-1.35.33v-1.69zM21.24 17h1.69c-.07.47-.18.92-.34 1.35L21.24 17zM17 9.07A7 7 0 0 1 22.93 15H20.9a5 5 0 0 0-3.9-3.9V9.07zm-7.6 4.58L10.76 15H9.07c.07-.47.18-.92.33-1.35zM15 9.07v1.69L13.65 9.4A6.95 6.95 0 0 1 15 9.07zM23 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>
      </svg>
    )
  }
];

export default amenities;  