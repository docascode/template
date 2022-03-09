// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React from 'jsx-dom'
import { getAbsolutePath, getDirectory, isRelativePath, isVisible, meta } from './utility';

export interface NavItem {
  name: string
  href?: string
}

export async function renderNavbar() {
  const navbarElement = document.getElementById('navbar')
  const navbarPath = meta('menu_path')?.replace(/\\/g, '/')
  if (!navbarPath || !navbarElement) {
    return
  }

  const data = await (await fetch(navbarPath)).json()

  let activeItem: NavItem
  let maxItemPathLength = 1
  const navrel = getDirectory(navbarPath)
  const windowPath = getAbsolutePath(window.location.pathname).toLowerCase()

  const items = data.items.map(item => {
    const href = isRelativePath(item.href) ? navrel + '/' + item.href : item.href;
    const result = { href: href, name: item.name }
    if (href) {
      const itemPath = getAbsolutePath(href).toLowerCase();
      const itemLength = commonPathPrefixLength(windowPath, itemPath);
      if (itemLength > maxItemPathLength) {
        maxItemPathLength = itemLength
        activeItem = result
      }
    }
    return result
  })

  navbarElement.appendChild(
    <ul class='nav navbar-nav'> {
      items.map(item => {
        const current = (item === activeItem ? 'page' : false)
        const active = (item === activeItem ? 'active' : null)
        return <li class='nav-item'><a class={['nav-link', active]} href={item.href} aria-current={current}>{item.name}</a></li>
      })
    } </ul>)

  function commonPathPrefixLength(path1, path2) {
    var items1 = path1.split('/');
    var items2 = path2.split('/');
    var length = items1.length > items2.length ? items2.length : items1.length;
    for (var i = 0; i < length; i++) {
      if (items1[i] !== items2[i]) {
        return i;
      }
    }
    return length;
  }
}

export function renderAside() {
  const inThisArticle = document.getElementById('in-this-article')
  const sections = Array.from(document.querySelectorAll("article h2"))
    .filter(e => isVisible(e))
    .map(item => ({ name: item.textContent, href: '#' + item.id }))

  if (!inThisArticle || sections.length <= 0) {
    return
  }

  document.body.setAttribute('data-bs-spy', 'scroll');
  document.body.setAttribute('data-bs-target', '#in-this-article');

  inThisArticle.appendChild(<h5 class='title'>In this Article</h5>)
  inThisArticle.appendChild(
    <ul class='nav'>
      {sections.map(item => {
        // https://github.com/twbs/bootstrap/pull/35566
        const target = item.href && item.href[0] === '#' ? '#' + CSS.escape(item.href.slice(1)) : item.href
        return <a class='nav-link' data-bs-target={target} href={item.href}>{item.name}</a>
      })}
    </ul>
  )
}
