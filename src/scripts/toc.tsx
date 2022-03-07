// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React, { createRef } from 'jsx-dom'
import { NavItem } from './nav';
import { getAbsolutePath, getDirectory, isRelativePath, meta } from './utility'

interface TocNode extends NavItem {
  items?: TocNode[]
}

export async function renderToc() {
  const tocPath = meta('toc_rel')?.replace(/\\/g, '/')
  const tocElement = document.getElementById('toc')
  if (!tocPath || !tocElement) {
    return
  }

  const toc = await (await fetch(tocPath)).json()
  const tocrel = getDirectory(tocPath)
  const currentHref = getAbsolutePath(window.location.pathname)
  const activeNodes: TocNode[] = []
  let activeElement: React.RefObject<HTMLElement>

  toc.items ||= []
  toc.items.map(expandNodes)
  tocElement.appendChild(<ul>{buildTocNodes(toc.items)}</ul>)
  registerTocEvents()

  if (activeElement) {
    activeElement.current.scrollIntoView({ block: 'nearest' })
  }

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

  function buildTocNodes(nodes: TocNode[]) {
    return nodes.map(node => {
      const li = createRef()
      const { href, name, items } = node
      const isLeaf = !items || items.length <= 0
      const active = activeNodes.includes(node)
      const activeClass= active ? 'active' : null

      if (active) {
        activeElement = li
      }

      return (
        <li ref={li} class={activeClass}>
          {isLeaf ? null : <i class='toggle' onClick={() => toggleTocNode(li.current)}></i>}
          {href
            ? <a class={activeClass} href={href}>{name}</a>
            : <a class={activeClass} onClick={() => toggleTocNode(li.current)}>{name}</a>}
          {isLeaf ? null : <ul>{buildTocNodes(items)}</ul>}
        </li>)
    })
  }

  function toggleTocNode(li: HTMLLIElement) {
    if (li.classList.contains('active') || li.classList.contains('filtered')) {
      li.classList.remove('active')
      li.classList.remove('filtered')
    } else {
      li.classList.add('active')
    }
  }

  function registerTocEvents() {
    const tocFilter = document.getElementById('toc-filter') as HTMLInputElement
    if (!tocFilter) {
      return
    }

    tocFilter.addEventListener('input', () => onTocFilterTextChange())

    // Set toc filter from local session storage on page load
    const filterString = sessionStorage?.filterString
    if (filterString) {
      tocFilter.value = filterString
      onTocFilterTextChange()
    }

    function onTocFilterTextChange() {
      const filter = tocFilter.value?.toLocaleLowerCase() || ''
      if (sessionStorage) {
        sessionStorage.filterString = filter
      }

      const toc = document.getElementById('toc')
      const anchors = toc.querySelectorAll('a')

      if (filter == '') {
        anchors.forEach(a => a.parentElement.classList.remove('filtered', 'hide'))
        return
      }

      const filteredLI = new Set<HTMLElement>()
      anchors.forEach(a => {
        const text = a.innerText
        if (text && text.toLowerCase().indexOf(filter) >= 0) {
          let e: HTMLElement = a
          while (e && e !== toc) {
            e = e.parentElement
            filteredLI.add(e)
          }
        }
      })

      anchors.forEach(a => {
        const li = a.parentElement
        if (filteredLI.has(li)) {
          li.classList.remove('hide')
          li.classList.add('filtered')
        } else {
          li.classList.add('hide')
        }
      })
    }
  }
}
