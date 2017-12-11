/*
* PINTAMAPS v.0.0.1
* Desenvolupat per GEOSTART
* "Fet amb el millor gust possible"
* Institut Cartogràfic i Geològic de Catalunya (ICGC) Gener 2016
* CC-BY
* http://www.icgc.cat
* http://betaportal.icgc.cat
*/

// mapboxgl.accessToken = 'pk.your-own-code-here-for-online-maps';
//mapboxgl.accessToken = 'pk.eyJ1IjoicmFmcm9zZXQiLCJhIjoiZW5HT0w2cyJ9.7S3z1vSbUQFJz1pSBKp0bg';
var map;
var mapStyle = {};
var socInici = true;
var pattern_map = false;
var aplicaZoom=false;
var estil = 'styles/style_icgc_matriu.json';
var featureTMP=null;
var options = {
	customClass : 'colorpicker-2x',
	sliders : {
		saturation : {
			maxLeft : 150,
			maxTop : 150
		},
		hue : {
			maxTop : 150
		},
		alpha : {
			maxTop : 150
		}
	},
	align : 'left',
	format : 'rgba'
};
var errors = {
	width : {
		state : false,
		msg : 'Amplada ha de ser un número positiu!',
		grp : 'widthGroup'
	},
	height : {
		state : false,
		grp : 'heightGroup'
	},
	dpi : {
		state : false,
		msg : 'DPI ha de ser un número positiu!',
		grp : 'dpiGroup'
	}
};
var drgFromMapa = null;
var drgFromBoto = null;
var drOpcionsMapa = {
	url : '/pintaservice/up.php',
	paramName : "file",
	maxFilesize : 1, // MB
	method : 'post',
	accept : function(file, done) {
	}
};

jQuery(document).ready(function() {


	if (jQuery.url('?style')) {
		//estil = '/pintaservice/styles/users/' + jQuery.url('?style') + ".json";
		estil = './styles/' + jQuery.url('?style') + '.json';
		//setTimeout('processIndirecte()',2000);
	}else if(jQuery.url('?url_style')) {
		estil= jQuery.url('?url_style') ;
		//setTimeout('processIndirecte()',2000);
	}


	 processaEstil(estil, true);
	$("input[name=optradio]:radio").click(function() {
		estil = './styles/'+$(this).val()+'.json';
		//aplicaZoom=true;
		processaEstil(estil, false);
	});

	jQuery('#bt_close').on('click',function(){
		//jQuery('#bt_close').hide();
		jQuery('#info_vector').hide();
	});

	jQuery('#bt_pin').on('click',function(){
		console.log('red');
		$(this).toggleClass('red');
	});

	jQuery('#info_vector').show();


}); // fi inici


function processIndirecte(){
	var estil_d=estil;
	aplicaZoom=true;
	processaEstil(estil_d, false);
}

function processaEstil(estil, nouMapa) {
	$.getJSON(estil).done(function(nou_estil, textStatus) {
		if (nouMapa) {
			mapStyle = nou_estil;
			creaMapa(mapStyle);
		} else {
			updateStyle(nou_estil);
		}
	}).fail(function(jqxhr, settings, exception) {
		alert("Fitxer no carregat");
		console.warn(exception);
	});
}

function updateStyle(nou_estil){
	mapStyle = nou_estil;
	var mapa = nou_estil.mapa;
	map.setCenter([ parseFloat(mapa.center.lng).toFixed(4),
	parseFloat(mapa.center.lat).toFixed(4) ]);
	map.setZoom(mapa.zoom);
	map.setPitch(mapa.pitch);
	map.setBearing(mapa.bearing);

	addEditorEstils(mapStyle);
	map.setStyle(mapStyle);

}

function creaMapa(style) {
	if (style.mapa) {
		var mapa = style.mapa;
		map = new mapboxgl.Map({
			container : 'map',
			center : mapa.center,
			zoom : mapa.zoom,
			pitch : mapa.pitch, // pitch in degrees
			bearing : mapa.bearing,
			minZoom : 1,
			maxZoom: 7,
			hash : true,
			style : style
			//maxBounds: [[-170,-60],[170,60]]
		});
	} else {
		map = new mapboxgl.Map({
			container : 'map',
			center : [ 0, 0 ],
			zoom : 2,
			pitch : 0, // pitch in degrees
			minZoom : 2,
			maxZoom: 7,
			bearing : 0,
			hash : true,
			style : style
			//maxBounds: [[-170,-60],[170,60]]
		});
	}


	//map.off('style.error', map.onError);
	//map.off('source.error', map.onError);
	//map.off('tile.error', map.onError);
	map.addControl(new mapboxgl.Navigation());

	style.layers.forEach(function (layer) {
		layer.interactive = true;
	});

	jQuery('.mapboxgl-ctrl-top-right div:first').append('<button id="bt_pitch" title="Perspectiva" class="mapboxgl-ctrl-icon glyphicon glyphicon-road"></button>');


	addEditorEstils(style);
	setupEvents();

	preparaControlCerca();

	preparaFormPrint();
	addDropFileOptions();

}

function setupEvents() {
	setupEventsMap();
	setupEventsButtons();
}

function setupEventsMap() {
	var controldiv = $(".mapboxgl-ctrl-bottom-right");
	var zoom = $("<div>", {class: "control-zoom"});
	controldiv.append(zoom);

	map.on('moveend', function() {
		zoom.text("ZL: " + map.getZoom().toFixed(2) + " | ");
		updateTwitter();
	});

	map.on('load', function() {

		SearchWorld.update();

		var toponims_layers = [];
		var layers = map.style._layers;
		$.each(layers, function (layer) {
			if(this.source == 'toponimiamon'){
				toponims_layers.push(this.id);
			}
		});

		map.on('mousemove', function (e) {
			if($('#info_vector').is(":visible") && !$('#bt_pin').hasClass("red")){
				var features = map.queryRenderedFeatures(e.point, { layers: toponims_layers});
				if (features.length) {
					taulaFeatures(features);
				}
			}
		});

		map.on('dblclick', function (e) {
			map.setZoom( map.getZoom() );
			var features = map.queryRenderedFeatures(e.point, { layers: toponims_layers });
			if (features.length) {
				if($('#info_vector').is(":visible")){
					//jQuery('#bt_close').show();
				}	else{
					jQuery('#info_vector').show();
				}
				taulaFeatures(features);
			}else {
				jQuery('#info_vector').hide();
			}
		});

	});
}

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

function updateTwitter(){
	delay(function(){
		$('#social').append('<a href="https://twitter.com/share" class="twitter-share-button twitter-hide" data-text="PintamapsMón! El món amb els teus colors, i en català" data-via="geostarters" data-hashtags="pintamaps">Tweet</a>');
		// reload twitter scripts to force them to run, converting a to iframe
		$.getScript("http://platform.twitter.com/widgets.js",function() {
			$('#social iframe:not(:last-child)').remove();
			$('#social').find('.twitter-hide').removeClass('twitter-hide');
			$('#social a:not(:last-child)').remove();
		});
	}, 500 );
}

function addEditorEstils(mapStyle){
	var layers = mapStyle.layers;

	var source   = $("#styles-template").html();
	var template = Handlebars.compile(source);
	var html = template(mapStyle);
	$(".list_styles").empty();
	$(".list_styles").append(html);

	for (var i = 0, length = layers.length; i < length; i++) {
		var layer = layers[i];
		if(layer.name){
			var color = getColor(layer);
			var p_options = $.extend({}, options, {
				color :  color
			});
			/*
			if(layer.id == 'background'){
				var backgroundOptions = {
					format: 'rgb'
				};
				var b_options = $.extend(p_options, backgroundOptions);
				$('#'+layer.id).colorpicker(b_options).on('changeColor.colorpicker',
				function(event) {
					if (socInici) {
						if (!pattern_map) {
							changeColorLayer(event);
						}
					}
				});
			}else {
				$('#'+layer.id).colorpicker(p_options).on('changeColor.colorpicker',
				function(event) {
					if (socInici) {
						if (!pattern_map) {
							changeColorLayer(event);
						}
					}
				});
			}*/

			$('#'+layer.id).colorpicker(p_options).on('changeColor.colorpicker',
			function(event) {
				if (socInici) {
					if (!pattern_map) {
						changeColorLayer(event);
					}
				}
			});
		}
	}
}

function getColor(layer){
	var color = "";
	if (layer.type == "fill"){
		if(layer.paint["fill-color"]["stops"]){
			color = layer.paint["fill-color"]["stops"][0][1];
		}else{
			color = layer.paint["fill-color"];
		}
	}else if(layer.type == "line"){
		if(layer.paint["line-color"]["stops"]){
			color = layer.paint["line-color"]["stops"][0][1];
		}else{
			color = layer.paint["line-color"];
		}
	}else if(layer.type == "circle"){
			color = layer.paint["circle-color"];
	}
	else if(layer.type == "background"){
		color = layer.paint["background-color"]
	}
	return color;
}

function getTipusGeometria(geometria){
	var tipusGeometria = "";
	if(geometria == 'fill'){
		return "fill-color"
	}else if(geometria == 'background'){
		return "background-color";
	}else if(geometria == 'line'){
		return "line-color";
	}else if(geometria == 'circle'){
		return "circle-color";
	}
	return tipusGeometria;
}

function changeColorLayer(event) {
	var colorRGBA;
  var id = event.target.id;
	for (var i = 0,length = mapStyle.layers.length; i < length; i++) {
		var layer = mapStyle.layers[i];
		if(layer.id == id){
			var tipusGeometria = getTipusGeometria(layer.type);
			/*
			if(layer.id == 'background'){
				colorRGBA = 'rgb(' + event.color.toRGB().r + ','
				+ event.color.toRGB().g + ','
				+ event.color.toRGB().b + ')';
			}else{
				colorRGBA = 'rgba(' + event.color.toRGB().r + ','
				+ event.color.toRGB().g + ','
				+ event.color.toRGB().b + ','
				+ event.color.toRGB().a + ')';
			}
			*/

			colorRGBA = 'rgba(' + event.color.toRGB().r + ','
			+ event.color.toRGB().g + ','
			+ event.color.toRGB().b + ','
			+ event.color.toRGB().a + ')';

			map.setPaintProperty(id, tipusGeometria, colorRGBA);
			layer.paint[tipusGeometria] = colorRGBA;

			//estados
			if(id === "ne_10m_admin_0_countries_1" || id === "ne_10m_admin_0_countries_9"){
				var origen;
				var fin;
				if(id === "ne_10m_admin_0_countries_1"){
					var layerfin = mapStyle.layers[i+8];
					origen = layer.paint[tipusGeometria];
					fin = layerfin.paint[tipusGeometria];
				}else{
					var layerorigen = mapStyle.layers[i-8];
					origen = layerorigen.paint[tipusGeometria];
					fin = layer.paint[tipusGeometria];
				}

				var scale = chroma.scale([origen, fin]).domain([1,2,3,4,5,6,7,8,9]);
				try {
					map.setPaintProperty("ne_10m_admin_0_countries_2", "fill-color", scale(2).css());
					layer = getLayerById(mapStyle, "ne_10m_admin_0_countries_2");
					layer.paint[tipusGeometria] = scale(2).css();
					map.setPaintProperty("ne_10m_admin_0_countries_3", "fill-color", scale(3).css());
					layer = getLayerById(mapStyle, "ne_10m_admin_0_countries_3");
					layer.paint[tipusGeometria] = scale(3).css();
					map.setPaintProperty("ne_10m_admin_0_countries_4", "fill-color", scale(4).css());
					layer = getLayerById(mapStyle, "ne_10m_admin_0_countries_4");
					layer.paint[tipusGeometria] = scale(4).css();
					map.setPaintProperty("ne_10m_admin_0_countries_5", "fill-color", scale(5).css());
					layer = getLayerById(mapStyle, "ne_10m_admin_0_countries_5");
					layer.paint[tipusGeometria] = scale(5).css();
					map.setPaintProperty("ne_10m_admin_0_countries_6", "fill-color", scale(6).css());
					layer = getLayerById(mapStyle, "ne_10m_admin_0_countries_6");
					layer.paint[tipusGeometria] = scale(6).css();
					map.setPaintProperty("ne_10m_admin_0_countries_7", "fill-color", scale(7).css());
					layer = getLayerById(mapStyle, "ne_10m_admin_0_countries_7");
					layer.paint[tipusGeometria] = scale(7).css();
					map.setPaintProperty("ne_10m_admin_0_countries_8", "fill-color", scale(8).css());
					layer = getLayerById(mapStyle, "ne_10m_admin_0_countries_8");
					layer.paint[tipusGeometria] = scale(8).css();
				} catch (e) {
					console.log(e);
				} finally {

				}
			}

			//bathymetry
			if(id === "ne_10m_bathymetry_K_200" || id === "ne_10m_bathymetry_A_10000"){
				if(id === "ne_10m_bathymetry_K_200"){
					var layerfin = mapStyle.layers[i+10];
					origen = layer.paint[tipusGeometria];
					fin = layerfin.paint[tipusGeometria];
				}else{
					var layerorigen = mapStyle.layers[i-10];
					origen = layerorigen.paint[tipusGeometria];
					fin = layer.paint[tipusGeometria];
				}
				try {
					var scale = chroma.scale([origen, fin]).domain([1,2,3,4,5,6,7,8,9,10,11]);
					map.setPaintProperty("ne_10m_bathymetry_J_1000", "fill-color", scale(2).css());
					layer = getLayerById(mapStyle, "ne_10m_bathymetry_J_1000");
					layer.paint[tipusGeometria] = scale(2).css();
					map.setPaintProperty("ne_10m_bathymetry_I_2000", "fill-color", scale(3).css());
					layer = getLayerById(mapStyle, "ne_10m_bathymetry_I_2000");
					layer.paint[tipusGeometria] = scale(3).css();
					map.setPaintProperty("ne_10m_bathymetry_H_3000", "fill-color", scale(4).css());
					layer = getLayerById(mapStyle, "ne_10m_bathymetry_H_3000");
					layer.paint[tipusGeometria] = scale(4).css();
					map.setPaintProperty("ne_10m_bathymetry_G_4000", "fill-color", scale(5).css());
					layer = getLayerById(mapStyle, "ne_10m_bathymetry_G_4000");
					layer.paint[tipusGeometria] = scale(5).css();
					map.setPaintProperty("ne_10m_bathymetry_F_5000", "fill-color", scale(6).css());
					layer = getLayerById(mapStyle, "ne_10m_bathymetry_F_5000");
					layer.paint[tipusGeometria] = scale(6).css();
					map.setPaintProperty("ne_10m_bathymetry_E_6000", "fill-color", scale(7).css());
					layer = getLayerById(mapStyle, "ne_10m_bathymetry_E_6000");
					layer.paint[tipusGeometria] = scale(7).css();
					map.setPaintProperty("ne_10m_bathymetry_D_7000", "fill-color", scale(8).css());
					layer = getLayerById(mapStyle, "ne_10m_bathymetry_D_7000");
					layer.paint[tipusGeometria] = scale(8).css();
					map.setPaintProperty("ne_10m_bathymetry_C_8000", "fill-color", scale(9).css());
					layer = getLayerById(mapStyle, "ne_10m_bathymetry_C_8000");
					layer.paint[tipusGeometria] = scale(9).css();
					map.setPaintProperty("ne_10m_bathymetry_B_9000", "fill-color", scale(10).css());
					layer = getLayerById(mapStyle, "ne_10m_bathymetry_B_9000");
					layer.paint[tipusGeometria] = scale(10).css();
				} catch (e) {
					console.log(e);
				} finally {

				}
			}
			break;
		}
	}
}

function changeFontText(font){
	//console.log("changeFontText");
	//toponimia_cap#toponimia_nucli", 'text-color',10
	//"text-font" : ["Open Sans Regular","Arial Unicode MS Regular"],
	if(typeof font == "undefined"){
		font="Arial-";
	}
	var tipusGeometria = 'text-font';
	mapStyle.fontFamily = font;
	for (var i = 0,length = mapStyle.layers.length; i < length; i++) {
		var vfont, layer = mapStyle.layers[i];
		if(layer.source == 'toponimiamon'){
			var lfont = layer.layout[tipusGeometria];
			if(lfont[0].indexOf('Regular') != -1){
				vfont = font+'Regular';
			}else if (lfont[0].indexOf('Italic') != -1) {
				vfont = font+'Italic';
			}else if (lfont[0].indexOf('Bold') != -1) {
				vfont = font+'Bold';
			}
			map.setLayoutProperty(layer.id, "text-font", [vfont]);
			layer.layout[tipusGeometria] = [vfont];
		}
	}
}

function getLayerById(mapStyle, id){
	var layer = null;
	for (var i = 0,length = mapStyle.layers.length; i < length; i++) {
			var layer = mapStyle.layers[i];
			if(layer.id === id){
				return layer;
			}
	}
	return layer;
}

function changeTopoLayer(actiu) {
	for (var i = 0,length = mapStyle.layers.length; i < length; i++) {
		var layer = mapStyle.layers[i];
		var id = layer.id;
		if (layer.source === 'toponimiamon' || id === 'Catalunya_toponim'){
			if (actiu) {
				map.setLayoutProperty(id, 'visibility', 'visible');
				layer.layout.visibility = 'visible';
			} else {
				map.setLayoutProperty(id, 'visibility', 'none');
				layer.layout.visibility = 'none';
			}
		}
	}
	mapStyle.estatToponimia = actiu;
}

function setupEventsButtons() {
	jQuery('#bt_pitch').on('click', function() {
		var pitch = parseInt(map.getPitch());
		pitch == 60 ? pitch = 0 : pitch = pitch + 30;
		map.easeTo({
			'pitch' : pitch
		});
	});

	jQuery('#bt_random').on('click', function() {
		randomizeColor();
	});

	jQuery('#bt_export').on('click', function() {
		mapStyle.mapa.center.lng = map.getCenter().lng;
		mapStyle.mapa.center.lat = map.getCenter().lat;
		mapStyle.mapa.zoom = map.getZoom();
		mapStyle.mapa.pitch = map.getPitch();
		mapStyle.mapa.bearing = map.getBearing();
		var msg = JSON.stringify(mapStyle);
		var data = "text/json;charset=utf-8," + encodeURIComponent(msg);
		var a = document.createElement('a');
		a.href = 'data:' + data;
		a.download = 'estil_mapa.json';
		a.title = 'Descarregar estil';
		a.className = 'verd glyphicon glyphicon-cloud-download';
		jQuery('#div_exportar').html(a);
		var container = document.getElementById('div_exportar');
		$('#md_export').modal({
			show : true
		});
	});

	jQuery('#bt_import').on('click', function() {
		$('#md_import').modal({
			show : true
		});
	});

	//captura
	jQuery('#bt_capture').on('click', function() {
		$('#md_print').modal({
			show : true
		});
	});
	jQuery('#generate-btn').on('click', generateMap);


	//world
	jQuery('#bt_world').on('click', function() {
		printWorld();
	});

	//toponims
	jQuery('#chk_toponims').on('click', function() {
		var actiu = this.checked;
		changeTopoLayer(actiu);
	});

	jQuery('#ul_topomap li').on('click', function() {
		var _li = this.id;
		_li=_li.replace("li_","");
		changeFontText(_li);
	});

	//twitter
		jQuery('#twitter-button').on('click', function() {
			console.log("click");
			//var data = $(this).data('text');
			//$(this).data('text', data + " hola");
		});
	//setupEventsSubscribe();
}

function preparaControlCerca() {
	var input = SearchWorld.createInput();
	jQuery('#barraCerca').append(input);
}

function taulaFeatures(features){
	var source   = $("#features-template").html();
	var template = Handlebars.compile(source);
	if(features.length){
		var html = template({features: features});
		$('#text_vector').html(html);
	}
}

function randomizeColor() {
	var inputs = $('.colorpicker-element');
	inputs.each(function(){
		$(this).colorpicker('setValue',
		chroma.random().alpha(Math.random().toFixed(2)).css());
	});
}

function generateMap() {
	'use strict';

	if (isError()) {
		openErrorModal('Configuració invàlida.');
		return;
	}

	$('#spinner').css('display', 'inline-block');
	$('#generate-btn').addClass('disabled');

	var width = Number($('#widthInput').val());
	var height = Number($('#heightInput').val());

	var dpi = Number($('#dpiInput').val());

	var format = $('input[name=outputOptions]:checked', '#config').val();

	var unit = $('input[name=unitOptions]:checked', '#config').val();

	var zoom = map.getZoom();
	var center = map.getCenter();
	var bearing = map.getBearing();
	var pitch= map.getPitch();

	createPrintMap(width, height, dpi, format, unit, zoom, center, bearing, pitch).then(function(){
		$('#spinner').hide();
		$('#generate-btn').removeClass('disabled');
	});
}

function preparaFormPrint() {
	// functions print
	var maxSize;
	if (map) {
		var canvas = map.getCanvas();
		var gl = canvas.getContext('experimental-webgl');
		maxSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
	}

	jQuery('#widthInput').on('change', function(e) {
		'use strict';
		var val = Number(e.target.value);
		var dpi = Number(jQuery('#dpiInput').val());
		var units = $("#config input[type='radio']:checked").val();
		val = validateSize(units,val,dpi,maxSize);
		if(val.error){
			errors.width.state = true;
			if(val.value < 0){
				errors.width.msg = 'l´amplada ha de ser un nombre positiu!';
			}else if(val.value === 0){
				errors.width.msg = 'l´amplada ha de ser un nombre més gran que zero!';
			}else if(val.value === null){
				errors.width.msg = 'l´amplada és massa gran!';
			}else{
				errors.width.msg = 'El valor màxim de l´amplada és '
				+ maxSize
				+ 'px, però l´amplada entrada és '
				+ val.value + 'px.';
			}
		}else{
			errors.width.state = false;
		}
		handleErrors();

	});

	jQuery('#heightInput').on('change', function(e) {
		'use strict';
		var val = Number(e.target.value);
		var dpi = Number(jQuery('#dpiInput').val());
		var units = $("#config input[type='radio']:checked").val();
		validateSize(units,val,dpi,maxSize);

		if(val.error){
			errors.height.state = true;
			if(val.value < 0){
				errors.height.msg = 'l´alçada ha de ser un nombre positiu!';
			}else if(val.value === 0){
				errors.height.msg = 'l´alçada ha de ser un nombre més gran que zero!';
			}else if(val.value === null){
				errors.height.msg = 'l´alçada és massa gran!';
			}else{
				errors.height.msg = 'El valor màxim de l´alçada és '
				+ maxSize
				+ 'px, però l´alçada entrada és '
				+ val.value + 'px.';
			}
		}else{
			errors.height.state = false;
		}

		handleErrors();
	});

	jQuery('#dpiInput').on('change', function(e) {
		'use strict';
		var dpi = Number(e.target.value);
		var h = Number(jQuery('#heightInput').val());
		var w = Number(jQuery('#widthInput').val());
		var units = $("#config input[type='radio']:checked").val();
		var val = validateSize(units,h,dpi,maxSize);
		if(dpi < 0){
			errors.dpi.state = true;
			errors.dpi.msg = 'DPI ha de ser un número positiu!';
		}else if(dpi > 300){
			errors.dpi.state = true;
			errors.dpi.msg = 'DPI ha de ser un número positiu menor que 300!';
		}else{
			if(!val.error){
				val = validateSize(units,w,dpi,maxSize);
				if(val.error){
					errors.dpi.state = true;
					errors.dpi.msg = 'Imatge massa gran selecciona un nombre menor';
				}else{
					errors.dpi.state = false;
				}
			}else{
				errors.dpi.state = true;
				errors.dpi.msg = 'Imatge massa gran selecciona un nombre menor';
			}
		}
		handleErrors();
	});

	jQuery('#mmUnit').on('change', function(e) {
		jQuery('#widthInput').val(jQuery('#widthInput').val() * 25.4);
		jQuery('#heightInput').val(jQuery('#heightInput').val() * 25.4);
	});

	jQuery('#inUnit').on('change', function(e) {
		'use strict';
		jQuery('#widthInput').val(jQuery('#widthInput').val() / 25.4);
		jQuery('#heightInput').val(jQuery('#heightInput').val() / 25.4);
	});
}

function createPrintMap(width, height, dpi, format, unit, zoom, center, bearing, pitch) {
	'use strict';

	var dfd = $.Deferred();
	// Calculate pixel ratio
	var actualPixelRatio = window.devicePixelRatio;
	Object.defineProperty(window, 'devicePixelRatio', {
		get : function() {
			return dpi / 96
		}
	});

	// Create map container
	var hidden = $('<div>', {class: 'hidden-map'});
	$('body').append(hidden);
	var container = $('<div>',{id:'map-hidden'}).css('width', toPixels(width)).css('height', toPixels(height));
	hidden.append(container);

	//console.log(mapStyle);

	// Render map
	var renderMap = new mapboxgl.Map({
		container : 'map-hidden',
		center : center,
		zoom : zoom,
		style : mapStyle,
		bearing : bearing,
		pitch:pitch,
		interactive : false,
		attributionControl : false,
		preserveDrawingBuffer: true
		//,maxBounds: [[-180,-80],[180,80]]
	});

	renderMap.on('load', function() {

		if (format == 'png') {
			renderMap.getCanvas().toBlob(function(blob) {
				saveAs(blob, 'captura_mapa.png');
			});
		} else {
			var pdf = new jsPDF({
				orientation : width > height ? 'l' : 'p',
				unit : unit,
				format : [ width, height ],
				compress : true
			});

			pdf.addImage(renderMap.getCanvas().toDataURL('image/jpeg', 0.95),
			'jpeg', 0, 0, width, height);
			pdf.save('captura_mapa.pdf');
		}

		setTimeout(function(){
			renderMap.remove();

			hidden.remove();

			Object.defineProperty(window, 'devicePixelRatio', {
				get : function() {
					return actualPixelRatio
				}
			});

			dfd.resolve();
		},500);

	});

	return dfd.promise();

}

function printWorld(){
	var width = 1038;
	var height = 750;
	var factor = 1;
	var unit = "mm";
	var format = "png";
	var dpi = 166;
	var factord = 1;

	var zoom = 2.94;
	var center = new mapboxgl.LngLat(0, 0);
	var bearing = 0;
	var pitch= 0;


	if(bowser.chrome){
		dpi = 100;
	}

	$('#md_world').modal('show');
	createPrintMap(width, height, dpi, format, unit, zoom, center, bearing, pitch).then(function(){
		$('#md_world').modal('hide');
	});

	//var center1 = new mapboxgl.LngLat(-90, 54);
	//var center2 = new mapboxgl.LngLat(90, 54);
	//var center3 = new mapboxgl.LngLat(-90, -40);
	//var center4 = new mapboxgl.LngLat(90, -40);

	//createCanvasMap(w*factor, h*factor, dpi*factord, format, units, zoom, center1, bearing, pitch, true, 'map-hidden1');
	//createCanvasMap(w*factor, h*factor, dpi*factord, format, units, zoom, center2, bearing, pitch, true, 'map-hidden2');
	//createCanvasMap(w*factor, h*factor, dpi*factord, format, units, zoom, center3, bearing, pitch, true, 'map-hidden3');
	//createCanvasMap(w*factor, h*factor, dpi*factord, format, units, zoom, center4, bearing, pitch, true, 'map-hidden4');

/*
	$.when( map1, map2 ).done(function ( v1, v2, v3 ) {
    console.log( v1 ); // v1 is undefined
    console.log( v2 ); // v2 is "abc"
		var canvases = [v1.getCanvas(), v2.getCanvas()];
		createMulticanvas(canvases);
	});
	*/

}

/*
function setupEventsSubscribe(){
	var canvases = [];
	$.subscribe('loadCanvas', function(e,data){
		canvases.push(data);
		data.canvas.toBlob(function(blob) {
			saveAs(blob, 'captura_mapa'+data.id+'.png');
		});
	});
}
*/

/*
function createCanvasMap(width, height, dpi, format, unit, zoom, center, bearing, pitch, multiple, idmap){
	var hidden = $('<div>', {class: 'hidden-map'});
	$('body').append(hidden);
	var container = $('<div>',{id:idmap}).css('width', toPixels(width)).css('height', toPixels(height));
	hidden.append(container);

	var dfd = new $.Deferred();
	var renderMap = new mapboxgl.Map({
		container : idmap,
		center : center,
		zoom : zoom,
		style : mapStyle,
		bearing : bearing,
		pitch:pitch,
		interactive : false,
		attributionControl : false
	});
	renderMap.once('load', function() {

		$.publish('loadCanvas', {canvas: renderMap.getCanvas(), id: idmap});
	});
	return dfd;
}
*/

function validateSize(units,val,dpi,maxSize){
	if (units === 'mm'){
		val = val / 25.4;
	}
	var value = val * dpi;
	if(val < 0 || dpi < 0){
		return {error: true, value: -1};
	}else if(val === 0 || dpi === 0){
		return {error: true, value: 0};
	}else if(val * window.devicePixelRatio * 96 > maxSize){
		return {error: true, value: null};
	}else if (value > maxSize) {
			return {error: true, value: value};
	}else {
		return {error: false};
	}
}

function handleErrors() {
	'use strict';
	var errorMsgElem = $('#error-message');
	var anError = false;
	var errorMsg;
	for ( var e in errors) {
		e = errors[e];
		if (e.state) {
			if (anError) {
				errorMsg += ' ' + e.msg;
			} else {
				errorMsg = e.msg;
				anError = true;
			}
			$('#'+e.grp).addClass('has-error');
		} else {
			$('#'+e.grp).removeClass('has-error');
		}
	}
	if (anError) {
		errorMsgElem.text(errorMsg);
		errorMsgElem.show();
	} else {
		errorMsgElem.hide();
	}
}

function toPixels(length) {
	'use strict';
	var unit = $('input[name=unitOptions]:checked', '#config').val();
	var conversionFactor = 96;
	if (unit == 'mm') {
		conversionFactor /= 25.4;
	}
	return conversionFactor * length + 'px';
}

function isError() {
	'use strict';
	for ( var e in errors) {
		if (errors[e].state) {
			return true;
		}
	}
	return false;
}

function addDropFileOptions() {
	var opcionsBoto = drOpcionsMapa;
	opcionsBoto.clickable = true;
	if (drgFromBoto == null) {
		drgFromBoto = new window.Dropzone("#div_upload_estil", opcionsBoto);
		drgFromBoto.on("addedfile", function(file, xhr) {
			drgFromBoto.uploadFile(drgFromBoto.files[0]);
			;
		});
		drgFromBoto.on('success', function(file, resposta) {
			var name=file.name;
			if(name.indexOf('_goto')!=-1){
				aplicaZoom=true;
			}else{
				aplicaZoom=false;
			}
			drgFromBoto.removeAllFiles(true);
			resposta = JSON.parse(resposta);
			if (resposta.STATUS == "OK") {
				$('#md_import').modal('hide');
				processaEstil(resposta.STYLE, false);
			} else {
				$('#md_import').modal('hide');
				alert("Error al carregar l'arxiu");
			}
		});
		drgFromBoto.on('error', function(file, errorMessage) {
			drgFromBoto.removeAllFiles(true);
			$('#md_import').modal('hide');
			alert("Error al carregar l'arxiu");
		});
	}
	var opcionsMapa = drOpcionsMapa;
	opcionsMapa.clickable = false;
	if (drgFromMapa == null) {
		drgFromMapa = new window.Dropzone("#map", opcionsMapa);
		drgFromMapa.on("addedfile", function(file, xhr) {
			drgFromMapa.uploadFile(drgFromMapa.files[0]);
			;
		});
		drgFromMapa.on('success', function(file, resposta) {
			var name=file.name;
			if(name.indexOf('goto')!=-1){
				aplicaZoom=true;
			}else{
				aplicaZoom=false;
			}
			drgFromMapa.removeAllFiles(true);
			resposta = JSON.parse(resposta);
			if (resposta.STATUS == "OK") {
				processaEstil(resposta.STYLE, false);
			} else {
				alert("Error al carregar l'arxiu");
			}
		});
		drgFromMapa.on('error', function(file, errorMessage) {
			drgFromMapa.removeAllFiles(true);
			alert("Error al carregar l'arxiu");
		});
	}
}

function tipus2Zoom(tipus){
	switch (tipus) {
		case "0UAES":
			return 3;
			break;
		case "0TDEP":
			return 4;
			break;
		case "0TCON":
			return 4;
			break;
		case "0UARE":
			return 5;
			break;
		case "1CEST":
			return 6;
			break;
		case "1EDIF":
			return 7;
			break;
		case "1NUCL":
			return 7;
			break;
		case "4ESPN":
			return 7;
			break;
		case "5BOSC":
			return 7;
			break;
		case "4HIND":
			return 7;
			break;
		case "5CIMS":
			return 7;
			break;
		case "5CONG":
			return 7;
			break;
		case "5COST":
			return 7;
			break;
		case "5DELT":
			return 7;
			break;
		case "5DESE":
			return 7;
			break;
		case "5ESCU":
			return 7;
			break;
		case "5GEOL":
			return 3;
			break;
		case "5ILLA":
			return 6;
			break;
		case "5INDR":
			return 7;
			break;
		case "5MCIM":
			return 7;
			break;
		case "5MDEP":
			return 6;
			break;
		case "5MIND":
			return 6;
			break;
		case "5MSER":
			return 6;
			break;
		case "5PLAN":
			return 7;
			break;
		case "5PUNT":
			return 7;
			break;
		case "5REGN":
			return 7;
			break;
		case "5SERR":
			return 7;
			break;
		case "5VOLC":
			return 7;
			break;
		case "6CALA":
			return 7;
			break;
		case "6CANA":
			return 7;
			break;
		case "6FREU":
			return 7;
			break;
		case "6GLAC":
			return 7;
			break;
		case "6GOLF":
			return 5;
			break;
		case "6LLAC":
			return 6;
			break;
		case "6MARS":
			return 5;
			break;
		case "6OASI":
			return 6;
			break;
		case "6PANT":
			return 7;
			break;
		case "6RIUS":
			return 6;
			break;
		case "6SALT":
			return 7;
			break;
		default:
			return 7;
			break;
	}
}
