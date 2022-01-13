// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import hljs from 'highlight.js';

export function highlight() {
  document.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block as HTMLElement)
  })

  document.querySelectorAll('pre code[highlight-lines]').forEach(block => {
    if (block.innerHTML === "") return
    var lines = block.innerHTML.split('\n')

    var queryString = block.getAttribute('highlight-lines')
    if (!queryString) return

    var ranges = queryString.split(',')
    for (var j = 0, range; range = ranges[j++];) {
      var found = range.match(/^(\d+)\-(\d+)?$/)
      if (found) {
        // consider region as `{startlinenumber}-{endlinenumber}`, in which {endlinenumber} is optional
        var start = +found[1]
        var end = +found[2]
        if (isNaN(end) || end > lines.length) {
          end = lines.length
        }
      } else {
        // consider region as a sigine line number
        if (isNaN(range)) continue
        var start = +range
        var end = start
      }
      if (start <= 0 || end <= 0 || start > end || start > lines.length) {
        // skip current region if invalid
        continue;
      }
      lines[start - 1] = '<span class="line-highlight">' + lines[start - 1]
      lines[end - 1] = lines[end - 1] + '</span>'
    }

    block.innerHTML = lines.join('\n')
  })
}