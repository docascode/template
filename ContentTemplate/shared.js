//@ts-check

function isArray(obj) {
	return obj !== undefined && obj !== null && Array.isArray(obj);
}

function isBool(obj) {
	return (
		typeof obj == 'boolean' ||
		(typeof obj == 'object' && obj != null && obj != undefined && obj.constructor === Boolean)
	);
}

function isNumber(obj) {
	return /^-?[\d.]+(?:e-?\d+)?$/.test(obj);
}

function isObject(obj) {
	return obj !== undefined && obj !== null && typeof obj === 'object';
}

function isString(obj) {
	return (
		typeof obj == 'string' ||
		(typeof obj == 'object' && obj != null && obj != undefined && obj.constructor === String)
	);
}

// this was extracted from the docfx shared transforms (getHtmlId) in common.js and modified to our desired format
function createHtmlId(input) {
	return standardHtmlId(input);
}

function standardHtmlId(input) {
	if (!input) return '';
	if (isString(input)) {
		return normalizeHtmlId(input);
	}
	if (isObject(input) && input.uid) {
		return normalizeHtmlId(input.uid);
	}
	return '';
}

function normalizeHtmlId(input) {
	input = input
		.toLowerCase()
		.replace(/\\/g, '')
		.replace(/'/g, '')
		.replace(/"/g, '')
		.replace(/%/g, '')
		.replace(/\^/g, '')
		.replace(/\[/g, '(')
		.replace(/\]/g, ')')
		.replace(/</g, '(')
		.replace(/>/g, ')')
		.replace(/{/g, '((')
		.replace(/}/g, '))');

	input = input.replace(/[^a-zA-Z0-9()@*]/g, '-');
	input = input.replace(/^-+/g, '');
	input = input.replace(/-+$/g, '');
	input = input.replace(/-+/g, '-');

	return input;
}

exports.createHtmlId = createHtmlId;
exports.isArray = isArray;
exports.isBool = isBool;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isString = isString;
