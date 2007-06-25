/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
*/
/**
 * @module editor
 * @description <p>Editor goes here</p>
 * @namespace YAHOO.widget
 * @requires yahoo, dom, element, event, toolbar, container, menu, button
 * @optional dragdrop, animation
 * @beta
 */

(function() {
var Dom = YAHOO.util.Dom,
    Event = YAHOO.util.Event,
    Lang = YAHOO.lang,
    DD = YAHOO.util.DD,
    Toolbar = YAHOO.widget.Toolbar;


    /**
     * Provides a rich text editor widget based on the button and toolbar
     * @constructor
     * @class Editor
     * @extends YAHOO.util.Element
     * @param {String/HTMLElement} el The element to turn into an editor.
     * @param {Object} attrs Object liternal containing configuration parameters.
    */
    
    YAHOO.widget.Editor = function(el, attrs) {
        YAHOO.log('Editor Initalizing', 'info', 'Editor');

        var oConfig = {
            element: null,
            attributes: (attrs || {})
        }

        if (Lang.isString(el)) {
            YAHOO.log('Found DOM element for editor (' + el + ')', 'warn', 'Editor');
            oConfig.attributes.textarea = Dom.get(el);
        }
        
        oConfig.element = document.createElement('DIV');
        oConfig.element.id = oConfig.attributes.textarea.id + '_container';
        Dom.setStyle(oConfig.element, 'display', 'none');
        
        if (!oConfig.attributes.toolbar_cont) {
            oConfig.attributes.toolbar_cont = document.createElement('DIV');
            oConfig.attributes.toolbar_cont.id = oConfig.attributes.textarea.id + '_toolbar';
            oConfig.element.appendChild(oConfig.attributes.toolbar_cont);
        }
        
        if (!oConfig.attributes.iframe) {
            oConfig.attributes.iframe = _createIframe(oConfig.attributes.textarea.id);
            var editorWrapper = document.createElement('DIV');
            editorWrapper.appendChild(oConfig.attributes.iframe.get('element'));
            oConfig.element.appendChild(editorWrapper);
        }

        YAHOO.widget.Editor.superclass.constructor.call(this, oConfig.element, oConfig.attributes);
    }

    /**
    * @private _cleanClassName
    * @description Makes a useable classname from dynamic data, by dropping it to lowercase and replacing spaces with -'s.
    * @param {String} str The classname to clean up
    * @returns {String}
    */
    function _cleanClassName(str) {
        return str.replace(/ /g, '-').toLowerCase();
    }

    /**
    * @private _createIframe
    * @description Creates the DOM and YUI Element for the iFrame editor area.
    * @param {String} id The string ID to prefix the iframe with
    * @returns {Object} iFrame object
    */
    function _createIframe(id) {
        var ifrmID = id + '_editor';
        var ifrmDom = document.createElement('iframe');
        ifrmDom.id = ifrmID;
        var config = {
            border: '0',
            frameBorder: '0',
            marginWidth: '0',
            marginHeight: '0',
            leftMargin: '0',
            topMargin: '0',
            allowTransparency: 'true',
            width: '100%',
            src: 'javascript:false'
        }
        for (var i in config) {
            ifrmDom.setAttribute(i, config[i]);
        }

        var ifrm = new YAHOO.util.Element(ifrmDom);
        ifrm.setStyle('zIndex', '-1');
        return ifrm;
    }

    YAHOO.extend(YAHOO.widget.Editor, YAHOO.util.Element, {
        /**
        * @property _selection
        * @private
        * @description Holder for caching iframe selections
        * @type {Object}
        */
        _selection: null,
        /**
        * @property _mask
        * @private
        * @description DOM Element holder for the editor Mask when disabled
        * @type {Object}
        */
        _mask: null,
        /**
        * @property _showingHiddenElements
        * @private
        * @description Status of the hidden elements button
        * @type {Boolean}
        */
        _showingHiddenElements: null,
        /**
        * @property currentWindow
        * @description A reference to the currently open EditorWindow
        * @type {Object}
        */
        currentWindow: null,
        /**
        * @property currentEvent
        * @description A reference to the current editor event
        * @type {Event}
        */
        currentEvent: null,
        /**
        * @property currentElement
        * @description A reference to the current working element in the editor
        * @type {HTMLElement}
        */
        currentElement: null,
        /**
        * @property dompath
        * @description A reference to the dompath container for writing the current working dom path to.
        * @type {HTMLElement}
        */
        dompath: null,
        /**
        * @property beforeElement
        * @description A reference to the H2 placed before the editor for Accessibilty.
        * @type {HTMLElement}
        */
        beforeElement: null,
        /**
        * @property afterElement
        * @description A reference to the H2 placed after the editor for Accessibilty.
        * @type {HTMLElement}
        */
        afterElement: null,
        /**
        * @property invalidHTML
        * @description Contains a list of HTML elements that are invalid inside the editor. They will be removed when they are found.
        * @type {Object}
        */
        invalidHTML: {
            form: true,
            input: true,
            button: true,
            select: true,
            link: true,
            html: true,
            body: true,
            script: true
        },
        /**
        * @property toolbar
        * @description Local property containing the YAHOO.widget.toolbar instance
        * @type {YAHOO.widget.Toolbar}
        */
        toolbar: null,
        /**
        * @private
        * @property _contentTimer
        * @description setTimeout holder for documentReady check
        */
        _contentTimer: null,
        /**
        * @private
        * @property _contentTimerCounter
        * @description Counter to check the number of times the body is polled for before giving up
        */
        _contentTimerCounter: 0,
        /**
        * @private
        * @property _disabled
        * @description The Toolbar items that should be disabled if there is no selection present in the editor.
        * @type {Array}
        */
        _disabled: [ 'createlink', 'forecolor', 'backcolor', 'fontname', 'fontsize', 'superscript', 'subscript', 'removeformat', 'heading' ],
        /**
        * @private
        * @property _alwaysDisabled
        * @description The Toolbar items that should ALWAYS be disabled event if there is a selection present in the editor.
        * @type {Object}
        */
        _alwaysDisabled: { },
        /**
        * @private
        * @property _alwaysEnabled
        * @description The Toolbar items that should ALWAYS be enabled event if there isn't a selection present in the editor.
        * @type {Object}
        */
        _alwaysEnabled: { hiddenelements: true },
        /**
        * @private
        * @property _semantic
        * @description The Toolbar commands that we should attempt to make tags out of instead of using styles.
        * @type {Object}
        */
        _semantic: { 'bold': true, 'italic' : true, 'underline' : true },
        /**
        * @private
        * @property _tag2cmd
        * @description A tag map of HTML tags to convert to the different types of commands so we can select the proper toolbar button.
        * @type {Object}
        */
        _tag2cmd: {
            'b': 'bold',
            'strong': 'bold',
            'i': 'italic',
            'em': 'italic',
            'u': 'underline',
            'blockquote': 'formatblock',
            'sup': 'superscript',
            'sub': 'subscript',
            'img': 'insertimage',
            'a' : 'createlink',
            'ul' : 'insertunorderedlist',
            'ol' : 'insertorderedlist',
            'indent' : 'indent',
            'outdent' : 'outdent'
        },
        /**
        * @private
        * @method _getDoc
        * @description Get the Document of the IFRAME
        * @return {Object}
        */
        _getDoc: function() {
            if (this.get('iframe') && this.get('iframe').get('element') && this.get('iframe').get('element').contentWindow && this.get('iframe').get('element').contentWindow.document) {
                return this.get('iframe').get('element').contentWindow.document;
            } else {
                return false;
            }
        },
        /**
        * @private
        * @method _getWindow
        * @description Get the Window of the IFRAME
        * @return {Object}
        */
        _getWindow: function() {
            return this.get('iframe').get('element').contentWindow;
        },
        /**
        * @private
        * @method _focusWindow
        * @description Attempt to set the focus of the iframes window.
        * @param {Boolean} onLoad Safari needs some special care to set the cursor in the iframe
        */
        _focusWindow: function(onLoad) {
            if (this.browser.webkit) {
                if (onLoad) {
                    /**
                    * @knownissue Safari Cursor Position
                    * @browser Safari 2.x
                    * @description Can't get Safari to place the cursor at the beginning of the text..
                    * This workaround at least set's the toolbar into the proper state.
                    */
                    this._getSelection().setBaseAndExtent(this._getDoc().body, 0, this._getDoc().body, 1);
                    this._getSelection().collapse(false);   
                }
                this._getWindow().focus();
                //Check for.webkit3
                if (this._getDoc().queryCommandEnabled('insertimage')) {
                    this.browser.webkit3 = true;
                }
            } else {
                this._getWindow().focus();
            }
        },
        /**
        * @private
        * @method _getSelection
        * @description Handles the different selection objects across the A-Grade list.
        * @returns {Object} Selection Object
        */
        _getSelection: function() {
            var _sel = null;
            if (this._getDoc().selection) {
                _sel = this._getDoc().selection;
            } else {
                _sel = this._getWindow().getSelection();
            }
            //Handle Safari's lack of Selection Object
            if (this.browser.webkit) {
                if (_sel.baseNode) {
                        this._selection = new Object();
                        this._selection.baseNode = _sel.baseNode;
                        this._selection.baseOffset = _sel.baseOffset;
                        this._selection.extentNode = _sel.extentNode;
                        this._selection.extentOffset = _sel.extentOffset;
                } else if (this._selection != null) {
                    _sel = this._getWindow().getSelection();
                    _sel.setBaseAndExtent(
                        this._selection.baseNode,
                        this._selection.baseOffset,
                        this._selection.extentNode,
                        this._selection.extentOffset
                    );
                    this._selection = null;
                }
            }
            return _sel;
        },
        /**
        * @private
        * @method _getRange
        * @description Handles the different range objects across the A-Grade list.
        * @returns {Object} Range Object
        */
        _getRange: function() {
            var sel = this._getSelection();

            if (sel == null) {
                return null;
            }

            if (this.browser.webkit && !sel.getRangeAt) {
                return this._getWindow().getSelection();
            }

            if (this.browser.ie) {
                return sel.createRange();
            }

            if (sel.rangeCount > 0) {
                return sel.getRangeAt(0);
            }
            return null;
        },
        /**
        * @private
        * @method _setDesignMode
        * @description Sets the designMode of the iFrame document.
        * @param {String} state This should be either on or off
        */
        _setDesignMode: function(state) {
            this._getDoc().designMode = state;
        },
        /**
        * @private
        * @method _toggleDesignMode
        * @description Toggles the designMode of the iFrame document on and off.
        * @returns {String} The state that it was set to.
        */
        _toggleDesignMode: function() {
            var _dMode = this._getDoc().designMode,
                _state = 'on';
            if (_dMode == 'on') {
                _state = 'off';
            }
            this._setDesignMode(_state);
            return _state;
        },
        /**
        * @private
        * @method _initEditor
        * @description This method is fired from _checkLoaded when the document is ready. It turns on designMode and set's up the listeners.
        */
        _initEditor: function() {
            YAHOO.log('editorLoaded', 'info', 'Editor');
            if (this.browser.ie) {
                this._getDoc().body.style.margin = '0';
            }
            this._setDesignMode('on');
            this.toolbar.on('buttonClick', this._handleToolbarClick, this, true);
            //Setup Listeners on iFrame
            Event.addListener(this._getDoc(), 'mouseup', this._handleMouseUp, this, true);
            Event.addListener(this._getDoc(), 'mousedown', this._handleMouseDown, this, true);
            Event.addListener(this._getDoc(), 'click', this._handleClick, this, true);
            Event.addListener(this._getDoc(), 'dblclick', this._handleDoubleClick, this, true);
            Event.addListener(this._getDoc(), 'keypress', this._handleKeyPress, this, true);
            Event.addListener(this._getDoc(), 'keyup', this._handleKeyUp, this, true);
            Event.addListener(this._getDoc(), 'keydown', this._handleKeyDown, this, true);
            this.toolbar.set('disabled', false);
            this.fireEvent('editorContentLoaded', { type: 'editorLoaded', target: this });
            if (this.get('dompath')) {
                var self = this;
                window.setTimeout(function() {
                    self._writeDomPath.call(self);
                }, 150);
            }
        },
        /**
        * @private
        * @method _checkLoaded
        * @description Called from a setTimeout loop to check if the iframes body.onload event has fired, then it will init the editor.
        */
        _checkLoaded: function() {
            this._contentTimerCounter++;
            if (this._contentTimer) {
                window.clearTimeout(this._contentTimer);
            }
            if (this._contentTimerCounter > 20) {
                //TODO
                alert('ERROR: Body Did Not load');
                return false;
            }
            if (this._getDoc() && this._getDoc().body && (this._getDoc().body._rteLoaded === true)) {
                //The onload event has fired, clean up after ourselves and fire the _initEditor method
                if (!this.browser.ie) {
                    //IE Doesn't like this..
                    delete this._getDoc().body._rteLoaded;
                    this._getDoc().body.removeAttribute('onload');
                }
                this._initEditor();
            } else {
                var self = this;
                this._contentTimer = window.setTimeout(function() {
                    self._checkLoaded.call(self);
                }, 20);
            }
        },
        /**
        * @private
        * @method _setInitialContent
        * @description This method will open the iframes content document and write the textareas value into it, then start the body.onload checking.
        */
        _setInitialContent: function() {
            YAHOO.log('Body of editor populated with contents of the text area', 'info', 'Editor');
            var title = this.STR_TITLE;
            this._getDoc().open();
            this._getDoc().write(YAHOO.lang.substitute(this.get('html'), { CONTENT: this.get('textarea').value, TITLE: title}));
            this._getDoc().close();
            
            this._checkLoaded();   
        },
        /**
        * @private
        * @method _setMarkupType
        * @param {String} action The action to take. Possible values are: css, default or semantic
        * @description This method will turn on/off the useCSS execCommand.
        */
        _setMarkupType: function(action) {
            switch (this.get('markup')) {
                case 'css':
                    this._setEditorStyle(true);
                    break;
                case 'default':
                    this._setEditorStyle(false);
                    break;
                case 'semantic':
                    if (this._semantic[action]) {
                        this._setEditorStyle(false);
                    } else {
                        this._setEditorStyle(true);
                    }
                    break;
            }
        },
        /**
        * Set the editor to use CSS instead of HTML
        * @param {Booleen} stat True/False
        */
        _setEditorStyle: function(stat) {
            try {
                this._getDoc().execCommand('useCSS', false, !stat);
            } catch (ex) {
               YAHOO.log('useCSS failed: ' + ex, 'info', 'Editor');
            }
        },
        /**
        * @private
        * @method _getSelectedElement
        * @description This method will attempt to locate the element that was last interacted with, either via selection, location or event.
        * @returns {HTMLElement} The currently selected element.
        */
        _getSelectedElement: function() {
            if (this.browser.ie) {
                var doc = this._getDoc();
                var range = this._getRange();
                var elm = range.item ? range.item(0) : range.parentElement();
                if (elm.ownerDocument != doc) {
                    //Sometimes Internet Explorer jumps out of the iFrame here.. Put it back in..
                    elm = doc;
                }
            } else {
                var sel = this._getSelection(),
                    range = this._getRange(),
                    elm = null;
                if (!sel || !range) {
                    return null;
                }
                if (sel != '') {
                    if (sel.anchorNode && (sel.anchorNode.nodeType == 3)) {
                        if (sel.anchorNode.parentNode) { //next check parentNode
                            elm = sel.anchorNode.parentNode;
                        }
                        if (sel.anchorNode.nextSibling != sel.focusNode.nextSibling) {
                            elm = sel.anchorNode.nextSibling;
                        }
                    }
                    
                    if (elm && elm.tagName && (elm.tagName.toLowerCase() == 'br')) {
                        elm = null;
                    }
                
                }
                
                
                if (!elm) {
                    elm = range.commonAncestorContainer;
                    //Safari Fix
                    if (!elm) {
                        if (this.currentEvent) {
                            elm = Event.getTarget(this.currentEvent);
                        }
                    }
                    if (!range.collapsed) {
                        if (range.startContainer == range.endContainer) {
                            if (range.startOffset - range.endOffset < 2) {
                                if (range.startContainer.hasChildNodes()) {
                                    elm = range.startContainer.childNodes[range.startOffset];
                                }
                            }
                        }
                    }
                }
            }
            if (!elm && (this.currentElement || this.currentEvent)) {
                if (this.currentEvent && (this.currentEvent.keyCode == undefined) && Event.getTarget(this.currentEvent)) {
                    elm = Event.getTarget(this.currentEvent);
                } else if (this.currentEvent && (this.currentEvent.keyCode != undefined) && Event.getTarget(this.currentEvent)) {
                } else {
                    elm = this.currentElement;
                }
            } else if ((elm == this._getDoc().body) && this.currentElement && this._getSelection() == '') {
                elm = this.currentElement;
            }
            
            //Catch No elements and set it to body
            /*
            if (!elm) {
                elm = this._getDoc().body;
            }
            if (elm.tagName == undefined) {
                elm = this._getDoc().body;
            }
            */
            return elm;
        },
        /**
        * @private
        * @method _getDomPath
        * @description This method will attempt to build the DOM path from the currently selected element.
        * @returns {Array} An array of node references that will create the DOM Path.
        */
        _getDomPath: function() {
			var el = this._getSelectedElement();
			var domPath = [];
			
			while (el!= null) {
                if (el.ownerDocument != this._getDoc()) {
                    return false;
                }
                //Check to see if we get el.nodeName and nodeType
                if (el.nodeName && (el.nodeType == 1)) {
					domPath[domPath.length] = el;
				}
                
				if (el.nodeName.toUpperCase() == "BODY") {
					break;
				}

				el = el.parentNode;
			}
            return domPath.reverse();
        },
        /**
        * @private
        * @method _writeDomPath
        * @description Write the current DOM path out to the dompath container below the editor.
        */
        _writeDomPath: function() { 
            var path = this._getDomPath(),
                pathArr = [];
            for (var i = 0; i < path.length; i++) {
                var tag = path[i].tagName.toLowerCase();
                if ((tag == 'ol') && (path[i].type)) {
                    tag += ':' + path[i].type;
                }
                if (Dom.hasClass(path[i], 'yui-tag')) {
                    tag = path[i].getAttribute('tag');
                }
                if ((this.get('markup') == 'semantic')) {
                    switch (tag) {
                        case 'b': tag = 'strong'; break;
                        case 'i': tag = 'em'; break;
                    }
                }
                if (!Dom.hasClass(path[i], 'yui-non')) {
                    if (Dom.hasClass(path[i], 'yui-tag')) {
                        var pathStr = tag;
                        if (tag == 'a') {
                            if (path[i].getAttribute('href')) {
                                pathStr += ':' + path[i].getAttribute('href').replace('mailto:', '').replace('http:/'+'/', '').replace('https:/'+'/', ''); //May need to add others here ftp
                            }
                        }
                    } else {
                        var classPath = ((path[i].className != '') ? '.' + path[i].className.replace(/ /g, '.') : '');
                        if ((classPath.indexOf('yui') != -1) || (classPath.toLowerCase().indexOf('apple-style-span') != -1)) {
                            classPath = '';
                        }
                        var pathStr = tag + ((path[i].id) ? '#' + path[i].id : '') + classPath;
                    }
                    if (pathStr.length > 10) {
                        pathStr = pathStr.substring(0, 10) + '...';
                    }
                    pathArr[pathArr.length] = pathStr;
                }
            }
            var str = pathArr.join(' ' + this.SEP_DOMPATH + ' ');
            //Prevent flickering
            if (this.dompath.innerHTML != str) {
                this.dompath.innerHTML = str;
            }
        },
        /**
        * @private
        * @method _fixNodes
        * @description Fix href and imgs as well as remove invalid HTML.
        */
        _fixNodes: function() {
            for (var i in this.invalidHTML) {
                var tags = this._getDoc().body.getElementsByTagName(i);
                for (var h = 0; h < tags.length; h++) {
                    if (tags[h].parentNode) {
                        tags[h].parentNode.removeChild(tags[h]);
                    }
                }
            }
            var as = this._getDoc().body.getElementsByTagName('a');
            if (as.length) {
                YAHOO.log('Found an A tag in the document, converting to span holder', 'info', 'Editor');
                for (var i = 0; i < as.length; i++) {
                    var el = this._getDoc().createElement('span');
                    Dom.addClass(el, 'yui-tag-a');
                    Dom.addClass(el, 'yui-tag');
                    el.innerHTML = as[i].innerHTML;
                    el.setAttribute('tag', 'a');
                    el.setAttribute('href', as[i].getAttribute('href'));
                    if (as[i].getAttribute('target') != null) {
                        el.setAttribute('target', as[i].getAttribute('target'));
                    }
                    as[i].parentNode.replaceChild(el, as[i]);
                    as[i] = null;
                }
            }
            var imgs = this._getDoc().getElementsByTagName('img');
            Dom.addClass(imgs, 'yui-img');
        },
        /**
        * @private
        * @method _showHidden
        * @description Toggle on/off the hidden.css file.
        */
        _showHidden: function() {
            var cssFile = 'hidden.css';
            if (this._showingHiddenElements) {
                if (this._showingHiddenElements.disabled) {
                    YAHOO.log('Enabling hidden CSS File', 'info', 'Editor');
                    this._showingHiddenElements.disabled = false;
                    this.toolbar.selectButton(this.toolbar.getButtonByValue('hiddenelements'));
                } else {
                    YAHOO.log('Disabling hidden CSS File', 'info', 'Editor');
                    this._showingHiddenElements.disabled = true;
                    this.toolbar.deselectButton(this.toolbar.getButtonByValue('hiddenelements'));
                }
            } else {
                YAHOO.log('Injecting Hidden CSS File', 'info', 'Editor');
                var head = this._getDoc().getElementsByTagName('head').item(0);
                var link = this._getDoc().createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', 'text/css');
                //TODO URLS
                link.setAttribute('href', 'css/hidden.css');
                head.appendChild(link);
                this._showingHiddenElements = link;
                this.toolbar.selectButton(this.toolbar.getButtonByValue('hiddenelements'));
            }
        },
        /**
        * @private
        * @method _setCurrentEvent
        * @param {Event} ev The event to cache
        * @description Sets the current event property
        */
        _setCurrentEvent: function(ev) {
            this.currentEvent = ev;
        },
        /**
        * @private
        * @method _handleClick
        * @param {Event} ev The event we are working on.
        * @description Handles all click events inside the iFrame document.
        */
        _handleClick: function(ev) {
            this._setCurrentEvent(ev);
            if (this.currentWindow) {
                this.closeWindow();
            }
            var sel = Event.getTarget(ev);
            if (sel && sel.tagName && (sel.tagName.toLowerCase() == 'img')) {
                if (this.browser.webkit) {
                    //Remove all of the other flags
                    var imgs = Dom.getElementsByClassName('img-selected', 'img', this._getDoc().body);
                    Dom.removeClass(imgs, 'img-selected');
                    Dom.setStyle(imgs, 'opacity', '1');

                    //Now set this image up
                    Dom.addClass(sel, 'img-selected');
                    Dom.setStyle(sel, 'opacity', '.75');
                    Event.stopEvent(ev);
                }
            } else {
                if (this.browser.webkit) {
                    var imgs = Dom.getElementsByClassName('img-selected', 'img', this._getDoc().body);
                    Dom.removeClass(imgs, 'img-selected');
                    Dom.setStyle(imgs, 'opacity', '1');
                }
            }
            this.nodeChange();
        },
        /**
        * @private
        * @method _handleMouseUp
        * @param {Event} ev The event we are working on.
        * @description Handles all mouseup events inside the iFrame document.
        */
        _handleMouseUp: function(ev) {
            this._setCurrentEvent(ev);
            this.fireEvent('editorMouseUp', { type: 'editorMouseUp', target: this, ev: ev });
        },
        /**
        * @private
        * @method _handleMouseDown
        * @param {Event} ev The event we are working on.
        * @description Handles all mousedown events inside the iFrame document.
        */
        _handleMouseDown: function(ev) {
            this._setCurrentEvent(ev);
            var sel = Event.getTarget(ev);
            if (sel && sel.tagName && (sel.tagName.toLowerCase() == 'img')) {
                if (this.browser.webkit) {
                    Event.stopEvent(ev);
                }
            }
            this.nodeChange();
            this.fireEvent('editorMouseDown', { type: 'editorMouseDown', target: this, ev: ev });
        },
        /**
        * @private
        * @method _handleDoubleClick
        * @param {Event} ev The event we are working on.
        * @description Handles all doubleclick events inside the iFrame document.
        */
        _handleDoubleClick: function(ev) {
            this._setCurrentEvent(ev);
            var sel = Event.getTarget(ev);
            if (sel && sel.tagName && (sel.tagName.toLowerCase() == 'img')) {
                this.currentElement = sel;
                this.toolbar.fireEvent('insertimageClick', { type: 'insertimageClick', target: this.toolbar });
                this.fireEvent('afterExecCommand', { type: 'afterExecCommand', target: this });
            } else if (sel && sel.getAttribute && sel.getAttribute('tag') && (sel.getAttribute('tag').toLowerCase() == 'a')) {
                this.currentElement = sel;
                this.toolbar.fireEvent('createlinkClick', { type: 'createlinkClick', target: this.toolbar });
                this.fireEvent('afterExecCommand', { type: 'afterExecCommand', target: this });
            }
            this.nodeChange();
            this.fireEvent('editorDoubleClick', { type: 'editorDoubleClick', target: this, ev: ev });
        },
        /**
        * @private
        * @method _handleKeyUp
        * @param {Event} ev The event we are working on.
        * @description Handles all keyup events inside the iFrame document.
        */
        _handleKeyUp: function(ev) {
            this._setCurrentEvent(ev);
            switch (ev.keyCode) {
                case 37://Up & Down keys
                case 38:
                case 39:
                case 40:
                    this.nodeChange();
                    break;
            }
            this.fireEvent('editorKeyUp', { type: 'editorKeyUp', target: this, ev: ev });
        },
        /**
        * @private
        * @method _handleKeyPress
        * @param {Event} ev The event we are working on.
        * @description Handles all keypress events inside the iFrame document.
        */
        _handleKeyPress: function(ev) {
            this._setCurrentEvent(ev);
            this.fireEvent('editorKeyPress', { type: 'editorKeyPress', target: this, ev: ev });
        },
        /**
        * @private
        * @method _handleKeyDown
        * @param {Event} ev The event we are working on.
        * @description Handles all keydown events inside the iFrame document.
        */
        _handleKeyDown: function(ev) {
            this._setCurrentEvent(ev);
            if (this.currentWindow) {
                this.closeWindow();
            }
            var doExec = false;
            var action = null;
            if (ev.ctrlKey) {
                doExec = true;
            }
            switch (ev.keyCode) {
                case 84: //Focus Toolbar Header -- Ctrl + Shift + T
                    if (ev.shiftKey && ev.ctrlKey) {
                        this.toolbar._titlebar.firstChild.focus();
                        Event.stopEvent(ev);
                        exec = false;
                    }
                    break;
                case 69: //Focus After Element - Ctrl + Shift + E
                    if (ev.shiftKey) {
                        this.afterElement.focus();
                        Event.stopEvent(ev);
                        exec = false;
                    }
                    break;
                case 66: //B
                    action = 'bold';
                    break;
                case 73: //I
                    action = 'italic';
                    break;
                case 85: //U
                    action = 'underline';
                    break;
                case 9: //Tab Key
                    if (this.browser.safari) {
                        this._getDoc().execCommand('inserttext', false, '\t');
                        Event.stopEvent(ev);
                    }
                    break;
                case 13:
                    if (this.browser.ie) {
                        //Insert a <br> instead of a <p></p> in Internet Explorer
                        var _range = this._getRange();
                        var tar = this._getSelectedElement();
                        if (tar && tar.tagName && (tar.tagName.toLowerCase() != 'li')) {
                            if (_range) {
                                _range.pasteHTML('<br>');
                                _range.collapse(false);
                                _range.select();
                            }
                            Event.stopEvent(ev);
                        }
                    }
            }
            if (doExec && action) {
                this.execCommand(action, null);
                Event.stopEvent(ev);
                this.nodeChange();
            }
            this.fireEvent('editorKeyDown', { type: 'editorKeyDown', target: this, ev: ev });
        },
        /**
        * @method nodeChange
        * @description Handles setting up the toolbar buttons, getting the Dom path, fixing nodes.
        */
        nodeChange: function() {
            this._fixNodes();

            //Node changes occur too often to log..
            //YAHOO.log('fireEvent::beforeNodeChange', 'info', 'Editor');
            this.fireEvent('beforeNodeChange', { type: 'beforeNodeChange', target: this });
            if (this.get('dompath')) {
                this._writeDomPath();
            }
            //Check to see if we are disabled before continuing
            if (!this.get('disabled')) {
                if (this.STOP_NODE_CHANGE) {
                    //YAHOO.log('Node change processing stopped via STOP_NODE_CHANGE var', 'warn', 'Editor');
                    //Reset this var for next action
                    this.STOP_NODE_CHANGE = false;
                    return false;
                } else {
                    var sel = this._getSelection();
                    var range = this._getRange();
                    var hasSel = false;
                    if ((sel != '') && (sel != undefined)) {
                        hasSel = true;
                    }
                    //Internet Explorer
                    if (this.browser.ie) {
                        if (!range.text) {
                            hasSel = false;
                        }
                    }
                    //Handle disabled buttons
                    for (var i = 0; i < this._disabled.length; i++) {
                        var _button = this.toolbar.getButtonByValue(this._disabled[i]);
                        if (_button && _button.get) {
                            if (!hasSel) {
                                //No Selection - disable
                                this.toolbar.disableButton(_button.get('id'));
                            } else {
                                if (!this._alwaysDisabled[this._disabled[i]]) {
                                    this.toolbar.enableButton(_button.get('id'));
                                }
                            }
                            if (!this._alwaysEnabled[this._disabled[i]]) {
                                this.toolbar.deselectButton(_button);
                            }
                        }
                    }
                    //Handle updating the toolbar with active buttons
                    for (var i = 0; i < this.toolbar._buttonList.length; i++) {
                        if (!this._alwaysEnabled[this.toolbar._buttonList[i].get('value')]) {
                            this.toolbar.deselectButton(this.toolbar._buttonList[i]);
                        }
                    }
                    var path = this._getDomPath();
                    var olType = null;
                    for (var i = 0; i < path.length; i++) {
                        var tag = path[i].tagName.toLowerCase();
                        if (path[i].getAttribute('tag')) {
                            var tag = path[i].getAttribute('tag').toLowerCase();
                        }
                        var cmd = this._tag2cmd[tag];

                        //Bold and Italic styles
                        if (path[i].style.fontWeight.toLowerCase() == 'bold') {
                            cmd = 'bold';
                        }
                        if (path[i].style.fontStyle.toLowerCase() == 'italic') {
                            cmd = 'italic';
                        }
                        if (path[i].style.textDecoration.toLowerCase() == 'underline') {
                            cmd = 'underline';
                        }
                        if (tag == 'ol') {
                            if (path[i].type) {
                                olType = path[i].type;
                            } else {
                                olType = 'A';
                            }
                        }
                        if (cmd) {
                            if (!Lang.isArray(cmd)) {
                                cmd = [cmd];
                            }
                            for (var j = 0; j < cmd.length; j++) {
                                var button = this.toolbar.getButtonByValue(cmd[j]);
                                this.toolbar.selectButton(button);
                                this.toolbar.enableButton(button);
                            }
                        }
                        //Handle Alignment
                        switch (path[i].style.textAlign.toLowerCase()) {
                            case 'left':
                            case 'right':
                            case 'center':
                            case 'justify':
                                var alignType = path[i].style.textAlign.toLowerCase();
                                if (path[i].style.textAlign.toLowerCase() == 'justify') {
                                    alignType = 'full';
                                }
                                var button = this.toolbar.getButtonByValue('justify' + alignType);
                                this.toolbar.selectButton(button);
                                this.toolbar.enableButton(button);
                                break;
                        }
                        //Handle Ordered List Drop Down
                        if (olType) {
                            this._updateMenuChecked('insertorderedlist', olType);
                        }
                    }
                    //Reset Font Family and Size to the inital configs
                    var fn_button = this.toolbar.getButtonByValue('fontname');
                    var family = fn_button._configs.label._initialConfig.value;
                    fn_button.set('label', '<span class="yui-toolbar-fontname-' + _cleanClassName(family) + '">' + family + '</span>');
                    this._updateMenuChecked('fontname', family);

                    var fs_button = this.toolbar.getButtonByValue('fontsize');
                    fs_button.set('label', fs_button._configs.label._initialConfig.value);

                    var hd_button = this.toolbar.getButtonByValue('heading');
                    hd_button.set('label', hd_button._configs.label._initialConfig.value);
                    this._updateMenuChecked('heading', 'none');
                }
            }


            //YAHOO.log('fireEvent::afterNodeChange', 'info', 'Editor');
            this.fireEvent('afterNodeChange', { type: 'afterNodeChange', target: this });
        },
        /**
        * @private
        * @method _updateMenuChecked
        * @param {Object} button The command identifier of the button you want to check
        * @param {String} value The value of the menu item you want to check
        * @param {YAHOO.widget.Toolbar} The Toolbar instance the button belongs to (defaults to this.toolbar) 
        * @description Gets the menu from a button instance, if the menu is not rendered it will render it. It will then search the menu for the specified value, unchecking all other items and checking the specified on.
        */
        _updateMenuChecked: function(button, value, tbar) {
            if (!tbar) {
                tbar = this.toolbar;
            }
            var _button = tbar.getButtonByValue(button);
            var _menuItems = _button.getMenu().getItems();
            if (_menuItems.length == 0) {
                _button.getMenu()._onBeforeShow();
                _menuItems = _button.getMenu().getItems();
            }
            for (var i = 0; i < _menuItems.length; i++) {
                _menuItems[i].cfg.setProperty('checked', false);
                if (_menuItems[i].value == value) {
                    _menuItems[i].cfg.setProperty('checked', true);
                }
            }
        },
        /**
        * @private
        * @method _handleToolbarClick
        * @param {Event} ev The event that triggered the button click
        * @description This is an event handler attached to the Toolbar's buttonClick event. It will fire execCommand with the command identifier from the Toolbar Button.
        */
        _handleToolbarClick: function(ev) {
            var value = '';
            var str = '';
            var cmd = ev.button.value;
            if (ev.button.menucmd) {
                value = cmd;
                cmd = ev.button.menucmd;
            }
            if (this.STOP_EXEC_COMMAND) {
                YAHOO.log('execCommand skipped because we found the STOP_EXEC_COMMAND flag set to true', 'warn', 'Editor');
                YAHOO.log('NOEXEC::execCommand::(' + cmd + '), (' + value + ')', 'warn', 'Editor');
                this.STOP_EXEC_COMMAND = false;
                return false;
            } else {
                this.execCommand(cmd, value);
            }
            Event.stopEvent(ev);
        },
        /**
        * @private
        * @method _setupAfterElement
        * @description Creates the accessibility h2 header and places it after the iframe in the Dom for navigation.
        */
        _setupAfterElement: function() {
            if (!this.afterElement) {
                this.afterElement = document.createElement('h2');
                this.afterElement.className = 'yui-editor-skipheader';
                this.afterElement.tabIndex = '-1';
                this.afterElement.innerHTML = this.STR_LEAVE_EDITOR;
                this.appendChild(this.afterElement);
            }
        },
        /**
        * @property EDITOR_PANEL_ID
        * @description HTML id to give the properties window in the DOM.
        */
        EDITOR_PANEL_ID: 'yui-editor-panel',
        /**
        * @property SEP_DOMPATH
        * @description The value to place in between the Dom path items
        */
        SEP_DOMPATH: '<',
        /**
        * @property STR_LEAVE_EDITOR
        * @description The accessibility string for the element after the iFrame
        */
        STR_LEAVE_EDITOR: 'You have left the Rich Text Editor.',
        /**
        * @property STR_BEFORE_EDITOR
        * @description The accessibility string for the element before the iFrame
        */
        STR_BEFORE_EDITOR: 'Rich Text Editor, hit tab to continue to editor. To bypass this editor continue to next heading. To move past the editor from inside use Control + Shift + E. To move back to the toolbar from inside the editor use Control + Shift + T.',
        /**
        * @property STR_TITLE
        * @description The Title of the HTML document that is created in the iFrame
        */
        STR_TITLE: 'Rich Text Area.',
        /**
        * @property STR_IMAGE_PROP_TITLE
        * @description The title for the Image Property Editor Window
        */
        STR_IMAGE_PROP_TITLE: 'Image Options',
        /**
        * @property STR_IMAGE_URL
        * @description The label string for Image URL
        */
        STR_IMAGE_URL: 'Image Url',
        /**
        * @property STR_IMAGE_TITLE
        * @description The label string for Image Description
        */
        STR_IMAGE_TITLE: 'Description',
        /**
        * @property STR_IMAGE_SIZE
        * @description The label string for Image Size
        */
        STR_IMAGE_SIZE: 'Size',
        /**
        * @property STR_IMAGE_ORIG_SIZE
        * @description The label string for Original Image Size
        */
        STR_IMAGE_ORIG_SIZE: 'Original Size',
        /**
        * @property STR_IMAGE_COPY
        * @description The label string for the image copy and paste message for Opera and Safari
        */
        STR_IMAGE_COPY: '<span class="tip"><strong>Note:</strong>To move this image just highlight it, cut, and paste where ever you\'d like.</span>',
        /**
        * @property STR_IMAGE_PADDING
        * @description The label string for the image padding.
        */
        STR_IMAGE_PADDING: 'Padding',
        /**
        * @property STR_IMAGE_BORDER
        * @description The label string for the image border.
        */
        STR_IMAGE_BORDER: 'Border',
        /**
        * @property STR_IMAGE_TEXTFLOW
        * @description The label string for the image text flow.
        */
        STR_IMAGE_TEXTFLOW: 'Text Flow',
        /**
        * @property STR_LOCAL_FILE_WARNING
        * @description The label string for the local file warning.
        */
        STR_LOCAL_FILE_WARNING: '<span class="warn"><strong>Note:</strong>This image points to a file on your computer and will not be accessible to others on the internet.</span>',
        /**
        * @property STR_LINK_PROP_TITLE
        * @description The label string for the Link Property Editor Window.
        */
        STR_LINK_PROP_TITLE: 'Link Options',
        /**
        * @property STR_LINK_URL
        * @description The label string for the Link URL.
        */
        STR_LINK_URL: 'Link URL',
        /**
        * @property STR_LINK_NEW_WINDOW
        * @description The string for the open in a new window label.
        */
        STR_LINK_NEW_WINDOW: 'Open in a new window.',
        /**
        * @property STR_LINK_TITLE
        * @description The string for the link description.
        */
        STR_LINK_TITLE: 'Description',
        /**
        * @protected
        * @property STOP_EXEC_COMMAND
        * @description Set to true when you want the default execCommand function to not process anything
        * @type {Boolean}
        */
        STOP_EXEC_COMMAND: false,
        /**
        * @protected
        * @property STOP_NODE_CHANGE
        * @description Set to true when you want the default nodeChange function to not process anything
        * @type {Boolean}
        */
        STOP_NODE_CHANGE: false,
        /**
        * @protected
        * @property CLASS_CONTAINER
        * @description Default CSS class to apply to the editors container element
        * @type {String}
        */
        CLASS_CONTAINER: 'yui-editor-container',
        /**
        * @protected
        * @property CLASS_EDITABLE
        * @description Default CSS class to apply to the editors iframe element
        * @type {String}
        */
        CLASS_EDITABLE: 'yui-editor-editable',
        /**
        * @protected
        * @property CLASS_EDITABLE_CONT
        * @description Default CSS class to apply to the editors iframe's parent element
        * @type {String}
        */
        CLASS_EDITABLE_CONT: 'yui-editor-editable-container',
        /**
        * @protected
        * @property CLASS_PREFIX
        * @description Default prefix for dynamically created class names
        * @type {String}
        */
        CLASS_PREFIX: 'yui-editor',
        /** 
        * @property browser
        * @description Standard browser detection
        * @type {Object}
        */
        browser: YAHOO.env.ua,
        /** 
        * @method init
        * @description The Editor class's initialization method
        */
        init: function(p_oElement, p_oAttributes) {
            YAHOO.widget.Editor.superclass.init.call(this, p_oElement, p_oAttributes);
            this.addClass(this.CLASS_CONTAINER);
            Dom.addClass(this.get('iframe').get('parentNode'), this.CLASS_EDITABLE_CONT);
            this.get('iframe').addClass(this.CLASS_EDITABLE);
        },
        /**
        * @method initAttributes
        * @description Initializes all of the configuration attributes used to create 
        * the editor.
        * @param {Object} attr Object literal specifying a set of 
        * configuration attributes used to create the editor.
        */
        initAttributes: function(attr) {
            YAHOO.widget.Editor.superclass.initAttributes.call(this, attr);
            var el = this.get('element');
            var self = this;

            /**
            * @private
            * @config textarea
            * @description A reference to the textarea element that we are replacing
            * @default null
            * @type Boolean
            */            
            this.setAttributeConfig('textarea', {
                value: attr.textarea,
                writeOnce: true
            });
            /**
            * @config height
            * @description The height of the editor iframe container, not including the toolbar..
            * @default Best guessed size of the textarea, for best results use CSS to style the height of the textarea or pass it in as an argument
            * @type String
            */
            this.setAttributeConfig('height', {
                value: Dom.getStyle(self.get('textarea'), 'height'),
                writeOnce: true
            });
            /**
            * @config width
            * @description The width of the editor container.
            * @default Best guessed size of the textarea, for best results use CSS to style the width of the textarea or pass it in as an argument
            * @type String
            */            
            this.setAttributeConfig('width', {
                value: Dom.getStyle(this.get('textarea'), 'width'),
                writeOnce: true
            });
            //TODO URL's
            /**
            * @config html
            * @description The default HTML to be written to the iframe document before the contents are loaded
            * @default This HTML requires a few things if you are to override:
                <ul>
                    <li>{TITLE} and {CONTENT} need to be there, they are passed to YAHOO.lang.substitute to be replace with other strings.</li>
                    <li>onload="document.body._rteLoaded = true;" : the onload statement must be there or the editor will not finish loading.</li>
                </ul>
                <!DOCTYPE HTML PUBLIC "-/'+'/W3C/'+'/DTD HTML 4.01/'+'/EN" "http:/'+'/www.w3.org/TR/html4/strict.dtd">
                <html>
                    <head>
                        <title>{TITLE}</title>
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                        <link rel="stylesheet" type="text/css" href="http:/'+'/yui.yahooapis.com/2.2.2/build/fonts/fonts-min.css">
                        <link rel="stylesheet" type="text/css" href="css/content.css">
                    </head>
                <body onload="document.body._rteLoaded = true;">
                {CONTENT}
                </body>
                </html>
            * @type String
            */            
            this.setAttributeConfig('html', {
                value: '<!DOCTYPE HTML PUBLIC "-/'+'/W3C/'+'/DTD HTML 4.01/'+'/EN" "http:/'+'/www.w3.org/TR/html4/strict.dtd"><html><head><title>{TITLE}</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><link rel="stylesheet" type="text/css" href="http:/'+'/yui.yahooapis.com/2.2.2/build/fonts/fonts-min.css"> <link rel="stylesheet" type="text/css" href="css/content.css"></head><body onload="document.body._rteLoaded = true;">{CONTENT}</body></html>',
                readOnly: true
            });
            /**
            * @config handleSubmit
            * @description Config handles if the editor will attach itself to the textareas parent form's submit handler.
            If it is set to true, the editor will attempt to attach a submit listener to the textareas parent form.
            Then it will trigger the editors save handler and place the new content back into the text area before the form is submitted.
            * @default false
            * @type Boolean
            */            
            this.setAttributeConfig('handleSubmit', {
                value: false,
                writeOnce: true,
                method: function(exec) {
                    if (exec) {
                        var ta = this.get('textarea');
                        if (ta.form) {
                            Event.addListener(ta.form, 'submit', function() {
                                this.saveHTML();
                            }, this, true);
                        }
                    }
                }
            });
            /**
            * @private
            * @config iframe
            * @description Internal config for holding the iframe element.
            * @default null
            * @type Boolean
            */
            this.setAttributeConfig('iframe', {
                value: null,
                writeOnce: true
            });
            /**
            * @config disabled
            * @description This will toggle the editor's disabled state. When the editor is disabled, designMode is turned off and a mask is placed over the iframe so no interaction can take place.
            All Toolbar buttons are also disabled so they cannot be used.
            * @default false
            * @type Boolean
            */

            this.setAttributeConfig('disabled', {
                value: false,
                method: function(disabled) {
                    if (disabled) {
                        if (!this._mask) {
                            this._setDesignMode('off');
                            this.toolbar.set('disabled', true);
                            this._mask = document.createElement('DIV');
                            Dom.setStyle(this._mask, 'height', '100%');
                            Dom.setStyle(this._mask, 'width', '100%');
                            Dom.setStyle(this._mask, 'position', 'absolute');
                            Dom.setStyle(this._mask, 'top', '0');
                            Dom.setStyle(this._mask, 'left', '0');
                            Dom.setStyle(this._mask, 'opacity', '.5');
                            Dom.addClass(this._mask, 'yui-editor-masked');
                            this.get('iframe').get('parentNode').appendChild(this._mask);
                        }
                    } else {
                        if (this._mask) {
                            this._mask.parentNode.removeChild(this._mask);
                            this._mask = null;
                            this.toolbar.set('disabled', false);
                            this._setDesignMode('on');
                            this._focusWindow();
                        }
                    }
                }
            });
            /**
            * @config toolbar_cont
            * @description Internal config for the toolbars container
            * @default false
            * @type Boolean
            */
            this.setAttributeConfig('toolbar_cont', {
                value: null,
                writeOnce: true
            });
            /**
            * @config toolbar
            * @description The default toolbar config.
            * @default 
                     {{{ Defaut Toolbar Config
                    collapse: true,
                    titlebar: 'Text Editing Tools',
                    draggable: false,
                    buttons: [
                        { group: 'fontstyle', label: 'Font Name and Size',
                            buttons: [
                                { type: 'select', label: 'Arial', value: 'fontname',
                                    menu: [
                                        { text: 'Arial', checked: true },
                                        { text: 'Arial Black' },
                                        { text: 'Comic Sans MS' },
                                        { text: 'Courier New' },
                                        { text: 'Impact' },
                                        { text: 'Lucida Sans' },
                                        { text: 'Monaco' },
                                        { text: 'Palatino' },
                                        { text: 'Tahoma' },
                                        { text: 'Times New Roman' },
                                        { text: 'Trebuchet MS' },
                                        { text: 'Verdana' }
                                    ]
                                },
                                { type: 'spin', label: '13', value: 'fontsize', range: [ 9, 75 ]}
                            ]
                        },
                        { type: 'separator' },
                        { group: 'textstyle', label: 'Font Style',
                            buttons: [
                                { type: 'push', label: 'Bold', value: 'bold' },
                                { type: 'push', label: 'Italic', value: 'italic' },
                                { type: 'push', label: 'Underline', value: 'underline' },
                                { type: 'separator' },
                                { type: 'push', label: 'Subscript', value: 'subscript' },
                                { type: 'push', label: 'Superscript', value: 'superscript' },
                                { type: 'separator' },
                                { type: 'color', label: 'Font Color', value: 'forecolor', disabled: true },
                                { type: 'color', label: 'Back Color', value: 'backcolor', disabled: true },
                                { type: 'separator' },
                                { type: 'push', label: 'Remove Formatting', value: 'removeformat' },
                                { type: 'push', label: 'Show Hidden Elements', value: 'hiddenelements' }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'alignment', label: 'Alignment',
                            buttons: [
                                { type: 'push', label: 'Left', value: 'justifyleft' },
                                { type: 'push', label: 'Center', value: 'justifycenter' },
                                { type: 'push', label: 'Right', value: 'justifyright' },
                                { type: 'push', label: 'Full', value: 'justifyfull' }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'parastyle', label: 'Paragraph Style',
                            buttons: [
                            { type: 'select', label: 'Normal', value: 'heading', disabled: true,
                                menu: [
                                    { text: 'Normal', value: 'none', checked: true },
                                    //{ text: 'Blockquote', value: 'blockquote' },
                                    { text: 'Header 1', value: 'h1' },
                                    { text: 'Header 2', value: 'h2' },
                                    { text: 'Header 3', value: 'h3' },
                                    { text: 'Header 4', value: 'h4' },
                                    { text: 'Header 5', value: 'h5' },
                                    { text: 'Header 6', value: 'h6' }
                                ]
                            }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'indentlist', label: 'Indenting and Lists',
                            buttons: [
                                { type: 'push', label: 'Indent', value: 'indent' },
                                { type: 'push', label: 'Outdent', value: 'outdent' },
                                { type: 'push', label: 'Create an Unordered List', value: 'insertunorderedlist' },
                                { type: 'menu', label: 'Create an Ordered List', value: 'insertorderedlist',
                                    menu: [
                                        { text: '1,2,3,4', value: '1', checked: true },
                                        { text: 'A,B,C,D', value: 'A' },
                                        { text: 'a,b,c,d', value: 'a' },
                                        { text: 'I,II,III,IV', value: 'I' },
                                        { text: 'i,ii,iii,iv', value: 'i' }
                                    ]
                                }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'insertitem', label: 'Insert Item',
                            buttons: [
                                { type: 'push', label: 'Create Link', value: 'createlink' },
                                { type: 'push', label: 'Insert Image', value: 'insertimage' }
                            ]
                        }
                    ]
                     }}}
            * @type {Object}
            */            
            this.setAttributeConfig('toolbar', {
                value: attr.buttons || {
                    /* {{{ Defaut Toolbar Config */
                    collapse: true,
                    titlebar: 'Text Editing Tools',
                    draggable: false,
                    buttons: [
                        { group: 'fontstyle', label: 'Font Name and Size',
                            buttons: [
                                { type: 'select', label: 'Arial', value: 'fontname', disabled: true,
                                    menu: [
                                        { text: 'Arial', checked: true },
                                        { text: 'Arial Black' },
                                        { text: 'Comic Sans MS' },
                                        { text: 'Courier New' },
                                        { text: 'Impact' },
                                        { text: 'Lucida Sans' },
                                        { text: 'Monaco' },
                                        { text: 'Palatino' },
                                        { text: 'Tahoma' },
                                        { text: 'Times New Roman' },
                                        { text: 'Trebuchet MS' },
                                        { text: 'Verdana' }
                                    ]
                                },
                                { type: 'spin', label: '13', value: 'fontsize', range: [ 9, 75 ], disabled: true }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'textstyle', label: 'Font Style',
                            buttons: [
                                { type: 'push', label: 'Bold', value: 'bold' },
                                { type: 'push', label: 'Italic', value: 'italic' },
                                { type: 'push', label: 'Underline', value: 'underline' },
                                { type: 'separator' },
                                { type: 'push', label: 'Subscript', value: 'subscript', disabled: true },
                                { type: 'push', label: 'Superscript', value: 'superscript', disabled: true },
                                { type: 'separator' },
                                { type: 'color', label: 'Font Color', value: 'forecolor', disabled: true },
                                { type: 'color', label: 'Back Color', value: 'backcolor', disabled: true },
                                { type: 'separator' },
                                { type: 'push', label: 'Remove Formatting', value: 'removeformat', disabled: true },
                                { type: 'push', label: 'Show Hidden Elements', value: 'hiddenelements' }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'alignment', label: 'Alignment',
                            buttons: [
                                { type: 'push', label: 'Left', value: 'justifyleft' },
                                { type: 'push', label: 'Center', value: 'justifycenter' },
                                { type: 'push', label: 'Right', value: 'justifyright' },
                                { type: 'push', label: 'Full', value: 'justifyfull' }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'parastyle', label: 'Paragraph Style',
                            buttons: [
                            { type: 'select', label: 'Normal', value: 'heading', disabled: true,
                                menu: [
                                    { text: 'Normal', value: 'none', checked: true },
                                    //{ text: 'Blockquote', value: 'blockquote' },
                                    { text: 'Header 1', value: 'h1' },
                                    { text: 'Header 2', value: 'h2' },
                                    { text: 'Header 3', value: 'h3' },
                                    { text: 'Header 4', value: 'h4' },
                                    { text: 'Header 5', value: 'h5' },
                                    { text: 'Header 6', value: 'h6' }
                                ]
                            }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'indentlist', label: 'Indenting and Lists',
                            buttons: [
                                { type: 'push', label: 'Indent', value: 'indent' },
                                { type: 'push', label: 'Outdent', value: 'outdent' },
                                { type: 'push', label: 'Create an Unordered List', value: 'insertunorderedlist' },
                                { type: 'menu', label: 'Create an Ordered List', value: 'insertorderedlist',
                                    menu: [
                                        { text: '1,2,3,4', value: '1', checked: true },
                                        { text: 'A,B,C,D', value: 'A' },
                                        { text: 'a,b,c,d', value: 'a' },
                                        { text: 'I,II,III,IV', value: 'I' },
                                        { text: 'i,ii,iii,iv', value: 'i' }
                                    ]
                                }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'insertitem', label: 'Insert Item',
                            buttons: [
                                { type: 'push', label: 'Create Link', value: 'createlink', disabled: true },
                                { type: 'push', label: 'Insert Image', value: 'insertimage' }
                            ]
                        }
                    ]
                    /* }}} */
                },
                writeOnce: true,
                method: function(toolbar) {
                }
            });
            /**
            * @config animate
            * @description Should the editor animate window movements
            * @default false unless Animation is found, then true
            * @type Boolean
            */            
            this.setAttributeConfig('animate', {
                value: false,
                validator: function(value) {
                    var ret = true;
                    if (!YAHOO.util.Anim) {
                        ret = false;
                    }
                    return ret;
                }               
            });
            /**
            * @config panel
            * @description A reference to the panel we are using for windows.
            * @default false
            * @type Boolean
            */            
            this.setAttributeConfig('panel', {
                value: null,
                writeOnce: true,
                validator: function(value) {
                    var ret = true;
                    if (!YAHOO.widget.Overlay) {
                        ret = false;
                    }
                    return ret;
                }               
            });
            /**
            * @config localFileWarning
            * @description Should we throw the warning if we detect a file that is local to their machine?
            * @default true
            * @type Boolean
            */            
            this.setAttributeConfig('localFileWarning', {
                value: true
            });
            /**
            * @config dompath
            * @description Toggle the display of the current Dom path below the editor
            * @default true
            * @type Boolean
            */            
            this.setAttributeConfig('dompath', {
                value: false,
                method: function(dompath) {
                    if (dompath && !this.dompath) {
                        this.dompath = document.createElement('DIV');
                        this.dompath.id = this.get('id') + '_dompath';
                        Dom.addClass(this.dompath, 'dompath');
                        this.appendChild(this.dompath);
                        if (this.get('iframe')) {
                            this._writeDomPath();
                        }
                    } else if (!dompath && this.dompath) {
                        this.removeChild(this.dompath);
                        this.dompath = null;
                    }
                    this._setupAfterElement();
                }
            });
            /**
            * @config markup
            * @description Should we try to adjust the markup for the following types: semantic, css or default
            * @default "semantic"
            * @type Boolean
            */            
            this.setAttributeConfig('markup', {
                value: 'semantic',
                validator: function(markup) {
                    switch (markup.toLowerCase()) {
                        case 'semantic':
                        case 'css':
                        case 'default':
                        return true;
                        break;
                    }
                    return false;
                }
            });

            this.on('afterRender', function() {
                this._renderPanel();
            });
        },
        /**
        * @private
        * @method _handleFontSize
        * @description Handles the font size button in the toolbar.
        * @param {Object} o Object returned from Toolbar's buttonClick Event
        */
        _handleFontSize: function(o) {
            YAHOO.log('(Button: ' + o.button.value + ')', 'info', 'fontsizeClick');
            var button = this.toolbar.getButtonById(o.button.id);
            var value = button.get('label') + 'px';
            YAHOO.log('fontsizeClick::execCommand::(fontsize), (' + value + ')', 'info', 'Editor');
            this.execCommand('fontsize', value);
            this.STOP_EXEC_COMMAND = true;
        },
        /**
        * @private
        * @method _handleColorPicker
        * @description Handles the colorpicker buttons in the toolbar.
        * @param {Object} o Object returned from Toolbar's buttonClick Event
        */
        _handleColorPicker: function(o) {
            var cmd = o.button;
            var value = '#' + o.color;
            if ((cmd == 'forecolor') || (cmd == 'backcolor')) {
                YAHOO.log('colorPickerClicked::execCommand::(' + cmd + '), (' + value + ')', 'info', 'Editor');
                this.execCommand(cmd, value);
            }
        },
        /**
        * @private
        * @method _handleAlign
        * @description Handles the alignment buttons in the toolbar.
        * @param {Object} o Object returned from Toolbar's buttonClick Event
        */
        _handleAlign: function(o) {
            var button = this.toolbar.getButtonById(o.button.id);
            var cmd = null;
            for (var i = 0; i < o.button.menu.length; i++) {
                if (o.button.menu[i].value == o.button.value) {
                    cmd = o.button.menu[i].value;
                }
            }
            var value = this._getSelection();
            YAHOO.log('alignClick::execCommand::(' + cmd + '), (' + value + ')', 'info', 'Editor');

            this.execCommand(cmd, value);
            this.STOP_EXEC_COMMAND = true;
        },
        /**
        * @private
        * @method _handleAfterNodeChange
        * @description Fires after a nodeChange happens to setup the things that where reset on the node change (button state).
        */
        _handleAfterNodeChange: function() {
            var path = this._getDomPath();
            for (var i = 0; i < path.length; i++) {
                var elm = path[i],
                    tag = elm.tagName.toLowerCase(),
                    family = null,
                    fontsize = null,
                    validFont = false;

                if (elm.getAttribute('tag')) {
                    tag = elm.getAttribute('tag');
                }

                family = elm.getAttribute('face');
                if (Dom.getStyle(elm, 'font-family')) {
                    family = Dom.getStyle(elm, 'font-family');
                }
                var fn_button = this.toolbar.getButtonByValue('fontname');
                for (var b = 0; b < fn_button._configs.menu.value.length; b++) {
                    if (family && fn_button._configs.menu.value[b].text.toLowerCase() == family.toLowerCase()) {
                        validFont = true;
                        family = fn_button._configs.menu.value[b].text; //Put the proper menu name in the button
                    }
                }
                if (!validFont) {
                    family = fn_button._configs.label._initialConfig.value;
                }
                fn_button.set('label', '<span class="yui-toolbar-fontname-' + _cleanClassName(family) + '">' + family + '</span>');
                this._updateMenuChecked('fontname', family);

                var fs_button = this.toolbar.getButtonByValue('fontsize');
                fontsize = parseInt(Dom.getStyle(elm, 'fontSize'));
                if ((fontsize == null) || isNaN(fontsize)) {
                    fontsize = fs_button._configs.label._initialConfig.value;
                }
                fs_button.set('label', ''+fontsize);

                if (tag.substring(0, 1) == 'h') {
                    var hd_button = this.toolbar.getButtonByValue('heading');
                    for (var b = 0; b < hd_button._configs.menu.value.length; b++) {
                        if (hd_button._configs.menu.value[b].value.toLowerCase() == tag) {
                            hd_button.set('label', hd_button._configs.menu.value[b].text);
                        }
                    }
                    this._updateMenuChecked('heading', tag);
                }
            }
            if (elm && elm.tagName && (elm.tagName.toLowerCase() != 'body')) {
                this.toolbar.enableButton(fn_button);
                this.toolbar.enableButton(fs_button);
            }
        },
        /**
        * @private
        * @method _handleInsertImageClick
        * @description Opens the Image Properties Window when the insert Image button is clicked or an Image is Double Clicked.
        */
        _handleInsertImageClick: function() {
            this.on('afterExecCommand', function() {
                var el = this.currentElement,
                    title = '',
                    src = '',
                    align = '',
                    height = 75,
                    width = 75,
                    padding = 0,
                    win = new YAHOO.widget.EditorWindow('insertimage', {
                        width: '350px'
                    });

                if (!el) {
                    el = this._getSelectedElement();
                }
                if (el) {
                    //el.scrollIntoView(true);
                    if (el.getAttribute('src')) {
                        src = el.getAttribute('src', 2);
                        if (src.indexOf('blankimage.jpg') != -1) {
                            src = 'Image Url Here';
                        }
                    }
                    if (el.getAttribute('alt', 2)) {
                        title = el.getAttribute('alt', 2);
                    }
                    if (el.getAttribute('title', 2)) {
                        title = el.getAttribute('title', 2);
                    }
                    height = parseInt(el.height);
                    width = parseInt(el.width);
                    if (el.style.height) {
                        height = parseInt(el.style.height);
                    }
                    if (el.style.width) {
                        width = parseInt(el.style.width);
                    }
                    if (el.style.margin) {
                        padding = parseInt(el.style.margin);
                    }
                    if (!el._height) {
                        el._height = height;
                    }
                    if (!el._width) {
                        el._width = width;
                    }
                    var oheight = el._height;
                    var owidth = el._width;
                }
                if (!win.cache) {
                    var str = '<label for="insertimage_url"><strong>' + this.STR_IMAGE_URL + ':</strong> <input type="text" id="insertimage_url" value="' + src + '" size="30" tabindex="-1"></label>';
                    var body = document.createElement('div');
                    body.innerHTML = str;

                    var tbarCont = document.createElement('div');
                    tbarCont.id = 'img_toolbar';
                    body.appendChild(tbarCont);

                    var str2 = '<label for="insertimage_title"><strong>' + this.STR_IMAGE_TITLE + ':</strong> <input type="text" id="insertimage_title" value="' + title + '" size="30" tabindex="-1"></label>';
                    var div = document.createElement('div');
                    div.innerHTML = str2;
                    body.appendChild(div);
                    win.cache = body;
                } else {
                    body = win.cache;
                }

                var tbar = new YAHOO.widget.Toolbar(tbarCont, {
                    /* {{{ */ 
                    buttons: [
                        { group: 'padding', label: this.STR_IMAGE_PADDING + ':',
                            buttons: [
                                { type: 'spin', label: ''+padding, value: 'padding', range: [0, 50] }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'border', label: this.STR_IMAGE_BORDER + ':',
                            buttons: [
                                { type: 'select', label: 'Border Size', value: 'bordersize',
                                    menu: [
                                        { text: 'none', value: '0', checked: true },
                                        { text: '----', value: '1' },
                                        { text: '----', value: '2' },
                                        { text: '----', value: '3' },
                                        { text: '----', value: '4' },
                                        { text: '----', value: '5' }
                                    ]
                                },
                                { type: 'select', label: 'Border Type', value: 'bordertype', disabled: true,
                                    menu: [
                                        { text: '----', value: 'solid', checked: true },
                                        { text: '----', value: 'dashed' },
                                        { text: '----', value: 'dotted' }
                                    ]
                                },
                                { type: 'color', label: 'Border Color', value: 'bordercolor', disabled: true }
                            ]
                        },
                        { type: 'separator' },
                        { group: 'textflow', label: this.STR_IMAGE_TEXTFLOW + ':',
                            buttons: [
                                { type: 'push', label: 'Left', value: 'left' },
                                { type: 'push', label: 'Inline', value: 'inline' },
                                { type: 'push', label: 'Block', value: 'block' },
                                { type: 'push', label: 'Right', value: 'right' }
                            ]
                        }
                    ]
                    /* }}} */
                });
                
                var bsize = '0';
                var btype = 'solid';
                if (el.style.borderLeftWidth) {
                    bsize = parseInt(el.style.borderLeftWidth);
                }
                if (el.style.borderLeftStyle) {
                    btype = el.style.borderLeftStyle;
                }
                var bs_button = tbar.getButtonByValue('bordersize');
                var bSizeStr = ((parseInt(bsize) > 0) ? '----' : 'none');
                bs_button.set('label', '<span class="yui-toolbar-bordersize-' + bsize + '">'+bSizeStr+'</span>');
                this._updateMenuChecked('bordersize', bsize, tbar);

                var bs_button = tbar.getButtonByValue('bordertype');
                bs_button.set('label', '<span class="yui-toolbar-bordertype-' + btype + '">----</span>');
                this._updateMenuChecked('bordertype', btype, tbar);
                if (parseInt(bsize) > 0) {
                    tbar.enableButton(tbar.getButtonByValue('bordertype'));
                    tbar.enableButton(tbar.getButtonByValue('bordercolor'));
                }

                var cont = tbar.get('cont');
                var hw = document.createElement('div');
                hw.className = 'yui-toolbar-group yui-toolbar-group-padding height-width';
                hw.innerHTML = '<h3>' + this.STR_IMAGE_SIZE + ':</h3>';
                hw.innerHTML += '<span><input type="text" size="3" value="'+width+'" id="insertimage_width"> x <input type="text" size="3" value="'+height+'" id="insertimage_height"></span><span class="info">' + this.STR_IMAGE_ORIG_SIZE + '<br>'+ owidth +' x ' + oheight + '</span>';
                cont.insertBefore(hw, cont.firstChild);

                Event.onAvailable('insertimage_width', function() {
                    Event.on('insertimage_width', 'blur', function() {
                        var value = parseInt(Dom.get('insertimage_width').value);
                        el.style.width = value + 'px';
                        this.moveWindow();
                    }, this, true);
                }, this, true);
                Event.onAvailable('insertimage_height', function() {
                    Event.on('insertimage_height', 'blur', function() {
                        var value = parseInt(Dom.get('insertimage_height').value);
                        el.style.height = value + 'px';
                        this.moveWindow();
                    }, this, true);
                }, this, true);

                if (el.align == 'right') {
                    tbar.selectButton(tbar.getButtonByValue('right'));
                } else if (el.align == 'left') {
                    tbar.selectButton(tbar.getButtonByValue('left'));
                } else if (el.style.display == 'block') {
                    tbar.selectButton(tbar.getButtonByValue('block'));
                } else {
                    tbar.selectButton(tbar.getButtonByValue('inline'));
                }
                if (parseInt(el.style.marginLeft) > 0) {
                     tbar.getButtonByValue('padding').set('label', ''+parseInt(el.style.marginLeft));
                }
                if (el.style.borderSize) {
                    tbar.selectButton(tbar.getButtonByValue('bordersize'));
                    tbar.selectButton(tbar.getButtonByValue(parseInt(el.style.borderSize)));
                }

                tbar.on('colorPickerClicked', function(o) {
                    var size = '1', type = 'solid', color = 'black';

                    if (el.style.borderLeftWidth) {
                        size = parseInt(el.style.borderLeftWidth);
                    }
                    if (el.style.borderLeftStyle) {
                        type = el.style.borderLeftStyle;
                    }
                    if (el.style.borderLeftColor) {
                        color = el.style.borderLeftColor;
                    }
                    var borderString = size + 'px ' + type + ' #' + o.color;
                    el.style.border = borderString;
                }, this.toolbar, true);

                tbar.on('buttonClick', function(o) {
                    var value = o.button.value;
                    if (o.button.menucmd) {
                        value = o.button.menucmd
                    }
                    var size = '1', type = 'solid', color = 'black';

                    /* All border calcs are done on the left border
                        since our default interface only supports
                        one border size/type and color */
                    if (el.style.borderLeftWidth) {
                        size = parseInt(el.style.borderLeftWidth);
                    }
                    if (el.style.borderLeftStyle) {
                        type = el.style.borderLeftStyle;
                    }
                    if (el.style.borderLeftColor) {
                        color = el.style.borderLeftColor;
                    }
                    switch(value) {
                        case 'bordersize':
                            var borderString = parseInt(o.button.value) + 'px ' + type + ' ' + color;
                            el.style.border = borderString;
                            if (parseInt(o.button.value) > 0) {
                                tbar.enableButton(tbar.getButtonByValue('bordertype'));
                                tbar.enableButton(tbar.getButtonByValue('bordercolor'));
                            } else {
                                tbar.disableButton(tbar.getButtonByValue('bordertype'));
                                tbar.disableButton(tbar.getButtonByValue('bordercolor'));
                            }
                            break;
                        case 'bordertype':
                            var borderString = size + 'px ' + o.button.value + ' ' + color;
                            el.style.border = borderString;
                            break;
                        case 'right':
                        case 'left':
                            tbar.deselectAllButtons();
                            el.style.display = '';
                            el.align = o.button.value;
                            break;
                        case 'inline':
                            tbar.deselectAllButtons();
                            el.style.display = '';
                            el.align = '';
                            break;
                        case 'block':
                            tbar.deselectAllButtons();
                            el.style.display = 'block';
                            el.align = 'center';
                            break;
                        case 'padding':
                            var _button = tbar.getButtonById(o.button.id);
                            el.style.margin = _button.get('label') + 'px';
                            break;
                    }
                    tbar.selectButton(tbar.getButtonByValue(o.button.value));
                    this.moveWindow();
                }, this, true);

                win.setHeader(this.STR_IMAGE_PROP_TITLE);
                win.setBody(body);
                if ((this.browser.webkit && !this.browser.webkit3) || this.browser.opera) {
                    YAHOO.log('Safari 2/Opera 9 warning', 'warn', 'Editor');
                    var str = this.STR_IMAGE_COPY;
                    win.setFooter(str);
                }
                this.openWindow(win);


                //Set event after openWindow..
                Event.onAvailable('insertimage_url', function() {
                    window.setTimeout(function() {
                        YAHOO.util.Dom.get('insertimage_url').focus();
                    }, 50);
                    
                    if (this.get('localFileWarning')) {
                        Event.on('insertimage_url', 'blur', function() {
                            var url = Dom.get('insertimage_url');
                            if ((url.value != '') && ((url.value.indexOf('file:/') != -1) || (url.value.indexOf(':\\') != -1))) {
                                //Local File throw Warning
                                Dom.addClass(url, 'warning');
                                url.focus();
                                url.select();
                                YAHOO.log('Local file reference found, show local warning', 'warn', 'Editor');
                                var str = this.STR_LOCAL_FILE_WARNING;
                                this.get('panel').setFooter(str);
                            } else {
                                Dom.removeClass(url, 'warning');
                                this.get('panel').setFooter(' ');
                                if ((this.browser.webkit && !this.browser.webkit3) || this.browser.opera) {
                                    YAHOO.log('Safari 2/Opera 9 warning', 'warn', 'Editor');
                                    var str = this.STR_IMAGE_COPY;
                                    this.get('panel').setFooter(str);
                                }
                                
                                if (url && url.value) {
                                    this.currentElement.setAttribute('src', url.value);
                                    this.moveWindow();
                                }
                            }
                        }, this, true);
                    }
                }, this, true);
            });
        },
        /**
        * @private
        * @method _handleInsertImageWindowClose
        * @description Handles the closing of the Image Properties Window.
        */
        _handleInsertImageWindowClose: function() {
            var url = Dom.get('insertimage_url');
            var title = Dom.get('insertimage_title');
            var el = this.currentElement;
            if (url && url.value) {
                el.setAttribute('src', url.value);
                el.setAttribute('title', title.value);
                el.setAttribute('alt', title.value);
            } else {
                //No url/src given, remove the node from the document
                el.parentNode.removeChild(el);
            }
        },
        /**
        * @private
        * @method _handleCreateLinkClick
        * @description Handles the opening of the Link Properties Window when the Create Link button is clicked or an href is doubleclicked.
        */
        _handleCreateLinkClick: function() {
            this.on('afterExecCommand', function() {
                var el = this.currentElement,
                    url = '',
                    title = '',
                    target = '';
                if (el) {
                    //el.scrollIntoView(true); //TODO IE Freaks on this..
                    if (el.getAttribute('href') != null) {
                        url = el.getAttribute('href');
                    }
                    if (el.getAttribute('title') != null) {
                        title = el.getAttribute('title');
                    }
                    if (el.getAttribute('target') != null) {
                        target = el.getAttribute('target');
                    }
                }
                var str = '<label for="createlink_url_' + this.get('id') + '"><strong>' + this.STR_LINK_URL + ':</strong> <input type="text" name="createlink_url_' + this.get('id') + '" id="createlink_url_' + this.get('id') + '" value="' + url + '"></label>';
                str += '<label for="createlink_target"><strong>&nbsp;</strong><input type="checkbox" name="createlink_target_' + this.get('id') + '" id="createlink_target_' + this.get('id') + '" value="_blank"' + ((target) ? ' checked' : '') + '> ' + this.STR_LINK_NEW_WINDOW + '</label>';
                str += '<label for="createlink_title"><strong>' + this.STR_LINK_TITLE + ':</strong> <input type="text" name="createlink_title_' + this.get('id') + '" id="createlink_title_' + this.get('id') + '" value="' + title + '"></label>';
                
                var body = document.createElement('div');
                body.innerHTML = str;

                var unlink = document.createElement('a');
                unlink.href = '#';
                unlink.className = 'removeLink';
                unlink.innerHTML = 'Remove link from text';
                Event.on(unlink, 'click', function(ev) {
                    Event.stopEvent(ev);
                    this.execCommand('unlink');
                    this.closeWindow();
                }, this, true);
                body.appendChild(unlink);

                var win = new YAHOO.widget.EditorWindow('createlink', {
                    height: '120px',
                    width: '300px'
                });
                win.setHeader(this.STR_LINK_PROP_TITLE);
                win.setBody(body);
                this.openWindow(win);

                Event.on('createlink_url_' + this.get('id'), 'blur', function() {
                    var url = Dom.get('createlink_url_' + this.get('id'));
                    if ((url.value != '') && ((url.value.indexOf('file:/') != -1) || (url.value.indexOf(':\\') != -1))) {
                        //Local File throw Warning
                        Dom.addClass(url, 'warning');
                        url.focus();
                        url.select();
                        YAHOO.log('Local file reference found, show local warning', 'warn', 'Editor');
                        var str = this.STR_LOCAL_FILE_WARNING;
                        this.get('panel').setFooter(str);
                    } else {
                        Dom.removeClass(url, 'warning');
                        this.get('panel').setFooter(' ');
                    }
                }, this, true);
            });
        },
        /**
        * @private
        * @method _handleCreateLinkWindowClose
        * @description Handles the closing of the Link Properties Window.
        */
        _handleCreateLinkWindowClose: function() {
                var url = Dom.get('createlink_url_' + this.get('id'));
                var target = Dom.get('createlink_target_' + this.get('id'));
                var title = Dom.get('createlink_title_' + this.get('id'));
                var el = this.currentElement;
                if (url && url.value) {
                    var urlValue = url.value;
                    if ((urlValue.indexOf(':/'+'/') == -1) && (urlValue.substring(0,1) != '/') && (urlValue.substring(0, 6).toLowerCase() != 'mailto')) {
                        if ((urlValue.indexOf('@') != -1) && (urlValue.substring(0, 6).toLowerCase() != 'mailto')) {
                            //Found an @ sign, prefix with mailto:
                            urlValue = 'mailto:' + urlValue;
                        } else {
                            /* :// not found adding */
                            urlValue = 'http:/'+'/' + urlValue;
                        }
                    }
                    el.setAttribute('href', urlValue);
                    el.setAttribute('target', ((target.checked) ? target.value : ''));
                    el.setAttribute('title', ((title.value) ? title.value : ''));

                } else {
                    el.removeAttribute('tag');
                    Dom.removeClass(el, 'yui-tag-a');
                    Dom.removeClass(el, 'yui-tag');
                    Dom.addClass(el, 'yui-non');
                }
        },
        /**
        * @method render
        * @description Causes the toolbar and the editor to render and replace the textarea.
        */
        render: function() {
            var self = this;
            var tbarConf = this.get('toolbar');
            //Set the toolbar to disabled until content is loaded
            tbarConf.disabled = true;

            //Create Toolbar instance
            this.toolbar = new Toolbar(this.get('toolbar_cont'), tbarConf);
            YAHOO.log('fireEvent::toolbarLoaded', 'info', 'Editor');
            this.fireEvent('toolbarLoaded', { type: 'toolbarLoaded', target: this.toolbar });
            
            this.toolbar.on('fontsizeClick', function(o) {
                this._handleFontSize(o);
            }, this, true);
            
            this.toolbar.on('colorPickerClicked', function(o) {
                this._handleColorPicker(o);
            }, this, true);

            this.toolbar.on('alignClick', function(o) {
                this._handleAlign(o);
            }, this, true);
            this.on('afterNodeChange', function() {
                this._handleAfterNodeChange();
            }, this, true);
            this.toolbar.on('insertimageClick', function() {
                this._handleInsertImageClick();
            }, this, true);
            this.on('windowinsertimageClose', function() {
                this._handleInsertImageWindowClose();
            }, this, true);
            this.toolbar.on('createlinkClick', function() {
                this._handleCreateLinkClick();
            }, this, true);
            this.on('windowcreatelinkClose', function() {
                this._handleCreateLinkWindowClose();
            }, this, true);


            //Replace Textarea with editable area
            this.get('textarea').parentNode.replaceChild(this.get('element'), this.get('textarea'));


            if (!this.beforeElement) {
                this.beforeElement = document.createElement('h2');
                this.beforeElement.className = 'yui-editor-skipheader';
                this.beforeElement.tabIndex = '-1';
                this.beforeElement.innerHTML = this.STR_BEFORE_EDITOR;
                this.insertBefore(this.beforeElement, this.toolbar.get('nextSibling'));
            }

            this.appendChild(this.get('textarea'));
            Dom.setStyle(this.get('textarea'), 'display', 'none');

            //Set height and width of editor container
            this.setStyle('width', this.get('width'));
            Dom.setStyle(this.get('iframe').get('parentNode'), 'height', this.get('height'));

            this.get('iframe').setStyle('width', '99%');
            this.get('iframe').setStyle('height', '100%');

            //Set display to show it
            this.setStyle('display', 'block');

            var self = this;
            window.setTimeout(function() {
                self._setInitialContent.call(self);
            }, 10);
            this.fireEvent('afterRender', { type: 'afterRender', target: this });
        },
        /**
        * @method execCommand
        * @param {String} action The "execCommand" action to try to execute (Example: bold, insertimage, inserthtml)
        * @param {String} value (optional) The value for a given action such as action: fontname value: 'Verdana'
        * @description This method attempts to try and level the differences in the various browsers and their support for execCommand actions
        */
        execCommand: function(action, value) {
            this.fireEvent('beforeExecCommand', { type: 'beforeExecCommand', target: this, args: arguments });
            if (this.STOP_EXEC_COMMAND) {
                this.STOP_EXEC_COMMAND = false;
                return false;
            }
            this._setMarkupType(action);

            if (!value) {
                //value = this._getSelection();
            }
            var exec = true;
            var _sel = this._getSelection();
            var _range = this._getRange();
            var _selEl = this._getSelectedElement();
            if (_selEl) {
                _sel = _selEl;
            }
            switch (action.toLowerCase()) {
                case 'heading':
                    if (value == 'none') {
                        if ((_sel && _sel.tagName && (_sel.tagName.toLowerCase().substring(0,1) == 'h')) || (_sel && _sel.parentNode && _sel.parentNode.tagName && (_sel.parentNode.tagName.toLowerCase().substring(0,1) == 'h'))) {
                            if (_sel.parentNode.tagName.toLowerCase().substring(0,1) == 'h') {
                                _sel = _sel.parentNode;
                            }
                            var _span = this._getDoc().createElement('span');
                            _span.className = 'yui-non';
                            _span.innerHTML = _sel.innerHTML;
                            _sel.parentNode.replaceChild(_span, _sel);
                        }
                        exec = false;
                    }
                    if (this.browser.webkit && !this._getDoc().queryCommandEnabled(action) && exec) {
                        this.createCurrentElement(value);
                        var _sub = this._getDoc().createElement(value);
                        _sub.innerHTML = this.currentElement.innerHTML;
                        this.currentElement.parentNode.replaceChild(_sub, this.currentElement);
                    }
                    break;
                case 'backcolor':
                    if (this.browser.gecko || this.browser.opera) {
                        this._setEditorStyle(true);
                        action = 'hilitecolor';
                    }
                    break;
                case 'hiddenelements':
                    this._showHidden();
                    exec = false;
                    break;
                case 'unlink':
                    var el = this._getSelectedElement();
                    el.removeAttribute('title');
                    el.removeAttribute('tag');
                    el.removeAttribute('target');
                    el.removeAttribute('href');
                    Dom.addClass(el, 'yui-non');
                    Dom.removeClass(el, 'yui-tag-a');
                    Dom.removeClass(el, 'yui-tag');
                    exec = false;
                    break;
                case 'createlink':
                    var el = this._getSelectedElement();
                    if (!el || (el.getAttribute('tag') != 'a')) {
                        this.createCurrentElement('a');
                    } else {
                        this.currentElement = el;
                    }
                    exec = false;
                    break;
                case 'insertimage':
                    if (value == '') {
                        //TODO URL
                        value = 'css/blankimage.jpg';
                    }
                    /**
                    * @knownissue
                    * @browser Safari 2.x
                    * @description The issue here is that we have no way of knowing where the cursor position is
                    * inside of the iframe, so we have to place the newly inserted data in the best place that we can.
                    */
                    
                    var el = this._getSelectedElement();
                    if (!el || (el.tagName && (el.tagName.toLowerCase() != 'img'))) {
                        if (!this._getDoc().queryCommandEnabled(action)) {
                            this.createCurrentElement('img');
                            var _img = this._getDoc().createElement('img');
                            _img.setAttribute('src', value);
                            Dom.addClass(_img, 'yui-img');
                            this.currentElement.parentNode.replaceChild(_img, this.currentElement);
                            this.currentElement = _img;
                            exec = false;
                        } else {
                            this._getDoc().execCommand('insertimage', false, value);
                            var imgs = this._getDoc().getElementsByTagName('img');
                            for (var i = 0; i < imgs.length; i++) {
                                if (!Dom.hasClass(imgs[i], 'yui-img')) {
                                    Dom.addClass(imgs[i], 'yui-img');
                                    this.currentElement = imgs[i];
                                }
                            }
                            exec = false;
                        }
                    } else {
                        this.currentElement = el;
                        exec = false;
                    }
                    
                    break;
                case 'inserthtml':
                    /**
                    * @knownissue
                    * @browser Safari 2.x
                    * @description The issue here is that we have no way of knowing where the cursor position is
                    * inside of the iframe, so we have to place the newly inserted data in the best place that we can.
                    */
                    if (this.browser.webkit && !this._getDoc().queryCommandEnabled(action)) {
                        YAHOO.log('More Safari DOM tricks (inserthtml)', 'info', 'EditorSafari');
                        this.createCurrentElement('img');
                        var _span = this._getDoc().createElement('span');
                        _span.innerHTML = value;
                        this.currentElement.parentNode.replaceChild(_span, this.currentElement);
                        exec = false;
                    }
                    break;
                case 'removeformat':
                    /**
                    * @knownissue Remove Format issue
                    * @browser Safari 2.x
                    * @description There is an issue here with Safari, that it may not always remove the format of the item that is selected.
                    * Due to the way that Safari 2.x handles ranges, it is very difficult to determine what the selection holds.
                    * So here we are making the best possible guess and acting on it.
                    */
                    if (this.browser.webkit && !this._getDoc().queryCommandEnabled(action)) {
                        this.createCurrentElement('span');
                        Dom.addClass(this.currentElement, 'yui-non');
                        var re= /<\S[^><]*>/g;
                        var str = this.currentElement.innerHTML.replace(re, '');
                        var _txt = this._getDoc().createTextNode(str);
                        this.currentElement.parentNode.parentNode.replaceChild(_txt, this.currentElement.parentNode);
                        
                        exec = false;
                    }
                    break;
                case 'superscript':
                case 'subscript':
                    if (this.browser.webkit) {
                        YAHOO.log('Safari dom fun again (' + action + ')..', 'info', 'EditorSafari');
                        var tag = action.toLowerCase().substring(0, 3);
                        this.createCurrentElement(tag);
                        if (this.currentElement.parentNode.tagName.toLowerCase() == tag) {
                            YAHOO.log('we are a child of tag (' + tag + '), reverse process', 'info', 'EditorSafari');
                            var span = this._getDoc().createElement('span');
                            span.innerHTML = this.currentElement.innerHTML;
                            Dom.addClass(span, 'yui-non');
                            this.currentElement.parentNode.parentNode.replaceChild(span, this.currentElement.parentNode);

                        } else {
                            var _sub = this._getDoc().createElement(tag);
                            _sub.innerHTML = this.currentElement.innerHTML;
                            this.currentElement.parentNode.replaceChild(_sub, this.currentElement);
                        }
                        exec = false;
                    }
                    break;
                case 'formatblock':
                    value = 'blockquote';
                    if (this.browser.webkit) {
                        this.createCurrentElement('blockquote');
                        if (Dom.hasClass(this.currentElement.parentNode, 'yui-tag-blockquote')) {
                            YAHOO.log('We have a blockquote inside a blockquote, remove formatting', 'info', 'Editor');
                            var span = this._getDoc().createElement('span');
                            span.innerHTML = this.currentElement.innerHTML;
                            Dom.addClass(span, 'yui-non');
                            this.currentElement.parentNode.parentNode.replaceChild(span, this.currentElement.parentNode);
                        }
                        exec = false;
                    } else {
                        var tar = Event.getTarget(this.currentEvent);
                        if (tar && tar.tagName && (tar.tagName.toLowerCase() == 'blockquote')) {
                            YAHOO.log('We have a blockquote inside a blockquote, remove formatting', 'info', 'Editor');
                            var span = this._getDoc().createElement('span');
                            span.innerHTML = tar.innerHTML;
                            Dom.addClass(span, 'yui-non');
                            tar.parentNode.replaceChild(span, tar);
                            exec = false;
                        }
                    }
                    break;
                case 'indent':
                case 'outdent':
                    this.createCurrentElement(action.toLowerCase());
                    if (this.currentElement.parentNode) {
                        if (action.toLowerCase() == 'outdent') {
                            YAHOO.log('We have an outdent, check to see if we are in an indent', 'info', 'Editor');
                            if (Dom.hasClass(this.currentElement.parentNode, 'yui-tag-indent')) {
                                YAHOO.log('We have an indent, remove formatting', 'info', 'Editor');
                                var span = this._getDoc().createElement('span');
                                span.innerHTML = this.currentElement.innerHTML;
                                Dom.addClass(span, 'yui-non');
                                this.currentElement.parentNode.parentNode.replaceChild(span, this.currentElement.parentNode);
                            }
                        }
                    }
                    exec = false;
                    break;
                case 'insertorderedlist':
                case 'insertunorderedlist':
                    /**
                    * @knownissue Safari 2.+ doesn't support ordered and unordered lists
                    * @browser Safari 2.x
                    * The issue with this workaround is that when applied to a set of text
                    * that has BR's in it, Safari may or may not pick up the individual items as
                    * list items. This is fixed in WebKit (Safari 3)
                    */
                    var tag = ((action.toLowerCase() == 'insertorderedlist') ? 'ol' : 'ul');
                    if (this.browser.webkit && !this._getDoc().queryCommandEnabled(action)) {
                        var selEl = this._getSelectedElement();
                        if ((selEl.tagName.toLowerCase() == 'li') && (selEl.parentNode.tagName.toLowerCase() == tag)) {
                            YAHOO.log('We already have a list, undo it', 'info', 'Editor');
                            var el = selEl.parentNode;
                            var list = this._getDoc().createElement('span');
                            Dom.addClass(list, 'yui-non');
                            var str = '';
                            var lis = el.getElementsByTagName('li');
                            for (var i = 0; i < lis.length; i++) {
                                str += lis[i].innerHTML + '<br>';
                            }
                            list.innerHTML = str;
                        } else {
                            YAHOO.log('Fun Dom write for Safari', 'info', 'Editor');
                            this.createCurrentElement(action.toLowerCase());
                            var el = this.currentElement;
                            var list = this._getDoc().createElement(tag);
                            if (tag == 'ol') {
                                list.type = value;
                            }
                            var li = this._getDoc().createElement('li');
                            li.innerHTML = el.innerHTML + '&nbsp;';
                            list.appendChild(li);
                        }
                        el.parentNode.replaceChild(list, el);
                        exec = false;
                    } else {
                        exec = false;
                        var el = this._getSelectedElement();
                        if ((el.tagName.toLowerCase() == 'li') && (tag == 'ol')) { //we are in a list..
                            el = el.parentNode;
                        } else {
                            this._getDoc().execCommand(action, '', value);
                            var el = this._getSelectedElement();
                            if (el.tagName.toLowerCase() == 'li') {
                                el = el.parentNode;
                            }
                        }
                        if (tag == 'ol') {
                            if (el.type == value) {
                                //Undo the list
                                this._getDoc().execCommand(action, '', value);
                            } else {
                                el.type = value;
                            }
                        }
                    }
                    break;
                case 'fontname':
                    var selEl = this._getSelectedElement();
                    if (selEl && selEl.tagName && (this._getSelection() == '')) {
                        Dom.setStyle(selEl, 'font-family', value);
                        exec = false;
                    }
                    break;
                case 'fontsize':
                    var selEl = this._getSelectedElement();
                    if (selEl && selEl.tagName && (this._getSelection() == '')) {
                        Dom.setStyle(selEl, 'fontSize', value);
                    } else {
                        this.createCurrentElement('span', {'fontSize': value });
                    }
                    exec = false;
                    break;
            }
            if (exec) {
                YAHOO.log('execCommand::(' + action + '), (' + value + ')', 'info', 'Editor');
                try {
                    if (this._getDoc().queryCommandEnabled(action)) {
                        this._getDoc().execCommand(action, false, value);
                    } else {
                        YAHOO.log('queryCommandEnabled Failed', 'error', 'Editor');
                    }
                } catch(e) {
                    YAHOO.log('execCommand Failed', 'error', 'Editor');
                }
            } else {
                YAHOO.log('OVERRIDE::execCommand skipped', 'warn', 'Editor');
            }
            this.on('afterExecCommand', function() {
                this.unsubscribeAll('afterExecCommand');
                this.nodeChange();
            });
            this.fireEvent('afterExecCommand', { type: 'afterExecCommand', target: this });
            
        },
        /**
        * @method createCurrentElement
        * @param {String} tagName (optional defaults to a) The tagname of the element that you wish to create
        * @param {Object} tagStyle (optional) Object literal containing styles to apply to the new element.
        * @description This is a work around for the various browser issues with execCommand. This method will run execCommand('fontname', false, 'yui-tmp') on the given selection.
        * it will then search the document for a span with the font-family set to yui-tmp and replace that with another span that has other information in it. The assign the new span to
        * this.currentElement, so we now have an element reference to the element that was just modified. So then we can use standard DOM manipulation to change it as we see fit.
        */
        createCurrentElement: function(tagName, tagStyle) {
            var tagName = ((tagName) ? tagName : 'a'),
                sel = this._getSelection(),
                tar = null,
                el = null,
                _doc = this._getDoc();

            var _elCreate = function() {
                var el = _doc.createElement('span');
                YAHOO.util.Dom.addClass(el, 'yui-tag-' + tagName);
                YAHOO.util.Dom.addClass(el, 'yui-tag');
                el.setAttribute('tag', tagName);
                for (var i in tagStyle) {
                    el.style[i] = tagStyle[i];
                }
                return el;
            };

            if (sel == '') {
                if (this._getDoc().queryCommandEnabled('insertimage')) {
                    this._getDoc().execCommand('insertimage', false, 'yui-tmp-img');
                    var imgs = this._getDoc().getElementsByTagName('img');
                    for (var i = 0; i < imgs.length; i++) {
                        if (imgs[i].getAttribute('src') == 'yui-tmp-img') {
                            el = _elCreate();
                            imgs[i].parentNode.replaceChild(el, imgs[i]);
                            this.currentElement = el;
                            return true;
                        }
                    }
                } else {
                    if (this.currentEvent) {
                        tar = Event.getTarget(this.currentEvent);
                    }
                }
                if (tar) {
                    /**
                    * @knownissue
                    * @browser Safari 2.x
                    * @description The issue here is that we have no way of knowing where the cursor position is
                    * inside of the iframe, so we have to place the newly inserted data in the best place that we can.
                    */
                    el = _elCreate();
                    if (tar.tagName.toLowerCase() == 'body') {
                        tar.appendChild(el);
                    } else if (tar.nextSibling) {
                        tar.parentNode.insertBefore(el, tar.nextSibling);
                    } else {
                        tar.parentNode.appendChild(el);
                    }
                    this.currentElement = el;
                }
            } else {
                //Force CSS Styling for this action...
                this._setEditorStyle(true);
                this._getDoc().execCommand('fontname', false, 'yui-tmp');
                var _tmp = [];
                var _tmp1 = this._getDoc().getElementsByTagName('font');
                var _tmp2 = this._getDoc().getElementsByTagName(this._getSelectedElement().tagName);
                var _tmp3 = this._getDoc().getElementsByTagName('span');
                for (var e = 0; e < _tmp1.length; e++) {
                    _tmp[_tmp.length] = _tmp1[e];
                }
                for (var e = 0; e < _tmp2.length; e++) {
                    _tmp[_tmp.length] = _tmp2[e];
                }
                for (var e = 0; e < _tmp3.length; e++) {
                    _tmp[_tmp.length] = _tmp3[e];
                }
                for (var i = 0; i < _tmp.length; i++) {
                    if ((Dom.getStyle(_tmp[i], 'font-family') == 'yui-tmp') || (_tmp[i].face && (_tmp[i].face == 'yui-tmp'))) {
                        var el = _elCreate();
                        el.innerHTML = _tmp[i].innerHTML;
                        if (_tmp[i].parentNode) {
                            _tmp[i].parentNode.replaceChild(el, _tmp[i]);
                            this.currentElement = el;
                        }
                    }
                }
            }
        },
        /**
        * @method saveHTML
        * @description Cleans the HTML with the cleanHTML method then places that string back into the textarea.
        */
        saveHTML: function() {
            var html = this.cleanHTML();
            this.get('textarea').value = html;
        },
        /**
        * @method getEditorHTML
        * @description Get's the unprocessed/unfiltered HTML from the editor
        */
        getEditorHTML: function() {
            return this._getDoc().body.innerHTML;
        },
        /**
        * @method cleanHTML
        * @param {String} html the unfiltered HTML
        * @description Process the HTML with a few regexes to clean it up and stabalize the output
        * @returns {String} The filtered HTML
        */
        cleanHTML: function(html) {
            //Start Filtering Output
            //Begin RegExs..
            if (!html) { 
                var html = this.getEditorHTML();
            }
            //Make some backups...
            //TODO Cache Regexes..
		    html = html.replace(/<div><br><\/div>/gi, '<YUI_BR>');
		    html = html.replace(/<p>(&nbsp;|&#160;)<\/p>/g, '<YUI_BR>');            
		    html = html.replace(/<p><br>&nbsp;<\/p>/gi, '<YUI_BR>');
		    html = html.replace(/<p>&nbsp;<\/p>/gi, '<YUI_BR>');
		    html = html.replace(/<br class="khtml-block-placeholder">/gi, '<YUI_BR>');
		    html = html.replace(/<br>/gi, '<YUI_BR>');
		    html = html.replace(/<br\/>/gi, '<YUI_BR>');
		    html = html.replace(/<img([^>]*)>/gi, '<YUI_IMG$1>');
		    html = html.replace(/<ul([^>]*)>/gi, '<YUI_UL$1>');
		    html = html.replace(/<\/ul>/gi, '<\/YUI_UL>');

            //Convert b and i tags to strong and em tags
		    html = html.replace(/<i([^>]*)>/gi, '<em$1>');
		    html = html.replace(/<\/i>/gi, '</em>');
		    html = html.replace(/<b([^>]*)>/gi, '<strong$1>');
		    html = html.replace(/<\/b>/gi, '</strong>');

		    html = html.replace(/<font/gi, '<font');
		    html = html.replace(/<\/font>/gi, '</font>');
		    html = html.replace(/<u/gi, '<u');
		    html = html.replace(/\/u>/gi, '/u>');

		    html = html.replace(/<ol([^>]*)>/gi, '<ol$1>');
		    html = html.replace(/\/ol>/gi, '/ol>');
		    html = html.replace(/<li/gi, '<li');
		    html = html.replace(/\/li>/gi, '/li>');

            //Handle the sudo A tags
            html = html.replace(new RegExp('<span ([^>]*) tag="a" ([^>]*)>([^>]*)<\/span>', 'gi'), '<a $1 $2>$3</a>');

            //Safari only regexes
            if (this.browser.webkit) {
                //<DIV><SPAN class="Apple-style-span" style="line-height: normal;">Test THis</SPAN></DIV>
                html = html.replace(/Apple-style-span/gi, '');
                html = html.replace(/style="line-height: normal;"/gi, '');
            }

            //yui-tag-a yui-tag yui-non yui-img
		    html = html.replace(/yui-tag-a/gi, '');
		    html = html.replace(/yui-tag/gi, '');
		    html = html.replace(/yui-non/gi, '');
		    html = html.replace(/yui-img/gi, '');
		    html = html.replace(/ class=""/gi, '');
		    html = html.replace(/ class=" "/gi, '');
		    html = html.replace(/ class="  "/gi, '');
		    html = html.replace(/ target=""/gi, '');
		    html = html.replace(/ title=""/gi, '');

            //Other string cleanup
		    html = html.replace(/<br><li/gi, '<li');
            //<P><br>&nbsp;</P>
		    //html = html.replace(/<span >([^>]*)<\/span>/gi, '$1');
		    //html = html.replace(/<div>([^>]*)<\/div>/gi, '$1');
            
            
            //Replace our backups with the real thing
		    html = html.replace(/<YUI_BR>/g, '<br>');
		    html = html.replace(/<YUI_IMG([^>]*)>/g, '<img$1>');
		    html = html.replace(/<YUI_UL([^>]*)>/g, '<ul$1>');
		    html = html.replace(/<\/YUI_UL>/g, '<\/ul>');

            return html;
        },
        /**
        * @method clearEditorDoc
        * @description Clear the doc of the Editor
        */
        clearEditorDoc: function() {
            this._getDoc().body.innerHTML = '&nbsp;';
        },
        /**
        * @private
        * @method _renderPanel
        * @description Renders the panel used for Editor Windows to the document so we can start using it..
        * @returns {YAHOO.widget.Overlay}
        */
        _renderPanel: function() {
            if (!YAHOO.widget.EditorInfo.panel) {
                var panel = new YAHOO.widget.Overlay(this.EDITOR_PANEL_ID, {
                    width: '300px',
                    iframe: true,
                    visible: false,
                    underlay: 'none'
                });
                YAHOO.widget.EditorInfo.panel = panel;
            } else {
                var panel = YAHOO.widget.EditorInfo.panel;
            }
            this.set('panel', panel);

            //TODO: Debugging code here
            this.get('panel').setBody('this is the content of the window. Edit as you like!!');
            this.get('panel').setHeader(' ');
            this.get('panel').setFooter(' ');
            this.get('panel').render(document.body);
            this.get('panel').cfg.setProperty('xy', Dom.getXY(this.get('iframe').get('parentNode')));
            Dom.addClass(this.get('panel').element, 'yui-editor-panel');
            this.get('panel').showEvent.subscribe(function() {
                YAHOO.util.Dom.setStyle(this.element, 'display', 'block');
            });
            return this.get('panel');
        },
        /**
        * @method openWindow
        * @param {YAHOO.widget.EditorWindow} win A YAHOO.widget.EditorWindow instance
        * @description Open a new "window/panel"
        */
        openWindow: function(win) {
            if (YAHOO.widget.EditorInfo.window.win && YAHOO.widget.EditorInfo.window.scope) {
                YAHOO.widget.EditorInfo.window.scope.closeWindow.call(YAHOO.widget.EditorInfo.window.scope);
            }
            YAHOO.widget.EditorInfo.window.win = win;
            YAHOO.widget.EditorInfo.window.scope = this;

            var self = this,
                xy = Dom.getXY(this.currentElement),
                elXY = Dom.getXY(this.get('iframe').get('element')),
                panel = this.get('panel'),
                newXY = [(xy[0] + elXY[0] - 20), (xy[1] + elXY[1] + 10)],
                wWidth = (parseInt(win.attrs.width) / 2),
                align = 'center';

            this.fireEvent('beforeOpenWindow', { type: 'beforeOpenWindow', win: win, panel: panel });

            body = document.createElement('div');
            form = document.createElement('form');
            form.setAttribute('method', 'GET');
            var windowName = win.name;
            Event.addListener(form, 'submit', function(ev) {
                var evName = 'window' + windowName + 'Submit';
                self.fireEvent(evName, { type: evName, target: this });
                Event.stopEvent(ev);
            }, this, true);
            body.appendChild(form);

            Dom.setStyle(panel.element.firstChild, 'width', win.attrs.width);
            if (Lang.isObject(win.body)) { //Assume it's a reference
                form.appendChild(win.body);
            } else { //Assume it's a string
                var _tmp = document.createElement('div');
                _tmp.innerHTML = win.body;
                form.appendChild(_tmp);
            }
            var _close = document.createElement('span');
            _close.innerHTML = 'X';
            _close.className = 'close';
            Event.addListener(_close, 'click', function() {
                self.closeWindow();
            });
            var _knob = document.createElement('span');
            _knob.innerHTML = '^';
            _knob.className = 'knob';
            win._knob = _knob;

            panel.cfg.setProperty('width', win.attrs.width);
            panel.setHeader(' '); //Clear the current header
            panel.setHeader(win.header);
            panel.appendToHeader(_close);
            panel.appendToHeader(_knob);
            panel.setBody(' '); //Clear the current body
            panel.setFooter(' '); //Clear the current footer
            if (win.footer != null) {
                panel.setFooter(win.footer);
            }
            panel.appendToBody(body); //Append the new DOM node to it
            panel.showEvent.subscribe(function() {
                Event.addListener(panel.element, 'click', function(ev) {
                    Event.stopPropagation(ev);
                });
            }, this, true);
            panel.hideEvent.subscribe(function() {
                panel.hideEvent.unsubscribeAll();            
                self.currentWindow = null;
                var evName = 'window' + windowName + 'Close';
                self.fireEvent(evName, { type: evName, target: this });

            }, this, true);
            this.currentWindow = win;
            this.moveWindow(true);
            panel.show();
            this.fireEvent('afterOpenWindow', { type: 'afterOpenWindow', win: win, panel: panel });
        },
        /**
        * @method moveWindow
        * @param {Boolean} force Boolean to tell it to move but not use any animation (Usually done the first time the window is loaded.)
        * @description Realign the window with the currentElement and reposition the knob above the panel.
        */
        moveWindow: function(force) {
            var win = this.currentWindow,
                xy = Dom.getXY(this.currentElement),
                elXY = Dom.getXY(this.get('iframe').get('element')),
                panel = this.get('panel'),
                newXY = [(xy[0] + elXY[0] - 20), (xy[1] + elXY[1] + 10)],
                wWidth = (parseInt(win.attrs.width) / 2),
                align = 'center',
                orgXY = panel.cfg.getProperty('xy'),
                _knob = win._knob;

            newXY[0] = ((newXY[0] - wWidth) + 20);
            //Account for the Scroll bars in a scrolled editor window.
            newXY[0] = newXY[0] - Dom.getDocumentScrollLeft(this._getDoc());
            newXY[1] = newXY[1] - Dom.getDocumentScrollTop(this._getDoc());
            


            if (this.currentElement.tagName && (this.currentElement.tagName.toLowerCase() == 'img')) {
                if (this.currentElement.src.indexOf('blankimage') != -1) {
                    newXY[0] = (newXY[0] + (75 / 2)); //Placeholder size
                    newXY[1] = (newXY[1] + 75); //Placeholder sizea
                } else {
                    var w = parseInt(this.currentElement.width);
                    var h = parseInt(this.currentElement.height);
                    newXY[0] = (newXY[0] + (w / 2));
                    newXY[1] = (newXY[1] + h);
                }
                newXY[1] = newXY[1] + 15;
            } else {
                if (Dom.getStyle(this.currentElement, 'fontSize').indexOf('px') != -1) {
                    newXY[1] = newXY[1] + parseInt(Dom.getStyle(this.currentElement, 'fontSize')) + 5;
                } else {
                    newXY[1] = newXY[1] + 20;
                }
            }
            if (newXY[0] < elXY[0]) {
                newXY[0] = elXY[0] + 5;
                align = 'left';
            }

            if ((newXY[0] + (wWidth * 2)) > (elXY[0] + parseInt(this.get('iframe').get('element').clientWidth))) {
                newXY[0] = ((elXY[0] + parseInt(this.get('iframe').get('element').clientWidth)) - (wWidth * 2) - 5);
                align = 'right';
            }
            
            var xDiff = (newXY[0] - orgXY[0]);
            var yDiff = (newXY[1] - orgXY[1]);
            
            //Convert zegative numbers to positive so we can get the difference in distance
            xDiff = ((xDiff < 0) ? (xDiff * -1) : xDiff);
            yDiff = ((yDiff < 0) ? (yDiff * -1) : yDiff);

            if (((xDiff > 10) || (yDiff > 10)) || force) { //Only move the window if it's supposed to move more than 10px or force was passed (new window)
                var _knobLeft = null;

                if (align == 'center') {
                    _knobLeft = (parseInt(win.attrs.width) / 2);
                } else if (align == 'right') {
                    _knobLeft = (xy[0] - newXY[0]);
                    if (this.currentElement.width) {
                        _knobLeft = _knobLeft + (parseInt(this.currentElement.width) / 2);
                    }
                } else {
                    var leftOffset = (xy[0] - newXY[0]);
                    if (leftOffset < newXY[0]) {
                        leftOffset = newXY[0];
                    }
                    if (this.currentElement.width) {
                        _knobLeft = leftOffset + (parseInt(this.currentElement.width) / 2);
                    } else {
                        _knobLeft = leftOffset;
                    }
                }
                if (force) {
                    _knob.style.left = _knobLeft + 'px';
                    if (this.get('animate')) {
                        Dom.setStyle(panel.element, 'opacity', '0');
                        var anim = new YAHOO.util.Anim(panel.element, {
                            opacity: {
                                from: 0,
                                to: 1
                            }
                        }, .1, YAHOO.util.Easing.easeOut);
                        panel.cfg.setProperty('xy', newXY);
                        anim.animate();
                    } else {
                        panel.cfg.setProperty('xy', newXY);
                    }
                } else {
                    if (this.get('animate')) {
                        var anim = new YAHOO.util.Anim(panel.element, {}, .5, YAHOO.util.Easing.easeOut);
                        anim.attributes = {
                            top: {
                                to: newXY[1]
                            },
                            left: {
                                to: newXY[0]
                            }
                        }
                        anim.onComplete.subscribe(function() {
                            panel.cfg.setProperty('xy', newXY);
                        });
                        //We have to animate the iframe shim at the same time as the panel or we get scrollbar bleed ..
                        var iframeAnim = new YAHOO.util.Anim(panel.iframe, anim.attributes, .5, YAHOO.util.Easing.easeOut)

                        var _knobAnim = new YAHOO.util.Anim(_knob, {
                            left: {
                                to: _knobLeft
                            }
                        }, .75, YAHOO.util.Easing.easeOut);
                        anim.animate();
                        iframeAnim.animate();
                        _knobAnim.animate();
                    } else {
                        _knob.style.left = _knobLeft + 'px';
                        panel.cfg.setProperty('xy', newXY);
                    }
                }
            }
        },
        /**
        * @method closeWindow
        * @description Close the current;y open EditorWindow.
        */
        closeWindow: function() {
            YAHOO.widget.EditorInfo.window = {};
            this.fireEvent('closeWindow', { type: 'closeWindow', win: this.currentWindow });
            this.currentWindow = null;
            this.get('panel').hide();
            this.get('panel').cfg.setProperty('xy', [-900,-900]);
            this.unsubscribeAll('afterExecCommand');
        },
        /**
        * @method toString
        * @description Returns a string representing the editor.
        * @return {String}
        */
        toString: function() {
            return 'Editor (#' + this.get('element').id + ')' + ((this.get('disabled') ? ' Disabled' : ''));
        }
    });


    /**
     * @description Singleton object used to track the open window objects and panels across the various open editors
     * @class EditorInfo
     * @static
    */
    YAHOO.widget.EditorInfo = {
        /**
        * @private
        * @property window
        * @description A reference to the currently open window object in any editor on the page.
        * @type {Object} YAHOO.widget.EditorWindow
        */
        window: {},
        /**
        * @private
        * @property window
        * @description A reference to the currently open panel in any editor on the page.
        * @type {Object} YAHOO.widget.Overlay
        */
        panel: null
    }

    /**
     * @description Class to hold Window information between uses. We use the same panel to show the windows, so using this will allow you to configure a window before it is shown.
     * This is what you pass to Editor.openWindow();. These parameters will not take effect until the openWindow() is called in the editor.
     * @class EditorWindow
     * @param {String} name The name of the window.
     * @param {Object} attrs Attributes for the window.
     * Current attributes used are : height and width
    */
    YAHOO.widget.EditorWindow = function(name, attrs) {
        this.name = name.replace(' ', '_');
        this.attrs = attrs;
    }

    YAHOO.widget.EditorWindow.prototype = {
        /**
        * @private
        * @property _cache
        * @description Holds a cache of the DOM for the window so we only have to build it once..
        */
        _cache: null,
        /**
        * @private
        * @property header
        * @description Holder for the header of the window, used in Editor.openWindow
        */
        header: null,
        /**
        * @private
        * @property body
        * @description Holder for the body of the window, used in Editor.openWindow
        */
        body: null,
        /**
        * @private
        * @property footer
        * @description Holder for the footer of the window, used in Editor.openWindow
        */
        footer: null,
        /**
        * @method setHeader
        * @description Sets the header for the window.
        */
        setHeader: function(str) {
            this.header = str;
        },
        /**
        * @method setBody
        * @description Sets the body for the window.
        */
        setBody: function(str) {
            this.body = str;
        },
        /**
        * @method setFooter
        * @description Sets the footer for the window.
        */
        setFooter: function(str) {
            this.footer = str;
        },
        /**
        * @method toString
        * @description Returns a string representing the EditorWindow.
        * @return {String}
        */
        toString: function() {
            return 'Editor Window (' + this.name + ')';
        }
    };
    
})();