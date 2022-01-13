// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React from 'jsx-dom'
import { getAbsolutePath, getDirectory, meta } from './utility';

export async function renderNavbar() {
  const navbarMount = document.getElementById('navbar')
  const navbarPath = meta('menu_path')?.replace(/\\/g, '/')
  if (!navbarPath || !navbarMount) {
    return
  }

  const data = await (await fetch(navbarPath)).json()

  let activeItem
  let maxItemPathLength = 1
  const navrel = getDirectory(navbarPath)
  const windowPath = getAbsolutePath(window.location.pathname).toLowerCase()

  const items = data.items.map(item => {
    const href = navrel + '/' + item.href
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

  if (activeItem) {
    activeItem.active = 'active'
  }

  navbarMount.appendChild(
    <ul class='nav navbar-nav level1'>
      {items.map(item => <li class={item.active}><a href={item.href} class={item.active}>{item.name}</a></li>)}
    </ul>);

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

export function renderBreadcrumb() {
  var breadcrumb = [];
  $('#navbar a.active').each(function (i, e) {
    breadcrumb.push({
      href: e.href,
      name: e.innerText
    });
  })
  $('#toc a.active').each(function (i, e) {
    breadcrumb.push({
      href: e.href,
      name: e.innerText
    });
  })

  document.getElementById('breadcrumb')?.appendChild(
    <ul class='breadcrumb'>
      {breadcrumb.map(item => <li> {item.href ? <a href={item.href}>{item.name}</a> : item.name}</li>)}
    </ul>
  )
}

export function renderAffix() {
  const affixMount = document.getElementById('affix')
  const sections = Array.from(document.querySelectorAll(".article article h2"))
    .map(item => ({ name: item.textContent, href: '#' + item.id }))

  if (!affixMount || sections.length <= 0) {
    return
  }

  affixMount.appendChild(<h5 class='title'>In this Article</h5>)
  affixMount.appendChild(
    <ul class='nav bs-docs-sidenav'>
      {sections.map(item => <li><a href={item.href} onClick={scroll}>{item.name}</a></li>)}
    </ul>
  )

  if ($('footer').is(':visible')) {
    $(".sideaffix").css("bottom", "70px");
  }

  function scroll(e) {
    var scrollspy = $('[data-spy="scroll"]').data()['bs.scrollspy'];
    var target = e.target.hash;
    if (scrollspy && target) {
      scrollspy.activate(target);
    }
  }
}
