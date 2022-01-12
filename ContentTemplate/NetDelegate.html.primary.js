var contentCommon = require('./content.common.js');
var dotnet = require('./partials/dotnet/transform.js');

exports.transform = function (model) {
	model._op_templateFilename = 'NetDelegate';
	model.title =
		contentCommon.breakText(model.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')) +
		' ' +
		model.__global.delegateInSubtitle;

	dotnet.updateAssemblies(model);
	dotnet.updatePackages(model);
	dotnet.setRootName(model);
	dotnet.createChildHtmlIds(model);

	dotnet.updateParameters(model);
	dotnet.updateTypeParameters(model);
	dotnet.updateReturns(model);
	dotnet.updateMonikerizedProperties(model);
	dotnet.updateUWPProperties(model);
	dotnet.updateAdditionalRequirements(model);
	dotnet.updateEditButton(model);

	if (model.extensionMethods) {
		model.extensionMethodsInfo = dotnet.getTypeChildrenInfo(model, model.extensionMethods);
	}

	return model;
};
