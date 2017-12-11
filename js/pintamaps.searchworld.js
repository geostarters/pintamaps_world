/**
 * require: jquery
 */
(function ( $, window, document, undefined ) {
	"use strict";

	var SearchWorld = {

		init: function() {
			this.cache();
    	this.subscriptions();
    	this.bindEvents();
    	return this;
    },

    cache: function(){
    	var self = this;
    	$.get("dades/toponims_mon.geojson",function(data){
				if(data.type){

				}else{
					data = JSON.parse(data);
				}
				for (var i = 0, length = data.features.length ; i < length; i++) {
					var feature = data.features[i];
					var html = feature.properties.toponim_catala;
					if(feature.properties.toponim_oficial){
						html += " (" + feature.properties.toponim_oficial + ")"
					}
					feature.label = html;
					feature.value = html;
				}
				self.toponims = data;
				//self.update();
    	});
    },

    createInput: function(){
    	var self = this;
			/*var searchInput = $('<select/>')
			.addClass('SearchWorld')
			.prop('title', "Cerca");*/

			var searchInput = $('<input/>')
			.addClass('SearchWorld')
			.prop('title', "Cerca")
			.prop('placeholder', 'Cerca un topònim');

			self.input = searchInput;
			//self.update();
    	return searchInput;
    },

		update: function(){
			var self = this,
			searchInput = self.input;
			if(self.toponims && searchInput){
				searchInput.autocomplete({
					minLength: 0,
					source: self.toponims.features,
					focus: function( event, ui ) {
						var html = ui.item.properties.toponim_catala;
						if(ui.item.properties.toponim_oficial){
							html += " (" + ui.item.properties.toponim_oficial + ")"
						}
						searchInput.val( html );
						return false;
					},
					select: function( event, ui ) {
						var zoom =  tipus2Zoom(ui.item.properties.tipus);
						map.jumpTo({
							center: [parseFloat(ui.item.geometry.coordinates[0]), parseFloat(ui.item.geometry.coordinates[1])],
							zoom: zoom
						});
						return false;
					}
				}).autocomplete( "instance" )._resizeMenu = function() {
				  this.menu.element.outerWidth( 350 );
				};

				/*
				if (searchInput.data('select2')){
					searchInput.select2("destroy");
				}
				searchInput.empty();
				var option = $('<option/>');
				searchInput.append(option);
				$.each(self.toponims.features, function() {
					var item = this;
					var html = item.properties.toponim_catala;
					if(item.properties.toponim_oficial){
						html += " (" + item.properties.toponim_oficial + ")"
					}
					var option = $('<option/>')
					.prop('value',item.geometry.coordinates+","+item.properties.tipus)
					.data('item', item)
					.html(html);
					searchInput.append(option);
				});
				searchInput.select2({
					placeholder: "Cerca un topònim",
					allowClear: true
				});
				searchInput.on('select2:select', function (evt) {
				  // Do something
					var id = $(this).select2('data')[0].id;
					id = id.split(",");
					var zoom =  tipus2Zoom(id[2]);
					map.jumpTo({
						center: [parseFloat(id[0]), parseFloat(id[1])],
						zoom: zoom
					});
				});
				*/
			}
			return self;
		},

		search: function() {
			var self = this,
			input = self.input;
			var q = input.val();
			if($.trim(q)){
				var results = $.grep( self.toponims.features, function( n, i ) {
					if(	n.properties.toponim_catala.toLowerCase().indexOf(q) != -1){
						return true;
					}else{
						return false;
					}
				});
			}
			return self;
		},

    getViewMunicipis: function(bbox){

    },

		setLayer: function(layer){
			var self = this;
			self.layer = layer;

		},

    /**********Events**************/
    bindEvents: function(){
    },

    subscriptions: function() {

    }
	}

	//Registre module if AMD is present:
 	if(typeof define === "function" && define.amd){
 		define([], function(){return SelectMunicipis.init();} );
 	}

 	//Initialize the whole thing. Can be referenced anywhere in your code after it has been declared.
 	window.SearchWorld = SearchWorld.init();

})( jQuery, window, document );
