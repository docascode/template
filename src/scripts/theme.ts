// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import cookie  from 'js-cookie'

let theme = cookie.get('docfx.theme') || 'light';

export function enableSwitchTheme() {
  let getThemeClass = theme => `theme-${theme}`;
  document.body.classList.add(getThemeClass(theme));

  let button = document.getElementById('switch-theme');
  if (!button) {
    return;
  }

  button.addEventListener('click', () => {
    document.body.classList.remove(getThemeClass(theme));

    let targetTheme = theme === 'light' ? 'dark' : 'light';

    cookie.set('docfx.theme', targetTheme);
    document.body.classList.add(getThemeClass(targetTheme));
    theme = targetTheme;
  });
}
