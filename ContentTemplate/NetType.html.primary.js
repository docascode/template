var contentCommon = require('./content.common.js');
var dotnet = require('./partials/dotnet/transform.js');

exports.transform = function (model) {
	model._op_templateFilename = 'NetType';
	dotnet.updateTitle(model, true, model.__global[model.type]);

	dotnet.updateDerivedClasses(model);
	dotnet.updateAssemblies(model);
	dotnet.updatePackages(model);
	dotnet.setRootName(model);
	dotnet.setThreadSafety(model);
	dotnet.createChildHtmlIds(model);
	dotnet.updatePermissions(model);

	updateChildren(model);
	dotnet.updateTypeParameters(model);
	dotnet.updateMonikerizedProperties(model);
	dotnet.updateUWPProperties(model);
	dotnet.updateAdditionalRequirements(model);
	dotnet.updateEditButton(model);

	return model;
};

function updateChildren(model) {
	if (model.constructors) {
		model.constructorsInfo = dotnet.getTypeChildrenInfo(model, model.constructors);
	}

	if (model.fields) {
		model.fieldsInfo = dotnet.getTypeChildrenInfo(model, model.fields);
	}

	if (model.methods) {
		model.methodsInfo = dotnet.getTypeChildrenInfo(model, model.methods);
	}

	if (model.properties) {
		model.propertiesInfo = dotnet.getTypeChildrenInfo(model, model.properties);
	}

	if (model.attachedProperties) {
		model.attachedPropertiesInfo = dotnet.getTypeChildrenInfo(model, model.attachedProperties);
	}

	if (model.operators) {
		model.operatorsInfo = dotnet.getTypeChildrenInfo(model, model.operators);
	}

	if (model.events) {
		model.eventsInfo = dotnet.getTypeChildrenInfo(model, model.events);
	}

	if (model.attachedEvents) {
		model.attachedEventsInfo = dotnet.getTypeChildrenInfo(model, model.attachedEvents);
	}

	if (model.eiis) {
		model.eiisInfo = dotnet.getTypeChildrenInfo(model, model.eiis);
	}

	if (model.extensionMethods) {
		model.extensionMethodsInfo = dotnet.getTypeChildrenInfo(model, model.extensionMethods);
	}
}
