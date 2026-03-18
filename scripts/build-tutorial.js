#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const tutorialPath = path.join(__dirname, '..', 'tutorials', 'python-api-tutorial.md');
const outputPath = path.join(__dirname, '..', 'docs', 'tutorials', 'python-api', 'index.html');

const readme = fs.readFileSync(tutorialPath, 'utf8');

const content = readme.replace(/^---\n[\s\S]*?\n---\n/, '');

const body = marked.parse(content);

const html = `<!DOCTYPE html>
<html class="default" lang="en" data-base="../..">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="IE=edge">
  <title>Python API Tutorial | opencarl</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="../../assets/style.css">
  <link rel="stylesheet" href="../../assets/highlight.css">
  <script defer src="../../assets/main.js"></script>
  <script async src="../../assets/icons.js" id="tsd-icons-script"></script>
</head>
<body>
  <script>document.documentElement.dataset.theme = localStorage.getItem("tsd-theme") || "os";document.body.style.display="none";setTimeout(() => window.app?app.showPage():document.body.style.removeProperty("display"),500)</script>
  <header class="tsd-page-toolbar">
    <div class="tsd-toolbar-contents container">
      <a href="../../index.html" class="title">opencarl</a>
      <div id="tsd-toolbar-links"></div>
      <button id="tsd-search-trigger" class="tsd-widget" aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <use href="../../assets/icons.svg#icon-search"></use>
        </svg>
      </button>
      <dialog id="tsd-search" aria-label="Search">
        <input role="combobox" id="tsd-search-input" aria-controls="tsd-search-results" aria-autocomplete="list" aria-expanded="true" autocapitalize="off" autocomplete="off" placeholder="Search the docs" maxLength="100">
        <ul role="listbox" id="tsd-search-results"></ul>
        <div id="tsd-search-status" aria-live="polite" aria-atomic="true"><div>Preparing search index...</div></div>
      </dialog>
      <a href="#" class="tsd-widget menu" id="tsd-toolbar-menu-trigger" data-toggle="menu" aria-label="Menu">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <use href="../../assets/icons.svg#icon-menu"></use>
        </svg>
      </a>
    </div>
  </header>
  <div class="container container-main">
    <div class="col-content">
      <div class="tsd-page-title">
        <h1>Python API Tutorial</h1>
      </div>
      <div class="tsd-panel tsd-typography">
        ${body}
      </div>
    </div>
  </div>
</body>
</html>`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);
console.log('Generated tutorial: docs/tutorials/python-api/index.html');
