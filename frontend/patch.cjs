const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'pages', 'PSDEditor.css');
let css = fs.readFileSync(cssPath, 'utf-8');

// Fix CSS
css = css.replace("@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');", "");
const globalStylesRegex = /\*\s*\{\s*box-sizing:\s*border-box;\s*margin:\s*0;\s*padding:\s*0;\s*\}\s*body\s*\{[^}]*\}\s*#root\s*\{[^}]*\}/s;
css = css.replace(globalStylesRegex, "");
fs.writeFileSync(cssPath, css);

const tsxPath = path.join(__dirname, 'src', 'pages', 'PSDEditor.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf-8');

// Add imports
tsx = tsx.replace("import React, { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect } from 'react';\nimport { useLocation, useNavigate } from 'react-router-dom';\nimport { api } from '../api/axios';");

// Add hooks
tsx = tsx.replace("export const PSDEditor = () => {", "export const PSDEditor = () => {\n  const location = useLocation();\n  const navigate = useNavigate();");

// Add initial image load
const initAppCode = `
  useEffect(() => {
    const initApp = async () => {
      try {
        if (location.state?.backgroundImageUrl) {
          const url = location.state.backgroundImageUrl;
          const img = new window.Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
            const stageW = psdData ? psdData.width : 800;
            const stageH = psdData ? psdData.height : 600;
            const newLayer = {
              uniqueId: Math.random().toString(36).substr(2, 9),
              name: 'Imported Image',
              hidden: false,
              opacity: 1,
              blendMode: 'source-over',
              left: stageW / 2 - img.width / 2,
              top: stageH / 2 - img.height / 2,
              right: (stageW / 2) + img.width / 2,
              bottom: (stageH / 2) + img.height / 2,
              imageElement: img
            };
            setLayers([newLayer]);
            setSelectedNodeId(newLayer.uniqueId);
          };
          img.src = url;
          // Only load once
          navigate('.', { replace: true, state: {} });
        } else {
          const savedBuffer = await localforage.getItem('saved_psd');
          if (savedBuffer) {
            await parsePsdBuffer(savedBuffer);
          }
        }
      } catch (err) {
        console.error("Failed to load", err);
      }
    };
    initApp();
  }, []);
`;

const oldInitAppCodeRegex = /useEffect\(\(\) => \{\s*const initApp = async \(\) => \{\s*try \{\s*const savedBuffer = await localforage.getItem\('saved_psd'\);\s*if \(savedBuffer\) \{\s*await parsePsdBuffer\(savedBuffer\);\s*\}\s*\} catch \(err\) \{\s*console.error\("Failed to load saved PSD", err\);\s*\}\s*\};\s*initApp\(\);\s*\}, \[\]\);/s;

tsx = tsx.replace(oldInitAppCodeRegex, initAppCode);

// Add button
const buttonHtml = `
          <button onClick={async () => {
            if (!stageRef.current) return;
            const prevHover = hoveredLayerId;
            const prevSelect = selectedNodeId;
            setHoveredLayerId(null);
            setSelectedNodeId(null);
            
            setTimeout(async () => {
              const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
              setHoveredLayerId(prevHover);
              setSelectedNodeId(prevSelect);
              try {
                const res = await fetch(uri);
                const blob = await res.blob();
                const file = new File([blob], "edited-image.png", { type: "image/png" });
                const fd = new FormData();
                fd.append('media', file);
                const uploadRes = await api.post('/schedule/upload', fd);
                navigate('/schedule', { state: { preloadedMediaUrl: uploadRes.data.url } });
              } catch(err) {
                console.error('Failed to schedule image', err);
              }
            }, 100);
          }} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Zap size={16} /> <span className="hidden sm:inline">Schedule Post</span>
          </button>
          <button onClick={handleExportPNG}`;

tsx = tsx.replace("<button onClick={handleExportPNG}", buttonHtml);

fs.writeFileSync(tsxPath, tsx);
console.log("Patched successfully!");
