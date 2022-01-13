// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import $ from 'jquery'

export function meta(name: string): string {
  return (document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement)?.content
}

export function toggleClass(e: HTMLElement, className: string): void {
  if (e.classList.contains(className)) {
    e.classList.remove(className)
  } else {
    e.classList.add(className)
  }
}

export function getAbsolutePath(href: string): string {
  if (!href) {
    return
  }
  // Use anchor to normalize href
  var anchor = $('<a href="' + href + '"></a>')[0];
  // Ignore protocal, remove search and query
  return anchor.host + anchor.pathname;
}

export function isRelativePath(href: string): boolean {
  if (href === undefined || href === '' || href[0] === '/') {
    return false;
  }
  return !isAbsolutePath(href);
}

export function isAbsolutePath(href: string): boolean {
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
