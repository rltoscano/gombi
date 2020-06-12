const projectStyles = document.createElement('dom-module');
projectStyles.innerHTML = `
<template>
  <style>
    :host {
      padding: 16px;
      background-color: #333;
      color: white;
    }
    h1 {
      font-size: 14pt;
    }
    h2 {
      font-size: 12pt;
    }
    p {
      max-width: 65em;
      text-align: justify;
      line-height: 1.8em;
    }
    a {
      color: cornflowerblue;
    }
    a:visited {
      color: cornflowerblue;
    }
  </style>
</template>`;
projectStyles.register('project-styles');
