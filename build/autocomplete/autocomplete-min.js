YAHOO.widget.AutoComplete=function(I,V,W,H){if(I&&V&&W){if(W instanceof YAHOO.widget.DataSource){this.dataSource=W;}else{return ;}if(YAHOO.util.Dom.inDocument(I)){if(YAHOO.lang.isString(I)){this._sName="instance"+YAHOO.widget.AutoComplete._nIndex+" "+I;this._oTextbox=document.getElementById(I);}else{this._sName=(I.id)?"instance"+YAHOO.widget.AutoComplete._nIndex+" "+I.id:"instance"+YAHOO.widget.AutoComplete._nIndex;this._oTextbox=I;}YAHOO.util.Dom.addClass(this._oTextbox,"yui-ac-input");}else{return ;}if(YAHOO.util.Dom.inDocument(V)){if(YAHOO.lang.isString(V)){this._oContainer=document.getElementById(V);}else{this._oContainer=V;}if(this._oContainer.style.display=="none"){}var j=this._oContainer.parentNode;var x=j.tagName.toLowerCase();if(x=="div"){YAHOO.util.Dom.addClass(j,"yui-ac");}else{}}else{return ;}if(H&&(H.constructor==Object)){for(var v in H){if(v){this[v]=H[v];}}}this._initContainer();this._initProps();this._initList();this._initContainerHelpers();var s=this;var g=this._oTextbox;var K=this._oContainer._oContent;YAHOO.util.Event.addListener(g,"keyup",s._onTextboxKeyUp,s);YAHOO.util.Event.addListener(g,"keydown",s._onTextboxKeyDown,s);YAHOO.util.Event.addListener(g,"focus",s._onTextboxFocus,s);YAHOO.util.Event.addListener(g,"blur",s._onTextboxBlur,s);YAHOO.util.Event.addListener(K,"mouseover",s._onContainerMouseover,s);YAHOO.util.Event.addListener(K,"mouseout",s._onContainerMouseout,s);YAHOO.util.Event.addListener(K,"scroll",s._onContainerScroll,s);YAHOO.util.Event.addListener(K,"resize",s._onContainerResize,s);if(g.form){YAHOO.util.Event.addListener(g.form,"submit",s._onFormSubmit,s);}YAHOO.util.Event.addListener(g,"keypress",s._onTextboxKeyPress,s);this.textboxFocusEvent=new YAHOO.util.CustomEvent("textboxFocus",this);this.textboxKeyEvent=new YAHOO.util.CustomEvent("textboxKey",this);this.dataRequestEvent=new YAHOO.util.CustomEvent("dataRequest",this);this.dataReturnEvent=new YAHOO.util.CustomEvent("dataReturn",this);this.dataErrorEvent=new YAHOO.util.CustomEvent("dataError",this);this.containerExpandEvent=new YAHOO.util.CustomEvent("containerExpand",this);this.typeAheadEvent=new YAHOO.util.CustomEvent("typeAhead",this);this.itemMouseOverEvent=new YAHOO.util.CustomEvent("itemMouseOver",this);this.itemMouseOutEvent=new YAHOO.util.CustomEvent("itemMouseOut",this);this.itemArrowToEvent=new YAHOO.util.CustomEvent("itemArrowTo",this);this.itemArrowFromEvent=new YAHOO.util.CustomEvent("itemArrowFrom",this);this.itemSelectEvent=new YAHOO.util.CustomEvent("itemSelect",this);this.unmatchedItemSelectEvent=new YAHOO.util.CustomEvent("unmatchedItemSelect",this);this.selectionEnforceEvent=new YAHOO.util.CustomEvent("selectionEnforce",this);this.containerCollapseEvent=new YAHOO.util.CustomEvent("containerCollapse",this);this.textboxBlurEvent=new YAHOO.util.CustomEvent("textboxBlur",this);g.setAttribute("autocomplete","off");YAHOO.widget.AutoComplete._nIndex++;}else{}};YAHOO.widget.AutoComplete.prototype.dataSource=null;YAHOO.widget.AutoComplete.prototype.minQueryLength=1;YAHOO.widget.AutoComplete.prototype.maxResultsDisplayed=10;YAHOO.widget.AutoComplete.prototype.queryDelay=0.2;YAHOO.widget.AutoComplete.prototype.highlightClassName="yui-ac-highlight";YAHOO.widget.AutoComplete.prototype.prehighlightClassName=null;YAHOO.widget.AutoComplete.prototype.delimChar=null;YAHOO.widget.AutoComplete.prototype.autoHighlight=true;YAHOO.widget.AutoComplete.prototype.typeAhead=false;YAHOO.widget.AutoComplete.prototype.animHoriz=false;YAHOO.widget.AutoComplete.prototype.animVert=true;YAHOO.widget.AutoComplete.prototype.animSpeed=0.3;YAHOO.widget.AutoComplete.prototype.forceSelection=false;YAHOO.widget.AutoComplete.prototype.allowBrowserAutocomplete=true;YAHOO.widget.AutoComplete.prototype.alwaysShowContainer=false;YAHOO.widget.AutoComplete.prototype.useIFrame=false;YAHOO.widget.AutoComplete.prototype.useShadow=false;YAHOO.widget.AutoComplete.prototype.toString=function(){return "AutoComplete "+this._sName;};YAHOO.widget.AutoComplete.prototype.isContainerOpen=function(){return this._bContainerOpen;};YAHOO.widget.AutoComplete.prototype.getListItems=function(){return this._aListItems;};YAHOO.widget.AutoComplete.prototype.getListItemData=function(x){if(x._oResultData){return x._oResultData;}else{return false;}};YAHOO.widget.AutoComplete.prototype.setHeader=function(x){if(x){if(this._oContainer._oContent._oHeader){this._oContainer._oContent._oHeader.innerHTML=x;this._oContainer._oContent._oHeader.style.display="block";}}else{this._oContainer._oContent._oHeader.innerHTML="";this._oContainer._oContent._oHeader.style.display="none";}};YAHOO.widget.AutoComplete.prototype.setFooter=function(x){if(x){if(this._oContainer._oContent._oFooter){this._oContainer._oContent._oFooter.innerHTML=x;this._oContainer._oContent._oFooter.style.display="block";}}else{this._oContainer._oContent._oFooter.innerHTML="";this._oContainer._oContent._oFooter.style.display="none";}};YAHOO.widget.AutoComplete.prototype.setBody=function(x){if(x){if(this._oContainer._oContent._oBody){this._oContainer._oContent._oBody.innerHTML=x;this._oContainer._oContent._oBody.style.display="block";this._oContainer._oContent.style.display="block";}}else{this._oContainer._oContent._oBody.innerHTML="";this._oContainer._oContent.style.display="none";}this._maxResultsDisplayed=0;};YAHOO.widget.AutoComplete.prototype.formatResult=function(V,K){var x=V[0];if(x){return x;}else{return "";}};YAHOO.widget.AutoComplete.prototype.doBeforeExpandContainer=function(x,V,H,K){return true;};YAHOO.widget.AutoComplete.prototype.sendQuery=function(x){this._sendQuery(x);};YAHOO.widget.AutoComplete.prototype.doBeforeSendQuery=function(x){return x;};YAHOO.widget.AutoComplete.prototype.destroy=function(){var V=this.toString();var x=this._oTextbox;var H=this._oContainer;this.textboxFocusEvent.unsubscribe();this.textboxKeyEvent.unsubscribe();this.dataRequestEvent.unsubscribe();this.dataReturnEvent.unsubscribe();this.dataErrorEvent.unsubscribe();this.containerExpandEvent.unsubscribe();this.typeAheadEvent.unsubscribe();this.itemMouseOverEvent.unsubscribe();this.itemMouseOutEvent.unsubscribe();this.itemArrowToEvent.unsubscribe();this.itemArrowFromEvent.unsubscribe();this.itemSelectEvent.unsubscribe();this.unmatchedItemSelectEvent.unsubscribe();this.selectionEnforceEvent.unsubscribe();this.containerCollapseEvent.unsubscribe();this.textboxBlurEvent.unsubscribe();YAHOO.util.Event.purgeElement(x,true);YAHOO.util.Event.purgeElement(H,true);H.innerHTML="";for(var K in this){if(YAHOO.lang.hasOwnProperty(this,K)){this[K]=null;}}};YAHOO.widget.AutoComplete.prototype.textboxFocusEvent=null;YAHOO.widget.AutoComplete.prototype.textboxKeyEvent=null;YAHOO.widget.AutoComplete.prototype.dataRequestEvent=null;YAHOO.widget.AutoComplete.prototype.dataReturnEvent=null;YAHOO.widget.AutoComplete.prototype.dataErrorEvent=null;YAHOO.widget.AutoComplete.prototype.containerExpandEvent=null;YAHOO.widget.AutoComplete.prototype.typeAheadEvent=null;YAHOO.widget.AutoComplete.prototype.itemMouseOverEvent=null;YAHOO.widget.AutoComplete.prototype.itemMouseOutEvent=null;YAHOO.widget.AutoComplete.prototype.itemArrowToEvent=null;YAHOO.widget.AutoComplete.prototype.itemArrowFromEvent=null;YAHOO.widget.AutoComplete.prototype.itemSelectEvent=null;YAHOO.widget.AutoComplete.prototype.unmatchedItemSelectEvent=null;YAHOO.widget.AutoComplete.prototype.selectionEnforceEvent=null;YAHOO.widget.AutoComplete.prototype.containerCollapseEvent=null;YAHOO.widget.AutoComplete.prototype.textboxBlurEvent=null;YAHOO.widget.AutoComplete._nIndex=0;YAHOO.widget.AutoComplete.prototype._sName=null;YAHOO.widget.AutoComplete.prototype._oTextbox=null;YAHOO.widget.AutoComplete.prototype._bFocused=true;YAHOO.widget.AutoComplete.prototype._oAnim=null;YAHOO.widget.AutoComplete.prototype._oContainer=null;YAHOO.widget.AutoComplete.prototype._bContainerOpen=false;YAHOO.widget.AutoComplete.prototype._bOverContainer=false;YAHOO.widget.AutoComplete.prototype._aListItems=null;YAHOO.widget.AutoComplete.prototype._nDisplayedItems=0;YAHOO.widget.AutoComplete.prototype._maxResultsDisplayed=0;YAHOO.widget.AutoComplete.prototype._sCurQuery=null;YAHOO.widget.AutoComplete.prototype._sSavedQuery=null;YAHOO.widget.AutoComplete.prototype._oCurItem=null;YAHOO.widget.AutoComplete.prototype._bItemSelected=false;YAHOO.widget.AutoComplete.prototype._nKeyCode=null;YAHOO.widget.AutoComplete.prototype._nDelayID=-1;YAHOO.widget.AutoComplete.prototype._iFrameSrc="javascript:false;";YAHOO.widget.AutoComplete.prototype._queryInterval=null;YAHOO.widget.AutoComplete.prototype._sLastTextboxValue=null;YAHOO.widget.AutoComplete.prototype._initProps=function(){var V=this.minQueryLength;if(!YAHOO.lang.isNumber(V)){this.minQueryLength=1;}var H=this.maxResultsDisplayed;if(!YAHOO.lang.isNumber(H)||(H<1)){this.maxResultsDisplayed=10;}var j=this.queryDelay;if(!YAHOO.lang.isNumber(j)||(j<0)){this.queryDelay=0.2;}var x=this.delimChar;if(YAHOO.lang.isString(x)&&(x.length>0)){this.delimChar=[x];}else{if(!YAHOO.lang.isArray(x)){this.delimChar=null;}}var K=this.animSpeed;if((this.animHoriz||this.animVert)&&YAHOO.util.Anim){if(!YAHOO.lang.isNumber(K)||(K<0)){this.animSpeed=0.3;}if(!this._oAnim){this._oAnim=new YAHOO.util.Anim(this._oContainer._oContent,{},this.animSpeed);}else{this._oAnim.duration=this.animSpeed;}}if(this.forceSelection&&x){}};YAHOO.widget.AutoComplete.prototype._initContainerHelpers=function(){if(this.useShadow&&!this._oContainer._oShadow){var V=document.createElement("div");V.className="yui-ac-shadow";this._oContainer._oShadow=this._oContainer.appendChild(V);}if(this.useIFrame&&!this._oContainer._oIFrame){var x=document.createElement("iframe");x.src=this._iFrameSrc;x.frameBorder=0;x.scrolling="no";x.style.position="absolute";x.style.width="100%";x.style.height="100%";x.tabIndex=-1;this._oContainer._oIFrame=this._oContainer.appendChild(x);}};YAHOO.widget.AutoComplete.prototype._initContainer=function(){YAHOO.util.Dom.addClass(this._oContainer,"yui-ac-container");if(!this._oContainer._oContent){var H=document.createElement("div");H.className="yui-ac-content";H.style.display="none";this._oContainer._oContent=this._oContainer.appendChild(H);var V=document.createElement("div");V.className="yui-ac-hd";V.style.display="none";this._oContainer._oContent._oHeader=this._oContainer._oContent.appendChild(V);var K=document.createElement("div");K.className="yui-ac-bd";this._oContainer._oContent._oBody=this._oContainer._oContent.appendChild(K);var x=document.createElement("div");x.className="yui-ac-ft";x.style.display="none";this._oContainer._oContent._oFooter=this._oContainer._oContent.appendChild(x);}else{}};YAHOO.widget.AutoComplete.prototype._initList=function(){this._aListItems=[];while(this._oContainer._oContent._oBody.hasChildNodes()){var V=this.getListItems();if(V){for(var x=V.length-1;x>=0;x--){V[x]=null;}}this._oContainer._oContent._oBody.innerHTML="";}var j=document.createElement("ul");j=this._oContainer._oContent._oBody.appendChild(j);for(var K=0;K<this.maxResultsDisplayed;K++){var H=document.createElement("li");H=j.appendChild(H);this._aListItems[K]=H;this._initListItem(H,K);}this._maxResultsDisplayed=this.maxResultsDisplayed;};YAHOO.widget.AutoComplete.prototype._initListItem=function(K,V){var x=this;K.style.display="none";K._nItemIndex=V;K.mouseover=K.mouseout=K.onclick=null;YAHOO.util.Event.addListener(K,"mouseover",x._onItemMouseover,x);YAHOO.util.Event.addListener(K,"mouseout",x._onItemMouseout,x);YAHOO.util.Event.addListener(K,"click",x._onItemMouseclick,x);};YAHOO.widget.AutoComplete.prototype._onIMEDetected=function(x){x._enableIntervalDetection();};YAHOO.widget.AutoComplete.prototype._enableIntervalDetection=function(){var x=this._oTextbox.value;var V=this._sLastTextboxValue;if(x!=V){this._sLastTextboxValue=x;this._sendQuery(x);}};YAHOO.widget.AutoComplete.prototype._cancelIntervalDetection=function(x){if(x._queryInterval){clearInterval(x._queryInterval);}};YAHOO.widget.AutoComplete.prototype._isIgnoreKey=function(x){if((x==9)||(x==13)||(x==16)||(x==17)||(x>=18&&x<=20)||(x==27)||(x>=33&&x<=35)||(x>=36&&x<=40)||(x>=44&&x<=45)){return true;}return false;};YAHOO.widget.AutoComplete.prototype._sendQuery=function(s){if(this.minQueryLength==-1){this._toggleContainer(false);return ;}var K=(this.delimChar)?this.delimChar:null;if(K){var g=-1;for(var V=K.length-1;V>=0;V--){var I=s.lastIndexOf(K[V]);if(I>g){g=I;}}if(K[V]==" "){for(var x=K.length-1;x>=0;x--){if(s[g-1]==K[x]){g--;break;}}}if(g>-1){var H=g+1;while(s.charAt(H)==" "){H+=1;}this._sSavedQuery=s.substring(0,H);s=s.substr(H);}else{if(s.indexOf(this._sSavedQuery)<0){this._sSavedQuery=null;}}}if((s&&(s.length<this.minQueryLength))||(!s&&this.minQueryLength>0)){if(this._nDelayID!=-1){clearTimeout(this._nDelayID);}this._toggleContainer(false);return ;}s=encodeURIComponent(s);this._nDelayID=-1;s=this.doBeforeSendQuery(s);this.dataRequestEvent.fire(this,s);this.dataSource.getResults(this._populateList,s,this);};YAHOO.widget.AutoComplete.prototype._populateList=function(U,k,W){if(k===null){W.dataErrorEvent.fire(W,U);}if(!W._bFocused||!k){return ;}var x=(navigator.userAgent.toLowerCase().indexOf("opera")!=-1);var b=W._oContainer._oContent.style;b.width=(!x)?null:"";b.height=(!x)?null:"";var v=decodeURIComponent(U);W._sCurQuery=v;W._bItemSelected=false;if(W._maxResultsDisplayed!=W.maxResultsDisplayed){W._initList();}var K=Math.min(k.length,W.maxResultsDisplayed);W._nDisplayedItems=K;if(K>0){W._initContainerHelpers();var H=W._aListItems;for(var s=K-1;s>=0;s--){var A=H[s];var V=k[s];A.innerHTML=W.formatResult(V,v);A.style.display="list-item";A._sResultKey=V[0];A._oResultData=V;}for(var I=H.length-1;I>=K;I--){var E=H[I];E.innerHTML=null;E.style.display="none";E._sResultKey=null;E._oResultData=null;}var C=W.doBeforeExpandContainer(W._oTextbox,W._oContainer,U,k);W._toggleContainer(C);if(W.autoHighlight){var g=H[0];W._toggleHighlight(g,"to");W.itemArrowToEvent.fire(W,g);W._typeAhead(g,U);}else{W._oCurItem=null;}}else{W._toggleContainer(false);}W.dataReturnEvent.fire(W,U,k);};YAHOO.widget.AutoComplete.prototype._clearSelection=function(){var K=this._oTextbox.value;var V=(this.delimChar)?this.delimChar[0]:null;var x=(V)?K.lastIndexOf(V,K.length-2):-1;if(x>-1){this._oTextbox.value=K.substring(0,x);}else{this._oTextbox.value="";}this._sSavedQuery=this._oTextbox.value;this.selectionEnforceEvent.fire(this);};YAHOO.widget.AutoComplete.prototype._textMatchesOption=function(){var H=null;for(var x=this._nDisplayedItems-1;x>=0;x--){var K=this._aListItems[x];var V=K._sResultKey.toLowerCase();if(V==this._sCurQuery.toLowerCase()){H=K;break;}}return (H);};YAHOO.widget.AutoComplete.prototype._typeAhead=function(j,I){if(!this.typeAhead||(this._nKeyCode==8)){return ;}var V=this._oTextbox;var g=this._oTextbox.value;if(!V.setSelectionRange&&!V.createTextRange){return ;}var K=g.length;this._updateValue(j);var H=V.value.length;this._selectText(V,K,H);var x=V.value.substr(K,H);this.typeAheadEvent.fire(this,I,x);};YAHOO.widget.AutoComplete.prototype._selectText=function(x,V,K){if(x.setSelectionRange){x.setSelectionRange(V,K);}else{if(x.createTextRange){var H=x.createTextRange();H.moveStart("character",V);H.moveEnd("character",K-x.value.length);H.select();}else{x.select();}}};YAHOO.widget.AutoComplete.prototype._toggleContainerHelpers=function(V){var H=false;var K=this._oContainer._oContent.offsetWidth+"px";var x=this._oContainer._oContent.offsetHeight+"px";if(this.useIFrame&&this._oContainer._oIFrame){H=true;if(V){this._oContainer._oIFrame.style.width=K;this._oContainer._oIFrame.style.height=x;}else{this._oContainer._oIFrame.style.width=0;this._oContainer._oIFrame.style.height=0;}}if(this.useShadow&&this._oContainer._oShadow){H=true;if(V){this._oContainer._oShadow.style.width=K;this._oContainer._oShadow.style.height=x;}else{this._oContainer._oShadow.style.width=0;this._oContainer._oShadow.style.height=0;}}};YAHOO.widget.AutoComplete.prototype._toggleContainer=function(W){var U=this._oContainer;if(this.alwaysShowContainer&&this._bContainerOpen){return ;}if(!W){this._oContainer._oContent.scrollTop=0;var K=this._aListItems;if(K&&(K.length>0)){for(var I=K.length-1;I>=0;I--){K[I].style.display="none";}}if(this._oCurItem){this._toggleHighlight(this._oCurItem,"from");}this._oCurItem=null;this._nDisplayedItems=0;this._sCurQuery=null;}if(!W&&!this._bContainerOpen){U._oContent.style.display="none";return ;}var V=this._oAnim;if(V&&V.getEl()&&(this.animHoriz||this.animVert)){if(!W){this._toggleContainerHelpers(W);}if(V.isAnimated()){V.stop();}var s=U._oContent.cloneNode(true);U.appendChild(s);s.style.top="-9000px";s.style.display="block";var g=s.offsetWidth;var H=s.offsetHeight;var x=(this.animHoriz)?0:g;var j=(this.animVert)?0:H;V.attributes=(W)?{width:{to:g},height:{to:H}}:{width:{to:x},height:{to:j}};if(W&&!this._bContainerOpen){U._oContent.style.width=x+"px";U._oContent.style.height=j+"px";}else{U._oContent.style.width=g+"px";U._oContent.style.height=H+"px";}U.removeChild(s);s=null;var v=this;var C=function(){V.onComplete.unsubscribeAll();if(W){v.containerExpandEvent.fire(v);}else{U._oContent.style.display="none";v.containerCollapseEvent.fire(v);}v._toggleContainerHelpers(W);};U._oContent.style.display="block";V.onComplete.subscribe(C);V.animate();this._bContainerOpen=W;}else{if(W){U._oContent.style.display="block";this.containerExpandEvent.fire(this);}else{U._oContent.style.display="none";this.containerCollapseEvent.fire(this);}this._toggleContainerHelpers(W);this._bContainerOpen=W;}};YAHOO.widget.AutoComplete.prototype._toggleHighlight=function(x,K){var V=this.highlightClassName;if(this._oCurItem){YAHOO.util.Dom.removeClass(this._oCurItem,V);}if((K=="to")&&V){YAHOO.util.Dom.addClass(x,V);this._oCurItem=x;}};YAHOO.widget.AutoComplete.prototype._togglePrehighlight=function(x,K){if(x==this._oCurItem){return ;}var V=this.prehighlightClassName;if((K=="mouseover")&&V){YAHOO.util.Dom.addClass(x,V);}else{YAHOO.util.Dom.removeClass(x,V);}};YAHOO.widget.AutoComplete.prototype._updateValue=function(g){var K=this._oTextbox;var j=(this.delimChar)?(this.delimChar[0]||this.delimChar):null;var V=this._sSavedQuery;var H=g._sResultKey;K.focus();K.value="";if(j){if(V){K.value=V;}K.value+=H+j;if(j!=" "){K.value+=" ";}}else{K.value=H;}if(K.type=="textarea"){K.scrollTop=K.scrollHeight;}var x=K.value.length;this._selectText(K,x,x);this._oCurItem=g;};YAHOO.widget.AutoComplete.prototype._selectItem=function(x){this._bItemSelected=true;this._updateValue(x);this._cancelIntervalDetection(this);this.itemSelectEvent.fire(this,x,x._oResultData);this._toggleContainer(false);};YAHOO.widget.AutoComplete.prototype._jumpSelection=function(){if(this._oCurItem){this._selectItem(this._oCurItem);}else{this._toggleContainer(false);}};YAHOO.widget.AutoComplete.prototype._moveSelection=function(I){if(this._bContainerOpen){var H=this._oCurItem;var g=-1;if(H){g=H._nItemIndex;}var K=(I==40)?(g+1):(g-1);if(K<-2||K>=this._nDisplayedItems){return ;}if(H){this._toggleHighlight(H,"from");this.itemArrowFromEvent.fire(this,H);}if(K==-1){if(this.delimChar&&this._sSavedQuery){if(!this._textMatchesOption()){this._oTextbox.value=this._sSavedQuery;}else{this._oTextbox.value=this._sSavedQuery+this._sCurQuery;}}else{this._oTextbox.value=this._sCurQuery;}this._oCurItem=null;return ;}if(K==-2){this._toggleContainer(false);return ;}var V=this._aListItems[K];var j=this._oContainer._oContent;var x=((YAHOO.util.Dom.getStyle(j,"overflow")=="auto")||(YAHOO.util.Dom.getStyle(j,"overflowY")=="auto"));if(x&&(K>-1)&&(K<this._nDisplayedItems)){if(I==40){if((V.offsetTop+V.offsetHeight)>(j.scrollTop+j.offsetHeight)){j.scrollTop=(V.offsetTop+V.offsetHeight)-j.offsetHeight;}else{if((V.offsetTop+V.offsetHeight)<j.scrollTop){j.scrollTop=V.offsetTop;}}}else{if(V.offsetTop<j.scrollTop){this._oContainer._oContent.scrollTop=V.offsetTop;}else{if(V.offsetTop>(j.scrollTop+j.offsetHeight)){this._oContainer._oContent.scrollTop=(V.offsetTop+V.offsetHeight)-j.offsetHeight;}}}}this._toggleHighlight(V,"to");this.itemArrowToEvent.fire(this,V);if(this.typeAhead){this._updateValue(V);}}};YAHOO.widget.AutoComplete.prototype._onItemMouseover=function(x,V){if(V.prehighlightClassName){V._togglePrehighlight(this,"mouseover");}else{V._toggleHighlight(this,"to");}V.itemMouseOverEvent.fire(V,this);};YAHOO.widget.AutoComplete.prototype._onItemMouseout=function(x,V){if(V.prehighlightClassName){V._togglePrehighlight(this,"mouseout");}else{V._toggleHighlight(this,"from");}V.itemMouseOutEvent.fire(V,this);};YAHOO.widget.AutoComplete.prototype._onItemMouseclick=function(x,V){V._toggleHighlight(this,"to");V._selectItem(this);};YAHOO.widget.AutoComplete.prototype._onContainerMouseover=function(x,V){V._bOverContainer=true;};YAHOO.widget.AutoComplete.prototype._onContainerMouseout=function(x,V){V._bOverContainer=false;if(V._oCurItem){V._toggleHighlight(V._oCurItem,"to");}};YAHOO.widget.AutoComplete.prototype._onContainerScroll=function(x,V){V._oTextbox.focus();};YAHOO.widget.AutoComplete.prototype._onContainerResize=function(x,V){V._toggleContainerHelpers(V._bContainerOpen);};YAHOO.widget.AutoComplete.prototype._onTextboxKeyDown=function(x,V){var K=x.keyCode;switch(K){case 9:if(V._oCurItem){if(V.delimChar&&(V._nKeyCode!=K)){if(V._bContainerOpen){YAHOO.util.Event.stopEvent(x);}}V._selectItem(V._oCurItem);}else{V._toggleContainer(false);}break;case 13:if(V._oCurItem){if(V._nKeyCode!=K){if(V._bContainerOpen){YAHOO.util.Event.stopEvent(x);}}V._selectItem(V._oCurItem);}else{V._toggleContainer(false);}break;case 27:V._toggleContainer(false);return ;case 39:V._jumpSelection();break;case 38:YAHOO.util.Event.stopEvent(x);V._moveSelection(K);break;case 40:YAHOO.util.Event.stopEvent(x);V._moveSelection(K);break;default:break;}};YAHOO.widget.AutoComplete.prototype._onTextboxKeyPress=function(x,K){var H=x.keyCode;var V=(navigator.userAgent.toLowerCase().indexOf("mac")!=-1);if(V){switch(H){case 9:if(K.delimChar&&(K._nKeyCode!=H)){YAHOO.util.Event.stopEvent(x);}break;case 13:if(K._nKeyCode!=H){YAHOO.util.Event.stopEvent(x);}break;case 38:case 40:YAHOO.util.Event.stopEvent(x);break;default:break;}}else{if(H==229){K._queryInterval=setInterval(function(){K._onIMEDetected(K);},500);}}};YAHOO.widget.AutoComplete.prototype._onTextboxKeyUp=function(V,H){H._initProps();var j=V.keyCode;H._nKeyCode=j;var K=this.value;if(H._isIgnoreKey(j)||(K.toLowerCase()==H._sCurQuery)){return ;}else{H._bItemSelected=false;YAHOO.util.Dom.removeClass(H._oCurItem,H.highlightClassName);H._oCurItem=null;H.textboxKeyEvent.fire(H,j);}if(H.queryDelay>0){var x=setTimeout(function(){H._sendQuery(K);},(H.queryDelay*1000));if(H._nDelayID!=-1){clearTimeout(H._nDelayID);}H._nDelayID=x;}else{H._sendQuery(K);}};YAHOO.widget.AutoComplete.prototype._onTextboxFocus=function(x,V){V._oTextbox.setAttribute("autocomplete","off");V._bFocused=true;if(!V._bItemSelected){V.textboxFocusEvent.fire(V);}};YAHOO.widget.AutoComplete.prototype._onTextboxBlur=function(x,V){if(!V._bOverContainer||(V._nKeyCode==9)){if(!V._bItemSelected){var K=V._textMatchesOption();if(!V._bContainerOpen||(V._bContainerOpen&&(K===null))){if(V.forceSelection){V._clearSelection();}else{V.unmatchedItemSelectEvent.fire(V);}}else{if(V.forceSelection){V._selectItem(K);}}}if(V._bContainerOpen){V._toggleContainer(false);}V._cancelIntervalDetection(V);V._bFocused=false;V.textboxBlurEvent.fire(V);}};YAHOO.widget.AutoComplete.prototype._onFormSubmit=function(x,V){if(V.allowBrowserAutocomplete){V._oTextbox.setAttribute("autocomplete","on");}else{V._oTextbox.setAttribute("autocomplete","off");}};YAHOO.widget.DataSource=function(){};YAHOO.widget.DataSource.ERROR_DATANULL="Response data was null";YAHOO.widget.DataSource.ERROR_DATAPARSE="Response data could not be parsed";YAHOO.widget.DataSource.prototype.maxCacheEntries=15;YAHOO.widget.DataSource.prototype.queryMatchContains=false;YAHOO.widget.DataSource.prototype.queryMatchSubset=false;YAHOO.widget.DataSource.prototype.queryMatchCase=false;YAHOO.widget.DataSource.prototype.toString=function(){return "DataSource "+this._sName;};YAHOO.widget.DataSource.prototype.getResults=function(x,H,V){var K=this._doQueryCache(x,H,V);if(K.length===0){this.queryEvent.fire(this,V,H);this.doQuery(x,H,V);}};YAHOO.widget.DataSource.prototype.doQuery=function(x,K,V){};YAHOO.widget.DataSource.prototype.flushCache=function(){if(this._aCache){this._aCache=[];}if(this._aCacheHelper){this._aCacheHelper=[];}this.cacheFlushEvent.fire(this);};YAHOO.widget.DataSource.prototype.queryEvent=null;YAHOO.widget.DataSource.prototype.cacheQueryEvent=null;YAHOO.widget.DataSource.prototype.getResultsEvent=null;YAHOO.widget.DataSource.prototype.getCachedResultsEvent=null;YAHOO.widget.DataSource.prototype.dataErrorEvent=null;YAHOO.widget.DataSource.prototype.cacheFlushEvent=null;YAHOO.widget.DataSource._nIndex=0;YAHOO.widget.DataSource.prototype._sName=null;YAHOO.widget.DataSource.prototype._aCache=null;YAHOO.widget.DataSource.prototype._init=function(){var x=this.maxCacheEntries;if(!YAHOO.lang.isNumber(x)||(x<0)){x=0;}if(x>0&&!this._aCache){this._aCache=[];}this._sName="instance"+YAHOO.widget.DataSource._nIndex;YAHOO.widget.DataSource._nIndex++;this.queryEvent=new YAHOO.util.CustomEvent("query",this);this.cacheQueryEvent=new YAHOO.util.CustomEvent("cacheQuery",this);this.getResultsEvent=new YAHOO.util.CustomEvent("getResults",this);this.getCachedResultsEvent=new YAHOO.util.CustomEvent("getCachedResults",this);this.dataErrorEvent=new YAHOO.util.CustomEvent("dataError",this);this.cacheFlushEvent=new YAHOO.util.CustomEvent("cacheFlush",this);};YAHOO.widget.DataSource.prototype._addCacheElem=function(V){var x=this._aCache;if(!x||!V||!V.query||!V.results){return ;}if(x.length>=this.maxCacheEntries){x.shift();}x.push(V);};YAHOO.widget.DataSource.prototype._doQueryCache=function(x,W,b){var v=[];var s=false;var C=this._aCache;var I=(C)?C.length:0;var U=this.queryMatchContains;var H;if((this.maxCacheEntries>0)&&C&&(I>0)){this.cacheQueryEvent.fire(this,b,W);if(!this.queryMatchCase){H=W;W=W.toLowerCase();}for(var c=I-1;c>=0;c--){var g=C[c];var V=g.results;var K=(!this.queryMatchCase)?encodeURIComponent(g.query).toLowerCase():encodeURIComponent(g.query);if(K==W){s=true;v=V;if(c!=I-1){C.splice(c,1);this._addCacheElem(g);}break;}else{if(this.queryMatchSubset){for(var w=W.length-1;w>=0;w--){var D=W.substr(0,w);if(K==D){s=true;for(var A=V.length-1;A>=0;A--){var M=V[A];var E=(this.queryMatchCase)?encodeURIComponent(M[0]).indexOf(W):encodeURIComponent(M[0]).toLowerCase().indexOf(W);if((!U&&(E===0))||(U&&(E>-1))){v.unshift(M);}}g={};g.query=W;g.results=v;this._addCacheElem(g);break;}}if(s){break;}}}}if(s){this.getCachedResultsEvent.fire(this,b,H,v);x(H,v,b);}}return v;};YAHOO.widget.DS_XHR=function(K,x,H){if(H&&(H.constructor==Object)){for(var V in H){this[V]=H[V];}}if(!YAHOO.lang.isArray(x)||!YAHOO.lang.isString(K)){return ;}this.schema=x;this.scriptURI=K;this._init();};YAHOO.widget.DS_XHR.prototype=new YAHOO.widget.DataSource();YAHOO.widget.DS_XHR.TYPE_JSON=0;YAHOO.widget.DS_XHR.TYPE_XML=1;YAHOO.widget.DS_XHR.TYPE_FLAT=2;YAHOO.widget.DS_XHR.ERROR_DATAXHR="XHR response failed";YAHOO.widget.DS_XHR.prototype.connMgr=YAHOO.util.Connect;YAHOO.widget.DS_XHR.prototype.connTimeout=0;YAHOO.widget.DS_XHR.prototype.scriptURI=null;YAHOO.widget.DS_XHR.prototype.scriptQueryParam="query";YAHOO.widget.DS_XHR.prototype.scriptQueryAppend="";YAHOO.widget.DS_XHR.prototype.responseType=YAHOO.widget.DS_XHR.TYPE_JSON;YAHOO.widget.DS_XHR.prototype.responseStripAfter="\n<!-";YAHOO.widget.DS_XHR.prototype.doQuery=function(j,I,V){var W=(this.responseType==YAHOO.widget.DS_XHR.TYPE_XML);var H=this.scriptURI+"?"+this.scriptQueryParam+"="+I;if(this.scriptQueryAppend.length>0){H+="&"+this.scriptQueryAppend;}var K=null;var g=this;var v=function(C){if(!g._oConn||(C.tId!=g._oConn.tId)){g.dataErrorEvent.fire(g,V,I,YAHOO.widget.DataSource.ERROR_DATANULL);return ;}for(var E in C){}if(!W){C=C.responseText;}else{C=C.responseXML;}if(C===null){g.dataErrorEvent.fire(g,V,I,YAHOO.widget.DataSource.ERROR_DATANULL);return ;}var k=g.parseResponse(I,C,V);var U={};U.query=decodeURIComponent(I);U.results=k;if(k===null){g.dataErrorEvent.fire(g,V,I,YAHOO.widget.DataSource.ERROR_DATAPARSE);k=[];}else{g.getResultsEvent.fire(g,V,I,k);g._addCacheElem(U);}j(I,k,V);};var x=function(C){g.dataErrorEvent.fire(g,V,I,YAHOO.widget.DS_XHR.ERROR_DATAXHR);return ;};var s={success:v,failure:x};if(YAHOO.lang.isNumber(this.connTimeout)&&(this.connTimeout>0)){s.timeout=this.connTimeout;}if(this._oConn){this.connMgr.abort(this._oConn);}g._oConn=this.connMgr.asyncRequest("GET",H,s,null);};YAHOO.widget.DS_XHR.prototype.parseResponse=function(sQuery,oResponse,oParent){var aSchema=this.schema;var aResults=[];var bError=false;var nEnd=((this.responseStripAfter!=="")&&(oResponse.indexOf))?oResponse.indexOf(this.responseStripAfter):-1;if(nEnd!=-1){oResponse=oResponse.substring(0,nEnd);}switch(this.responseType){case YAHOO.widget.DS_XHR.TYPE_JSON:var jsonList,jsonObjParsed;var isNotMac=(navigator.userAgent.toLowerCase().indexOf("khtml")==-1);if(oResponse.parseJSON&&isNotMac){jsonObjParsed=oResponse.parseJSON();if(!jsonObjParsed){bError=true;}else{try{jsonList=eval("jsonObjParsed."+aSchema[0]);}catch(e){bError=true;break;}}}else{if(window.JSON&&isNotMac){jsonObjParsed=JSON.parse(oResponse);if(!jsonObjParsed){bError=true;break;}else{try{jsonList=eval("jsonObjParsed."+aSchema[0]);}catch(e){bError=true;break;}}}else{try{while(oResponse.substring(0,1)==" "){oResponse=oResponse.substring(1,oResponse.length);}if(oResponse.indexOf("{")<0){bError=true;break;}if(oResponse.indexOf("{}")===0){break;}var jsonObjRaw=eval("("+oResponse+")");if(!jsonObjRaw){bError=true;break;}jsonList=eval("(jsonObjRaw."+aSchema[0]+")");}catch(e){bError=true;break;}}}if(!jsonList){bError=true;break;}if(!YAHOO.lang.isArray(jsonList)){jsonList=[jsonList];}for(var i=jsonList.length-1;i>=0;i--){var aResultItem=[];var jsonResult=jsonList[i];for(var j=aSchema.length-1;j>=1;j--){var dataFieldValue=jsonResult[aSchema[j]];if(!dataFieldValue){dataFieldValue="";}aResultItem.unshift(dataFieldValue);}if(aResultItem.length==1){aResultItem.push(jsonResult);}aResults.unshift(aResultItem);}break;case YAHOO.widget.DS_XHR.TYPE_XML:var xmlList=oResponse.getElementsByTagName(aSchema[0]);if(!xmlList){bError=true;break;}for(var k=xmlList.length-1;k>=0;k--){var result=xmlList.item(k);var aFieldSet=[];for(var m=aSchema.length-1;m>=1;m--){var sValue=null;var xmlAttr=result.attributes.getNamedItem(aSchema[m]);if(xmlAttr){sValue=xmlAttr.value;}else{var xmlNode=result.getElementsByTagName(aSchema[m]);if(xmlNode&&xmlNode.item(0)&&xmlNode.item(0).firstChild){sValue=xmlNode.item(0).firstChild.nodeValue;}else{sValue="";}}aFieldSet.unshift(sValue);}aResults.unshift(aFieldSet);}break;case YAHOO.widget.DS_XHR.TYPE_FLAT:if(oResponse.length>0){var newLength=oResponse.length-aSchema[0].length;if(oResponse.substr(newLength)==aSchema[0]){oResponse=oResponse.substr(0,newLength);}var aRecords=oResponse.split(aSchema[0]);for(var n=aRecords.length-1;n>=0;n--){aResults[n]=aRecords[n].split(aSchema[1]);}}break;default:break;}sQuery=null;oResponse=null;oParent=null;if(bError){return null;}else{return aResults;}};YAHOO.widget.DS_XHR.prototype._oConn=null;YAHOO.widget.DS_JSFunction=function(x,K){if(K&&(K.constructor==Object)){for(var V in K){this[V]=K[V];}}if(!YAHOO.lang.isFunction(x)){return ;}else{this.dataFunction=x;this._init();}};YAHOO.widget.DS_JSFunction.prototype=new YAHOO.widget.DataSource();YAHOO.widget.DS_JSFunction.prototype.dataFunction=null;YAHOO.widget.DS_JSFunction.prototype.doQuery=function(K,g,H){var V=this.dataFunction;var j=[];j=V(g);if(j===null){this.dataErrorEvent.fire(this,H,g,YAHOO.widget.DataSource.ERROR_DATANULL);return ;}var x={};x.query=decodeURIComponent(g);x.results=j;this._addCacheElem(x);this.getResultsEvent.fire(this,H,g,j);K(g,j,H);return ;};YAHOO.widget.DS_JSArray=function(x,K){if(K&&(K.constructor==Object)){for(var V in K){this[V]=K[V];}}if(!YAHOO.lang.isArray(x)){return ;}else{this.data=x;this._init();}};YAHOO.widget.DS_JSArray.prototype=new YAHOO.widget.DataSource();YAHOO.widget.DS_JSArray.prototype.data=null;YAHOO.widget.DS_JSArray.prototype.doQuery=function(j,v,x){var g;var K=this.data;var W=[];var H=false;var V=this.queryMatchContains;if(v){if(!this.queryMatchCase){v=v.toLowerCase();}for(g=K.length-1;g>=0;g--){var s=[];if(YAHOO.lang.isString(K[g])){s[0]=K[g];}else{if(YAHOO.lang.isArray(K[g])){s=K[g];}}if(YAHOO.lang.isString(s[0])){var I=(this.queryMatchCase)?encodeURIComponent(s[0]).indexOf(v):encodeURIComponent(s[0]).toLowerCase().indexOf(v);if((!V&&(I===0))||(V&&(I>-1))){W.unshift(s);}}}}else{for(g=K.length-1;g>=0;g--){if(YAHOO.lang.isString(K[g])){W.unshift([K[g]]);}else{if(YAHOO.lang.isArray(K[g])){W.unshift(K[g]);}}}}this.getResultsEvent.fire(this,x,v,W);j(v,W,x);};YAHOO.register("autocomplete",YAHOO.widget.AutoComplete,{version:"@VERSION@",build:"@BUILD@"});