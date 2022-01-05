// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import AnchorJs from 'anchor-js';

export function enableAnchor() {
  const anchors = new AnchorJs()
  anchors.options = {
    placement: 'left',
    visible: 'touch'
  };
  anchors.add('article h2:not(.no-anchor), article h3:not(.no-anchor), article h4:not(.no-anchor)');
}
