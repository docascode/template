// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { formList, getAbsolutePath, getDirectory } from "./utility";

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
      name: e.innerHTML
    });
  })
  $('#toc a.active').each(function (i, e) {
    breadcrumb.push({
      href: e.href,
      name: e.innerHTML
    });
  })

  var html = formList(breadcrumb, 'breadcrumb');
  $('#breadcrumb').html(html);
}

export function renderAffix() {
  var sections = Array.from(document.querySelectorAll(".article article h2"))
    .map(item => ({ name: htmlEncode(item.textContent), href: '#' + item.id }))

  if (sections.length > 0) {
    var html = '<h5 class="title">In This Article</h5>'
    html += formList(sections, ['nav', 'bs-docs-sidenav']);
    $("#affix").empty().append(html);
    if ($('footer').is(':visible')) {
      $(".sideaffix").css("bottom", "70px");
    }
    $('#affix a').click(function (e) {
      var scrollspy = $('[data-spy="scroll"]').data()['bs.scrollspy'];
      var target = e.target.hash;
      if (scrollspy && target) {
        scrollspy.activate(target);
      }
    });
  }

  function htmlEncode(str) {
    if (!str) return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
