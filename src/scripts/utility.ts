// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export function meta(name: string): string {
  return (document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement)?.content
}

export function isVisible(element: Element): boolean {
  return (element as HTMLElement).offsetParent != null
}

export function getAbsolutePath(href: string): string {
  if (!href) {
    return
  }
  const a = document.createElement('a')
  a.href = href
  return a.host + a.pathname;
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

export function getDirectory(href: string): string {
  if (!href) return '.';
  var index = href.lastIndexOf('/');
  return index < 0 ? '.' : href.slice(0, index);
}
