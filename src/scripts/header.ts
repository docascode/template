// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export function renderFooter() {
  initFooter();
  $(window).on("scroll", showFooterCore);

  function initFooter() {
    if (needFooter()) {
      shiftUpBottomCss();
      $("footer").show();
    } else {
      resetBottomCss();
      $("footer").hide();
    }
  }

  function showFooterCore() {
    if (needFooter()) {
      shiftUpBottomCss();
      $("footer").fadeIn();
    } else {
      resetBottomCss();
      $("footer").fadeOut();
    }
  }

  function needFooter() {
    var scrollHeight = $(document).height();
    var scrollPosition = $(window).height() + $(window).scrollTop();
    return (scrollHeight - scrollPosition) < 1;
  }

  function resetBottomCss() {
    $(".sidetoc").removeClass("shiftup");
    $(".sideaffix").removeClass("shiftup");
  }

  function shiftUpBottomCss() {
    $(".sidetoc").addClass("shiftup");
    $(".sideaffix").addClass("shiftup");
  }
}

export function renderLogo() {
  // For LOGO SVG
  // Replace SVG with inline SVG
  // http://stackoverflow.com/questions/11978995/how-to-change-color-of-svg-image-using-css-jquery-svg-image-replacement
  jQuery('img.svg').each(function () {
    var $img = jQuery(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgURL = $img.attr('src');

    jQuery.get(imgURL, function (data) {
      // Get the SVG tag, ignore the rest
      var $svg = jQuery(data).find('svg');

      // Add replaced image's ID to the new SVG
      if (typeof imgID !== 'undefined') {
        $svg = $svg.attr('id', imgID);
      }
      // Add replaced image's classes to the new SVG
      if (typeof imgClass !== 'undefined') {
        $svg = $svg.attr('class', imgClass + ' replaced-svg');
      }

      // Remove any invalid XML tags as per http://validator.w3.org
      $svg = $svg.removeAttr('xmlns:a');

      // Replace image with new SVG
      $img.replaceWith($svg);

    }, 'xml');
  });
}

// adjusted from https://stackoverflow.com/a/13067009/1523776
export function workAroundFixedHeaderForAnchors() {
  var HISTORY_SUPPORT = !!(history && history.pushState);
  var ANCHOR_REGEX = /^#[^ ]+$/;

  function getFixedOffset() {
    return $('header').first().height();
  }

  /**
   * If the provided href is an anchor which resolves to an element on the
   * page, scroll to it.
   * @param  {String} href
   * @return {Boolean} - Was the href an anchor.
   */
  function scrollIfAnchor(href, pushToHistory = false) {
    var match, rect, anchorOffset;

    if (!ANCHOR_REGEX.test(href)) {
      return false;
    }

    match = document.getElementById(href.slice(1));

    if (match) {
      rect = match.getBoundingClientRect();
      anchorOffset = window.pageYOffset + rect.top - getFixedOffset();
      window.scrollTo(window.pageXOffset, anchorOffset);

      // Add the state to history as-per normal anchor links
      if (HISTORY_SUPPORT && pushToHistory) {
        history.pushState({}, document.title, location.pathname + href);
      }
    }

    return !!match;
  }

  /**
   * Attempt to scroll to the current location's hash.
   */
  function scrollToCurrent() {
    scrollIfAnchor(window.location.hash);
  }

  /**
   * If the click event's target was an anchor, fix the scroll position.
   */
  function delegateAnchors(e) {
    var elem = e.target;

    if (scrollIfAnchor(elem.getAttribute('href'), true)) {
      e.preventDefault();
    }
  }

  $(window).on('hashchange', scrollToCurrent);

  $(window).on('load', function () {
    // scroll to the anchor if present, offset by the header
    scrollToCurrent();
  });

  $(document).ready(function () {
    // Exclude tabbed content case
    $('a:not([data-tab])').click(function (e) { delegateAnchors(e); });
  });
}
