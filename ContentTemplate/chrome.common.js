var shared = require('./shared.js');

function preProcessSDPMetadata(model) {
	var prop = null,
		propName = null,
		propNameValue = null;

	if (model.metadata) {
		for (prop in model.metadata) {
			propName = prop.toString();
			if (shared.isString(propName)) {
				propNameValue = model.metadata[propName];
				if (propNameValue !== undefined && propNameValue !== null) {
                    model[propName] = propNameValue;
                }
			}
		}
		model.metadata = undefined;
	}
}

exports.makeCanonicalUrl = () => { };
exports.makeDescription = () => { };
exports.makeTitle = () => { };
exports.replaceXrefTags = () => { };
exports.preProcessSDPMetadata = preProcessSDPMetadata;
exports.processMetadata = () => { };
exports.processCommunityContributionMetadata = () => { };
exports.buildEditLink = shared.buildEditLink;
exports.createHtmlId = shared.createHtmlId;
exports.isArray = shared.isArray;
exports.isBool = shared.isBool;
exports.isObject = shared.isObject;
exports.isString = shared.isString;
