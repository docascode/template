// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Component, Inline, ReferencePage, TreeNode } from "./reference"
import escape from 'escape-html'
import markdownIt from 'markdown-it'

import gohttp from '../data/arm.yml'

const md = markdownIt('commonmark')

export function showRefDocs() {
  if (window.location.href.includes('/api/')) {
    document.getElementsByTagName('article')[0].innerHTML = render(gohttp as ReferencePage)
  }
}

export function render(e: ReferencePage | Component | Inline) : string {
  if (typeof e === 'string') {
    return html`${e}`
  } else if (e instanceof Object) {
    if ('link' in e) {
      return html`<a href="${e.href}">${e.link}</a>`
    } else if ('id' in e) {
      return html`<h1>${e.title}</h1>` + e.body.map(render).join('')
    } else if ('section' in e) {
      return html`<h2>${e.section}</h2>` + e.body.map(render).join('')
    } else if ('markdown' in e) {
      return md.render(e.markdown)
    } else if ('declaration' in e) {
      if (typeof e.declaration === 'string') {
        return html`<pre><code>${e.declaration}</code></pre>`
      } else {
        return `<pre><code>${e.declaration.map(e => render(e)).join('')}</code></pre>`
      }
    } else if ('code' in e) {
      if (typeof e.code === 'string') {
        return html`<pre><code>${e.code}</code></pre>`
      } else {
        return `<pre><code>${e.code.map(e => render(e)).join('')}</code></pre>`
      }
    } else if ('note' in e) {
      return `<div class="alert alert-info" role="alert">${md.render(e.note)}</div>`
    } else if ('jumplist' in e) {
      return `<table><tbody>${e.jumplist.map(e =>
        html`<tr><td>${render(e.name)}</td><td>${e.description}</td></tr>`).join('')}</tbody></table>`
    } else if ('parameters' in e) {
      return e.parameters.map(e =>
        `<div class="parameterName">${render(e.name)}</div>
        ${e.type != undefined ? html`<div class="parameterType">${e.type}</div>` : ''}
        ${e.required === false ? '<div class="parameterTag">Optional</div>' : ''}
        ${e.required === true ? '<div class="parameterTag red">Required</div>' : ''}
        ${e.default != undefined ? html`<div class="parameterTag">Default: ${e.default}</div>` : ''}
        <div class="parameterDescription">${md.render(e.description)}</div>`).join('')
    } else if ('tree' in e) {
      const renderTreeNodes = (nodes: TreeNode[]): string => `<ul>${nodes.map(e => `<li>${render(e.name)}</li>${e.items ? renderTreeNodes(e.items) : ''}`).join('')}</ul>`
      return renderTreeNodes(e.tree)
    }
  }
  return ''
}

function html(string: TemplateStringsArray, ...values: any[]) {
  let result = string[0]
  for (let i = 0; i < values.length; i++) {
    result += escape(values[i]) + string[i + 1]
  }
  return result
}