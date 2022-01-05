// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

let theme = window.localStorage.getItem('docfxTemplateTheme') || 'light';

export function enableSwitchTheme() {
  let getThemeClass = theme => `theme-${theme}`;
  document.body.classList.add(getThemeClass(theme));

  let entrance = document.querySelector('.switch-theme');
  if (!entrance) {
    return;
  }

  entrance.querySelector(`.${theme === 'light' ? 'dark' : 'light'}-entrance`).classList.remove('hidden');

  entrance.addEventListener('click', () => {
    document.body.classList.remove(getThemeClass(theme));

    let targetTheme = theme === 'light' ? 'dark' : 'light';

    window.localStorage.setItem('docfxTemplateTheme', targetTheme);
    document.body.classList.add(getThemeClass(targetTheme));
    entrance.querySelector(`.${theme}-entrance`).classList.remove('hidden');
    entrance.querySelector(`.${targetTheme}-entrance`).classList.add('hidden');
    theme = targetTheme;
  });
}