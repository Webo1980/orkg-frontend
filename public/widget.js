!function(){"use strict";var e={240:function(e,n,t){var r=t(81),o=t.n(r),a=t(645),i=t.n(a)()(o());i.push([e.id,".orkg-widget-box {\n    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\n    border: 1px solid rgb(232, 97, 97);\n}\n.orkg-widget-link {\n    color: #fff;\n    background-color: rgb(232, 97, 97);\n    border-color: rgb(232, 97, 97);\n    padding: 6px 12px;\n    display: block;\n    margin-bottom: 0 !important;\n    font-size: 14px;\n    font-weight: 400;\n    line-height: 1.42857143;\n    text-align: center;\n    white-space: nowrap;\n    touch-action: manipulation;\n    cursor: pointer;\n    user-select: none;\n    background-image: none;\n    border: 1px solid transparent;\n    text-decoration: none;\n}\n.orkg-widget-link:hover,\n.orkg-widget-link:focus {\n    color: #fff;\n    background-color: #e34040;\n    border-color: #e23434;\n}\n.orkg-widget-description {\n    padding: 5px;\n}\n.orkg-widget-label {\n    position: relative;\n    left: -3px;\n    text-align: left;\n    display: inline-block;\n    background: transparent;\n}\n.orkg-widget-icon {\n    width: 24px;\n    vertical-align: middle;\n}\n.orkg-widget-statements {\n    float: right;\n    font-weight: bold;\n}\n",""]),n.Z=i},645:function(e){e.exports=function(e){var n=[];return n.toString=function(){return this.map((function(n){var t="",r=void 0!==n[5];return n[4]&&(t+="@supports (".concat(n[4],") {")),n[2]&&(t+="@media ".concat(n[2]," {")),r&&(t+="@layer".concat(n[5].length>0?" ".concat(n[5]):""," {")),t+=e(n),r&&(t+="}"),n[2]&&(t+="}"),n[4]&&(t+="}"),t})).join("")},n.i=function(e,t,r,o,a){"string"==typeof e&&(e=[[null,e,void 0]]);var i={};if(r)for(var s=0;s<this.length;s++){var c=this[s][0];null!=c&&(i[c]=!0)}for(var d=0;d<e.length;d++){var l=[].concat(e[d]);r&&i[l[0]]||(void 0!==a&&(void 0===l[5]||(l[1]="@layer".concat(l[5].length>0?" ".concat(l[5]):""," {").concat(l[1],"}")),l[5]=a),t&&(l[2]?(l[1]="@media ".concat(l[2]," {").concat(l[1],"}"),l[2]=t):l[2]=t),o&&(l[4]?(l[1]="@supports (".concat(l[4],") {").concat(l[1],"}"),l[4]=o):l[4]="".concat(o)),n.push(l))}},n}},81:function(e){e.exports=function(e){return e[1]}},379:function(e){var n=[];function t(e){for(var t=-1,r=0;r<n.length;r++)if(n[r].identifier===e){t=r;break}return t}function r(e,r){for(var a={},i=[],s=0;s<e.length;s++){var c=e[s],d=r.base?c[0]+r.base:c[0],l=a[d]||0,u="".concat(d," ").concat(l);a[d]=l+1;var p=t(u),f={css:c[1],media:c[2],sourceMap:c[3],supports:c[4],layer:c[5]};if(-1!==p)n[p].references++,n[p].updater(f);else{var g=o(f,r);r.byIndex=s,n.splice(s,0,{identifier:u,updater:g,references:1})}i.push(u)}return i}function o(e,n){var t=n.domAPI(n);t.update(e);return function(n){if(n){if(n.css===e.css&&n.media===e.media&&n.sourceMap===e.sourceMap&&n.supports===e.supports&&n.layer===e.layer)return;t.update(e=n)}else t.remove()}}e.exports=function(e,o){var a=r(e=e||[],o=o||{});return function(e){e=e||[];for(var i=0;i<a.length;i++){var s=t(a[i]);n[s].references--}for(var c=r(e,o),d=0;d<a.length;d++){var l=t(a[d]);0===n[l].references&&(n[l].updater(),n.splice(l,1))}a=c}}},569:function(e){var n={};e.exports=function(e,t){var r=function(e){if(void 0===n[e]){var t=document.querySelector(e);if(window.HTMLIFrameElement&&t instanceof window.HTMLIFrameElement)try{t=t.contentDocument.head}catch(e){t=null}n[e]=t}return n[e]}(e);if(!r)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");r.appendChild(t)}},216:function(e){e.exports=function(e){var n=document.createElement("style");return e.setAttributes(n,e.attributes),e.insert(n,e.options),n}},565:function(e,n,t){e.exports=function(e){var n=t.nc;n&&e.setAttribute("nonce",n)}},795:function(e){e.exports=function(e){var n=e.insertStyleElement(e);return{update:function(t){!function(e,n,t){var r="";t.supports&&(r+="@supports (".concat(t.supports,") {")),t.media&&(r+="@media ".concat(t.media," {"));var o=void 0!==t.layer;o&&(r+="@layer".concat(t.layer.length>0?" ".concat(t.layer):""," {")),r+=t.css,o&&(r+="}"),t.media&&(r+="}"),t.supports&&(r+="}");var a=t.sourceMap;a&&"undefined"!=typeof btoa&&(r+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(a))))," */")),n.styleTagTransform(r,e,n.options)}(n,e,t)},remove:function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(n)}}}},589:function(e){e.exports=function(e,n){if(n.styleSheet)n.styleSheet.cssText=e;else{for(;n.firstChild;)n.removeChild(n.firstChild);n.appendChild(document.createTextNode(e))}}}},n={};function t(r){var o=n[r];if(void 0!==o)return o.exports;var a=n[r]={id:r,exports:{}};return e[r](a,a.exports,t),a.exports}t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,{a:n}),n},t.d=function(e,n){for(var r in n)t.o(n,r)&&!t.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:n[r]})},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.nc=void 0,function(){var e=t(379),n=t.n(e),r=t(795),o=t.n(r),a=t(569),i=t.n(a),s=t(565),c=t.n(s),d=t(216),l=t.n(d),u=t(589),p=t.n(u),f=t(240),g={};g.styleTagTransform=p(),g.setAttributes=c(),g.insert=i().bind(null,"head"),g.domAPI=o(),g.insertStyleElement=l();n()(f.Z,g),f.Z&&f.Z.locals&&f.Z.locals;var m={add:{de:"Artikel zu ORKG hinzufügen",en:"Add paper to ORKG"},open:{de:"In ORKG öffnen",en:"Open in ORKG"},numStatements:{de:"Anzahl der Aussagen",en:"Number of statements"}};function v(e){for(var n=document.getElementsByClassName("orkg-widget"),t=function(t){var r=document.createElement("div");r.innerHTML='<div class="orkg-widget-box"> <a href="#" class="orkg-widget-link" target="_blank"> <span class="orkg-widget-label"> <img src="#" class="orkg-widget-icon"/> <span class="orkg-widget-txt-link">Open in ORKG</span> </span> </a> <div class="orkg-widget-description"> <span class="orkg-widget-text-statements">Number of statements</span> <span class="orkg-widget-statements">0</span> </div> </div> ',r.getElementsByClassName("orkg-widget-icon")[0].src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAkCAMAAADfNcjQAAAArlBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8tivQqAAAAOXRSTlMABAf6EfcL1oE7xDYYWu/ib5R8VElA5si4l4+JdBzrv08z8d7OsqydhGNeRjArJiHboHgVD6i6Z6J3b8ivAAACPElEQVQ4y3VUB5KjQAwUOWewiY7rnNfe2+v/f+zEDK7yVdmiCmZoqdXSCOjFFMosRDt+vjeFfoHxCC0pH3APWkD6Gs4nDhcNQ4r19Z5ACRDqjNMcxXuKY2PLVOW6J1J4Ofg9zqeLrqQ/sSIdnEh9DfRKDcDeBlCR5B576nxXr9w/rUnkwFgnm+nc0gxtpD8Er53Os9xxcnti+TS29KEEDWUe2R27OA1J042Kwm9SFY46jRfW6QZMGp/MVGpUyb3SuJZ5dccz6ZJGwKilgykZ1IlLe0tKz7H0eeFvQ8DNht7u0bLkGSl8BZiYoojzD6DZQqw+CjnoOFaZi2JYQxtodgWmR15OkVIfa/PNrPE8Ao7cAIUTXG5XlYTHgQ7FFq6AJUkc/LLauS/3rGxLNqYSHkg0GFjTkDW5EaVwXx3u0AyUpIjNX5dvrdTw1FnYwKLwxa4JTa5iJ6uQeArDy749O+oblsHra56BdxL2XOBrTvSYoCbSFxvRKA9GJ+B7bQCJ2p+EoxknatAJ4gvCM8NmHAHX2ZCrQkLhIF51nDt1scXaav05k2dtSbjxcfehm3CU7QCtdES0MBppZCwvwvkbgHGM1p6at7n+nGPNIhvGqqqmQcIjB1E4ndLyTxVnOb/DjEMnYFsdACxNmdw858nXAoB7ELNU7HeZQ/tV3Q3igp5I7brHUMzT4mQY1abv3AsoBSvmEp7oWRuT8vbrLlD2/fOt+6f/wwYx57bsj78QdYUfO5p+xJlkGxrV//A/nMo2F7Pql/EAAAAASUVORK5CYII=";var o=n[t],a=o.getAttribute("data-doi");(function(e){var n="https://www.orkg.org/api/widgets/?doi="+e;return new Promise((function(e,t){fetch(n).then((function(n){if(n.ok){var r=n.json();if(!r.then)return e(r);r.then(e).catch(t)}else t({error:new Error("Error response. (".concat(n.status,") ").concat(n.statusText)),statusCode:n.status,statusText:n.statusText})})).catch(t)}))})(a).then((function(n){for(r.getElementsByClassName("orkg-widget-txt-link")[0].textContent=m.open[e.language],r.getElementsByClassName("orkg-widget-text-statements")[0].textContent=m.numStatements[e.language],r.getElementsByClassName("orkg-widget-statements")[0].textContent=n.num_statements,r.getElementsByClassName("orkg-widget-link")[0].href="https://www.orkg.org/paper/"+n.id;r.children.length>0;)o.appendChild(r.children[0])})).catch((function(n){r.getElementsByClassName("orkg-widget-txt-link")[0].textContent=m.add[e.language],r.getElementsByClassName("orkg-widget-link")[0].href="https://www.orkg.org/add-paper?entry="+a;var t=r.getElementsByClassName("orkg-widget-description")[0];for(t.parentNode.removeChild(t);r.children.length>0;)o.appendChild(r.children[0])}))},r=0;r<n.length;r++)t(r)}var h=["paper"];function w(e,n){if(!e)throw Error("API method required");if(e=e.toLowerCase(),-1===h.indexOf(e))throw Error("Method ".concat(e," is not supported"));if("paper"===e)v(n);else console.warn("No handler defined for ".concat(e))}!function(e){var n=e[e["ORKG-Widget"]],t=n.q;if(t)for(var r=0;r<t.length;r++)w(t[r][0],t[r][1]);n=w}(window)}()}();