function localizeContentType(contentType, __global) {
	var map = {
		architecture: __global.architecture,
		concept: __global.concept,
		deploy: __global.deploy,
		download: __global.download,
		'get-started': __global.getStarted,
		'how-to-guide': __global.howToGuide,
		learn: __global.learn,
		overview: __global.overview,
		quickstart: __global.quickstart,
		reference: __global.reference,
		tutorial: __global.tutorial,
		'whats-new': __global.whatsNew
	};
	return map[contentType] || contentType || __global.overview;
}

function localizeQnaProductCategory(qnaProductCategory, __global) {
	var map = {
		all: __global.all,
		aspnet: __global.products_aspnet,
		azure: __global.products_azure,
		'azure-devops': __global.products_azure_devops,
		dotnet: __global.products_dotnet,
		'ms-graph': __global.products_ms_graph,
		m365: __global.products_m365,
		nuget: __global.products_nuget,
		office: __global.products_office,
		powerbi: __global.products_power_bi,
		powershell: __global.products_powershell,
		sql: __global.products_sql_server,
		'visual-studio': __global.products_vs,
		windows: __global.products_windows,
		'windows-system-center': __global.products_windows_system_center,
		xamarin: __global.products_xamarin
	};
	return map[qnaProductCategory] || qnaProductCategory;
}

exports.localizeContentType = localizeContentType;
exports.localizeQnaProductCategory = localizeQnaProductCategory;
