// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import $ from 'jquery'

window.jQuery = $
window.$ = $

require('bootstrap')

import { enableAnchor } from './scripts/anchor'
import { renderLogo, workAroundFixedHeaderForAnchors } from './scripts/header'
import { highlight } from './scripts/highlight'
import { breakText, renderAlerts, renderLinks, renderTables, renderTabs } from './scripts/markdown'
import { renderAffix, renderBreadcrumb, renderNavbar } from './scripts/nav'
import { enableSwitchTheme } from './scripts/theme'
import { renderToc } from './scripts/toc'

$(function () {
  enableAnchor()
  enableSwitchTheme();
  workAroundFixedHeaderForAnchors();
  highlight();

  renderTables();
  renderAlerts();
  renderLinks();

  Promise.all([renderNavbar(), renderToc()]).then(() => renderBreadcrumb());

  renderAffix();
  renderLogo();

  breakText();
  renderTabs();
});
