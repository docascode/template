//@ts-check
var contentCommon = require('./content.common.js');
var hubTransform = require('./partials/hub/transform.js');
var azureCategoryTransform = require('./partials/hub/azure-category.js');

exports.transform = function (model) {
	model._op_templateFilename = 'Hub';

	// Check Hub Type
	isQnaHub(model);
	isAzureHub(model);

	// localize the contentType and set the icons for highlighted Content
	if (model.highlightedContent) {
		// Loop Dupes and set Ids
		updateSection(model.highlightedContent);

		if (model.highlightedContent.sections) {
			model.highlightedContent.sections.forEach(function (section) {
				localizedHighlightedContent(section, model.__global);
			});
		} else {
			localizedHighlightedContent(model.highlightedContent, model.__global);
		}
	}

	updateSection(model.productDirectory);

	// Facets on Hub page: Azure Hub or Q&A Hub
	if (model.productDirectory) {
		model.productDirectory.hasFacet = checkHasFacet(
			model.productDirectory,
			model.isAzureHub,
			model.isQnaHub
		);

		// These should only run if we are using the Facet layout
		if (model.productDirectory.hasFacet) {
			// Check if we include a featured category
			model.productDirectory.hasFeaturedCategory = checkForFeaturedCategory(model.productDirectory);

			if (model.productDirectory.sections) {
				model.productDirectory.sections.forEach(function (section) {
					section.items = sortByTitle(section.items);
				});
			} else {
				model.productDirectory.items = sortByTitle(model.productDirectory.items);
			}

			// Order is important here
			model.productDirectory.facetList = buildFacetList(
				model.productDirectory,
				model.isQnaHub,
				model.__global
			); // 1: build facetList with un-localized categories
			localizeCategories(model.productDirectory, model.__global); // 2: localize categories
			initAllCategories(model); // 3: init All section
			populateAllCategories(model.productDirectory, model.isQnaHub); // 4: Build All, uses loc categories
		}
	}

	updateSection(model.conceptualContent);
	updateSection(model.tools);

	updateSection(model.additionalContent);
	setAdditionalContent(model);

	setColumnCount(model.highlightedContent, 4, 2);
	setColumnCount(model.productDirectory, 4, 2);
	setColumnCount(model.conceptualContent, 4, 2);
	setColumnCount(model.tools, 6, 2);
	setColumnCount(model.additionalContent, 4, 3);

	return model;
};

function isQnaHub(model) {
	if (!model.pageModifier) {
		return;
	}
	if (model.pageModifier !== 'qna-home') {
		return;
	}
	model.isQnaHub = true;
}

function isAzureHub(model) {
	if (!model.brand) {
		return;
	}
	if (model.brand !== 'azure') {
		return;
	}
	model.isAzureHub = true;
}

/**
 * Given model.highlightedContent OR the sections for model.highlightedContent, localize
 * the item collections.
 * @param {*} highlightedContent model.highlightedContent OR model.highlightedContent.section[x].
 * @param {*} __global model.__global localization object. Used to pass through to localizeContentType.
 * @returns void
 */
function localizedHighlightedContent(highlightedContent, __global) {
	if (!highlightedContent) {
		return;
	}
	for (var i = 0; i < highlightedContent.items.length; i++) {
		var highlightedItem = highlightedContent.items[i];
		highlightedItem.itemTypeIcon = contentIcons(highlightedItem.itemType); // first
		highlightedItem.itemType = hubTransform.localizeContentType(highlightedItem.itemType, __global);
	}
}

/**
 * Localize the Azure or QnA categories
 * @param {*} productDirectory model.productDirectory
 * @param {*} __global model.__global localization object.
 */
function localizeCategories(productDirectory, __global) {
	// We only allow one section in the schema, but this could change. For each section,
	// perform the check, unless we have a root-level "items" key.
	var contentToCheck = productDirectory.sections || [productDirectory];

	for (var i = 0; i < contentToCheck.length; i++) {
		for (var j = 0; j < contentToCheck[i].items.length; j++) {
			var productItem = contentToCheck[i].items[j];
			if (productItem.azureCategories) {
				for (var k = 0; k < productItem.azureCategories.length; k++) {
					productItem.azureCategories[k] = azureCategoryTransform.localizeAzureCategory(
						productItem.azureCategories[k],
						__global
					);
				}
			} else if (productItem.qnaProductCategories) {
				for (var k = 0; k < productItem.qnaProductCategories.length; k++) {
					productItem.qnaProductCategories[k] = hubTransform.localizeQnaProductCategory(
						productItem.qnaProductCategories[k],
						__global
					);
				}
			}
		}
	}
}

/**
 * Populate each category with items tagged with category, covers items that meet multiple categories.
 * @param {*} productDirectory model.productDirectory
 * @param {boolean} isQnaHub model.isQnaHub.
 */
function populateAllCategories(productDirectory, isQnaHub) {
	// We only allow one section in the schema, but this could change. For each section,
	// perform the check, unless we have a root-level "items" key.
	var contentToCheck = productDirectory.sections || [productDirectory];

	for (var i = 0; i < contentToCheck.length; i++) {
		for (var j = 0; j < contentToCheck[i].items.length; j++) {
			var productItem = contentToCheck[i].items[j];
			var category = isQnaHub ? productItem.qnaProductCategories : productItem.azureCategories;
			for (var k = 0; k < category.length; k++) {
				for (var l = 0; l < productDirectory.categories.length; l++) {
					if (productDirectory.categories[l].categoryTitle === category[k]) {
						productDirectory.categories[l].items.push(productItem);
					}
				}
			}
		}
	}
}

function initAllCategories(model) {
	// Build the category structure and add title
	model.productDirectory.categories = [];
	for (var i = 0; i < model.productDirectory.facetList.length; i++) {
		model.productDirectory.categories[i] = {
			items: [],
			categoryTitle: model.productDirectory.facetList[i].title
		};
	}
}

/**
 * Returns true only if all product directory items have azureCategories set
 * @param {*} productDirectory model.productDirectory
 * @param {boolean} isAzureHub model.isAzureHub
 * @param {boolean} isQnaHub model.isQnaHub
 * @returns {boolean}
 */
function checkHasFacet(productDirectory, isAzureHub, isQnaHub) {
	if (!productDirectory) {
		return;
	}

	// We only allow one section in the schema, but this could change. For each section,
	// perform the check, unless we have a root-level "items" key.
	var contentToCheck = productDirectory.sections || [productDirectory];

	for (var i = 0; i < contentToCheck.length; i++) {
		for (var j = 0; j < contentToCheck[i].items.length; j++) {
			var productItem = contentToCheck[i].items[j];
			if (
				(isAzureHub && productItem.azureCategories) ||
				(isQnaHub && productItem.qnaProductCategories)
			) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Builds our facet items based on Azure categorie
 * @param {*} productDirectory model.productDirectory
 * @param {boolean} isQnaHub model.isQnaHub.
 * @param {*} __global model.__global localization object. Used to pass through to localize functions.
 * @returns A sorted array of facet objects.
 */
function buildFacetList(productDirectory, isQnaHub, __global) {
	var facetList = [];
	// We only allow one section in the schema, but this could change. For each section,
	// perform the check, unless we have a root-level "items" key.
	var contentToCheck = productDirectory.sections || [productDirectory];

	for (var i = 0; i < contentToCheck.length; i++) {
		for (var j = 0; j < contentToCheck[i].items.length; j++) {
			var productItem = contentToCheck[i].items[j];
			var category = isQnaHub ? productItem.qnaProductCategories : productItem.azureCategories;
			if (!category) {
				return;
			}
			for (var k = 0; k < category.length; k++) {
				// TODO: remove featured once category is removed from content
				if (category[k] === 'featured' || category[k] === 'popular') {
					continue;
				} // skip Featured
				var localizedFacet = isQnaHub
					? hubTransform.localizeQnaProductCategory(category[k], __global)
					: azureCategoryTransform.localizeAzureCategory(category[k], __global);
				facetList.push({ id: category[k], title: localizedFacet });
			}
		}
	}

	return removeDuplicates(facetList, 'id').sort(function (a, b) {
		return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
	});
}

function removeDuplicates(originalArray, prop) {
	var newArray = [];
	var lookupObject = {};

	for (var i in originalArray) {
		lookupObject[originalArray[i][prop]] = originalArray[i];
	}

	for (i in lookupObject) {
		newArray.push(lookupObject[i]);
	}
	return newArray;
}

function setAdditionalContent(model) {
	if (!model.additionalContent) {
		return;
	}
	// additional content special cases due to sections nesting
	for (var i = 0; i < model.additionalContent.sections.length; i++) {
		var additionalSection = model.additionalContent.sections[i];
		setItems(additionalSection); // set items loop dupe here, because of sections
		if (!additionalSection.items) {
			continue;
		}
		for (var j = 0; j < additionalSection.items.length; j++) {
			var additionalSectionItem = additionalSection.items[j];
			if (additionalSectionItem.url && additionalSectionItem.links) {
				additionalSectionItem.url = null; // strip card url if card has list of links
			}
		}
	}
}

function updateSection(modelSection) {
	if (!modelSection) {
		return;
	}
	// each if is a loop doop to stop variable scope bleeding
	if (modelSection.title === undefined) {
		modelSection.title = null;
	}

	if (modelSection.summary === undefined) {
		modelSection.summary = null;
	}

	if (!modelSection.items) {
		return;
	}

	setItems(modelSection);

	if (modelSection.sections) {
		for (var i = 0; i < modelSection.sections.length; i++) {
			updateSection(modelSection);
		}
	}
}

function setItems(x) {
	if (!x.items) {
		return;
	}
	for (var i = 0; i < x.items.length; i++) {
		let sectionItem = x.items[i];
		if (sectionItem.title === undefined) {
			sectionItem.title = null;
		}
		if (sectionItem.summary === undefined) {
			sectionItem.summary = null;
		}
		if (sectionItem.url === undefined) {
			sectionItem.url = null;
		}
		if (sectionItem.footerLink === undefined) {
			sectionItem.footerLink = null;
		}
		// Create an id for each item
		sectionItem.id = contentCommon.createHtmlId(sectionItem.title + '-' + [i]);
	}
}

function setColumnCount(model, max, min) {
	if (!model) {
		return;
	}
	if (model.sections) {
		for (var i = 0; i < model.sections.length; i++) {
			model.columnCount = columnLookup(model.sections[i]);
		}
	} else {
		model.columnCount = columnLookup(model);
	}

	function columnLookup(model) {
		if (!model.items) {
			return;
		}
		if (contentCommon.isArray(model.items[0].azureCategories)) {
			return 'is-4-tablet is-3-desktop is-one-fifth-widescreen';
		}
		var itemLength = model.items.length;
		if (itemLength % 6 === 0 && max >= 6) {
			return 'is-6-tablet is-4-desktop is-2-widescreen';
		}
		if (itemLength === 5) {
			return 'is-4-tablet is-4-desktop';
		} // if 5 cards use 3 column layout
		if (itemLength % 5 === 0 && max >= 5) {
			return 'is-4-tablet is-one-fifth-desktop';
		}
		if (itemLength % 4 === 0) {
			return 'is-6-tablet is-3-desktop';
		}
		if ((itemLength % 3 === 0 && itemLength <= 9) || (itemLength === 2 && min === 3)) {
			return 'is-4-tablet is-4-desktop';
		}
		if (itemLength % 2 === 0 && itemLength <= 9) {
			return 'is-6-tablet';
		}
		return 'is-6-tablet is-3-desktop';
	}
}

function sortByTitle(items) {
	return items.sort(function (a, b) {
		return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
	});
}

/**
 * Only used for Azure's hub page, which has top-level items in the product directory. Sets a flag if
 * "featured" is in the Azure categories.
 * TODO the featured tag is being replaced with 'popular' we will need to update all code names once content has been updated.
 * @param {*} productDirectory model.productDirectory.
 * @returns {boolean}
 */
function checkForFeaturedCategory(productDirectory) {
	// We only allow one section in the schema, but this could change. For each section,
	// perform the check, unless we have a root-level "items" key.
	var contentToCheck = productDirectory.sections || [productDirectory];

	for (var i = 0; i < contentToCheck.length; i++) {
		for (var j = 0; j < contentToCheck[i].items.length; j++) {
			const azureCategories = contentToCheck[i].items[j].azureCategories;
			if (!azureCategories) {
				continue;
			}
			for (var k = 0; k < azureCategories.length; k++) {
				// TODO: remove featured once category is removed from content
				if (azureCategories[k] === 'featured' || azureCategories[k] === 'popular') {
					return true;
				}
			}
		}
	}

	return false;
}

/**
 * Given a key, return an associated SVG XML string associated with that key.
 * @param {*} contentType One of 'architecture', 'concept', 'deploy', 'download', 'get-started', 'how-to-guide', 'learn'
 *                        'overview', 'quickstart', 'tutorial', 'reference', 'sample', 'whats-new', and 'video'.
 * @returns String representation in XML of SVG icon.
 */
function contentIcons(contentType) {
	switch (contentType) {
		case 'architecture':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
		  <g data-name="Layer 1">\
			<path fill="#919191" d="M49.82 12.94v6.77H24.6v-6a3.35 3.35 0 0 0-.05-.63 4.42 4.42 0 0 0-2.1-3.18h29a5.09 5.09 0 0 0-1.63 3.04zM58.67 19.71h-7.54v-6.62a3.79 3.79 0 0 1 3.74-3.21c3.64 0 3.79 3.75 3.79 3.79v6z"/>\
			<path d="M54.88 9.31a4.38 4.38 0 0 0-4.33 3.76v41.05h-34.3V13.68a4.38 4.38 0 0 1 4.38-4.37z" fill-opacity=".3" fill="#e3e3e3"/>\
			<path d="M54.88 8.55H20a5.12 5.12 0 0 0-5.12 5.12v41.78H51.1V13.09a3.79 3.79 0 0 1 3.74-3.21c3.64 0 3.79 3.75 3.79 3.79v6H60v-6a5.08 5.08 0 0 0-5.12-5.12zm-5.06 4.39V54.12H16.25V13.67A3.79 3.79 0 0 1 20 9.88h31.45a5.09 5.09 0 0 0-1.63 3.06z" fill="#e3e3e3"/>\
			<path d="M10 27.08l10.77 8.56H10v-8.56M4 14.69v26.94h33.93L4 14.69z" class="has-fill-current-color" fill="#0079d6"/>\
		  </g>\
		</svg>\
		';
		case 'concept':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g data-name="Layer 1">\
				<path class="has-stroke-current-color" fill="none" stroke="#0079d6" stroke-width="3.25px" stroke-miterlimit="10" d="M17.05 6.77a5.87 5.87 0 0 0-4.45 1.47c-.92 1-1.39 2.66-1.39 5V21q0 8.71-5.58 10.91v.14q5.58 2.31 5.58 11.42V51q0 6.35 5.84 6.34M47 57.23a5.87 5.87 0 0 0 4.45-1.47c.92-1 1.39-2.66 1.39-5V43q0-8.72 5.58-10.91v-.14q-5.58-2.31-5.58-11.42V13q0-6.35-5.84-6.34"/>\
				<path opacity=".5" fill="#e3e3e3" d="M17.13 13.91h29.75v9.52H17.13z"/>\
				<path fill="none" stroke="#c8c8c8" stroke-width="1.25px" stroke-miterlimit="10" d="M17.13 13.91h29.75v9.52H17.13z"/>\
				<path fill="#c8c8c8" opacity=".5" d="M17.13 27.24h29.75v9.52H17.13z"/>\
				<path fill="none" stroke="#c8c8c8" stroke-width="1.25px" stroke-miterlimit="10" d="M17.13 27.24h29.75v9.52H17.13z"/>\
				<path fill="#acacac" opacity=".5" d="M17.13 40.56h29.75v9.52H17.13z"/>\
				<path fill="none" stroke="#c8c8c8" stroke-width="1.25px" stroke-miterlimit="10" d="M17.13 40.56h29.75v9.52H17.13z"/>\
			</g>\
		</svg>\
		';
		case 'deploy':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g style="isolation:isolate">\
			  <g data-name="Layer 1">\
				<path d="M15.63 21.8l16.22 12.63m-5.21-12.5l5.21 12.5M48.96 21.8L32.67 34.43m5.21-12.49l-5.21 12.49" stroke-width="1.22" fill="none" stroke="#c8c8c8" stroke-miterlimit="10"/>\
				<path d="M49.79 23.11c-.15-1.31-2.71-2.34-5.84-2.34-2.85 0-5.21.85-5.74 2H38c-.53-1.13-2.9-2-5.74-2s-5.21.85-5.74 2h-.23c-.52-1.14-2.89-2-5.73-2-3.14 0-5.69 1-5.85 2.34a17.55 17.55 0 0 1 35.09 0z" class="has-fill-current-color" fill="#0079d6"/>\
				<g opacity=".1">\
				  <path d="M48.63 58.3H15.37a.93.93 0 0 1-.93-.93V35.82a.93.93 0 0 1 .93-.93h33.8a.38.38 0 0 1 .39.39v22.09a.93.93 0 0 1-.93.93z" opacity=".3" fill="#404040"/>\
				</g>\
				<path d="M48.63 57.92H15.37a.93.93 0 0 1-.93-.93V35.44a.93.93 0 0 1 .93-.93h33.8a.38.38 0 0 1 .39.39V57a.93.93 0 0 1-.93.92z" fill="#e3e3e3" opacity=".3"/>\
				<path d="M15 34.56h34.54a.4.4 0 0 1 .4.4v4.28H14.06v-3.73a1 1 0 0 1 .94-.95z" opacity=".8" fill="#c8c8c8"/>\
				<circle fill="#919191" cx="21.4" cy="36.86" r=".74"/>\
				<circle fill="#919191" cx="19.1" cy="36.86" r=".74"/>\
				<circle fill="#919191" cx="16.81" cy="36.86" r=".74"/>\
				<path d="M15.37 34.51h33.8a.39.39 0 0 1 .39.39V57a.93.93 0 0 1-.93.93H15.37a.93.93 0 0 1-.93-.93V35.44a.93.93 0 0 1 .93-.93z" stroke-width="1.25" fill="none" stroke="#c8c8c8" stroke-miterlimit="10"/>\
				<path d="M28.85 51.71l-3.79-3.79 3.79-3.79m7.84 0l3.79 3.79-3.79 3.79M34 42.86l-2.58 10.12" opacity=".8" fill="none" stroke="#c8c8c8" stroke-miterlimit="10"/>\
			  </g>\
			</g>\
		</svg>\
		';
		case 'download':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g style="isolation:isolate">\
			  <g data-name="Layer 1">\
				<g opacity=".1">\
				  <path d="M52.51 52.38h-40.1a1.12 1.12 0 0 1-1.12-1.12V25a1.13 1.13 0 0 1 1.12-1.13h40.76a.47.47 0 0 1 .47.47v26.9a1.12 1.12 0 0 1-1.13 1.14z" opacity=".3" fill="#404040"/>\
				</g>\
				<path d="M52.51 51.92h-40.1a1.12 1.12 0 0 1-1.12-1.12V24.56a1.13 1.13 0 0 1 1.12-1.13h40.76a.47.47 0 0 1 .47.47v26.9a1.12 1.12 0 0 1-1.13 1.12z" fill="#e3e3e3" opacity=".3"/>\
				<path d="M12 23.11h41.64a.48.48 0 0 1 .48.48v27.5A1.15 1.15 0 0 1 53 52.25H12a1.15 1.15 0 0 1-1.15-1.15V24.26A1.15 1.15 0 0 1 12 23.11z" stroke="#c8c8c8" stroke-width="1.25" fill="none" stroke-miterlimit="10"/>\
				<circle cx="32.5" cy="17.03" r="8.8" class="has-fill-current-color" fill="#0079d6"/>\
				<path fill="#c8c8c8" d="M4.46 51.72h56v2.5a1.56 1.56 0 0 1-1.56 1.56H6a1.56 1.56 0 0 1-1.56-1.56v-2.5h.02z"/>\
				<path d="M32.5 12.26v8.09m3.04-3.05l-3.04 3.04-3.04-3.04" stroke="#fff" stroke-width="1.62" fill="none" stroke-miterlimit="10"/>\
				<path fill="#c8c8c8" transform="rotate(180 32.405 37.675)" d="M20.6 35.78h23.61v3.8H20.6z"/>\
				<path fill="#acacac" d="M28.35 35.78h16.16v3.8H28.35z"/>\
			  </g>\
			</g>\
		</svg>\
		';
		case 'get-started':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g data-name="Layer 1">\
			  <path d="M49.85 11.83v46.84a.57.57 0 0 1-.57.57h-34.5a1.37 1.37 0 0 1-1.37-1.37V11.83a1.37 1.37 0 0 1 1.37-1.37h33.7a1.37 1.37 0 0 1 1.37 1.37z" fill-opacity=".3" fill="#e3e3e3"/>\
			  <path d="M49.57 11.83v46.84a.57.57 0 0 1-.57.57H14.5a1.37 1.37 0 0 1-1.37-1.37v-46a1.37 1.37 0 0 1 1.37-1.37h33.7a1.37 1.37 0 0 1 1.37 1.33z" fill="none" stroke="#c8c8c8" stroke-miterlimit="10" stroke-width="1.25"/>\
			  <path d="M41.47 15.14H45v35.11a3.56 3.56 0 0 0 3.53 3.06h-27.9a3.57 3.57 0 0 1-3.57-3.57v-34.6h4.52" fill="#c8c8c8" fill-opacity=".8"/>\
			  <path d="M48.19 45.29H23.87v4.91a3 3 0 0 1 0 .52 3.6 3.6 0 0 1-1.71 2.59H48.21c2.56-.27 2.68-3 2.68-3.07v-4.95z" opacity=".8" fill="#e3e3e3"/>\
			  <path d="M30.08 31.55h-4.71a.26.26 0 0 1-.27-.24.17.17 0 0 1 0-.1l5.65-11.28a.26.26 0 0 1 .24-.14h5.61a.25.25 0 0 1 .26.24.2.2 0 0 1 0 .13L30.17 29h6.48a.26.26 0 0 1 .27.24.24.24 0 0 1-.07.16L26.09 40.67c-.1.06-.81.66-.46-.25z" class="has-fill-current-color" fill="#0079d6"/>\
			  <path d="M34.52 8.23a1.55 1.55 0 0 0 0-.22A3.25 3.25 0 1 0 28 8a1.55 1.55 0 0 0 0 .22h-6.59v8.44H41.3V8.23z" fill="#919191"/>\
			</g>\
		</svg>\
		';
		case 'how-to-guide':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
		  <g data-name="Layer 1">\
			<path d="M60 19v31.57H35.84a5.33 5.33 0 0 1-3.77 2c-1.43 0-2.23-.45-3.77-2H4.05V19h4.61v25l19.62 1.39a4.17 4.17 0 0 1 3.58 4.12h.22a4.16 4.16 0 0 1 3.58-4.12L55.28 44V19z" fill="#acacac"/>\
			<path d="M32 49.54a4.16 4.16 0 0 0-3.57-4.12L8.77 44V11.44l19 1.35A4.16 4.16 0 0 1 32 17z" fill="#e3e3e3"/>\
			<path d="M32 49.54a4.16 4.16 0 0 1 3.58-4.12L55.19 44V11.71l-19 1.08A4.16 4.16 0 0 0 32 17z" fill-opacity=".3" fill="#e3e3e3"/>\
			<path d="M31.71 49.54a4.16 4.16 0 0 0-3.57-4.12L8.52 44V11.44l19 1.35A4.16 4.16 0 0 1 31.71 17zm.48 0a4.16 4.16 0 0 1 3.57-4.12L55.38 44V11.44l-19 1.35A4.16 4.16 0 0 0 32.19 17z" fill="none" stroke-miterlimit="10" stroke="#c8c8c8" stroke-width="1.25"/>\
			<circle cx="31.96" cy="29.13" r="8.8" class="has-fill-current-color" fill="#0079d6"/>\
			<path stroke="#fff" stroke-width="1.85" fill="none" stroke-miterlimit="10" d="M27.12 29.46l3.24 3.25 5.65-7.16"/>\
		  </g>\
		</svg>\
		';
		case 'learn':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g data-name="Layer 1">\
				<path d="M26.1 48.89h11.8a10.25 10.25 0 0 1-.61-3.28H26.71z" fill="#e7e7e7"/>\
				<path d="M43 53.52v1a.26.26 0 0 1-.29.23h-21.4c-.16 0-.3-.11-.3-.23v-1h.07a7.56 7.56 0 0 0 4.63-3.76 6.93 6.93 0 0 0 .39-.87 9.92 9.92 0 0 0 .62-3.28v-.35h10.57v.35a9.93 9.93 0 0 0 .61 3.28 7 7 0 0 0 .4.87 7.53 7.53 0 0 0 4.62 3.76z" fill="#acacac"/>\
				<path d="M37.91 48.89a9.93 9.93 0 0 1-.61-3.28v-7H26.72v7a9.92 9.92 0 0 1-.62 3.28 6.93 6.93 0 0 1-.39.87h12.6a7 7 0 0 1-.4-.87zm-5.9-5a1.79 1.79 0 1 1 1.79-1.79 1.79 1.79 0 0 1-1.8 1.78z" fill="#919191"/>\
				<path d="M58.85 9.85v28.57H5.15V10.67a1.42 1.42 0 0 1 1.42-1.42h51.69a.59.59 0 0 1 .59.6z" fill-opacity=".3" fill="#e3e3e3"/>\
				<path d="M58.85 38.54v5.18a1.41 1.41 0 0 1-1.42 1.42H6.57a1.41 1.41 0 0 1-1.42-1.42v-5.18z" opacity=".5" fill="#e3e3e3"/>\
				<path d="M58.85 10v33.76a1.41 1.41 0 0 1-1.42 1.42H6.57a1.41 1.41 0 0 1-1.42-1.42v-33a1.41 1.41 0 0 1 1.42-1.38h51.69a.58.58 0 0 1 .59.62z" fill="none" stroke="#c8c8c8" stroke-miterlimit="10" stroke-width="1.25"/>\
				<path fill="#8f8f8f" fill-opacity=".1" stroke="#ccc" stroke-linejoin="round" stroke-width=".96" d="M5.3 38.54h53.4"/>\
				<path d="M32 22c-3.66-3-10.82-3.4-10.82-3.4v13.52C26.51 31.26 32 34.83 32 34.83s5.49-3.57 10.83-2.71V18.58S35.36 19.31 32 22z" fill="#e3e3e3" opacity=".5"/>\
				<path d="M32 20.3c-3.66-3-10.82-3.4-10.82-3.4v13.55c5.34-.86 10.83 2.7 10.83 2.7s5.49-3.56 10.83-2.7V16.9s-7.48.74-10.84 3.4z" class="has-fill-current-color" fill="#137ad1"/>\
			</g>\
		</svg>\
		';
		case 'overview':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g data-name="Layer 1">\
				<path fill="#acacac" d="M40.93 51.66L24.42 54.3V12.12l16.51-2.64v42.18z"/>\
				<path fill-opacity=".3" fill="#e3e3e3" d="M57.71 53.19l-16.59-1.32-16.59 2.65-16.58-1.33V12.14l16.58 1.33 16.59-2.65 16.59 1.32v41.05z"/>\
				<path d="M24.41 54.52h-.08l-17.2-1.38V10.76l17.23 1.37 16.58-2.65H41l17.2 1.37v42.39L41 51.87zM8.46 51.91l15.9 1.27 16.58-2.65H41l15.87 1.27V12.09L41 10.82l-16.59 2.65h-.08L8.46 12.19z" fill="#e3e3e3"/>\
				<path d="M59.63 31.82a3 3 0 0 0-3-3A5.48 5.48 0 0 0 46.79 26h-.37a4.42 4.42 0 0 0-.48 8.81h11.1a3 3 0 0 0 2.59-2.99zm-34.02.79A3.61 3.61 0 0 0 22 29h-.06a6.6 6.6 0 0 0-11.81-3.41h-.44a5.33 5.33 0 0 0-.58 10.62h13.37a3.6 3.6 0 0 0 3.13-3.6z" fill="#fff" stroke="#e3e3e3" stroke-miterlimit="10"/>\
				<circle cx="32.83" cy="32" r="10" class="has-fill-current-color" fill="#0079d6"/>\
				<path fill="#fff" d="M36.89 26.93l-5.64 4.02-2.48 6.48 5.64-4.03 2.48-6.47z"/>\
			</g>\
		</svg>\
		';
		case 'quickstart':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g data-name="Layer 1">\
				<path fill="#919191" d="M32.06 20.19L14.69 37.55l-5.87-5.87 17.37-17.37c1.94-1.94 5.44-3.37 7.34-1.47s.47 5.41-1.47 7.35zM20.94 48.04l-5.22-5.22 2.82-1.41 3.81 3.8-1.41 2.83z"/>\
				<path class="has-fill-current-color" fill="#0079d6" d="M16.82 44c-2-.24-7.32 2.43-8 11.11.49-.05 1-.1 1.42-.17 7.15-1 9.74-6.09 9.52-8z"/>\
				<path fill="#919191" d="M49.69 37.81L32.32 55.18l-5.88-5.87 17.37-17.37c1.94-1.94 5.44-3.38 7.35-1.47s.47 5.4-1.47 7.34z"/>\
				<path d="M14.51 37.74l14-14c-4.4 4.41-16.85-.69-22.73 5.18zm11.75 11.75l14-14c-4.41 4.4.69 16.85-5.18 22.73z" fill="#c8c8c8" opacity=".8"/>\
				<path d="M56.85 7.15C53 3.34 44.26 8 40.38 11.87L15 37.21 26.79 49l25.34-25.38C56 19.74 60.66 11 56.85 7.15z" fill="#e3e3e3" fill-opacity=".5"/>\
				<path d="M56.85 7.27c-1.66-1.66-4.27-1.71-7-.92a23.45 23.45 0 0 0-6.43 3.16 21.54 21.54 0 0 0-3 2.48L15 37.33l11.79 11.75 25.34-25.34c3.87-3.88 8.53-12.66 4.72-16.47z" fill="none" stroke="#c8c8c8" stroke-miterlimit="10" stroke-width="1.25"/>\
				<path class="has-fill-current-color" fill="#0079d6" d="M48.09 21.62a.58.58 0 0 1-.82 0C47 21.4 42.6 17 42.38 16.73a.57.57 0 0 1 0-.82 4 4 0 1 1 5.71 5.71z"/>\
			</g>\
		</svg>\
		';
		case 'tutorial':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g data-name="Layer 1">\
				<path fill="#e3e3e3" d="M15.21 6.69h31.57v4.29H15.21z"/>\
				<path d="M41 57.87H9a4.09 4.09 0 0 1-4.09-4.09V16h4.85v32.9a4.09 4.09 0 0 0 4.09 4.1h23.06v1.37a4.1 4.1 0 0 0 4.09 3.5z" fill="#acacac"/>\
				<path d="M9.76 16H4.85v37.8a4.09 4.09 0 0 0 4.09 4.09H41a4.1 4.1 0 0 1-4.05-3.51V53" stroke="#acacac" fill="none" stroke-miterlimit="10" stroke-width="1.17"/>\
				<path fill="#e3e3e3" d="M45.87 53h-32a4.09 4.09 0 0 1-4.11-4.1V11.1h4.93v32.83A4.09 4.09 0 0 0 18.78 48h23v1.46A4.09 4.09 0 0 0 45.87 53z"/>\
				<path fill="none" stroke-miterlimit="10" stroke-width="1.17px" stroke="#c8c8c8" d="M14.69 11.1H9.76v37.8a4.09 4.09 0 0 0 4.09 4.1h32a4.09 4.09 0 0 1-4-3.51V48"/>\
				<path d="M50.8 48a4.1 4.1 0 0 1-4-3.51V6.11h-32v37.8A4.09 4.09 0 0 0 18.78 48z" fill-opacity=".3" fill="#e3e3e3"/>\
				<path fill="none" stroke-miterlimit="10" stroke-width="1.17px" stroke="#c8c8c8" d="M50.8 48a4.1 4.1 0 0 1-4-3.51V6.11h-32v37.8A4.09 4.09 0 0 0 18.78 48zM27.28 19.78h14.33M27.28 27.96h14.33M27.28 36.74h14.33"/>\
				<path fill="none" stroke-miterlimit="10" stroke-width="1.17px" stroke="#c8c8c8" d="M20.1 19.23l1.42 1.42 3.52-3.51M20.1 27.55l1.42 1.42 3.52-3.52M20.1 36.24l1.42 1.42 3.52-3.51"/>\
				<circle cx="50.35" cy="27.96" r="8.8" class="has-fill-current-color" fill="#0079d6"/>\
				<path fill="#fff" d="M47 22.51l.86 9.71 2.2-2.64 2.37 3.84 1.51-.87-2.37-3.94 3.51-.84L47 22.51z"/>\
			</g>\
		</svg>\
		';
		case 'reference':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g data-name="Layer 1">\
				<path fill="none" d="M-.06.05h64v64h-64z"/>\
				<path fill="#919191" d="M32.27 18.07c0-3.54 1-3.85 4.3-5.53L49.09 6v5.67L36.05 15s-3.35 2.33-3.78 3.07zM31.75 18.07c0-3.54-1-3.85-4.3-5.53L14.94 6v5.67L28 15s3.33 2.33 3.75 3.07z"/>\
				<path fill="#acacac" d="M31.75 19.05c0-2.62-1.24-3.85-4.3-4.74L7.8 9.92v5.45l20.2 1.4s3.33 1.54 3.75 2.28z"/>\
				<path d="M32.25 19.05c0-2.62 1.24-3.85 4.3-4.74L56.2 9.92v5.45L36 16.77s-3.33 1.54-3.75 2.28z" fill="#c8c8c8"/>\
				<path fill="#acacac" d="M32.25 18.55c0-2.62 1.79-3.85 4.3-4.74L56.2 9.42v5.45L37 16.24a8 8 0 0 0-4.75 2.31z"/>\
				<path d="M32.06 58.11a4.74 4.74 0 0 1 4.07-4.7l22.35-1.59V15L36.8 16.24A4.74 4.74 0 0 0 32.06 21z" fill-opacity=".3" fill="#e3e3e3"/>\
				<path fill="none" stroke="#c8c8c8" stroke-miterlimit="10" stroke-width="1.25px" d="M32.27 58.11a4.74 4.74 0 0 1 4.07-4.7l22.35-1.59V14.7L37 16.24A4.74 4.74 0 0 0 32.27 21z"/>\
				<path d="M32 58.11a4.74 4.74 0 0 0-4.07-4.7L5.59 51.82V14.7l21.68 1.54A4.74 4.74 0 0 1 32 21z" fill="#e3e3e3"/>\
				<path fill="none" stroke="#c8c8c8" stroke-miterlimit="10" stroke-width="1.25px" d="M31.73 58.11a4.74 4.74 0 0 0-4.07-4.7L5.31 51.82V14.7L27 16.24A4.74 4.74 0 0 1 31.73 21z"/>\
				<path fill="#fff" d="M34.19 38.16l-2.61-3.36-4.24.15 6.21-4.36.64 7.57z"/>\
				<circle cx="32.06" cy="35.43" r="8.84" class="has-fill-current-color" fill="#0079d6"/>\
				<path fill="#fff" d="M34.65 40.58l-3.22-4.15-5.25.19 7.68-5.39.79 9.35z"/>\
			</g>\
		</svg>\
		';
		case 'sample':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g style="isolation:isolate">\
				<g>\
				<path d="M55.57 44.24H8.43a1.33 1.33 0 01-1.32-1.32V12.38a1.33 1.33 0 011.32-1.32h47.9a.56.56 0 01.56.55v31.31a1.33 1.33 0 01-1.32 1.32z" opacity=".3" fill="#414141"/>\
				<path d="M55.57 43.7H8.43a1.32 1.32 0 01-1.32-1.31V11.84a1.33 1.33 0 011.32-1.32h47.9a.56.56 0 01.56.55v31.32a1.32 1.32 0 01-1.32 1.31z" fill="#e3e3e3" opacity=".3"/>\
				<path d="M7.93 10.52h48.93a.56.56 0 01.56.56v6.06H6.58v-5.27a1.35 1.35 0 011.35-1.35z" fill="#adadad"/>\
				<circle fill="#919191" cx="16.97" cy="13.78" r="1.05"/>\
				<circle fill="#919191" cx="13.72" cy="13.78" r="1.05"/>\
				<circle fill="#919191" cx="10.47" cy="13.78" r="1.05"/>\
				<path d="M8.43 10.52h47.9a.55.55 0 01.55.55v31.32a1.32 1.32 0 01-1.32 1.32H8.43a1.32 1.32 0 01-1.32-1.32V11.84a1.32 1.32 0 011.32-1.32z" stroke="#c8c8c8" stroke-width="1.17" fill="none" stroke-miterlimit="10"/>\
				<path fill="none" stroke-miterlimit="10" stroke="#919191" stroke-linecap="round" stroke-width="1.83px" d="M20.42 24.24h17.39"/>\
				<path fill="none" stroke-miterlimit="10" stroke="#919191" stroke-linecap="round" stroke-width="1.83px" d="M26.19 30.69h17.39"/>\
				<path fill="none" stroke-miterlimit="10" stroke="#919191" stroke-linecap="round" stroke-width="1.83px" d="M40.65 24.24h2.93"/>\
				<path fill="none" stroke-miterlimit="10" stroke="#919191" stroke-linecap="round" stroke-width="1.83px" d="M20.42 27.44h7.1"/>\
				<path fill="none" stroke-miterlimit="10" stroke="#919191" stroke-linecap="round" stroke-width="1.83px" d="M30.66 27.44h.94"/>\
				<path fill="none" stroke-miterlimit="10" stroke="#919191" stroke-linecap="round" stroke-width="1.83px" d="M34.74 27.44h.94"/>\
				<path fill="none" stroke-miterlimit="10" stroke="#919191" stroke-linecap="round" stroke-width="1.83px" d="M20.42 30.72h2.61"/>\
				<path fill="none" stroke-miterlimit="10" stroke="#919191" stroke-linecap="round" stroke-width="1.83px" d="M38.69 27.44h4.89"/>\
				<path d="M44 53.78H20a.72.72 0 01-.72-.72V35a.72.72 0 01.72-.72h24.42a.29.29 0 01.3.3v18.48a.72.72 0 01-.72.72z" fill="#414141"/>\
				<path d="M44 53.48H20a.73.73 0 01-.72-.73V34.66a.73.73 0 01.72-.73h24.42a.3.3 0 01.3.31v18.51a.73.73 0 01-.72.73z" class="has-fill-current-color" fill="#0079d6"/>\
				<path fill="#fff" d="M40.21 44.08L35 46.58v-1.1l3.81-1.69L35 41.86v-1.1l5.2 2.71z"/>\
				<path fill="#fff" d="M35.01 40.76v1.1l3.81 1.89v.04l-3.81 1.69v1.1l5.2-2.5v-.61l-5.2-2.71z"/>\
				<path fill="#fff" d="M29 46.62l-5.2-2.5v-.62l5.2-2.72v1.11l-3.8 1.89 3.8 1.74z"/>\
				<path fill="#fff" d="M28.99 40.78l-5.2 2.72v.62l5.2 2.5v-1.1l-3.8-1.72v-.02l3.8-1.89v-1.11z"/>\
				<path fill="#fff" d="M33.73 40.05l-3 7.31h-.93l3-7.31z"/>\
				<path fill="#fff" d="M33.73 40.05h-.94l-3.02 7.31h.93l3.03-7.31z"/>\
				</g>\
			</g>\
		</svg>\
		';
		case 'whats-new':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" preserveAspectRatio="xMidYMin meet">\
			<g data-name="Layer 1">\
				<path fill="none" d="M.04 0h64v64h-64z"/>\
				<path fill="none" d="M-.04 0h64v64h-64z"/>\
				<path d="M54.16 16v35a1.86 1.86 0 0 1-2.64 1.69 74.73 74.73 0 0 0-8.72-3.39C29.1 45 12 42.54 6.57 41.85A1.87 1.87 0 0 1 5 40V26.89A1.87 1.87 0 0 1 6.57 25c5.43-.7 22.53-3.1 36.23-7.46a76.6 76.6 0 0 0 8.72-3.3A1.85 1.85 0 0 1 54.16 16z" fill="#e3e3e3" fill-opacity=".3"/>\
				<path d="M32.16 46.19v1.47a6.28 6.28 0 0 1-6.28 6.28h-.81A7 7 0 0 1 18.12 47v-3.7" stroke="#c8c8c8" stroke-miterlimit="10" stroke-width="2" fill="none"/>\
				<path d="M59.05 33.44A7 7 0 0 1 49.56 40c-.18-2.07-.28-4.27-.28-6.54s.1-4.51.28-6.6a7 7 0 0 1 9.49 6.57z" fill="#919191"/>\
				<path fill="#c8c8c8" d="M52.3 15.44a.52.52 0 0 1 .52.53v35a.52.52 0 0 1-.52.52.59.59 0 0 1-.22 0A76.54 76.54 0 0 0 43.21 48c-13.88-4.41-31.42-6.86-36.47-7.5a.52.52 0 0 1-.44-.5V26.89a.53.53 0 0 1 .45-.52c6.47-.83 23-3.22 36.46-7.51a76.64 76.64 0 0 0 8.87-3.36.46.46 0 0 1 .22-.06m0-1.34a1.85 1.85 0 0 0-.78.18 76.6 76.6 0 0 1-8.72 3.3C29.1 21.94 12 24.34 6.57 25A1.87 1.87 0 0 0 5 26.89V40a1.87 1.87 0 0 0 1.62 1.85C12 42.54 29.1 45 42.8 49.3a74.73 74.73 0 0 1 8.72 3.31 1.83 1.83 0 0 0 .78.17 1.86 1.86 0 0 0 1.86-1.86V16a1.86 1.86 0 0 0-1.86-1.9z"/>\
				<path fill="#c8c8c8" d="M54.16 16v35a1.86 1.86 0 0 1-2.64 1.69 74.73 74.73 0 0 0-8.72-3.39V17.58a76.6 76.6 0 0 0 8.72-3.3A1.85 1.85 0 0 1 54.16 16z"/>\
				<circle cx="26.29" cy="21.3" r="9.8" class="has-fill-current-color" fill="#0079d6"/>\
				<path fill="#fff" d="M26.3 15.36l1.47 4.54h4.77l-3.86 2.8 1.47 4.54-3.85-2.81-3.86 2.81 1.47-4.54-3.86-2.8h4.77l1.48-4.54z"/>\
			</g>\
		</svg>\
		';
		case 'video':
			return '\
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" preserveAspectRatio="xMidYMin meet">\
			<g data-name="Layer 1">\
				<path fill="none" d="M0 0h48v48H0z"/>\
				<path d="M44.8 11.17v28.7a1.12 1.12 0 0 1-1 1.21h-36a1.12 1.12 0 0 1-1-1.21v-28a1.12 1.12 0 0 1 1-1.21h36.58a.46.46 0 0 1 .42.51z" fill="#e2e2e2" fill-opacity=".5"/>\
				<path d="M41.61 8v2.6H7.75a1.12 1.12 0 0 0-1 1.2v25.68H4.1A1.11 1.11 0 0 1 3 36.37V8a1.11 1.11 0 0 1 1.1-1.08h36.4A1.1 1.1 0 0 1 41.61 8z" fill="#acacac"/>\
				<path fill="#c8c8c8" d="M7.1 33.63h37.55A.36.36 0 0 1 45 34v5.72A1.33 1.33 0 0 1 43.68 41H8.07a1.33 1.33 0 0 1-1.33-1.33V34a.36.36 0 0 1 .36-.37z"/>\
				<circle class="has-fill-current-color" cx="25.68" cy="22.67" r="5.25" fill="#0079d6"/>\
				<path d="M24.55 24v-2.85a.21.21 0 0 1 .31-.17l2.67 1.41a.21.21 0 0 1 0 .34l-2.67 1.41a.21.21 0 0 1-.31-.14z" fill="#fff"/>\
				<path stroke="#acacac" stroke-miterlimit="10" stroke-width=".94" fill="none" d="M9.93 37.1h31.68"/>\
				<path fill="#c8c8c8" d="M44 11.63v28.2a.35.35 0 0 1 0 .2H7.8a.35.35 0 0 1 0-.2v-28a.38.38 0 0 1 0-.2H44m.59-1H7.75a1.12 1.12 0 0 0-1 1.2v28a1.12 1.12 0 0 0 1 1.21H44a1.12 1.12 0 0 0 1-1.21v-28.7a.46.46 0 0 0-.42-.5z"/>\
			</g>\
		</svg>\
		';
	}
}
