var contentCommon = require('./content.common.js');
var opCommon = require('./op.common.js');
var common = require('./common.js');
var dotnet = require('./partials/dotnet/transform.js');

exports.transform = function (model) {
	model._op_templateFilename = 'NetMember';
	model.isOverload = model.uid && model.members.length > 1;

	dotnet.updateMemberTitle(model, true);

	model.returnLabel = model.__global.returns;
	if (model.type === 'field') {
		model.returnLabel = model.__global.fieldValue;
	} else if (model.type === 'property' || model.type === 'attachedproperty') {
		model.returnLabel = model.__global.propertyValue;
	} else if (model.type === 'event') {
		model.returnLabel = model.__global.eventType;
	}

	updateChildren(model);
	dotnet.updateAssemblies(model);
	dotnet.updatePackages(model);

	dotnet.updateReturns(model);
	return model;
};

exports.getOptions = function (model) {
	var bookmarks = {};

	if (model.uid && model.members.length > 0) {
		model.members.forEach(function (item) {
			bookmarks[item.uid] = common.getHtmlId(item.uid);
		});

		bookmarks[model.uid] = '';
	}

	return {
		bookmarks: bookmarks
	};
};

function updateChildren(model) {
	if (model.members && model.members.length > 0) {
		model.membersInfo = dotnet.getTypeChildrenInfo(model, model.members);
		for (var k = 0; k < model.members.length; k++) {
			if (!model.members[k].examples) {
				model.members[k].examples = null;
			}

			if (!model.members[k].remarks) {
				model.members[k].remarks = null;
			}

			if (!model.members[k].seeAlso) {
				model.members[k].seeAlso = null;
			}

			if (!model.members[k].summary) {
				model.members[k].summary = null;
			}

			if (model.members[k].attributes && model.members[k].attributes.length > 0) {
				model.members[k].hasAttributes = true;
			}

			model.members[k].htmlId = common.getHtmlId(model.members[k].uid);

			dotnet.updateMonikerizedProperties(model.members[k]);
			dotnet.updateParameters(model.members[k]);
			dotnet.updateTypeParameters(model.members[k]);
			dotnet.updateExceptions(model.members[k]);
			dotnet.updatePermissions(model.members[k]);
			dotnet.updateReturns(model.members[k]);

			dotnet.setThreadSafety(model.members[k]);
			dotnet.updateEditButton(model.members[k]);
			dotnet.updateUWPProperties(model.members[k], model.__global.win10_introducedIn);
			dotnet.updateAdditionalRequirements(model.members[k]);
		}
	}
}
