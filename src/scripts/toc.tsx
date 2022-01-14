// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import $ from 'jquery'
import React, { createRef } from 'jsx-dom'
import { NavItem } from './nav';
import { getAbsolutePath, getDirectory, isRelativePath, meta, toggleClass } from './utility'

const filtered = 'filtered';
const show = 'show';
const hide = 'hide';

interface TocNode extends NavItem {
  items?: TocNode[]
}

export async function renderToc(): Promise<TocNode[]> {
  const tocPath = meta('toc_rel')?.replace(/\\/g, '/')
  const tocMount = document.getElementById('toc')
  if (!tocPath || !tocMount) {
    return
  }

  const toc = await (await fetch(tocPath)).json()
  const tocrel = getDirectory(tocPath)
  const currentHref = getAbsolutePath(window.location.pathname)
  const activeNodes: TocNode[] = []
  let activeElement: React.RefObject<HTMLElement>

  toc.items ||= []
  toc.items.map(expandNodes)
  tocMount.appendChild(<ul class='nav level1'>{buildTocNodes(toc.items)}</ul>)
  registerTocEvents()

  if (activeElement) {
    activeElement.current.scrollIntoView()
  }

  return activeNodes

  function expandNodes(node: TocNode): boolean {
    let isActive = false
    if (node.href) {
      node.href = isRelativePath(node.href) ? tocrel + '/' + node.href : node.href
      if (getAbsolutePath(node.href) == currentHref) {
        isActive = true
      }
    }
    
    if (node.items) {
      for (const item of node.items) {
        if (expandNodes(item)) {
          isActive = true
        }
      }
    }

    if (isActive) {
      activeNodes.unshift(node)
      return true
    }
    return false
  }

  function buildTocNodes(nodes: TocNode[], level: number = 1) {
    return nodes.map(node => {
      const li = createRef()
      const { href, name, items } = node
      const isLeaf = !items || items.length <= 0
      const active = activeNodes.includes(node)

      if (active) {
        activeElement = li
      }

      return (
        <li ref={li} class={active ? ['in', 'active'] : null}>
          {isLeaf ? null : <span class='expand-stub' onClick={() => toggleClass(li.current, 'in')}></span>}
          {href
            ? <a class={active ? 'active' : null} href={href}>{name}</a>
            : <a class={active ? 'active' : null} onClick={() => toggleClass(li.current, 'in')}>{name}</a>}
          {isLeaf ? null : <ul class={['nav', `level${level + 1}`]}>{buildTocNodes(items, level + 1)}</ul>}
        </li>)
    })
  }

  function registerTocEvents() {
    var tocFilterInput = $('#toc_filter_input');
    var tocFilterClearButton = $('#toc_filter_clear');

    tocFilterInput.on('focus', () => {
      tocFilterInput.parent().addClass('focused');
    });
    tocFilterInput.on('blur', () => {
      tocFilterInput.parent().removeClass('focused');
    });
    tocFilterInput.on('input', function (e) {
      var val = this.value;
      //Save filter string to local session storage
      if (typeof (Storage) !== "undefined") {
        try {
          sessionStorage.filterString = val;
        }
        catch (e) { }
      }
      if (val === '') {
        // Clear 'filtered' class
        $('#toc li').removeClass(filtered).removeClass(hide);
        tocFilterClearButton.fadeOut();
        return;
      }
      tocFilterClearButton.fadeIn();

      // set all parent nodes status
      $('#toc li>a').filter(function (i, e) {
        return $(e).siblings().length > 0
      }).each(function (i, anchor) {
        var parent = $(anchor).parent();
        parent.addClass(hide);
        parent.removeClass(show);
        parent.removeClass(filtered);
      })

      // Get leaf nodes
      $('#toc li>a').filter(function (i, e) {
        return $(e).siblings().length === 0
      }).each(function (i, anchor) {
        var text = $(anchor).attr('title');
        var parent = $(anchor).parent();
        var parentNodes = parent.parents('ul>li');
        for (const parentNode of parentNodes) {
          var parentText = $(parentNode).children('a').attr('title');
          if (parentText) text = parentText + '.' + text;
        };
        if (filterNavItem(text, val)) {
          parent.addClass(show);
          parent.removeClass(hide);
        } else {
          parent.addClass(hide);
          parent.removeClass(show);
        }
      });
      $('#toc li>a').filter(function (i, e) {
        return $(e).siblings().length > 0
      }).each(function (i, anchor) {
        var parent = $(anchor).parent();
        if (parent.find('li.show').length > 0) {
          parent.addClass(show);
          parent.addClass(filtered);
          parent.removeClass(hide);
        } else {
          parent.addClass(hide);
          parent.removeClass(show);
          parent.removeClass(filtered);
        }
      })

      function filterNavItem(name, text) {
        if (!text) return true;
        if (name && name.toLowerCase().indexOf(text.toLowerCase()) > -1) return true;
        return false;
      }
    });

    // toc filter clear button
    tocFilterClearButton.hide();
    tocFilterClearButton.on("click", function (e) {
      tocFilterInput.val("");
      tocFilterInput.trigger('input');
      if (typeof (Storage) !== "undefined") {
        try {
          sessionStorage.filterString = "";
        }
        catch (e) { }
      }
    });

    //Set toc filter from local session storage on page load
    if (typeof (Storage) !== "undefined") {
      try {
        tocFilterInput.val(sessionStorage.filterString);
        tocFilterInput.trigger('input');
      }
      catch (e) { }
    }
    if ($('footer').is(':visible')) {
      $('.sidetoc').addClass('shiftup');
    }

    if ($('footer').is(':visible')) {
      $('.sidetoc').addClass('shiftup');
    }
  }
}

