// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import $ from 'jquery'
import React, { createRef } from 'jsx-dom'
import { getAbsolutePath, getDirectory, isRelativePath, meta, toggleClass } from './utility'

const active = 'active';
const expanded = 'in';
const filtered = 'filtered';
const show = 'show';
const hide = 'hide';

interface TocNode {
  name: string
  href: string | undefined
  items: TocNode[] | undefined
}

export async function renderToc() {
  const tocPath = meta('toc_rel')?.replace(/\\/g, '/')
  const tocMount = document.getElementById('toc')
  if (!tocPath || !tocMount) {
    return
  }

  const toc = await (await fetch(tocPath)).json()
  const tocrel = getDirectory(tocPath)
  const currentHref = getAbsolutePath(window.location.pathname)
  tocMount.appendChild(<ul class='nav level1'>{buildTocNodes(toc.items)}</ul>)
  registerTocEvents()

  function buildTocNodes(nodes: TocNode[], level: number = 1) {
    return nodes.map(node => {
      const li = createRef()
      const href = isRelativePath(node.href) ? tocrel + '/' + node.href : node.href
      const isLeaf = !node.items || node.items.length <= 0
      const isActive = getAbsolutePath(href) == currentHref
      return (
        <li ref={li}>
          {isLeaf ? null : <span class='expand-stub' onClick={() => toggleClass(li.current, expanded)}></span>}
          {href
            ? <a class={isActive ? active : null} href={href}>{node.name}</a>
            : <a onClick={() => toggleClass(li.current, expanded)}>{node.name}</a>}
          {isLeaf ? null : <ul class={['nav', `level${level + 1}`]}>{buildTocNodes(node.items, level + 1)}</ul>}
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

    // Scroll to active item
    var top = 0;
    $('#toc a.active').parents('li').each(function (i, e) {
      $(e).addClass(active).addClass(expanded);
      $(e).children('a').addClass(active);
    })
    $('#toc a.active').parents('li').each(function (i, e) {
      top += $(e).position().top;
    })
    $('.sidetoc').scrollTop(top - 50);

    if ($('footer').is(':visible')) {
      $('.sidetoc').addClass('shiftup');
    }
  }
}

