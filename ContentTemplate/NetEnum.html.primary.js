var contentCommon = require('./content.common.js');
var common = require('./common.js');
var dotnet = require('./partials/dotnet/transform.js');

exports.transform = function (model) {
	model._op_templateFilename = 'NetEnum';
	dotnet.updateTitle(model, true, model.__global.enumInSubtitle);

	dotnet.updateAssemblies(model);
	dotnet.updatePackages(model);
	dotnet.setRootName(model);
	dotnet.createChildHtmlIds(model);
	dotnet.updateMonikerizedProperties(model);
	dotnet.updateUWPProperties(model);
	dotnet.updateAdditionalRequirements(model);

	dotnet.updateEditButton(model);

	updateChildren(model);

	if (model.isFlags && !model.summary) {
		model.summary = ' ';
	}
	return model;
};

function updateChildren(model) {
	if (model.fields) {
		model.fieldsInfo = dotnet.getTypeChildrenInfo(model, model.fields);
		for (var i = 0; i < model.fields.length; i++) {
			if (!model.fields[i].literalValue) {
				model.fields[i].literalValue = null;
			}
			if (!model.fields[i].summary) {
				model.fields[i].summary = null;
			}
			model.fields[i].htmlId = common.getHtmlId(model.fields[i].uid);
		}
	}
}

function getBookmarks(model, ignoreChildren) {
	if (!model) return null;
	var bookmarks = {};

	if (typeof ignoreChildren === 'undefined' || ignoreChildren === false) {
		if (model.fields) {
			model.fields.forEach(function (item) {
				bookmarks[item.uid] = common.getHtmlId(item.uid);
			});
		}
	}

	// Reference's first level bookmark should have no anchor
	bookmarks[model.uid] = '';
	return bookmarks;
}

exports.getOptions = function (model) {
	return { bookmarks: getBookmarks(model) };
};
