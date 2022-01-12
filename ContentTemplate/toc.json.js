exports.transform = function (model) {

	groupChildren(model, model)

	return {
		items: model.items
	};
};

function groupChildren(rootModel, item) {
	if (!item || !item.items || item.items.length == 0) {
		return;
	}

	var groupNames = {
		constructor: { key: 'constructorsInSubtitle' },
		field: { key: 'fieldsInSubtitle' },
		property: { key: 'propertiesInSubtitle' },
		method: { key: 'methodsInSubtitle' },
		event: { key: 'eventsInSubtitle' },
		operator: { key: 'operatorsInSubtitle' },
		eii: { key: 'eiisInSubtitle' }
	};

	var grouped = {};
	var items = [];
	item.items.forEach(function (element) {
		groupChildren(rootModel, element);
		if (element.type) {
			var type = element.type.toLowerCase();
			if (type === 'constructor') {
				element.name = rootModel.__global['constructorsInSubtitle'];
				items.push(element);
			} else {
				if (
					(type === 'method' || type === 'property') &&
					element.isEii !== undefined &&
					element.isEii !== null &&
					element.isEii
				) {
					type = 'eii';
					element.type = rootModel.__global['eiisInSubtitle'];
				}

				if (!grouped.hasOwnProperty(type)) {
					if (!groupNames.hasOwnProperty(type)) {
						groupNames[type] = {
							name: element.type
						};
					}
					grouped[type] = [];
				}
				grouped[type].push(element);
			}
		} else {
			items.push(element);
		}
	}, this);

	for (var key in groupNames) {
		if (groupNames.hasOwnProperty(key) && grouped.hasOwnProperty(key)) {
			var monikers = {};
			for (var i = 0; i < grouped[key].length; i++) {
				var m = grouped[key][i];
				if (m.monikers && m.monikers.length > 0) {
					for (var j = 0; j < m.monikers.length; j++) {
						var moniker = m.monikers[j];
						monikers[moniker] = true;
					}
				} else {
					// An element in this group has no monikers associated with it.
					// This means the parent node will never be hidden due to moniker selection.
					// No need to associate monikers with the parent node.
					monikers = {};
					break;
				}
			}

			var groupedMonikers = Object.keys(monikers);

			if (groupedMonikers && groupedMonikers.length > 0) {
				items.push({
					name: rootModel.__global[groupNames[key].key] || groupNames[key].name,
					items: grouped[key],
					monikers: groupedMonikers
				});
			} else {
				items.push({
					name: rootModel.__global[groupNames[key].key] || groupNames[key].name,
					items: grouped[key]
				});
			}
		}
	}

	item.items = items;
}
