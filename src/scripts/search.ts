// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

require('twbs-pagination')
require('mark.js')

const collapsed = 'collapsed';

function enableSearch() {
  var query;
  var relHref = $("meta[property='docfx\\:rel']").attr("content");
  if (typeof relHref === 'undefined') {
    return;
  }
  try {
    var worker = new Worker(relHref + 'styles/search-worker.js');
    if (!worker && !window.worker) {
      localSearch();
    } else {
      webWorkerSearch();
    }

    renderSearchBox();
    highlightKeywords();
    addSearchEvent();
  } catch (e) {
    console.error(e);
  }

  //Adjust the position of search box in navbar
  function renderSearchBox() {
    autoCollapse();
    $(window).on('resize', autoCollapse);
    $(document).on('click', '.navbar-collapse.in', function (e) {
      if ($(e.target).is('a')) {
        $(this).collapse('hide');
      }
    });

    function autoCollapse() {
      var navbar = $('#autocollapse');
      if (navbar.height() === null) {
        setTimeout(autoCollapse, 300);
      }
      navbar.removeClass(collapsed);
      if (navbar.height() > 60) {
        navbar.addClass(collapsed);
      }
    }
  }

  // Search factory
  function localSearch() {
    console.log("using local search");
    var lunrIndex = lunr(function () {
      this.ref('href');
      this.field('title', { boost: 50 });
      this.field('keywords', { boost: 20 });
    });
    lunr.tokenizer.seperator = /[\s\-\.]+/;
    var searchData = {};
    var searchDataRequest = new XMLHttpRequest();

    var indexPath = relHref + "index.json";
    if (indexPath) {
      searchDataRequest.open('GET', indexPath);
      searchDataRequest.onload = function () {
        if (this.status != 200) {
          return;
        }
        searchData = JSON.parse(this.responseText);
        for (var prop in searchData) {
          if (searchData.hasOwnProperty(prop)) {
            lunrIndex.add(searchData[prop]);
          }
        }
      }
      searchDataRequest.send();
    }

    $("body").bind("queryReady", function () {
      var hits = lunrIndex.search(query);
      var results = [];
      hits.forEach(function (hit) {
        var item = searchData[hit.ref];
        results.push({ 'href': item.href, 'title': item.title, 'keywords': item.keywords });
      });
      handleSearchResults(results);
    });
  }

  function webWorkerSearch() {
    console.log("using Web Worker");
    var indexReady = $.Deferred();

    worker.onmessage = function (oEvent) {
      switch (oEvent.data.e) {
        case 'index-ready':
          indexReady.resolve();
          break;
        case 'query-ready':
          var hits = oEvent.data.d;
          handleSearchResults(hits);
          break;
      }
    }

    indexReady.promise().done(function () {
      $("body").bind("queryReady", function () {
        worker.postMessage({ q: query });
      });
      if (query && (query.length >= 3)) {
        worker.postMessage({ q: query });
      }
    });
  }

  // Highlight the searching keywords
  function highlightKeywords() {
    var q = url('?q');
    if (q !== null) {
      var keywords = q.split("%20");
      keywords.forEach(function (keyword) {
        if (keyword !== "") {
          $('.data-searchable *').mark(keyword);
          $('article *').mark(keyword);
        }
      });
    }
  }

  function addSearchEvent() {
    $('body').bind("searchEvent", function () {
      $('#search-query').keypress(function (e) {
        return e.which !== 13;
      });

      $('#search-query').keyup(function () {
        query = $(this).val();
        if (query.length < 3) {
          flipContents("show");
        } else {
          flipContents("hide");
          $("body").trigger("queryReady");
          $('#search-results>.search-list').text('Search Results for "' + query + '"');
        }
      }).off("keydown");
    });
  }

  function flipContents(action) {
    if (action === "show") {
      $('.hide-when-search').show();
      $('#search-results').hide();
    } else {
      $('.hide-when-search').hide();
      $('#search-results').show();
    }
  }

  function relativeUrlToAbsoluteUrl(currentUrl, relativeUrl) {
    var currentItems = currentUrl.split(/\/+/);
    var relativeItems = relativeUrl.split(/\/+/);
    var depth = currentItems.length - 1;
    var items = [];
    for (var i = 0; i < relativeItems.length; i++) {
      if (relativeItems[i] === '..') {
        depth--;
      } else if (relativeItems[i] !== '.') {
        items.push(relativeItems[i]);
      }
    }
    return currentItems.slice(0, depth).concat(items).join('/');
  }

  function extractContentBrief(content) {
    var briefOffset = 512;
    var words = query.split(/\s+/g);
    var queryIndex = content.indexOf(words[0]);
    var briefContent;
    if (queryIndex > briefOffset) {
      return "..." + content.slice(queryIndex - briefOffset, queryIndex + briefOffset) + "...";
    } else if (queryIndex <= briefOffset) {
      return content.slice(0, queryIndex + briefOffset) + "...";
    }
  }

  function handleSearchResults(hits) {
    var numPerPage = 10;
    $('#pagination').empty();
    $('#pagination').removeData("twbs-pagination");
    if (hits.length === 0) {
      $('#search-results>.sr-items').html('<p>No results found</p>');
    } else {
      $('#pagination').twbsPagination({
        totalPages: Math.ceil(hits.length / numPerPage),
        visiblePages: 5,
        onPageClick: function (event, page) {
          var start = (page - 1) * numPerPage;
          var curHits = hits.slice(start, start + numPerPage);
          $('#search-results>.sr-items').empty().append(
            curHits.map(function (hit) {
              var currentUrl = window.location.href;
              var itemRawHref = relativeUrlToAbsoluteUrl(currentUrl, relHref + hit.href);
              var itemHref = relHref + hit.href + "?q=" + query;
              var itemTitle = hit.title;
              var itemBrief = extractContentBrief(hit.keywords);

              var itemNode = $('<div>').attr('class', 'sr-item');
              var itemTitleNode = $('<div>').attr('class', 'item-title').append($('<a>').attr('href', itemHref).attr("target", "_blank").text(itemTitle));
              var itemHrefNode = $('<div>').attr('class', 'item-href').text(itemRawHref);
              var itemBriefNode = $('<div>').attr('class', 'item-brief').text(itemBrief);
              itemNode.append(itemTitleNode).append(itemHrefNode).append(itemBriefNode);
              return itemNode;
            })
          );
          query.split(/\s+/).forEach(function (word) {
            if (word !== '') {
              $('#search-results>.sr-items *').mark(word);
            }
          });
        }
      });
    }
  }
};
