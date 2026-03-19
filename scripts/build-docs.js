#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

function generatePage(title, body, basePath, assetsPath) {
  return `<!DOCTYPE html>
<html class="default" lang="en" data-base="${basePath}">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="IE=edge">
  <title>${title} | opencarl</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="${assetsPath}/style.css">
  <link rel="stylesheet" href="${assetsPath}/highlight.css">
  <script defer src="${assetsPath}/main.js"></script>
  <script async src="${assetsPath}/icons.js" id="tsd-icons-script"></script>
</head>
<body>
  <script>document.documentElement.dataset.theme = localStorage.getItem("tsd-theme") || "os";document.body.style.display="none";setTimeout(() => window.app?app.showPage():document.body.style.removeProperty("display"),500)</script>
  <header class="tsd-page-toolbar">
    <div class="tsd-toolbar-contents container">
      <a href="${basePath}/index.html" class="title">opencarl</a>
      <div id="tsd-toolbar-links"></div>
      <button id="tsd-search-trigger" class="tsd-widget" aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <use href="${assetsPath}/icons.svg#icon-search"></use>
        </svg>
      </button>
      <dialog id="tsd-search" aria-label="Search">
        <input role="combobox" id="tsd-search-input" aria-controls="tsd-search-results" aria-autocomplete="list" aria-expanded="true" autocapitalize="off" autocomplete="off" placeholder="Search the docs" maxLength="100">
        <ul role="listbox" id="tsd-search-results"></ul>
        <div id="tsd-search-status" aria-live="polite" aria-atomic="true"><div>Preparing search index...</div></div>
      </dialog>
      <a href="#" class="tsd-widget menu" id="tsd-toolbar-menu-trigger" data-toggle="menu" aria-label="Menu">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <use href="${assetsPath}/icons.svg#icon-menu"></use>
        </svg>
      </a>
    </div>
  </header>
  <div class="container container-main">
    <div class="col-content">
      <div class="tsd-page-title">
        <h1>${title}</h1>
      </div>
      <div class="tsd-panel tsd-typography">
        ${body}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function processMarkdown(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function buildFile(inputPath, outputPath, title, basePath, assetsPath) {
  const content = fs.readFileSync(inputPath, 'utf8');
  const processed = processMarkdown(content);
  const body = marked.parse(processed);
  const html = generatePage(title, body, basePath, assetsPath);
  
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
  console.log(`Generated: ${outputPath}`);
}

const rootDir = path.join(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');

// Build INSTALL.md (one level deep: docs/install/)
buildFile(
  path.join(rootDir, 'INSTALL.md'),
  path.join(docsDir, 'install', 'index.html'),
  'Installation Guide',
  '..',
  '../api/assets'
);

// Build TROUBLESHOOTING.md (one level deep: docs/troubleshooting/)
buildFile(
  path.join(rootDir, 'TROUBLESHOOTING.md'),
  path.join(docsDir, 'troubleshooting', 'index.html'),
  'Troubleshooting',
  '..',
  '../api/assets'
);

// Build tutorials (two levels deep: docs/tutorials/name/)
const tutorialsDir = path.join(rootDir, 'tutorials');
if (fs.existsSync(tutorialsDir)) {
  const tutorials = fs.readdirSync(tutorialsDir).filter(f => f.endsWith('.md'));
  tutorials.forEach(file => {
    const name = file.replace('-tutorial.md', '').replace('.md', '');
    buildFile(
      path.join(tutorialsDir, file),
      path.join(docsDir, 'tutorials', name, 'index.html'),
      file.replace('-tutorial.md', '').replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Tutorial',
      '../..',
      '../../api/assets'
    );
  });
}

// Build skills (two levels deep: docs/guides/name/)
const skillsDir = path.join(rootDir, 'resources', 'skills');
if (fs.existsSync(skillsDir)) {
  const skills = fs.readdirSync(skillsDir);
  skills.forEach(skillName => {
    const skillPath = path.join(skillsDir, skillName);
    if (fs.statSync(skillPath).isDirectory()) {
      const mdFiles = fs.readdirSync(skillPath).filter(f => f.endsWith('.md'));
      mdFiles.forEach(file => {
        const name = file.replace('.md', '').toLowerCase();
        const title = file.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        buildFile(
          path.join(skillPath, file),
          path.join(docsDir, 'guides', name, 'index.html'),
          title,
          '../..',
          '../../api/assets'
        );
      });
    }
  });
}

console.log('\nDocs build complete!');
