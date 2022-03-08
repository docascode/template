// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.

var chromeCommon = require('./chrome.common.js')

exports.transform = function (model) {
    model.layout = "Home";
    Object.assign(model, model.metadata);

    chromeCommon.makeGitHubRepoLink(model);

    return {
        content: JSON.stringify(model)
    }
}