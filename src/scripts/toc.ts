// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import $ from 'jquery'
import { getAbsolutePath, getDirectory, isRelativePath } from './utility';

const active = 'active';
const expanded = 'in';
const filtered = 'filtered';
const show = 'show';
const hide = 'hide';

export function renderToc() {
  var tocPath = $("meta[name='toc_rel']").attr("content");
  if (!tocPath) {
    return Promise.resolve();
  }
  tocPath = tocPath.replace(/\\/g, '/');

  return fetch(tocPath).then(response => response.text()).then(tocHtml => {
    document.getElementById('sidetoc').innerHTML = tocHtml;
    var tocrel = getDirectory(tocPath);
    var currentHref = getAbsolutePath(window.location.pathname);
    $('#sidetoc').find('a[href]').each(function (i, e) {
      var href = $(e).attr("href");
      if (isRelativePath(href)) {
        href = tocrel + '/' + href;
        $(e).attr("href", href);
      }

      if (getAbsolutePath(e.href) === currentHref) {
        $(e).addClass(active);
      }

      $(e).breakWord();
    });

    registerTocEvents();
  });

  function registerTocEvents() {
    var tocFilterInput = $('#toc_filter_input');
    var tocFilterClearButton = $('#toc_filter_clear');

    $('.toc .nav > li > .expand-stub').click(function (e) {
      $(e.target).parent().toggleClass(expanded);
    });
    $('.toc .nav > li > .expand-stub + a:not([href])').click(function (e) {
      $(e.target).parent().toggleClass(expanded);
    });
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
