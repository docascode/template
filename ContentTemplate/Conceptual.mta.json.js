// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.

exports.transform = function (model) {
    model.toc_rel = model._tocRel;
    model.layout = model.layout || "Conceptual";
    delete model.conceptual;

    var contrib = model._op_gitContributorInformation;
    if (contrib && contrib.author) {
        contrib.contributors = contrib.contributors || [];
        contrib.contributors.unshift(contrib.author);
    }

    return {
        content: JSON.stringify(model)
    }
}