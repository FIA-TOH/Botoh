// ==UserScript==
// @name         Macro-Master
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  try to take over the world!
// @author       You
// @match        */*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

!function(){"use strict";let e="";function t(t){var n;t.nodeType===Node.ELEMENT_NODE&&"P"===t.tagName&&t.textContent.trim().startsWith("Seu código de PitStop é")&&(n=/[0-9]+/.exec(t.textContent.trim())[0],e=n.split("").reverse().join(""),document.keyListenerAdded||(document.addEventListener("keydown",(t=>{let n=document.querySelector("input");if(!n)return;let r="";if("e"===t.key)r="!tyres s";else if("r"===t.key)r="!tyres m";else if("t"===t.key)r="!tyres h";else{if("y"!==t.key)return;r="!tyres t"}t.preventDefault(),n.focus(),document.execCommand("insertText",!1,`${r} ${e}`)})),document.keyListenerAdded=!0))}new MutationObserver((e=>{for(const n of e)n.addedNodes.forEach((e=>{t(e)}))})).observe(document.body,{childList:!0,subtree:!0})}();