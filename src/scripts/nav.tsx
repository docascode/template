// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React from 'jsx-dom'
import { getAbsolutePath, getDirectory } from './utility';

export function renderNavbar() {
  var navbarPath = $("meta[name='menu_path']").attr("content");
  if (!navbarPath) {
    return Promise.resolve();
  }

  navbarPath = navbarPath.replace(/\\/g, '/');
  var ul = document.createElement('ul');
  ul.classList.add('nav');
  ul.classList.add('level1');
  ul.classList.add('navbar-nav');

  return fetch(navbarPath).then(response => response.json()).then(data => {
    var activeA;
    var activeLi;
    var maxItemPathLength = 1;
    var navrel = getDirectory(navbarPath);
    var windowPath = getAbsolutePath(window.location.pathname).toLowerCase();
    data.items.forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = navrel + '/' + item.href;
      a.innerHTML = item.name;
      li.appendChild(a);
      ul.appendChild(li);

      if (a.href) {
        var itemPath = getAbsolutePath(a.href).toLowerCase();
        var itemLength = commonPathPrefixLength(windowPath, itemPath);
        if (itemLength > maxItemPathLength) {
          maxItemPathLength = itemPath.length;
          activeA = a;
          activeLi = li;
        }
      }
    });

    if (activeA) {
      activeA.classList.add('active');
    }
    if (activeLi) {
      activeLi.classList.add('active');
    }
    document.getElementById('navbar').appendChild(ul);
  });

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

  function scroll (e) {
    var scrollspy = $('[data-spy="scroll"]').data()['bs.scrollspy'];
    var target = e.target.hash;
    if (scrollspy && target) {
      scrollspy.activate(target);
    }
  }
}
