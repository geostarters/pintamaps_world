!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.geobuf=e()}}(function(){return function e(t,r,i){function n(a,u){if(!r[a]){if(!t[a]){var f="function"==typeof require&&require;if(!u&&f)return f(a,!0);if(o)return o(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var l=r[a]={exports:{}};t[a][0].call(l.exports,function(e){var r=t[a][1][e];return n(r?r:e)},l,l.exports,e,t,r,i)}return r[a].exports}for(var o="function"==typeof require&&require,a=0;a<i.length;a++)n(i[a]);return n}({1:[function(e,t){"use strict";function r(e){P=2,S=Math.pow(10,6),V=null,M=[],w=[];var t=e.readFields(i,{});return M=null,t}function i(e,t,r){1===e?M.push(r.readString()):2===e?P=r.readVarint():3===e?S=Math.pow(10,r.readVarint()):4===e?n(r,t):5===e?o(r,t):6===e&&a(r,t)}function n(e,t){return t.type="FeatureCollection",t.features=[],e.readMessage(u,t)}function o(e,t){return t.type="Feature",e.readMessage(f,t)}function a(e,t){return e.readMessage(s,t)}function u(e,t,r){1===e?t.features.push(o(r,{})):13===e?w.push(d(r)):15===e&&p(r,t)}function f(e,t,r){1===e?t.geometry=a(r,{}):11===e?t.id=r.readString():12===e?t.id=r.readSVarint():13===e?w.push(d(r)):14===e?t.properties=p(r,{}):15===e&&p(r,t)}function s(e,t,r){1===e?t.type=m[r.readVarint()]:2===e?V=r.readPackedVarint():3===e?l(t,r,t.type):4===e?(t.geometries=t.geometries||[],t.geometries.push(a(r,{}))):13===e?w.push(d(r)):15===e&&p(r,t)}function l(e,t,r){"Point"===r?e.coordinates=c(t):"MultiPoint"===r?e.coordinates=y(t,!0):"LineString"===r?e.coordinates=y(t):"MultiLineString"===r?e.coordinates=h(t):"Polygon"===r?e.coordinates=h(t,!0):"MultiPolygon"===r&&(e.coordinates=v(t))}function d(e){for(var t=e.readVarint()+e.pos,r=null;e.pos<t;){var i=e.readVarint(),n=i>>3;1===n?r=e.readString():2===n?r=e.readDouble():3===n?r=e.readVarint():4===n?r=-e.readVarint():5===n?r=e.readBoolean():6===n&&(r=JSON.parse(e.readString()))}return r}function p(e,t){for(var r=e.readVarint()+e.pos;e.pos<r;)t[M[e.readVarint()]]=w[e.readVarint()];return w=[],t}function c(e){for(var t=e.readVarint()+e.pos,r=[];e.pos<t;)r.push(e.readSVarint()/S);return r}function g(e,t,r,i){var n,o,a=0,u=[],f=[];for(o=0;P>o;o++)f[o]=0;for(;r?r>a:e.pos<t;){for(n=[],o=0;P>o;o++)f[o]+=e.readSVarint(),n[o]=f[o]/S;u.push(n),a++}return i&&u.push(u[0]),u}function y(e){return g(e,e.readVarint()+e.pos)}function h(e,t){var r=e.readVarint()+e.pos;if(!V)return[g(e,r,null,t)];for(var i=[],n=0;n<V.length;n++)i.push(g(e,r,V[n],t));return V=null,i}function v(e){var t=e.readVarint()+e.pos;if(!V)return[[g(e,t,null,!0)]];for(var r=[],i=1,n=0;n<V[0];n++){for(var o=[],a=0;a<V[i];a++)o.push(g(e,t,V[i+1+a],!0));i+=V[i]+1,r.push(o)}return V=null,r}t.exports=r;var M,w,V,P,S,m=["Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","GeometryCollection"]},{}],2:[function(e,t){"use strict";function r(e,t){M={},w=0,V=0,P=1,i(e),P=Math.min(P,S);for(var r=Math.ceil(Math.log(P)/Math.LN10),n=Object.keys(M),o=0;o<n.length;o++)t.writeStringField(1,n[o]);return 2!==V&&t.writeVarintField(2,V),6!==r&&t.writeVarintField(3,r),"FeatureCollection"===e.type?t.writeMessage(4,f,e):"Feature"===e.type?t.writeMessage(5,s,e):t.writeMessage(6,l,e),M=null,t.finish()}function i(e){var t,r;if("FeatureCollection"===e.type){for(t=0;t<e.features.length;t++)i(e.features[t]);for(r in e)"type"!==r&&"features"!==r&&u(r)}else if("Feature"===e.type){i(e.geometry);for(r in e.properties)u(r);for(r in e)"type"!==r&&"id"!==r&&"properties"!==r&&"geometry"!==r&&u(r)}else{if("Point"===e.type)a(e.coordinates);else if("MultiPoint"===e.type)o(e.coordinates);else if("GeometryCollection"===e.type)for(t=0;t<e.geometries.length;t++)i(e.geometries[t]);else if("LineString"===e.type)o(e.coordinates);else if("Polygon"===e.type||"MultiLineString"===e.type)n(e.coordinates);else if("MultiPolygon"===e.type)for(t=0;t<e.coordinates.length;t++)n(e.coordinates[t]);for(r in e)"type"!==r&&"id"!==r&&"coordinates"!==r&&"arcs"!==r&&"geometries"!==r&&"properties"!==r&&u(r)}}function n(e){for(var t=0;t<e.length;t++)o(e[t])}function o(e){for(var t=0;t<e.length;t++)a(e[t])}function a(e){V=Math.max(V,e.length);for(var t=0;t<e.length;t++)for(;Math.round(e[t]*P)/P!==e[t]&&S>P;)P*=10}function u(e){void 0===M[e]&&(M[e]=w++)}function f(e,t){for(var r=0;r<e.features.length;r++)t.writeMessage(1,s,e.features[r]);d(e,t,!0)}function s(e,t){t.writeMessage(1,l,e.geometry),void 0!==e.id&&("number"==typeof e.id&&e.id%1===0?t.writeSVarintField(12,e.id):t.writeStringField(11,e.id)),e.properties&&d(e.properties,t),d(e,t,!0)}function l(e,t){t.writeVarintField(1,m[e.type]);var r=e.coordinates;if("Point"===e.type)c(r,t);else if("MultiPoint"===e.type)g(r,t,!0);else if("LineString"===e.type)g(r,t);else if("MultiLineString"===e.type)y(r,t);else if("Polygon"===e.type)y(r,t,!0);else if("MultiPolygon"===e.type)h(r,t);else if("GeometryCollection"===e.type)for(var i=0;i<e.geometries.length;i++)t.writeMessage(4,l,e.geometries[i]);d(e,t,!0)}function d(e,t,r){var i=[],n=0;for(var o in e){if(r){if("type"===o||"id"===o||"coordinates"===o||"arcs"===o||"geometries"===o||"properties"===o)continue;if("FeatureCollection"===e.type){if("features"===o)continue}else if("Feature"===e.type&&("id"===o||"properties"===o||"geometry"===o))continue}t.writeMessage(13,p,e[o]),i.push(M[o]),i.push(n++)}t.writePackedVarint(r?15:14,i)}function p(e,t){var r=typeof e;"string"===r?t.writeStringField(1,e):"boolean"===r?t.writeBooleanField(5,e):"object"===r?t.writeStringField(6,JSON.stringify(e)):"number"===r&&(e%1!==0?t.writeDoubleField(2,e):e>=0?t.writeVarintField(3,e):t.writeVarintField(4,-e))}function c(e,t){for(var r=[],i=0;V>i;i++)r.push(Math.round(e[i]*P));t.writePackedSVarint(3,r)}function g(e,t){var r=[];v(r,e),t.writePackedSVarint(3,r)}function y(e,t,r){var i,n=e.length;if(1!==n){var o=[];for(i=0;n>i;i++)o.push(e[i].length-(r?1:0));t.writePackedVarint(2,o)}var a=[];for(i=0;n>i;i++)v(a,e[i],r);t.writePackedSVarint(3,a)}function h(e,t){var r,i,n=e.length;if(1!==n||1!==e[0].length){var o=[n];for(r=0;n>r;r++)for(o.push(e[r].length),i=0;i<e[r].length;i++)o.push(e[r][i].length-1);t.writePackedVarint(2,o)}var a=[];for(r=0;n>r;r++)for(i=0;i<e[r].length;i++)v(a,e[r][i],!0);t.writePackedSVarint(3,a)}function v(e,t,r){var i,n,o=t.length-(r?1:0),a=new Array(V);for(n=0;V>n;n++)a[n]=0;for(i=0;o>i;i++)for(n=0;V>n;n++){var u=Math.round(t[i][n]*P)-a[n];e.push(u),a[n]+=u}}t.exports=r;var M,w,V,P,S=1e6,m={Point:0,MultiPoint:1,LineString:2,MultiLineString:3,Polygon:4,MultiPolygon:5,GeometryCollection:6}},{}],3:[function(e,t,r){"use strict";r.encode=e("./encode"),r.decode=e("./decode")},{"./decode":1,"./encode":2}]},{},[3])(3)});