(window.webpackJsonp=window.webpackJsonp||[]).push([[48],{"1d6c4d2a7bdc74efd1d7":function(e,a,t){"use strict";t.r(a);var r=t("8af190b70a6bc55c6f1b"),n=t.n(r),c=t("e95a63b25fb92ed15721"),i=t("811a4999285c4f950f0a"),d=t("fe25efaa8d6f45e3f5f9"),E=t("499d577663719e9512ef"),o=t("6104aceff0328eacbce8"),u=t("ca37a65e274e0b8f5aaa"),D=n.a.createElement(c.Switch,null,n.a.createElement(c.Route,{exact:!0,path:"/project/:projectId/widget/:widgetId?",component:u.c}),n.a.createElement(c.Route,{exact:!0,path:"/project/:projectId/widgets",component:u.b}));a.default=function(){return Object(i.b)({key:"widget",reducer:E.a}),Object(d.b)({key:"widget",saga:o.a}),D}},"499d577663719e9512ef":function(e,a,t){"use strict";t.d(a,"b",(function(){return d}));t("aee243f252d382c9e099"),t("e1e7df29006c8ae8a3c1"),t("c7c67f6c83a234360c8a"),t("7c38c3c508ba38fc2a83");var r=t("7edf83707012a871cdfb"),n=t("be3ae9b489ceb948e586"),c=t("6b414ce5e780d1c58f66"),i=t("88a09aae288902a34b11"),d={widgets:[],currentWidget:null,loading:!1,dataLoading:!1,columnValueLoading:!1,distinctColumnValues:null};a.a=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:d,a=arguments.length>1?arguments[1]:void 0;return Object(r.a)(e,(function(e){switch(a.type){case n.a.LOAD_WIDGETS:e.loading=!0,e.widgets=null;break;case n.a.LOAD_WIDGETS_SUCCESS:e.loading=!1,e.widgets=a.payload.widgets;break;case n.a.LOAD_WIDGETS_FAILURE:e.loading=!1;break;case n.a.ADD_WIDGET:e.loading=!0;break;case n.a.ADD_WIDGET_SUCCESS:e.widgets?(e.widgets.push(a.payload.result),e.loading=!1):(e.loading=!1,e.widgets=[a.payload.result]);break;case n.a.ADD_WIDGET_FAILURE:e.loading=!1;break;case n.a.DELETE_WIDGET:e.loading=!0;break;case n.a.DELETE_WIDGET_SUCCESS:e.widgets=e.widgets.filter((function(e){return e.id!==a.payload.id})),e.loading=!1;break;case n.a.DELETE_WIDGET_FAILURE:e.loading=!1;break;case n.a.LOAD_WIDGET_DETAIL:e.loading=!0,e.currentWidget=null;break;case n.a.LOAD_WIDGET_DETAIL_SUCCESS:e.loading=!1,e.currentWidget=a.payload.detail;break;case n.a.LOAD_WIDGET_DETAIL_FAILURE:e.loading=!1;break;case n.a.EDIT_WIDGET:e.loading=!0;break;case n.a.EDIT_WIDGET_SUCCESS:case n.a.EDIT_WIDGET_FAILURE:e.loading=!1;break;case n.a.COPY_WIDGET:e.loading=!0;break;case n.a.COPY_WIDGET_SUCCESS:var t=a.payload.fromWidgetId;e.widgets.splice(e.widgets.findIndex((function(e){return e.id===t}))+1,0,a.payload.result),e.loading=!1;break;case n.a.COPY_WIDGET_FAILURE:e.loading=!1;case i.a.LOAD_VIEW_DATA:e.dataLoading=!0;break;case i.a.LOAD_VIEW_DATA_SUCCESS:case i.a.LOAD_VIEW_DATA_FAILURE:e.dataLoading=!1;break;case c.a.LOAD_DASHBOARD_DETAIL_SUCCESS:e.widgets=a.payload.widgets;break;case i.a.LOAD_VIEW_DISTINCT_VALUE:e.columnValueLoading=!0,e.distinctColumnValues=null;break;case i.a.LOAD_VIEW_DISTINCT_VALUE_SUCCESS:e.columnValueLoading=!1,e.distinctColumnValues=a.payload.data.slice(0,100);break;case i.a.LOAD_VIEW_DISTINCT_VALUE_FAILURE:e.columnValueLoading=!1;break;case n.a.CLEAR_CURRENT_WIDGET:e.currentWidget=null}}))}},"6104aceff0328eacbce8":function(e,a,t){"use strict";t.d(a,"a",(function(){return w}));t("156e15eb0ffe21ef81ad"),t("f701f5ba8dd9267f7597"),t("aee243f252d382c9e099"),t("71af1170aba5de7dbb34"),t("be92b4822cb7f54ccc11"),t("cd527224333f8fb65ecd"),t("703bea8fdce723c8f746"),t("9bf0cff4074afe1a9974"),t("4f517bc3ec49a4c4049b"),t("2c09af3fb5c4ba3698b3");var r=t("d782b72bc5b680c7122c"),n=t("be3ae9b489ceb948e586"),c=t("4633b5891e83a9df58b7"),i=t.n(c),d=t("6ba0a35486f5e23ac5ae"),E=t("95066b9b78a83cfbe91a"),o=t("9adba983ceae6f089ff0"),u=t("55c69f0ea731e712b8f3"),D=regeneratorRuntime.mark(L),l=regeneratorRuntime.mark(O),_=regeneratorRuntime.mark(S),s=regeneratorRuntime.mark(A),p=regeneratorRuntime.mark(C),I=regeneratorRuntime.mark(y),b=regeneratorRuntime.mark(G),T=regeneratorRuntime.mark(w);function f(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);a&&(r=r.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,r)}return t}function g(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?f(t,!0).forEach((function(a){W(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):f(t).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function W(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function L(e){var a,t,c;return regeneratorRuntime.wrap((function(i){for(;;)switch(i.prev=i.next){case 0:if(e.type===n.a.LOAD_WIDGETS){i.next=2;break}return i.abrupt("return");case 2:return a=e.payload.projectId,i.prev=3,i.next=6,Object(r.call)(E.a,"".concat(o.a.widget,"?projectId=").concat(a));case 6:return t=i.sent,c=t.payload.map((function(e){return g({},e,{config:JSON.parse(e.config)})})),i.next=10,Object(r.put)(d.a.widgetsLoaded(c));case 10:i.next=17;break;case 12:return i.prev=12,i.t0=i.catch(3),i.next=16,Object(r.put)(d.a.widgetsLoadedFail());case 16:Object(u.a)(i.t0);case 17:case"end":return i.stop()}}),D,null,[[3,12]])}function O(e){var a,t,c,i,D,_;return regeneratorRuntime.wrap((function(l){for(;;)switch(l.prev=l.next){case 0:if(e.type===n.a.ADD_WIDGET){l.next=2;break}return l.abrupt("return");case 2:return a=e.payload,t=a.widget,c=a.resolve,l.prev=3,l.next=6,Object(r.call)(E.a,{method:"post",url:o.a.widget,data:t});case 6:return i=l.sent,D=i.payload,_=g({},D,{config:JSON.parse(D.config)}),l.next=11,Object(r.put)(d.a.widgetAdded(_));case 11:c(),l.next=19;break;case 14:return l.prev=14,l.t0=l.catch(3),l.next=18,Object(r.put)(d.a.addWidgetFail());case 18:Object(u.a)(l.t0);case 19:case"end":return l.stop()}}),l,null,[[3,14]])}function S(e){var a;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(e.type===n.a.DELETE_WIDGET){t.next=2;break}return t.abrupt("return");case 2:return a=e.payload.id,t.prev=3,t.next=6,Object(r.call)(E.a,{method:"delete",url:"".concat(o.a.widget,"/").concat(a)});case 6:return t.next=8,Object(r.put)(d.a.widgetDeleted(a));case 8:t.next=15;break;case 10:return t.prev=10,t.t0=t.catch(3),t.next=14,Object(r.put)(d.a.deleteWidgetFail());case 14:Object(u.a)(t.t0);case 15:case"end":return t.stop()}}),_,null,[[3,10]])}function A(e){var a,t,c,i;return regeneratorRuntime.wrap((function(D){for(;;)switch(D.prev=D.next){case 0:if(e.type===n.a.LOAD_WIDGET_DETAIL){D.next=2;break}return D.abrupt("return");case 2:return a=e.payload.id,D.prev=3,D.next=6,Object(r.call)(E.a,"".concat(o.a.widget,"/").concat(a));case 6:return t=D.sent,c=t.payload.viewId,D.next=10,Object(r.call)(E.a,"".concat(o.a.view,"/").concat(c));case 10:return i=D.sent,D.next=13,Object(r.put)(d.a.widgetDetailLoaded(t.payload,i.payload));case 13:D.next=20;break;case 15:return D.prev=15,D.t0=D.catch(3),D.next=19,Object(r.put)(d.a.loadWidgetDetailFail(D.t0));case 19:Object(u.a)(D.t0);case 20:case"end":return D.stop()}}),s,null,[[3,15]])}function C(e){var a,t,c;return regeneratorRuntime.wrap((function(i){for(;;)switch(i.prev=i.next){case 0:if(e.type===n.a.EDIT_WIDGET){i.next=2;break}return i.abrupt("return");case 2:return a=e.payload,t=a.widget,c=a.resolve,i.prev=3,i.next=6,Object(r.call)(E.a,{method:"put",url:"".concat(o.a.widget,"/").concat(t.id),data:t});case 6:return i.next=8,Object(r.put)(d.a.widgetEdited());case 8:c(),i.next=16;break;case 11:return i.prev=11,i.t0=i.catch(3),i.next=15,Object(r.put)(d.a.editWidgetFail());case 15:Object(u.a)(i.t0);case 16:case"end":return i.stop()}}),p,null,[[3,11]])}function y(e){var a,t,c,D,l,_;return regeneratorRuntime.wrap((function(s){for(;;)switch(s.prev=s.next){case 0:if(e.type===n.a.COPY_WIDGET){s.next=2;break}return s.abrupt("return");case 2:return a=e.payload,t=a.widget,c=a.resolve,s.prev=3,s.next=6,Object(r.call)(E.a,{method:"post",url:o.a.widget,data:i()(t,"id")});case 6:return D=s.sent,l=D.payload,_=g({},l,{config:JSON.parse(l.config)}),s.next=11,Object(r.put)(d.a.widgetCopied(t.id,_));case 11:c(),s.next=19;break;case 14:return s.prev=14,s.t0=s.catch(3),s.next=18,Object(r.put)(d.a.copyWidgetFail());case 18:Object(u.a)(s.t0);case 19:case"end":return s.stop()}}),I,null,[[3,14]])}function G(e){var a;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(e.type===n.a.EXECUTE_COMPUTED_SQL){t.next=2;break}return t.abrupt("return");case 2:return a=e.payload.sql,t.prev=3,t.next=6,Object(r.call)(E.a,{method:"post",data:a});case 6:t.sent,t.next=12;break;case 9:t.prev=9,t.t0=t.catch(3),Object(u.a)(t.t0);case 12:case"end":return t.stop()}}),b,null,[[3,9]])}function w(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Object(r.all)([Object(r.takeLatest)(n.a.LOAD_WIDGETS,L),Object(r.takeEvery)(n.a.ADD_WIDGET,O),Object(r.takeEvery)(n.a.DELETE_WIDGET,S),Object(r.takeLatest)(n.a.LOAD_WIDGET_DETAIL,A),Object(r.takeEvery)(n.a.EDIT_WIDGET,C),Object(r.takeEvery)(n.a.COPY_WIDGET,y),Object(r.takeEvery)(n.a.EXECUTE_COMPUTED_SQL,G)]);case 2:case"end":return e.stop()}}),T)}},"6ba0a35486f5e23ac5ae":function(e,a,t){"use strict";t.d(a,"a",(function(){return c}));var r=t("be3ae9b489ceb948e586"),n=t("fdb445ec61a8d515506e"),c={loadWidgets:function(e){return{type:r.a.LOAD_WIDGETS,payload:{projectId:e}}},widgetsLoaded:function(e){return{type:r.a.LOAD_WIDGETS_SUCCESS,payload:{widgets:e}}},widgetsLoadedFail:function(){return{type:r.a.LOAD_WIDGETS_FAILURE,payload:{}}},addWidget:function(e,a){return{type:r.a.ADD_WIDGET,payload:{widget:e,resolve:a}}},widgetAdded:function(e){return{type:r.a.ADD_WIDGET_SUCCESS,payload:{result:e}}},addWidgetFail:function(){return{type:r.a.ADD_WIDGET_FAILURE,payload:{}}},loadWidgetDetail:function(e){return{type:r.a.LOAD_WIDGET_DETAIL,payload:{id:e}}},widgetDetailLoaded:function(e,a){return{type:r.a.LOAD_WIDGET_DETAIL_SUCCESS,payload:{detail:e,view:a}}},loadWidgetDetailFail:function(e){return{type:r.a.LOAD_WIDGET_DETAIL_FAILURE,payload:{error:e}}},editWidget:function(e,a){return{type:r.a.EDIT_WIDGET,payload:{widget:e,resolve:a}}},widgetEdited:function(){return{type:r.a.EDIT_WIDGET_SUCCESS,payload:{}}},editWidgetFail:function(){return{type:r.a.EDIT_WIDGET_FAILURE,payload:{}}},copyWidget:function(e,a){return{type:r.a.COPY_WIDGET,payload:{widget:e,resolve:a}}},widgetCopied:function(e,a){return{type:r.a.COPY_WIDGET_SUCCESS,payload:{fromWidgetId:e,result:a}}},copyWidgetFail:function(){return{type:r.a.COPY_WIDGET_FAILURE,payload:{}}},deleteWidget:function(e){return{type:r.a.DELETE_WIDGET,payload:{id:e}}},widgetDeleted:function(e){return{type:r.a.DELETE_WIDGET_SUCCESS,payload:{id:e}}},deleteWidgetFail:function(){return{type:r.a.DELETE_WIDGET_FAILURE,payload:{}}},clearCurrentWidget:function(){return{type:r.a.CLEAR_CURRENT_WIDGET,payload:{}}},executeComputed:function(e){return{type:r.a.EXECUTE_COMPUTED_SQL,payload:{sql:e}}}};Object(n.b)(c)},be3ae9b489ceb948e586:function(e,a,t){"use strict";t.d(a,"a",(function(){return c}));var r,n=t("fdb445ec61a8d515506e");!function(e){e.LOAD_WIDGETS="davinci/Widget/LOAD_WIDGETS",e.LOAD_WIDGETS_SUCCESS="davinci/Widget/LOAD_WIDGETS_SUCCESS",e.LOAD_WIDGETS_FAILURE="davinci/Widget/LOAD_WIDGETS_FAILURE",e.ADD_WIDGET="davinci/Widget/ADD_WIDGET",e.ADD_WIDGET_SUCCESS="davinci/Widget/ADD_WIDGET_SUCCESS",e.ADD_WIDGET_FAILURE="davinci/Widget/ADD_WIDGET_FAILURE",e.LOAD_WIDGET_DETAIL="davinci/Widget/LOAD_WIDGET_DETAIL",e.LOAD_WIDGET_DETAIL_SUCCESS="davinci/Widget/LOAD_WIDGET_DETAIL_SUCCESS",e.LOAD_WIDGET_DETAIL_FAILURE="davinci/Widget/LOAD_WIDGET_DETAIL_FAILURE",e.EDIT_WIDGET="davinci/Widget/EDIT_WIDGET",e.EDIT_WIDGET_SUCCESS="davinci/Widget/EDIT_WIDGET_SUCCESS",e.EDIT_WIDGET_FAILURE="davinci/Widget/EDIT_WIDGET_FAILURE",e.COPY_WIDGET="davinci/Widget/COPY_WIDGET",e.COPY_WIDGET_SUCCESS="davinci/Widget/COPY_WIDGET_SUCCESS",e.COPY_WIDGET_FAILURE="davinci/Widget/COPY_WIDGET_FAILURE",e.DELETE_WIDGET="davinci/Widget/DELETE_WIDGET",e.DELETE_WIDGET_SUCCESS="davinci/Widget/DELETE_WIDGET_SUCCESS",e.DELETE_WIDGET_FAILURE="davinci/Widget/DELETE_WIDGET_FAILURE",e.CLEAR_CURRENT_WIDGET="davinci/Widget/CLEAR_CURRENT_WIDGET",e.EXECUTE_COMPUTED_SQL="davinci/Widget/EXECUTE_COMPUTED_SQL"}(r||(r={}));var c=Object(n.a)(r)}}]);