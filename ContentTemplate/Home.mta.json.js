// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.

exports.transform = function (model) {
    model.layout = "Home";
    Object.assign(model, model.metadata);

    return {
        content: JSON.stringify(model)
    }
}