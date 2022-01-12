var opCommon = require('./op.common.js');
var chromeCommon = require('./chrome.common.js');
var dotnet = require('./partials/dotnet/transform.js');

exports.transform = function (model) {
	chromeCommon.preProcessSDPMetadata(model);
	model.layout = 'Reference';
	model._op_layout = model.layout;
	model.page_type = 'dotnet';
	model.page_kind = 'enum';

	model['ms.assetid'] = model['ms.assetid'] || opCommon.getAssetId(model);

	dotnet.updateTitleForMeta(model, model.__global.enumInSubtitle);

	chromeCommon.makeTitle(model);
	model.description = model.description || chromeCommon.replaceXrefTags(model.summary);
	chromeCommon.makeDescription(model);
	if (!model.description) {
		model.description = model.__global.descriptionAPIDefault
			.replace('{name}', model.fullName)
			.replace('{namespace}', model.namespace);
	}
	chromeCommon.makeCanonicalUrl(model);

	model.dev_langs = model.devLangs;

	model.toc_asset_id = model.toc_asset_id || model._tocPath;
	model.toc_rel = model.toc_rel || model._tocRel;
	if (typeof templateUtility !== 'undefined' && model.breadcrumb_path && model._path) {
		model.breadcrumb_path = templateUtility.resolveSourceRelativePath(
			model.breadcrumb_path,
			model._path
		);
	}

	// Clean up unused predefined properties
	var resetKeys = [
		'assembliesWithMoniker',
		'attributeMonikers',
		'attributesWithMoniker',
		'capabilities',
		'commentId',
		'devLangs',
		'examples',
		'fields',
		'fullName',
		'inheritancesWithMoniker',
		'isFlags',
		'isDeprecated',
		'isInternalOnly',
		'langs',
		'name',
		'nameWithType',
		'obsoleteMessagesWithMoniker',
		'osRequirements',
		'packagesWithMoniker',
		'remarks',
		'sdkRequirements',
		'seeAlso',
		'source',
		'summary',
		'syntaxWithMoniker',
		'uid',
		'uwpRequirements',
		'xamlSyntax'
	];

	model = opCommon.resetKeysAndSystemAttributes(model, resetKeys, true);

	opCommon.resolvePdfUrlTemplate(model);

	chromeCommon.processMetadata(model);

	return {
		content: JSON.stringify(model)
	};
};
