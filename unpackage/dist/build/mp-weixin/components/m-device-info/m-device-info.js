(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/m-device-info/m-device-info"],{"1ddf":function(n,e,t){"use strict";var i=t("4b29"),o=t.n(i);o.a},3691:function(n,e,t){"use strict";t.r(e);var i=t("b461"),o=t.n(i);for(var c in i)"default"!==c&&function(n){t.d(e,n,(function(){return i[n]}))}(c);e["default"]=o.a},"4b29":function(n,e,t){},b461:function(n,e,t){"use strict";(function(n){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;t("8748");var i={name:"m-device-info",props:{coverView:{type:Boolean,default:!1},info:{type:Object,default:function(){return{}}}},data:function(){return{chargeInfoVisible:!1,chargeInfoOriginHeight:0,chargeInfoHeight:"17px"}},computed:{isOnline:function(){return!(!this.info.device||!this.info.device.state||1!=this.info.device.state)},deviceType:function(){var n=["07","12"].includes(this.info.device.hardVersion);return n?1:0},chargeInfo:function(){var n=this.info.chargeInfo;return"string"!==typeof n&&(n=""),n.length<=0?["暂无收费说明"]:n.split(/[\n\r]/)},distance:function(){return this.info.distance.toFixed(2)},deviceName:function(){return this.info.deviceName?this.info.deviceName:this.info.deviceNum},areaName:function(){return this.info.area&&this.info.area.name?this.info.area.name:""}},methods:{toggle:function(){this.chargeInfoVisible=!this.chargeInfoVisible,this.chargeInfoVisible?this.chargeInfoHeight="initial":this.chargeInfoHeight="17px"},openLocation:function(){var e=this;console.log("组件内 openLocation"),n.getLocation({type:"gcj02",success:function(t){var i=e.info.geoCoord[1],o=e.info.geoCoord[0];n.openLocation({latitude:i,longitude:o,scale:8,name:e.info.deviceName||e.info.deviceNum,address:e.info.area&&e.info.area.name||"",success:function(){console.log("success")},fail:function(n){console.log("fail",n)}})}})}},watch:{info:{handler:function(n){console.log(n)}}}};e.default=i}).call(this,t("543d")["default"])},de34:function(n,e,t){"use strict";t.r(e);var i=t("f9b0"),o=t("3691");for(var c in o)"default"!==c&&function(n){t.d(e,n,(function(){return o[n]}))}(c);t("1ddf");var a,f=t("f0c5"),r=Object(f["a"])(o["default"],i["b"],i["c"],!1,null,"1220f7fc",null,!1,i["a"],a);e["default"]=r.exports},f9b0:function(n,e,t){"use strict";t.d(e,"b",(function(){return o})),t.d(e,"c",(function(){return c})),t.d(e,"a",(function(){return i}));var i={mPortStatus:function(){return t.e("components/m-port-status/m-port-status").then(t.bind(null,"38ed"))},mIconImage:function(){return t.e("components/m-icon-image/m-icon-image").then(t.bind(null,"1b08"))}},o=function(){var n=this,e=n.$createElement;n._self._c},c=[]}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/m-device-info/m-device-info-create-component',
    {
        'components/m-device-info/m-device-info-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("de34"))
        })
    },
    [['components/m-device-info/m-device-info-create-component']]
]);
