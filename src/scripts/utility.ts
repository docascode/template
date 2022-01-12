// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import $ from 'jquery'

export function getAbsolutePath(href) {
  // Use anchor to normalize href
  var anchor = $('<a href="' + href + '"></a>')[0];
  // Ignore protocal, remove search and query
  return anchor.host + anchor.pathname;
}

export function isRelativePath(href) {
  if (href === undefined || href === '' || href[0] === '/') {
    return false;
  }
  return !isAbsolutePath(href);
}

export function isAbsolutePath(href) {
  return (/^(?:[a-z]+:)?\/\//i).test(href);
}

export function getDirectory(href) {
  if (!href) return '';
  var index = href.lastIndexOf('/');
  if (index == -1) return '';
  if (index > -1) {
    return href.substr(0, index);
  }
}

export function formList(item, classes) {
  var level = 1;
  var model = {
    items: item
  };
  var cls = [].concat(classes).join(" ");
  return getList(model, cls);

  function getList(model, cls) {
    if (!model || !model.items) return null;
    var l = model.items.length;
    if (l === 0) return null;
    var html = '<ul class="level' + level + ' ' + (cls || '') + '">';
    level++;
    for (var i = 0; i < l; i++) {
      var item = model.items[i];
      var href = item.href;
      var name = item.name;
      if (!name) continue;
      html += href ? '<li><a href="' + href + '">' + name + '</a>' : '<li>' + name;
      html += getList(item, cls) || '';
      html += '</li>';
    }
    html += '</ul>';
    return html;
  }
}