// @ts-check
/**git
 * @typedef {object} HubModel
 * @property {string} title
 * @property {__global} __global
 * @property {string} page_type
 * @property {string} breadcrumb_path
 */

var opCommon = require('./op.common.js');
var chromeCommon = require('./chrome.common.js');

exports.transform = function (model) {
	chromeCommon.preProcessSDPMetadata(model);
	model.layout = 'Hub';
	model._op_layout = model.layout;
	model.page_type = 'hub';
	model.hide_bc = false;

	model.documentTitle
		? chromeCommon.makeCustomTitle(model, model.documentTitle)
		: chromeCommon.makeTitle(model);

	model.description = model.description || model.summary;
	chromeCommon.makeDescription(model);
	chromeCommon.makeCanonicalUrl(model);

	//@ts-ignore
	if (typeof templateUtility !== 'undefined' && model.breadcrumb_path && model._path) {
		//@ts-ignore
		model.breadcrumb_path = templateUtility.resolveSourceRelativePath(
			model.breadcrumb_path,
			model._path
		);
	}

	var resetKeys = [
		'additionalContent',
		'conceptualContent',
		'highlightedContent',
		'productDirectory',
		'tools',
		'documentTitle'
	];
	model = opCommon.resetKeysAndSystemAttributes(model, resetKeys, true);

	chromeCommon.processMetadata(model);

	return {
		content: JSON.stringify(model)
	};
};
