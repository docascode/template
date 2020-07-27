// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.

exports.transform = function (model) {
    model.layout = model.layout || "Conceptual";
    delete model.conceptual;

    return {
        content: JSON.stringify(model)
    }
}