// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import $ from 'jquery'

window.jQuery = $
window.$ = $

require('bootstrap')

import { enableAnchor } from './scripts/anchor'
import { highlight } from './scripts/highlight'
import { renderAlerts, renderLinks, renderTables, renderTabs } from './scripts/markdown'
import { renderAside, renderBreadcrumb, renderNavbar } from './scripts/nav'
import { enableSwitchTheme } from './scripts/theme'
import { renderToc } from './scripts/toc'

document.addEventListener('DOMContentLoaded', onContentLoad)

function onContentLoad() {
  enableAnchor()
  enableSwitchTheme();
  highlight();

  renderTables();
  renderAlerts();
  renderLinks();

  Promise.all([renderNavbar(), renderToc()])
         .then(([nav, toc]) => renderBreadcrumb([nav, ...toc]));

  renderAside();
  renderTabs();
}