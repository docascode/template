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
  var hierarchy = getHierarchy();
  if (hierarchy && hierarchy.length > 0) {
    var html = '<h5 class="title">In This Article</h5>'
    html += formList(hierarchy, ['nav', 'bs-docs-sidenav']);
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

  function getHierarchy() {
    // supported headers are h1, h2, h3, and h4
    var $headers = $($.map(['h1', 'h2', 'h3', 'h4'], function (h) { return ".article article " + h; }).join(", "));

    // a stack of hierarchy items that are currently being built
    var stack = [];
    $headers.each(function (i, e) {
      if (!e.id) {
        return;
      }

      var item = {
        name: htmlEncode($(e).text()),
        href: "#" + e.id,
        items: []
      };

      if (!stack.length) {
        stack.push({ type: e.tagName, siblings: [item] });
        return;
      }

      var frame = stack[stack.length - 1];
      if (e.tagName === frame.type) {
        frame.siblings.push(item);
      } else if (e.tagName[1] > frame.type[1]) {
        // we are looking at a child of the last element of frame.siblings.
        // push a frame onto the stack. After we've finished building this item's children,
        // we'll attach it as a child of the last element
        stack.push({ type: e.tagName, siblings: [item] });
      } else {  // e.tagName[1] < frame.type[1]
        // we are looking at a sibling of an ancestor of the current item.
        // pop frames from the stack, building items as we go, until we reach the correct level at which to attach this item.
        while (e.tagName[1] < stack[stack.length - 1].type[1]) {
          buildParent();
        }
        if (e.tagName === stack[stack.length - 1].type) {
          stack[stack.length - 1].siblings.push(item);
        } else {
          stack.push({ type: e.tagName, siblings: [item] });
        }
      }
    });
    while (stack.length > 1) {
      buildParent();
    }

    function buildParent() {
      var childrenToAttach = stack.pop();
      var parentFrame = stack[stack.length - 1];
      var parent = parentFrame.siblings[parentFrame.siblings.length - 1];
      $.each(childrenToAttach.siblings, function (i, child) {
        parent.items.push(child);
      });
    }
    if (stack.length > 0) {

      var topLevel = stack.pop().siblings;
      if (topLevel.length === 1) {  // if there's only one topmost header, dump it
        return topLevel[0].items;
      }
      return topLevel;
    }
    return undefined;
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
