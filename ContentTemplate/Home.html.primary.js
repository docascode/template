// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.

exports.transform = function (model) {

    if (model.hero && model.hero.actions && model.hero.actions.length > 0) {
        model.hero.actions[0].first = true;
    }

    return model;
}