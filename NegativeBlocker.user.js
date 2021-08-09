// ==UserScript==
// @name           NegativeBlocker
// @namespace      mx5vrota63
// @version        0.1.0
// @description    Use the configured negative word or url to replace the sentence or block the element.
// @description:ja 設定した ネガティブワード または URL を使用して、文章を置換えたり、要素をブロックします。
// @author         mx5vrota63
// @match          *://*/*
// @run-at         document-start
// @grant          GM.getValue
// @grant          GM_getValue
// @grant          GM.setValue
// @grant          GM_setValue
// @grant          GM.deleteValue
// @grant          GM_deleteValue
// @grant          GM.listValues
// @grant          GM_listValues
// @grant          GM.registerMenuCommand
// @grant          GM_registerMenuCommand
// @grant          unsafeWindow
// ==/UserScript==

(async () => {
    'use strict';

    let divElement_RootShadow;
    let settingsbox_Element;
    let DashboardMain_div;
    let settingsbox_2_ele_stack = new Array();
    let settingbuttonEle;
    let BlockCounter = 0;
    let readyStateCheckInterval;

    let WebAbronTempDisableArrayElement = new Array();
    let WebAbronExecuteResult = new Array();
    let WebAbronDuplicateString = new Array();
    let ElementBlockerExecuteResult = new Object();

    let NGListStorage;
    let WebAbronStorage;
    let ElementBlockerStorage;
    let WebAbronTempDisableArray;
    let PreferenceSetting;

    async function StorageApiRead(keyname) {
        let StorageValue;
        try {
            // eslint-disable-next-line no-undef
            StorageValue = await GM.getValue(keyname);
        } catch (e) {
            console.error(e);
            console.log("GM Function Not Detected");
            try {
                let value_data
                // eslint-disable-next-line no-undef
                chrome.storage.local.get(keyname, (value) => {
                    value_data = value[keyname];
                });
                return value_data;
            } catch (e) {
                console.error(e);
                console.log("Chrome API Not Detected");
                StorageValue = undefined;
            }
        }
        return StorageValue;

        // debug only WeblocalStorage
        /*
        try {
            StorageValue = localStorage.getItem(keyname);
        } catch (e) {
            console.error(e);
            console.log("localStorage API Not Detected");
        }
        */
    }
    async function StorageApiWrite(keyname, setvalue) {
        try {
            // eslint-disable-next-line no-undef
            await GM.setValue(keyname, setvalue);
            return true;
        } catch (e) {
            console.error(e);
            console.log("GM Function Not Detected");
            try {
                // eslint-disable-next-line no-undef
                chrome.storage.local.set({ keyname: setvalue });
                return true;
            } catch (e) {
                console.error(e);
                console.log("Chrome API Not Detected");
                return false;
            }
        }

        // debug only WeblocalStorage
        /*
        try {
            localStorage.setItem(keyname, value);
            return true;
        } catch (e) {
            console.error(e);
            console.log("localStorage API Not Detected");
            return false;
        }
        */

    }
    async function StorageApiDelete(keyname) {
        try {
            // eslint-disable-next-line no-undef
            await GM.deleteValue(keyname);
            return true;
        } catch (e) {
            console.error(e);
            console.log("GM Function Not Detected");
            return false;
        }
    }
    async function StorageApiKeynamelist() {
        try {
            // eslint-disable-next-line no-undef
            return await GM.listValues();
        } catch (e) {
            console.error(e);
            console.log("GM Function Not Detected");
            return undefined;
        }
    }




    async function StorageLoad() {
        NGListStorage = await StorageApiRead("NGList");
        if (NGListStorage) {
            NGListStorage = JSON.parse(NGListStorage);
        } else {
            NGListStorage = new Array();
            await StorageApiWrite("NGList", JSON.stringify(NGListStorage));
        }

        WebAbronStorage = await StorageApiRead("WebAbron");
        if (WebAbronStorage) {
            WebAbronStorage = JSON.parse(WebAbronStorage);
        } else {
            WebAbronStorage = new Array();
            await StorageApiWrite("WebAbron", JSON.stringify(WebAbronStorage));
        }

        ElementBlockerStorage = await StorageApiRead("ElementBlocker");
        if (ElementBlockerStorage) {
            ElementBlockerStorage = JSON.parse(ElementBlockerStorage);
        } else {
            ElementBlockerStorage = new Array();
            await StorageApiWrite("ElementBlocker", JSON.stringify(ElementBlockerStorage));
        }

        PreferenceSetting = await StorageApiRead("PreferenceSetting");
        if (PreferenceSetting) {
            PreferenceSetting = JSON.parse(PreferenceSetting);
        } else {
            PreferenceSetting = new Object();
            await StorageApiWrite("PreferenceSetting", JSON.stringify(PreferenceSetting));
        }

        WebAbronTempDisableArray = await StorageApiRead("WebAbron_TempDisable");
        if (WebAbronTempDisableArray) {
            WebAbronTempDisableArray = JSON.parse(WebAbronTempDisableArray);
        } else {
            WebAbronTempDisableArray = new Array();
        }
        await StorageApiWrite("WebAbron_TempDisable", JSON.stringify(new Array()));
    }
    await StorageLoad();


    const ArrayLast = array => array[array.length - 1];
    function XPathSelectorAll(expression, parentElement) {
        var XPathNode = new Array();
        var evaluateobj = document.evaluate(expression, parentElement || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0, l = evaluateobj.snapshotLength; i < l; i++) {
            XPathNode.push(evaluateobj.snapshotItem(i));
        }
        return XPathNode;
    }

    async function NGListStoUpdateOtherSetting(oldName, newName) {
        WebAbronStorage.forEach((WebAbronObj) => {
            if (WebAbronObj.nglist_list === oldName) {
                WebAbronObj.nglist_list = newName;
            }
            if (WebAbronObj.nglist_white_list === oldName) {
                WebAbronObj.nglist_white_list = newName;
            }
        });
        await StorageApiWrite("WebAbron", JSON.stringify(WebAbronStorage));
        ElementBlockerStorage.forEach((ElemnetBlockerObj) => {
            if (ElemnetBlockerObj.nglist_list === oldName) {
                ElemnetBlockerObj.nglist_list = newName;
            }
            if (ElemnetBlockerObj.nglist_white_list === oldName) {
                ElemnetBlockerObj.nglist_white_list = newName;
            }
        });
        await StorageApiWrite("ElementBlocker", JSON.stringify(ElementBlockerStorage));
    }

    async function copyTextToClipboard(text) {
        var textArea = document.createElement("textarea");

        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = 0;
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.value = text;
        document.body.append(textArea);
        textArea.focus();
        textArea.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        document.body.removeChild(textArea);
    }

    function inIframeDetect() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }


    // BackGround Fuction Start
    class BackGround_Func {
        constructor() {
            this.testObj = new Object();
        }
        escapeRegExp(string) {
            return string.replace(/[/.*+?^${}()|[\]\\]/g, '\\$&');
        }
        escapeRegExpExcludewildcard(string) {
            return string.replace(/[/.+?^${}()|[\]\\]/g, '\\$&').replace(/[*]/g, '.$&');
        }
        UrlArrayReverseSearch(blockurlarray, SourceUrl) {
            let BlockUrlFilter;
            let BlockUrlDomainFilter;
            let DomainSplit;
            let DomainHit = false;
            let UrlHit = false;

            try {
                SourceUrl = SourceUrl.match(/^.*:\/{2,}(.*)/)[1].split("/");
                if (!SourceUrl.length) return false;
                DomainSplit = SourceUrl[0].split(".");
                DomainSplit.reverse();
            } catch (e) {
                return false;
            }

            let DomainLinking = "";
            for (let i = 0; i < DomainSplit.length; i++) {
                DomainLinking = DomainSplit[i] + DomainLinking;
                const DomainLinkingRegexp = DomainLinking.replace(/(.*)/, "^$1(?:/|$)+.*$");
                BlockUrlDomainFilter = blockurlarray.filter(RegExp.prototype.test, new RegExp(DomainLinkingRegexp));
                if (BlockUrlDomainFilter.length) {
                    DomainHit = true;
                    break;
                }
                DomainLinking = '.' + DomainLinking;
            }

            if (DomainHit) {
                const DomainLinkingRegexp = DomainLinking.replace(/(.*)/, "$1/?(?!.+)");
                BlockUrlFilter = BlockUrlDomainFilter.filter(RegExp.prototype.test, new RegExp(DomainLinkingRegexp));
                if (BlockUrlFilter.length) {
                    UrlHit = true;
                } else {
                    let SourceUrlLinking = DomainLinking + '/';
                    for (let i = 1; i < SourceUrl.length; i++) {
                        SourceUrlLinking = SourceUrlLinking + SourceUrl[i];
                        const SourceUrlLinkingRegexp = SourceUrlLinking.replace(/(.*)/, "^$1/?$");
                        BlockUrlFilter = BlockUrlDomainFilter.filter(RegExp.prototype.test, new RegExp(SourceUrlLinkingRegexp));
                        if (!BlockUrlFilter.length) {
                            SourceUrlLinking = SourceUrlLinking + '/';
                            continue;
                        }
                        UrlHit = true;
                        break;
                    }
                }
            }
            return UrlHit;
        }
        async NGListStoLoadfunc(SettingArray, listflag) {
            return await Promise.all(SettingArray.map(async (SetObj) => {
                if (this.testObj[SetObj.nglist_list]) return new Array();
                let regexpEnable = false, insensitiveEnable = false, keyNgname;
                if (listflag === "ngblock") {
                    if (SetObj.nglist_lowuppDist_enable === false) {
                        insensitiveEnable = true;
                    }
                    if (SetObj.nglist_regex_enable === true) {
                        regexpEnable = true;
                    }
                    keyNgname = SetObj.nglist_list;
                } else if (listflag === "ngwhite" && SetObj.nglist_white_enable) {
                    if (SetObj.nglist_white_lowuppDist_enable === false) {
                        insensitiveEnable = true;
                    }
                    if (SetObj.nglist_white_regex_enable === true) {
                        regexpEnable = true;
                    }
                    keyNgname = SetObj.nglist_white_list;
                } else return new Array();


                let regexflag = 'g';
                if (insensitiveEnable === true) {
                    regexflag = regexflag.concat('i');
                }
                if (keyNgname !== "") {
                    const NGListTextKey = "NGList_" + keyNgname;
                    let NGListTextObj = await StorageApiRead(NGListTextKey);
                    NGListTextObj = JSON.parse(NGListTextObj);
                    if (NGListTextObj) {
                        const ngarr = NGListTextObj.text.split("\n");
                        if (SetObj.nglist_urlMethod_enable === true) return ngarr;
                        const test1 = await Promise.all(ngarr.map(async (ngobj) => {
                            if (regexpEnable === true) {
                                try {
                                    return new RegExp(ngobj, regexflag);
                                } catch (e) {
                                    console.error(e);
                                    return new RegExp("(?!)", regexflag);
                                }
                            } else {
                                try {
                                    return new RegExp(this.escapeRegExp(ngobj), regexflag);
                                } catch (e) {
                                    console.error(e);
                                    return new RegExp("(?!)", regexflag);
                                }
                            }
                        }));
                        NGListTextObj.text = NGListTextObj.text.split("\n").filter(str => str !== "");
                        if (NGListTextObj.regexp) {
                            let regexflag2 = 'g';
                            if (!NGListTextObj.caseSensitive) {
                                regexflag2 = regexflag2.concat('i');
                            }
                            NGListTextObj.text = await Promise.all(NGListTextObj.text.map(async (ngobj) => {
                                try {
                                    return new RegExp(ngobj, regexflag2);
                                } catch (e) {
                                    console.error(e);
                                    return new RegExp("(?!)", regexflag2);
                                }
                            }));
                        } else if (!NGListTextObj.caseSensitive) {
                            NGListTextObj.text = await Promise.all(NGListTextObj.text.map(async (ngobj) => {
                                return ngobj.toLowerCase();
                            }));
                        }
                        this.testObj[SetObj.nglist_list] = NGListTextObj;
                        return test1;
                    } else {
                        return new Array();
                    }
                } else {
                    return new Array();
                }
            }));
        }
    }

    const BG_WebAbron_Obj = new class extends BackGround_Func {
        constructor() {
            super();
            this.WebAbronfilter1 = null;
            this.NGListRegexp1 = null;
            this.NGListWhiteRegexp1 = null;
            this.WebAbronfilter2 = null;
            this.NGListRegexp2 = null;
            this.NGListWhiteRegexp2 = null;
        }
        async init() {
            this.WebAbronfilter1 = WebAbronStorage.filter((arr) => {
                if (arr.url === "" && arr.enable === true) {
                    return true;
                }
                return false;
            });
            this.NGListRegexp1 = await this.NGListStoLoadfunc(this.WebAbronfilter1, "ngblock");
            this.NGListWhiteRegexp1 = await this.NGListStoLoadfunc(this.WebAbronfilter1, "ngwhite");
            const CurrentURL = location.href;
            this.WebAbronfilter2 = WebAbronStorage.filter((arr) => {
                if (arr.url !== "") {
                    if (arr.url_regex_enable === true && arr.enable === true) {
                        try {
                            const result = new RegExp(arr.url, 'gi').test(CurrentURL);
                            if (result) {
                                return true;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    } else if (arr.url_regex_enable === false && arr.enable === true) {
                        try {
                            const result = new RegExp(this.escapeRegExpExcludewildcard(arr.url), 'gi').test(CurrentURL);
                            if (result) {
                                return true;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
                return false;
            });
            this.NGListRegexp2 = await this.NGListStoLoadfunc(this.WebAbronfilter2, "ngblock");
            this.NGListWhiteRegexp2 = await this.NGListStoLoadfunc(this.WebAbronfilter2, "ngwhite");
        }
        async initReadyElement() {
            const nodeText = document.evaluate('//text()', document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            const nodePre = document.evaluate('//pre', document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            if (nodeText.snapshotLength === 1 && nodePre.snapshotLength === 1) {
                const del = nodeText.snapshotItem(0);
                const lines = del.nodeValue.split(/\r?\n/);
                const ins = document.createElement('pre');
                ins.style.whiteSpace = 'pre-wrap';
                del.parentNode.replaceChild(ins, del);
                for (let i = 0; i < lines.length; i++) {
                    ins.append(document.createTextNode(lines[i]));
                    ins.append(document.createElement('br'));
                }
            }
        }
        async Start(node) {
            this.WebAbronBackgroundExecute(node, this.WebAbronfilter1);
            this.WebAbronBackgroundExecute(node, this.WebAbronfilter2);
        }
        // PriveteFunction
        async WebAbronBackgroundExecute(node, WebAbron_SettingArray) {
            const textReplaceExecute = async (EleObj, PropertyName) => {
                let sentenceReplaceFlag = false;

                const WADupCheck = WebAbronDuplicateString.some((str) => {
                    return str === EleObj[PropertyName];
                })
                if (WADupCheck) return;

                Promise.all(WebAbron_SettingArray.map(async (webabronSet) => {
                    if (WebAbronTempDisableArray.some((name) => name === webabronSet.name)) {
                        return;
                    }

                    if (sentenceReplaceFlag) return;
                    let test4;
                    if (this.testObj[webabronSet.nglist_list]) {
                        if (this.testObj[webabronSet.nglist_list].regexp) {
                            test4 = this.testObj[webabronSet.nglist_list].text.filter((ngRegexp) => {
                                return ngRegexp.test(EleObj[PropertyName]);
                            });
                        } else if (this.testObj[webabronSet.nglist_list].caseSensitive) {
                            test4 = this.testObj[webabronSet.nglist_list].text.filter((ngRegexp) => {
                                return EleObj[PropertyName].includes(ngRegexp);
                            });
                        } else {
                            test4 = this.testObj[webabronSet.nglist_list].text.filter((ngRegexp) => {
                                return EleObj[PropertyName].toLowerCase().includes(ngRegexp);
                            });
                        }
                    } else return;

                    if (test4.length) {
                        let test5;
                        if (this.testObj[webabronSet.nglist_white_list]) {
                            if (this.testObj[webabronSet.nglist_white_list].regexp) {
                                test5 = this.testObj[webabronSet.nglist_white_list].text.some((ngRegexp) => {
                                    return ngRegexp.test(EleObj[PropertyName]);
                                });
                            } else if (this.testObj[webabronSet.nglist_white_list].caseSensitive) {
                                test5 = this.testObj[webabronSet.nglist_white_list].text.some((ngRegexp) => {
                                    return EleObj[PropertyName].includes(ngRegexp);
                                });
                            } else {
                                test5 = this.testObj[webabronSet.nglist_white_list].text.some((ngRegexp) => {
                                    return EleObj[PropertyName].toLowerCase().includes(ngRegexp);
                                });
                            }
                        }

                        if (!test5) {
                            if (webabronSet.replace_mode === "sentence") {
                                EleObj[PropertyName] = webabronSet.replace_string;
                                WebAbronDuplicateString.push(EleObj[PropertyName]);
                                sentenceReplaceFlag = true;
                            } else if (webabronSet.replace_mode === "word") {
                                if (this.testObj[webabronSet.nglist_list].regexp) {
                                    test4.forEach((ngRegexp) => {
                                        EleObj[PropertyName] = EleObj[PropertyName].replace(ngRegexp, webabronSet.replace_string);
                                    });
                                } else {
                                    let regexflag2 = 'g';
                                    if (!this.testObj[webabronSet.nglist_list].caseSensitive) {
                                        regexflag2 = regexflag2.concat('i');
                                    }
                                    test4.forEach((ngRegexp) => {
                                        EleObj[PropertyName] = EleObj[PropertyName].replace(new RegExp(ngRegexp, regexflag2), webabronSet.replace_string);
                                    });
                                }
                                WebAbronDuplicateString.push(EleObj[PropertyName]);
                            }
                            const fiindex = WebAbronExecuteResult.findIndex(({ name }) => name === webabronSet.name);
                            if (fiindex !== -1) {
                                WebAbronExecuteResult[fiindex].count++;
                            } else {
                                WebAbronExecuteResult.push({
                                    name: webabronSet.name,
                                    count: 1
                                });
                            }
                            BlockCounter++;
                            BlockCounterUpdate();
                        }
                    }
                }));
            };

            if (!node) return;

            const candidates1 = document.evaluate('.//text()[not(parent::style) and not(parent::textarea) and not(parent::script)]', node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < candidates1.snapshotLength; i++) {
                textReplaceExecute(candidates1.snapshotItem(i), "nodeValue");
            }
            const candidates2 = document.evaluate('.//input[not(@type="text")]/@value | .//img/@alt | .//*/@title | .//a/@href', node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < candidates2.snapshotLength; i++) {
                textReplaceExecute(candidates2.snapshotItem(i), "value");
            }
        }
    }

    const BG_ElementBlocker_Obj = new class extends BackGround_Func {
        constructor() {
            super();
            this.ElementBlockerfilter;
            this.NGListRegexp;
            this.NGListWhiteRegexp;
        }
        async init() {
            const CurrentURL = location.href;
            this.ElementBlockerfilter = ElementBlockerStorage.filter((arr) => {
                if (arr.url === "") return false;
                if (arr.url_regex_enable === true && arr.enable === true) {
                    try {
                        const result = new RegExp(arr.url, 'g').test(CurrentURL);
                        if (result) {
                            return true;
                        }
                    } catch (e) {
                        console.error(e);
                    }
                } else if (arr.url_regex_enable === false && arr.enable === true) {
                    try {
                        const result = new RegExp(this.escapeRegExpExcludewildcard(arr.url), 'g').test(CurrentURL);
                        if (result) {
                            return true;
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
                return false;
            });
            this.NGListRegexp = await this.NGListStoLoadfunc(this.ElementBlockerfilter, "ngblock");
            this.NGListWhiteRegexp = await this.NGListStoLoadfunc(this.ElementBlockerfilter, "ngwhite");
        }
        async Start(node) {
            await this.ElementBlockerExecute(node, this.ElementBlockerfilter, this.NGListRegexp, this.NGListWhiteRegexp);
        }
        //Private Function
        async ElementBlockerExecute(node, EleBlock_SettingArray, EleBlock_nglistArray, EleBlock_whitelistArray) {
            EleBlock_SettingArray.forEach((EleBlockSet, index) => {
                let ElementNode;
                if (!node) return;
                if (EleBlockSet.elementHide_method === "css") {
                    ElementNode = node.querySelectorAll(EleBlockSet.elementHide);
                } else if (EleBlockSet.elementHide_method === "xpath") {
                    ElementNode = XPathSelectorAll(EleBlockSet.elementHide, node);
                }
                ElementNode.forEach((ElementObj) => {
                    let firstblockflag;
                    try {
                        firstblockflag = ElementBlockerExecuteResult[EleBlockSet.name].some((arr) => {
                            return arr.element === ElementObj;
                        })
                    } catch (e) {
                        firstblockflag = false;
                    }
                    if (firstblockflag) {
                        return;
                    }

                    let SearchEleNode;
                    if (EleBlockSet.elementSearch === "") {
                        ElementObj.style.display = "none";
                        return;
                    }

                    if (EleBlockSet.elementSearch_method === "css") {
                        SearchEleNode = ElementObj.querySelectorAll(EleBlockSet.elementSearch);
                    } else if (EleBlockSet.elementSearch_method === "xpath") {
                        SearchEleNode = XPathSelectorAll(EleBlockSet.elementSearch, ElementObj);
                    }

                    if (EleBlockSet.elementSearch_index_enable && EleBlockSet.elementSearch_index !== "") {
                        const EleSearchIndex = Number(EleBlockSet.elementSearch_index)
                        if (Number.isInteger(EleSearchIndex) && EleSearchIndex >= 0) {
                            if (SearchEleNode[EleSearchIndex]) {
                                SearchEleNode = new Array(SearchEleNode[EleSearchIndex]);
                            }
                        }
                    }

                    SearchEleNode.forEach((SearchEleObj) => {
                        let testResult;
                        let searchProperty;
                        switch (EleBlockSet.elementSearch_property) {
                            case "text":
                                searchProperty = SearchEleObj.textContent;
                                break;
                            case "href":
                                searchProperty = SearchEleObj.href;
                                break;
                            case "style":
                                searchProperty = window.getComputedStyle(SearchEleObj)[EleBlockSet.elementSearch_property_style];
                                break;
                        }
                        if (searchProperty === undefined) {
                            return;
                        }

                        if (EleBlockSet.nglist_urlMethod_enable) {
                            testResult = this.UrlArrayReverseSearch(EleBlock_nglistArray[index], searchProperty);
                        } else {
                            testResult = EleBlock_nglistArray[index].some((ngRegexp) => {
                                return ngRegexp.test(searchProperty);
                            });
                        }
                        if (testResult) {
                            let whitetestResult;
                            if (EleBlockSet.nglist_white_urlMethod_enable) {
                                whitetestResult = this.UrlArrayReverseSearch(EleBlock_whitelistArray[index], searchProperty);
                            } else {
                                whitetestResult = EleBlock_whitelistArray[index].some((ngRegexp) => {
                                    return ngRegexp.test(searchProperty);
                                });
                            }
                            if (!whitetestResult) {
                                if (ElementObj.style.display !== "none") {
                                    ElementObj.style.display = "none";

                                    if (!ElementBlockerExecuteResult[EleBlockSet.name]) {
                                        ElementBlockerExecuteResult[EleBlockSet.name] = new Array();
                                    }

                                    ElementBlockerExecuteResult[EleBlockSet.name].push({
                                        settingobj: EleBlockSet,
                                        element: ElementObj,
                                        searchProperty: searchProperty
                                    });
                                    BlockCounter++;
                                    BlockCounterUpdate();
                                }
                            }
                        }
                    });
                })
            })
        }
    }

    async function BlockCounterUpdate() {
        if (settingbuttonEle) {
            if (BlockCounter > 0) {
                settingbuttonEle.style.backgroundColor = "#FFAFAF"
            }
            settingbuttonEle.textContent = "C:(" + BlockCounter + ")";
        }
    }



    await BG_WebAbron_Obj.init();
    await BG_ElementBlocker_Obj.init();

    if (document.body != null) {
        await initInsertElement();
        StartExecute();
        readyStateSetInterval();
    } else {
        const observer = new MutationObserver(async () => {
            if (document.body != null) {
                observer.disconnect();
                await initInsertElement();
                StartExecute();
                readyStateSetInterval();
            }
        });

        const config = {
            attributes: false,
            attributeOldValue: false,
            characterData: false,
            characterDataOldValue: false,
            childList: true,
            subtree: true
        }

        observer.observe(document, config)
    }

    document.addEventListener("readystatechange", async (evt) => {
        switch (evt.target.readyState) {
            case "interactive":
                await initInsertElement();
                StartExecute();
                break;
            case "complete":
                StartExecute();
                clearInterval(readyStateCheckInterval);
                observerregister();
                break;
        }
    }, { capture: true });




    async function StartExecute() {
        await BG_ElementBlocker_Obj.Start(document);
        await BG_WebAbron_Obj.Start(document);
    }

    async function readyStateSetInterval() {
        readyStateCheckInterval = setInterval(async () => {
            StartExecute();
        }, 10);
    }

    async function initInsertElement() {
        if (!divElement_RootShadow) {
            await BG_WebAbron_Obj.initReadyElement();

            divElement_RootShadow = document.createElement("div");
            divElement_RootShadow.style.all = "initial";
            divElement_RootShadow.attachShadow({ mode: "open" });
            document.body.append(divElement_RootShadow);

            if (!PreferenceSetting["hideButton"] || PreferenceSetting["hideButton"] === false) {
                if (!inIframeDetect()) {
                    settingbuttonEle = document.createElement("button");
                    settingbuttonEle.style.position = "fixed";
                    settingbuttonEle.style.top = 0;
                    settingbuttonEle.style.right = 0;
                    settingbuttonEle.style.zIndex = 9998;
                    settingbuttonEle.style.width = "60px";
                    settingbuttonEle.style.height = "40px";
                    settingbuttonEle.style.backgroundColor = "#AFFFAF";
                    settingbuttonEle.addEventListener("click", SettingWindow, false);
                    divElement_RootShadow.shadowRoot.append(settingbuttonEle);
                    BlockCounterUpdate();
                }
            }

            try {
                // eslint-disable-next-line no-undef
                GM.registerMenuCommand("Dashboard", SettingWindow, "D");
                return;
            } catch (e) {
                console.error(e);
            }
        }
    }

    async function observerregister() {
        const observer = new MutationObserver(async () => {
            BG_ElementBlocker_Obj.Start(document.body);
            BG_WebAbron_Obj.Start(document.body);
        });
        const config = {
            attributes: false,
            attributeOldValue: false,
            characterData: false,
            characterDataOldValue: false,
            childList: true,
            subtree: true
        };
        observer.observe(document.body, config);
    }


    // BackGround Fuction End




    async function SettingWindow() {
        const RootShadow = divElement_RootShadow.shadowRoot;

        settingsbox_Element = document.createElement("div");
        settingsbox_Element.innerHTML = `
<style type="text/css">
  div#FrameBack {
    all: initial;
    position: fixed;
    top: 0;
    right: 1px;
    z-index: 2147483647;
    padding: 1px 2px;
    background-color: #ffffff;
    border: solid 1px #888888;
    border-radius: 10px;
    text-align: center;
    margin: 0em auto;
    height: calc(100vh - 150px);
    font-size: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
  div#FrameBackHeader {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  p#FrameBackHeaderTitle {
    margin: 0px;
    font-size: medium;
  }
  button.FrameBackHeaderButton {
    display: block;
    margin: 0 0 0 auto;
    width: 60px;
    height: inherit;
  }
  div#DashboardMain {
    overflow: auto;
    width: 97%;
    height: calc(100% - 60px);
    margin: 0em auto;
    margin-top: 2px;
    margin-bottom: 0px;
    word-wrap: break-word;
    padding: 5px;
    border-width: 1px;
    border-style: solid;
    border-color: black;
    text-align: left;
    font-size: medium;
    background-color: #ffffb2;
  }
</style>

<div id="FrameBack">
  <div id="FrameBackHeader">
    <p id="FrameBackHeaderTitle"><b>NegativeBlocker Dashboard</b></p>
    <button id="FrameBackHeaderButton1" class="FrameBackHeaderButton">✖</button>
    <button id="FrameBackHeaderButton2" class="FrameBackHeaderButton">
      ✖✖✖
    </button>
  </div>
  <div id="DashboardMain"></div>
</div>


`
        RootShadow.append(settingsbox_Element);
        function DashboardFrameBackWidthLimit() {
            const DashboardFrameBack = RootShadow.getElementById("FrameBack");
            if (window.innerWidth <= 400) {
                DashboardFrameBack.style.width = "calc(100vw - 7px)";
            } else {
                DashboardFrameBack.style.width = "400px";
            }
        }
        DashboardFrameBackWidthLimit();
        window.addEventListener("resize", DashboardFrameBackWidthLimit);

        RootShadow.getElementById("FrameBackHeaderButton1").addEventListener("click", () => {
            settingsbox_Element.remove();
            window.removeEventListener("resize", DashboardFrameBackWidthLimit);
        })

        RootShadow.getElementById("FrameBackHeaderButton2").addEventListener("click", () => {
            settingsbox_Element.remove();
            window.removeEventListener("resize", DashboardFrameBackWidthLimit);
            settingbuttonEle.remove();
        })


        DashboardMain_div = RootShadow.getElementById("DashboardMain");


        {
            const settingsbox_1_div = document.createElement("div");
            settingsbox_1_div.innerHTML = `
<style type="text/css">
  div.ItemFrame_Border {
    position: relative;
    margin-top: 1em;
    padding: 12px;
    border: 1px solid black;
  }
  h1.ItemFrame_Title {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1em;
    padding: 0 4px;
    margin: 0;
    transform: translateY(-50%) translateX(6px);
    background-color: #ffffb2;
  }
  div.ItemFrame_ElementBlock_ItemListFrame {
    border: 1px solid black;
  }
</style>

<div id="ItemFrame_SentenceBlock" class="ItemFrame_Border">
  <h1 id="Text-ResultSentenceBlockTitle" class="ItemFrame_Title"></h1>
  <div id="ItemFrame_SentenceBlock_Result"></div>
  <button id="ItemFrame_SentenceBlock_Result_TempDisableButton"></button>
</div>
<div id="ItemFrame_ElementBlock" class="ItemFrame_Border">
  <h1 id="Text-ResultElementBlockTitle" class="ItemFrame_Title"></h1>
</div>
<div>
  <button id="ItemFrame-SettingPageButton"></button>
</div>

`
            settingsbox_2_ele_stack.push(settingsbox_1_div);
            DashboardMain_div.append(settingsbox_1_div);

            RootShadow.getElementById("Text-ResultSentenceBlockTitle").textContent = "Webあぼーん 適用リスト";
            RootShadow.getElementById("ItemFrame_SentenceBlock_Result_TempDisableButton").textContent = "一時無効を適用してリロード";
            RootShadow.getElementById("Text-ResultElementBlockTitle").textContent = "要素ブロック 適用リスト";
            RootShadow.getElementById("ItemFrame-SettingPageButton").textContent = "設定画面";

            {
                const SentenceBlock_div = RootShadow.getElementById("ItemFrame_SentenceBlock_Result");

                for (let i = 0; i < WebAbronExecuteResult.length; i++) {
                    const settingsbox_1_1_1_p = document.createElement("span");
                    settingsbox_1_1_1_p.textContent = WebAbronExecuteResult[i].name + "(" + WebAbronExecuteResult[i].count + ")";
                    SentenceBlock_div.append(settingsbox_1_1_1_p);

                    const settingsbox_1_1_1_input = document.createElement("input");
                    settingsbox_1_1_1_input.setAttribute("type", "checkbox");
                    settingsbox_1_1_1_input.setAttribute("name", WebAbronExecuteResult[i].name);
                    WebAbronTempDisableArrayElement.push(settingsbox_1_1_1_input);
                    SentenceBlock_div.append(settingsbox_1_1_1_input);

                    SentenceBlock_div.append(document.createElement("br"));
                }
            }

            RootShadow.getElementById("ItemFrame_SentenceBlock_Result_TempDisableButton").addEventListener("click", async () => {
                const tempdis = new Array();
                WebAbronTempDisableArrayElement.forEach((ele) => {
                    if (ele.checked) {
                        tempdis.push(ele.name);
                    }
                })
                await StorageApiWrite("WebAbron_TempDisable", JSON.stringify(tempdis));
                location.reload();
            }, false);

            {
                const ElementBlock_div = RootShadow.getElementById("ItemFrame_ElementBlock");

                for (let keyname in ElementBlockerExecuteResult) {
                    const settingsbox_1_2_1_p = document.createElement("span");
                    settingsbox_1_2_1_p.textContent = keyname
                    ElementBlock_div.append(settingsbox_1_2_1_p);

                    const settingsbox_1_2_1_1_div = document.createElement("div");
                    settingsbox_1_2_1_1_div.style.border = "1px solid black"
                    ElementBlockerExecuteResult[keyname].forEach((arr) => {
                        if (arr.settingobj.elementSearch_property === "href") {
                            const settingsbox_1_2_1_1_p = document.createElement("p")
                            settingsbox_1_2_1_1_p.textContent = arr.searchProperty;
                            settingsbox_1_2_1_1_div.append(settingsbox_1_2_1_1_p);

                            const settingsbox_1_2_1_1_button1 = document.createElement("button");
                            settingsbox_1_2_1_1_button1.textContent = "再表示する"
                            settingsbox_1_2_1_1_button1.addEventListener("click", () => {
                                arr.element.style.display = "";
                            })
                            settingsbox_1_2_1_1_div.append(settingsbox_1_2_1_1_button1);

                            const settingsbox_1_2_1_1_button2 = document.createElement("button");
                            settingsbox_1_2_1_1_button2.textContent = "URLをコピー"
                            settingsbox_1_2_1_1_button2.addEventListener("click", () => {
                                copyTextToClipboard(arr.searchProperty);
                            })
                            settingsbox_1_2_1_1_div.append(settingsbox_1_2_1_1_button2);
                        }
                    })
                    ElementBlock_div.append(settingsbox_1_2_1_1_div);
                }
            }

            RootShadow.getElementById("ItemFrame-SettingPageButton").addEventListener("click", settingsbox_2_1_PreferenceTop, false);

        }

        async function settingsbox_2_1_PreferenceTop() {
            ArrayLast(settingsbox_2_ele_stack).style.display = "none";
            const settingsbox_2_1_div = document.createElement("div");
            settingsbox_2_ele_stack.push(settingsbox_2_1_div);
            settingsbox_2_1_div.innerHTML = `
<style type="text/css">
  div.SettingsItem {
    display: block;
    margin: 0 0 20px 0;
  }
  #SettingMainPage p {
    margin: 0;
  }
</style>

<div id="SettingMainPage">
  <div id="BlockListText_Setting" class="SettingsItem">
    <p id="BlockListText_Setting_Title"></p>
    <button id="BlockListText_Setting_Button"></button>
  </div>
  <div id="SentenceBlock_Setting" class="SettingsItem">
    <p id="SentenceBlock_Setting_Title"></p>
    <button id="SentenceBlock_Setting_Button"></button>
  </div>
  <div id="ElementBlock_Setting" class="SettingsItem">
    <p id="ElementBlock_Setting_Title"></p>
    <button id="ElementBlock_Setting_Button"></button>
  </div>
  <div id="Other_Setting" class="SettingsItem">
    <p id="Other_Setting_Title"></p>
    <button id="Other_Setting_Button"></button>
  </div>
  <div id="SettingMainPageBack" class="SettingsItem">
    <button id="SettingMainPageBack_Button"></button>
  </div>
</div>
            `
            DashboardMain_div.append(settingsbox_2_1_div);


            RootShadow.getElementById("BlockListText_Setting_Title").innerHTML = "NGフィルタ設定<br>グループ単位でNGワードリストまたはNGURLリストを設定できます。";
            RootShadow.getElementById("BlockListText_Setting_Button").textContent = "NGフィルタを設定する";
            RootShadow.getElementById("BlockListText_Setting_Button").addEventListener("click", settingsbox_2_2_NGListSet, false);

            RootShadow.getElementById("SentenceBlock_Setting_Title").innerHTML = "Webあぼーん機能<br>Webの文章内にNGフィルタのリストが含まれる場合、その一文章または単語を別の文字に置換します。";
            RootShadow.getElementById("SentenceBlock_Setting_Button").textContent = "Webあぼーん機能を設定する";
            RootShadow.getElementById("SentenceBlock_Setting_Button").addEventListener("click", settingsbox_2_3_WebAbronSet, false);

            RootShadow.getElementById("ElementBlock_Setting_Title").innerHTML = "要素ブロック機能<br>要素の文字またはプロパティにNGフィルタのリストが含まれる場合、要素ごとブロックします。";
            RootShadow.getElementById("ElementBlock_Setting_Button").textContent = "要素ブロック機能を設定する";
            RootShadow.getElementById("ElementBlock_Setting_Button").addEventListener("click", settingsbox_2_4_ElementBlockerSet, false);

            RootShadow.getElementById("Other_Setting_Title").innerHTML = "その他設定<br>拡張機能全体の設定をします。";
            RootShadow.getElementById("Other_Setting_Button").textContent = "その他設定";
            RootShadow.getElementById("Other_Setting_Button").addEventListener("click", settingsbox_2_5_PreferenceSet, false);


            RootShadow.getElementById("SettingMainPageBack_Button").textContent = "←戻る";
            RootShadow.getElementById("SettingMainPageBack_Button").addEventListener("click", () => {
                settingsbox_2_ele_stack.pop().remove();
                ArrayLast(settingsbox_2_ele_stack).style.display = "block";
            }, false)
        }




        class ListEdit_Func {
            constructor(ListStorage) {
                this.ListStorage = ListStorage;
                this.ulol_Ele = null;
                this.editarea_Ele = null;
                this.name_Ele = null;
                this.index_Ele = null;
                this.enable_Ele = null;
                this.li_cfuncArgTemp = new Array();
                this.li_cfunchandlers = new Array(); //privete
                this.li_cfuncinfunction = new Function();
                this.li_cfuncinfunction_arg = new Array();
                this.currentEle_li = null; //privete
                this.currentEle_li_BGColorTemp = null; //privete
                this.currentName = null;
                this.currentIndex = null;
                this.Editflag = false;

                this.SaveButtonFunc = new Function();
                this.DelButtonFunc = new Function();
                this.NewObjectButtonFunc = new Function();

                this.SettingsObjectListPage_Ele = null;
                this.EditConfigObjectPage_Ele = null
            }

            async init() {
                ArrayLast(settingsbox_2_ele_stack).style.display = "none";
                this.SettingsObjectListPage_Ele = document.createElement("div");
                this.SettingsObjectListPage_Ele.style.height = "100%";
                settingsbox_2_ele_stack.push(this.SettingsObjectListPage_Ele);
                this.SettingsObjectListPage_Ele.innerHTML = `
<style type="text/css">
  div#SettingsObjectListPage {
    height: 100%;
  }
  div#ObjectLists_Frame {
    width: auto;
    height: calc(100% - 130px);
    overflow: auto;
    border: 2px solid black;
  }
  ol#ObjectLists_ol {
    background-color: #eee;
    list-style-position: inside;
    margin: 0 0 0 0;
    padding: 0 0 0 0;
  }
</style>

<div id="SettingsObjectListPage">
  <div id="ObjectLists_Frame">
    <ol id="ObjectLists_ol"></ol>
  </div>
  <div id="SettingsObject_ConfigItems" style="display: none">
    <div id="SettingsObject_ConfigItems_Name">
      <span id="SettingsObject_ConfigItems_Name_Span"></span>
      <input id="SettingsObject_ConfigItems_Name_Form" type="text" />
    </div>
    <div id="SettingsObject_ConfigItems_Sort">
      <span id="SettingsObject_ConfigItems_Sort_Span"></span>
      <select id="SettingsObject_ConfigItems_Sort_Form" size="1"></select>
    </div>
    <div id="SettingsObject_ConfigItems_Enable">
      <span id="SettingsObject_ConfigItems_Enable_Span"></span>
      <input id="SettingsObject_ConfigItems_Enable_Form" type="checkbox" />
    </div>
    <div id="SettingsObject_ConfigItems_EditConfig">
      <span id="SettingsObject_ConfigItems_EditConfig_Span"></span>
      <button id="SettingsObject_ConfigItems_EditConfig_Form"></button>
    </div>
  </div>
  <div id="SettingsObject_ActionButton">
    <button id="SettingsObject_ActionButton_Back"></button>
    <button id="SettingsObject_ActionButton_NewObject"></button>
    <button id="SettingsObject_ActionButton_DeleteObject"></button>
    <button id="SettingsObject_ActionButton_SaveObject"></button>
  </div>
</div>
                `
                DashboardMain_div.append(this.SettingsObjectListPage_Ele);

                RootShadow.getElementById("SettingsObject_ConfigItems_Name_Span").textContent = "名前：";
                RootShadow.getElementById("SettingsObject_ConfigItems_Sort_Span").textContent = "並び替え：";
                RootShadow.getElementById("SettingsObject_ConfigItems_Enable_Span").textContent = "有効：";
                RootShadow.getElementById("SettingsObject_ConfigItems_EditConfig_Span").textContent = "設定編集：";
                RootShadow.getElementById("SettingsObject_ConfigItems_EditConfig_Form").textContent = "設定編集";
                RootShadow.getElementById("SettingsObject_ActionButton_Back").textContent = "←戻る";
                RootShadow.getElementById("SettingsObject_ActionButton_NewObject").textContent = "新規追加";
                RootShadow.getElementById("SettingsObject_ActionButton_DeleteObject").textContent = "削除";
                RootShadow.getElementById("SettingsObject_ActionButton_SaveObject").textContent = "保存";

                this.ulol_Ele = RootShadow.getElementById("ObjectLists_ol");
                this.editarea_Ele = RootShadow.getElementById("SettingsObject_ConfigItems");
                this.name_Ele = RootShadow.getElementById("SettingsObject_ConfigItems_Name_Form");
                this.index_Ele = RootShadow.getElementById("SettingsObject_ConfigItems_Sort_Form");
                this.enable_Ele = RootShadow.getElementById("SettingsObject_ConfigItems_Enable_Form");

                for (let i = 0; i < this.ListStorage.length; i++) {
                    await this.li_Add(i);
                }
                for (let i = 0; i < this.ListStorage.length + 1; i++) {
                    this.SelectOption_Add();
                }

                RootShadow.getElementById("SettingsObject_ConfigItems_EditConfig_Form").addEventListener("click", () => {
                    this.Editflag = true;
                    this.SettingsObjectListPage_Ele.style.display = "none";
                    this.EditConfigObjectPage_Ele.style.display = "block";
                }, false);

                RootShadow.getElementById("SettingsObject_ActionButton_Back").addEventListener("click", () => {
                    if (this.Editflag) {
                        const res = confirm("トップ設定ページに戻ります。現在入力されている内容は失われますがよろしいですか？");
                        if (!res) {
                            return false;
                        }
                    }
                    settingsbox_2_ele_stack.pop().remove();
                    settingsbox_2_ele_stack.pop().remove();
                    ArrayLast(settingsbox_2_ele_stack).style.display = "block";
                }, false);
                RootShadow.getElementById("SettingsObject_ActionButton_NewObject").addEventListener("click", async (evt) => await this.NewObjectButtonFunc(evt.target), false);
                RootShadow.getElementById("SettingsObject_ActionButton_DeleteObject").addEventListener("click", async () => await this.DelButtonFunc(), false);
                RootShadow.getElementById("SettingsObject_ActionButton_SaveObject").addEventListener("click", async () => await this.SaveButtonFunc(), false);
            }

            async ListStoSave(StoKey, StoObj) {
                if (StoObj.name === "") {
                    alert("エラー：名前を入力してください。");
                    return false;
                }
                const fiindex = this.ListStorage.findIndex(({ name }) => name === this.currentName);
                let dupcheck1;
                if (fiindex !== -1) {
                    dupcheck1 = this.ListStorage.filter((v) => v.name !== this.ListStorage[fiindex].name);
                } else {
                    dupcheck1 = this.ListStorage;
                }
                const dupcheck2 = dupcheck1.filter((v) => v.name === StoObj.name);
                if (dupcheck2.length) {
                    alert("エラー：すでに同じ名前が存在します。");
                    return false;
                }
                if (fiindex !== -1) {
                    this.ListStorage.splice(fiindex, 1);
                }
                this.ListStorage.splice(this.index_Ele.value, 0, StoObj);
                // eslint-disable-next-line no-undef
                await GM.setValue(StoKey, JSON.stringify(this.ListStorage));

                if (fiindex !== -1) {
                    this.currentEle_li.remove();
                } else {
                    this.currentEle_li.style.backgroundColor = "";
                    this.SelectOption_Add();
                }
                this.li_Add(this.index_Ele.value);
                this.editarea_Ele.style.display = "none";
                this.Editflag = false;

                return true;
            }

            async ListStoDel(StoKey) {
                const fiindex = this.ListStorage.findIndex(({ name }) => name === this.currentName);
                if (fiindex !== -1) {
                    const res = confirm("[" + this.currentName + "]設定を削除してよろしいですか？");
                    if (!res) {
                        return false;
                    }
                    this.currentEle_li.remove();
                    this.SelectOption_Del()
                    this.ListStorage.splice(fiindex, 1);
                    // eslint-disable-next-line no-undef
                    await GM.setValue(StoKey, JSON.stringify(this.ListStorage));
                    this.editarea_Ele.style.display = "none";
                    this.Editflag = false;
                    return true;
                } else {
                    return false;
                }
            }

            async NewEditButton(NewbuttonEle) {
                if (this.Editflag) {
                    const res = confirm("新規作成しますか？現在入力されている内容は失われます。");
                    if (!res) {
                        return false;
                    }
                }
                this.currentName = "";
                this.name_Ele.value = "";
                this.index_Ele.lastChild.style.display = "block";
                this.index_Ele.selectedIndex = this.ListStorage.length;
                this.li_EleSelect(NewbuttonEle);
                this.Editflag = false;
                return true;
            }

            async li_cfunc(cfunchandlersIndex, cfuncinfunction_arg) {
                return this.li_cfunchandlers[cfunchandlersIndex] || (this.li_cfunchandlers[cfunchandlersIndex] = async () => {
                    if (this.Editflag) {
                        const res = confirm("設定フィールドを変更しますか？現在入力されている内容は失われます。");
                        if (!res) {
                            return false;
                        }
                    }
                    const fiindex = Array.from(cfuncinfunction_arg[0].parentNode.children).indexOf(cfuncinfunction_arg[0]);
                    this.currentName = this.ListStorage[fiindex].name;
                    this.currentIndex = fiindex;
                    this.name_Ele.value = this.ListStorage[fiindex].name;
                    this.index_Ele.selectedIndex = fiindex;
                    this.index_Ele.lastChild.style.display = "none";
                    this.li_EleSelect(cfuncinfunction_arg[0]);
                    this.li_cfuncArgTemp[0] = cfunchandlersIndex;
                    this.li_cfuncArgTemp[1] = cfuncinfunction_arg;
                    await this.li_cfuncinfunction(cfuncinfunction_arg);
                    this.Editflag = false;
                });
            }

            async li_Add(index) {
                const settingsbox_2_2_1_li = document.createElement("li");
                settingsbox_2_2_1_li.style.borderStyle = "solid";
                settingsbox_2_2_1_li.style.borderWidth = "1px";
                settingsbox_2_2_1_li.style.borderTopWidth = 0;
                settingsbox_2_2_1_li.style.borderColor = "silver";
                settingsbox_2_2_1_li.style.padding = "0 0 0 5px";
                settingsbox_2_2_1_li.style.cursor = "pointer";
                settingsbox_2_2_1_li.textContent = this.ListStorage[index].name;
                this.li_cfuncinfunction_arg.unshift(settingsbox_2_2_1_li);
                settingsbox_2_2_1_li.addEventListener("click", await this.li_cfunc(this.li_cfunchandlers.length, Array.from(this.li_cfuncinfunction_arg)), false);
                // NGList_Obj.currentEle_li.removeEventListener("click", await NGList_Obj.li_cfunc(NGList_Obj.li_cfuncArgTemp[0], NGList_Obj.li_cfuncArgTemp[1]), false);
                if (index < this.ulol_Ele.childNodes.length) {
                    this.ulol_Ele.childNodes[index].before(settingsbox_2_2_1_li);
                } else {
                    this.ulol_Ele.append(settingsbox_2_2_1_li);
                }
                return settingsbox_2_2_1_li;
            }

            async li_EleSelect(Ele) {
                if (this.currentEle_li) {
                    this.currentEle_li.style.backgroundColor = this.currentEle_li_BGColorTemp;
                }
                this.currentEle_li = Ele;
                this.currentEle_li_BGColorTemp = Ele.style.backgroundColor;
                Ele.style.backgroundColor = "lightskyblue";
                this.editarea_Ele.style.display = "block";
            }

            async SelectOption_Add() {
                const settingsbox_2_2_2_2_option = document.createElement("option");
                settingsbox_2_2_2_2_option.value = this.index_Ele.length;
                settingsbox_2_2_2_2_option.textContent = this.index_Ele.length + 1;
                this.index_Ele.append(settingsbox_2_2_2_2_option);
            }

            async SelectOption_Del() {
                this.index_Ele.lastChild.remove();
            }

        }

        async function settingsbox_2_2_NGListSet() {
            await new class extends ListEdit_Func {
                constructor(NGListStorage) {
                    super(NGListStorage);
                    this.textarea_Ele = null;
                    this.fetch_enable_Ele = null;
                    this.fetch_url_Ele = null;
                    this.regexp_Ele = null;
                    this.caseSensitive_Ele = null;
                    this.uBlacklist_Ele = null;
                    this.li_cfuncinfunction = async () => {
                        const NGListTextKey = "NGList_" + this.ListStorage[this.currentIndex].name;
                        let NGListText;
                        NGListText = await StorageApiRead(NGListTextKey);
                        if (NGListText) {
                            NGListText = JSON.parse(NGListText);
                            this.textarea_Ele.value = NGListText.text;
                            this.fetch_enable_Ele.checked = NGListText.fetch_enable;
                            this.fetch_url_Ele.value = NGListText.fetch_url;
                            this.regexp_Ele.checked = NGListText.regexp;
                            this.caseSensitive_Ele.checked = NGListText.caseSensitive;
                            this.uBlacklist_Ele.checked = NGListText.uBlacklist;
                        } else {
                            this.textarea_Ele.value = "";
                            this.fetch_enable_Ele.checked = false;
                            this.fetch_url_Ele.value = "";
                            this.regexp_Ele.checked = false;
                            this.caseSensitive_Ele.checked = false;
                            this.uBlacklist_Ele.checked = false;
                        }
                    }
                    this.SaveButtonFunc = this.NGListStoSave.bind(this);
                    this.DelButtonFunc = this.NGListStoDel.bind(this);
                    this.NewObjectButtonFunc = this.NGListNewEditButton.bind(this);
                }

                async init() {
                    await super.init();
                    this.EditConfigObjectPage_Ele = document.createElement("div");
                    this.EditConfigObjectPage_Ele.style.display = "none";
                    this.EditConfigObjectPage_Ele.style.height = "100%";
                    this.EditConfigObjectPage_Ele.innerHTML = `
<style type="text/css">
  div.EditConfigObjectPage {
    height: 100%;
  }
  div#BlockListText_div {
    height: calc(100% - 80px);
  }
  textarea#BlockListText_Textarea {
    resize: none;
    margin-left: -10px;
    width: calc(100% + 14px);
    height: 100%;
  }
  div.BlockListText_Border {
    border: 1px solid black;
  }
  div.ItemFrame_Border {
    position: relative;
    margin-top: 1em;
    padding: 12px;
    border: 1px solid black;
  }
  h1.ItemFrame_Title {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1em;
    padding: 0 4px;
    margin: 0;
    transform: translateY(-50%) translateX(6px);
    background-color: #ffffb2;
    white-space: nowrap;
  }
</style>

<div id="BlockListText" class="EditConfigObjectPage">
  <div id="BlockListText_div" class="ItemFrame_Border">
    <h1 id="BlockListText_Textarea_Title" class="ItemFrame_Title"></h1>
    <textarea id="BlockListText_Textarea" spellcheck="false"></textarea>
  </div>
  <div class="ItemFrame_Border">
    <h1 id="BlockListText_ReadFile_Title" class="ItemFrame_Title"></h1>
    <input id="BlockListText_ReadFile_Input" type="file" />
  </div>
  <div class="ItemFrame_Border">
    <h1 id="BlockListText_Fetch_Title" class="ItemFrame_Title"></h1>
    <label>
      <input id="BlockListText_Fetch_InputCheckbox" type="checkbox" />
      <span id="BlockListText_Fetch_InputCheckbox_SpanText"></span>
    </label>
    <input id="BlockListText_Fetch_InputText" type="text" />
  </div>
  <div class="ItemFrame_Border">
    <h1 id="BlockListText_Config_Title" class="ItemFrame_Title"></h1>
    <label>
      <input id="BlockListText_Config1_Input" type="checkbox" />
      <span id="BlockListText_Config1_SpanText"></span>
    </label>
    <label>
      <input id="BlockListText_Config2_Input" type="checkbox" />
      <span id="BlockListText_Config2_SpanText"></span>
    </label>
    <label>
      <input id="BlockListText_Config3_Input" type="checkbox" />
      <span id="BlockListText_Config3_SpanText"></span>
    </label>
  </div>
  <div>
    <button id="BlockListText_BackButton"></button>
  </div>
</div>
            `
                    DashboardMain_div.append(this.EditConfigObjectPage_Ele);
                    settingsbox_2_ele_stack.push(this.EditConfigObjectPage_Ele);

                    RootShadow.getElementById("BlockListText_Textarea_Title").textContent = "ブロックリストテキスト"
                    RootShadow.getElementById("BlockListText_ReadFile_Title").textContent = "テキストファイルを読み込む";
                    RootShadow.getElementById("BlockListText_Fetch_Title").textContent = "URLから取得する";
                    RootShadow.getElementById("BlockListText_Fetch_InputCheckbox_SpanText").textContent = "有効";
                    RootShadow.getElementById("BlockListText_Config_Title").textContent = "オプション";
                    RootShadow.getElementById("BlockListText_Config1_SpanText").textContent = "正規表現";
                    RootShadow.getElementById("BlockListText_Config2_SpanText").textContent = "大文字と小文字を区別する";
                    RootShadow.getElementById("BlockListText_Config3_SpanText").textContent = "uBlacklist形式を使用する";

                    this.textarea_Ele = RootShadow.getElementById("BlockListText_Textarea");
                    this.fetch_enable_Ele = RootShadow.getElementById("BlockListText_Fetch_InputCheckbox");
                    this.fetch_url_Ele = RootShadow.getElementById("BlockListText_Fetch_InputText");
                    this.regexp_Ele = RootShadow.getElementById("BlockListText_Config1_Input");
                    this.caseSensitive_Ele = RootShadow.getElementById("BlockListText_Config2_Input");
                    this.uBlacklist_Ele = RootShadow.getElementById("BlockListText_Config3_Input");

                    RootShadow.getElementById("BlockListText_ReadFile_Input").addEventListener("change", (evt) => {
                        if (evt.target.files[0]) {
                            const res = confirm("現在入力されているテキストはファイルのテキストで上書きされます。よろしいですか？");
                            if (!res) {
                                return false;
                            }
                            const file = evt.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                                this.textarea_Ele.value = evt.target.result;
                            }
                            reader.readAsText(file);
                        }
                    })

                    RootShadow.getElementById("BlockListText_BackButton").textContent = "←戻る"
                    RootShadow.getElementById("BlockListText_BackButton").addEventListener("click", () => {
                        this.SettingsObjectListPage_Ele.style.display = "block";
                        this.EditConfigObjectPage_Ele.style.display = "none";
                    }, false);

                    RootShadow.getElementById("SettingsObject_ConfigItems_Enable").style.display = "none";
                }

                async NGListStoSave() {
                    const StoObj = {
                        name: this.name_Ele.value
                    }
                    const StoObj_Text = {
                        text: this.textarea_Ele.value.trim(),
                        fetch_enable: this.fetch_enable_Ele.checked,
                        fetch_url: this.fetch_url_Ele.value,
                        regexp: this.regexp_Ele.checked,
                        caseSensitive: this.caseSensitive_Ele.checked,
                        uBlacklist: this.uBlacklist_Ele.checked
                    }
                    if (await this.ListStoSave("NGList", StoObj)) {
                        const NGListTextKeyOld = "NGList_" + this.currentName;
                        if (this.currentName !== "") {
                            await StorageApiDelete(NGListTextKeyOld);
                        }
                        const NGListTextKeyNew = "NGList_" + StoObj.name;
                        await StorageApiWrite(NGListTextKeyNew, JSON.stringify(StoObj_Text));
                        if (this.currentName !== "") {
                            NGListStoUpdateOtherSetting(this.currentName, StoObj.name);
                        }
                    }
                }

                async NGListStoDel() {
                    if (await this.ListStoDel("NGList")) {
                        const NGListTextKey = "NGList_" + this.currentName;
                        await StorageApiDelete(NGListTextKey);
                        NGListStoUpdateOtherSetting(this.currentName, "");
                    }
                }

                async NGListNewEditButton(NewbuttonEle) {
                    if (await this.NewEditButton(NewbuttonEle)) {
                        this.textarea_Ele.value = "";
                        this.fetch_enable_Ele.checked = false;
                        this.fetch_url_Ele.value = "";
                        this.regexp_Ele.checked = false;
                        this.caseSensitive_Ele.checked = false;
                        this.uBlacklist_Ele.checked = false;
                    }
                }

            }(NGListStorage).init();
        }

        async function settingsbox_2_3_WebAbronSet() {
            await new class extends ListEdit_Func {
                constructor(WebAbronStorage) {
                    super(WebAbronStorage);
                    this.url_Ele = null;
                    this.url_regex_enable_Ele = null;
                    this.nglist_list_Ele = null;
                    this.nglist_regex_enable_Ele = null;
                    this.nglist_lowuppDist_enable_Ele = null;
                    this.nglist_white_enable_Ele = null;
                    this.nglist_white_list_Ele = null;
                    this.nglist_white_regex_enable_Ele = null;
                    this.nglist_white_lowuppDist_enable_Ele = null;
                    this.replace_string_Ele = null;
                    this.replace_mode_Ele = null;
                    this.li_cfuncinfunction = async () => {
                        const applylist = this.ListStorage[this.currentIndex];
                        this.enable_Ele.checked = applylist.enable;
                        this.url_Ele.value = applylist.url;
                        this.url_regex_enable_Ele.checked = applylist.url_regex_enable;
                        this.nglist_list_Ele.value = applylist.nglist_list;
                        this.nglist_regex_enable_Ele.checked = applylist.nglist_regex_enable;
                        this.nglist_lowuppDist_enable_Ele.checked = applylist.nglist_lowuppDist_enable;
                        this.nglist_white_enable_Ele.checked = applylist.nglist_white_enable;
                        this.nglist_white_list_Ele.value = applylist.nglist_white_list;
                        this.nglist_white_regex_enable_Ele.checked = applylist.nglist_white_regex_enable;
                        this.nglist_white_lowuppDist_enable_Ele.checked = applylist.nglist_white_lowuppDist_enable;
                        this.replace_string_Ele.value = applylist.replace_string;
                        this.replace_mode_Ele.webabron_mode.value = applylist.replace_mode;
                    }

                    this.SaveButtonFunc = this.WebAbronListStoSave.bind(this);
                    this.DelButtonFunc = this.WebAbronListStoDel.bind(this);
                    this.NewObjectButtonFunc = this.WebAbronListNewEditButton.bind(this);
                }

                async init() {
                    await super.init();
                    this.EditConfigObjectPage_Ele = document.createElement("div");
                    this.EditConfigObjectPage_Ele.style.display = "none";
                    this.EditConfigObjectPage_Ele.style.height = "calc(100% - 80px)";
                    this.EditConfigObjectPage_Ele.innerHTML = `
<style type="text/css">
  div.EditConfigObjectPage {
    height: 100%;
  }
  div.ItemFrame_Border {
    position: relative;
    margin-top: 1em;
    padding: 12px;
    border: 1px solid black;
  }
  h1.ItemFrame_Title {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1em;
    padding: 0 4px;
    margin: 0;
    transform: translateY(-50%) translateX(6px);
    background-color: #ffffb2;
    white-space: nowrap;
  }
  select.SentenceBlock_Select {
    width: 100%;
  }
</style>

<div id="SentenceBlockConfig" class="EditConfigObjectPage">
  <div class="ItemFrame_Border">
    <h1 id="SentenceBlockConfig1_Title" class="ItemFrame_Title"></h1>
    <p id="SentenceBlockConfig1_Description"></p>
    <input id="SentenceBlockConfig1_Input1" type="text" />
    <br />
    <label>
      <input id="SentenceBlockConfig1_Input2" type="checkbox" />
      <span id="SentenceBlockConfig1_Input2_SpanText"></span>
    </label>
  </div>
  <div class="ItemFrame_Border">
    <h1 id="SentenceBlockConfig2_Title" class="ItemFrame_Title"></h1>
    <p id="SentenceBlockConfig2_Description"></p>
    <select
      id="SentenceBlockConfig2_Select"
      class="SentenceBlock_Select"
      size="1"
    >
      <option value="">-----</option>
    </select>
    <div>
      <label>
        <input id="SentenceBlockConfig2_Input1" type="checkbox" />
        <span id="SentenceBlockConfig2_Input1_SpanText"></span>
      </label>
      <label>
        <input id="SentenceBlockConfig2_Input2" type="checkbox" />
        <span id="SentenceBlockConfig2_Input2_SpanText"></span>
      </label>
      <div class="ItemFrame_Border">
        <label>
          <input id="SentenceBlockConfig2-2_Input1" type="checkbox" />
          <span id="SentenceBlockConfig2-2_Input1_SpanText"></span>
        </label>
        <select
          id="SentenceBlockConfig2-2_Select"
          class="SentenceBlock_Select"
          size="1"
        >
          <option value="">-----</option>
        </select>
        <div>
          <label>
            <input id="SentenceBlockConfig2-2_Input2" type="checkbox" />
            <span id="SentenceBlockConfig2-2_Input2_SpanText"></span>
          </label>
          <label>
            <input id="SentenceBlockConfig2-2_Input3" type="checkbox" />
            <span id="SentenceBlockConfig2-2_Input3_SpanText"></span>
          </label>
        </div>
      </div>
    </div>
  </div>
  <div class="ItemFrame_Border">
    <h1 id="SentenceBlockConfig3_Title" class="ItemFrame_Title"></h1>
    <p id="SentenceBlockConfig3_Description"></p>
    <input id="SentenceBlockConfig3_InputText" type="text" />
    <form id="SentenceBlockConfig3_Form">
      <label>
        <input type="radio" name="webabron_mode" value="sentence" checked />
        <span id="SentenceBlockConfig3_Form_Input1_SpanText"></span>
      </label>
      <label>
        <input type="radio" name="webabron_mode" value="word" />
        <span id="SentenceBlockConfig3_Form_Input2_SpanText"></span>
      </label>
    </form>
  </div>
  <div>
    <button id="SentenceBlockConfig_BackButton"></button>
  </div>
</div>
                    `
                    DashboardMain_div.append(this.EditConfigObjectPage_Ele);
                    settingsbox_2_ele_stack.push(this.EditConfigObjectPage_Ele);

                    RootShadow.getElementById("SentenceBlockConfig1_Title").textContent = "URL";
                    RootShadow.getElementById("SentenceBlockConfig1_Description").textContent = "このルールを有効にするサイトを指定します。何も入力せず空欄にするとすべてのサイトが対象になります。";
                    RootShadow.getElementById("SentenceBlockConfig1_Input2_SpanText").textContent = "正規表現";
                    RootShadow.getElementById("SentenceBlockConfig2_Title").textContent = "NGフィルタ";
                    RootShadow.getElementById("SentenceBlockConfig2_Description").textContent = "使用するNGフィルタを指定します。";
                    RootShadow.getElementById("SentenceBlockConfig2_Input1_SpanText").textContent = "正規表現";
                    RootShadow.getElementById("SentenceBlockConfig2_Input2_SpanText").textContent = "大文字小文字を区別";
                    RootShadow.getElementById("SentenceBlockConfig2-2_Input1_SpanText").textContent = "ホワイトリストも使用する";
                    RootShadow.getElementById("SentenceBlockConfig2-2_Input2_SpanText").textContent = "正規表現";
                    RootShadow.getElementById("SentenceBlockConfig2-2_Input3_SpanText").textContent = "大文字小文字を区別";
                    RootShadow.getElementById("SentenceBlockConfig3_Title").textContent = "置換文字";
                    RootShadow.getElementById("SentenceBlockConfig3_Description").textContent = "置換する文字列を入力します。";
                    RootShadow.getElementById("SentenceBlockConfig3_Form_Input1_SpanText").textContent = "一文章で置換える";
                    RootShadow.getElementById("SentenceBlockConfig3_Form_Input2_SpanText").textContent = "単語で置換える";
                    RootShadow.getElementById("SentenceBlockConfig_BackButton").textContent = "←戻る";

                    this.url_Ele = RootShadow.getElementById("SentenceBlockConfig1_Input1");
                    this.url_regex_enable_Ele = RootShadow.getElementById("SentenceBlockConfig1_Input2");
                    this.nglist_list_Ele = RootShadow.getElementById("SentenceBlockConfig2_Select");
                    this.nglist_regex_enable_Ele = RootShadow.getElementById("SentenceBlockConfig2_Input1");
                    this.nglist_lowuppDist_enable_Ele = RootShadow.getElementById("SentenceBlockConfig2_Input2");
                    this.nglist_white_enable_Ele = RootShadow.getElementById("SentenceBlockConfig2-2_Input1");
                    this.nglist_white_list_Ele = RootShadow.getElementById("SentenceBlockConfig2-2_Select");
                    this.nglist_white_regex_enable_Ele = RootShadow.getElementById("SentenceBlockConfig2-2_Input2");
                    this.nglist_white_lowuppDist_enable_Ele = RootShadow.getElementById("SentenceBlockConfig2-2_Input3");
                    this.replace_string_Ele = RootShadow.getElementById("SentenceBlockConfig3_InputText");
                    this.replace_mode_Ele = RootShadow.getElementById("SentenceBlockConfig3_Form");

                    for (let i = 0; i < NGListStorage.length; i++) {
                        const settingsbox_2_3_4_1_2_option = document.createElement("option");
                        settingsbox_2_3_4_1_2_option.setAttribute("value", NGListStorage[i].name);
                        settingsbox_2_3_4_1_2_option.textContent = NGListStorage[i].name;
                        this.nglist_list_Ele.append(settingsbox_2_3_4_1_2_option);
                        this.nglist_white_list_Ele.append(settingsbox_2_3_4_1_2_option.cloneNode(true));
                    }

                    RootShadow.getElementById("SentenceBlockConfig_BackButton").addEventListener("click", () => {
                        this.SettingsObjectListPage_Ele.style.display = "block";
                        this.EditConfigObjectPage_Ele.style.display = "none";
                    }, false);
                }

                async WebAbronListStoSave() {
                    const StoObj = {
                        name: this.name_Ele.value,
                        enable: this.enable_Ele.checked,
                        url: this.url_Ele.value,
                        url_regex_enable: this.url_regex_enable_Ele.checked,
                        nglist_list: this.nglist_list_Ele.value,
                        nglist_regex_enable: this.nglist_regex_enable_Ele.checked,
                        nglist_lowuppDist_enable: this.nglist_lowuppDist_enable_Ele.checked,
                        nglist_white_enable: this.nglist_white_enable_Ele.checked,
                        nglist_white_list: this.nglist_white_list_Ele.value,
                        nglist_white_regex_enable: this.nglist_white_regex_enable_Ele.checked,
                        nglist_white_lowuppDist_enable: this.nglist_white_lowuppDist_enable_Ele.checked,
                        replace_string: this.replace_string_Ele.value,
                        replace_mode: this.replace_mode_Ele.webabron_mode.value,
                    }
                    await this.ListStoSave("WebAbron", StoObj);
                }

                async WebAbronListStoDel() {
                    await this.ListStoDel("WebAbron");
                }

                async WebAbronListNewEditButton(NewbuttonEle) {
                    if (await this.NewEditButton(NewbuttonEle)) {
                        this.url_Ele.value = "";
                        this.url_regex_enable_Ele.checked = false;
                        this.nglist_list_Ele.value = "";
                        this.nglist_regex_enable_Ele.checked = false;
                        this.nglist_lowuppDist_enable_Ele.checked = false;
                        this.nglist_white_enable_Ele.checked = false;
                        this.nglist_white_list_Ele.value = "";
                        this.nglist_white_regex_enable_Ele.checked = false;
                        this.nglist_white_lowuppDist_enable_Ele.checked = false;
                        this.replace_string_Ele.value = "";
                        this.replace_mode_Ele.webabron_mode.value = "sentence";

                        this.enable_Ele.checked = true;
                        return 0;
                    }
                }

            }(WebAbronStorage).init();
        }

        async function settingsbox_2_4_ElementBlockerSet() {
            await new class extends ListEdit_Func {
                constructor(ElementBlockerStorage) {
                    super(ElementBlockerStorage);
                    this.url_Ele = null;
                    this.url_regex_enable_Ele = null;
                    this.elementHide_Ele = null;
                    this.elementHide_method_Ele = null;
                    this.elementSearch_Ele = null;
                    this.elementSearch_method_Ele = null;
                    this.elementSearch_index_enable_Ele = null;
                    this.elementSearch_index_Ele = null;
                    this.elementSearch_property_Ele = null;
                    this.elementSearch_property_style_Ele = null;
                    this.nglist_list_Ele = null;
                    this.nglist_regex_enable_Ele = null;
                    this.nglist_lowuppDist_enable_Ele = null;
                    this.nglist_urlMethod_enable_Ele = null;
                    this.nglist_white_enable_Ele = null;
                    this.nglist_white_list_Ele = null;
                    this.nglist_white_regex_enable_Ele = null;
                    this.nglist_white_lowuppDist_enable_Ele = null;
                    this.nglist_white_urlMethod_enable_Ele = null;
                    this.li_cfuncinfunction = async () => {
                        const applylist = this.ListStorage[this.currentIndex];
                        this.enable_Ele.checked = applylist.enable;
                        this.url_Ele.value = applylist.url;
                        this.url_regex_enable_Ele.checked = applylist.url_regex_enable;
                        this.elementHide_Ele.value = applylist.elementHide;
                        this.elementHide_method_Ele.pickerMethod.value = applylist.elementHide_method;
                        this.elementSearch_Ele.value = applylist.elementSearch;
                        this.elementSearch_method_Ele.pickerMethod.value = applylist.elementSearch_method;
                        // this.elementSearch_index_enable_Ele.checked = applylist.elementSearch_index_enable;
                        // this.elementSearch_index_Ele.value = applylist.elementSearch_index;
                        this.elementSearch_property_Ele.propertyMode.value = applylist.elementSearch_property;
                        this.elementSearch_property_style_Ele.value = applylist.elementSearch_property_style;
                        this.nglist_list_Ele.value = applylist.nglist_list;
                        this.nglist_regex_enable_Ele.checked = applylist.nglist_regex_enable;
                        this.nglist_lowuppDist_enable_Ele.checked = applylist.nglist_lowuppDist_enable;
                        this.nglist_urlMethod_enable_Ele.checked = applylist.nglist_urlMethod_enable;
                        this.nglist_white_enable_Ele.checked = applylist.nglist_white_enable;
                        this.nglist_white_list_Ele.value = applylist.nglist_white_list;
                        this.nglist_white_regex_enable_Ele.checked = applylist.nglist_white_regex_enable;
                        this.nglist_white_lowuppDist_enable_Ele.checked = applylist.nglist_white_lowuppDist_enable;
                        this.nglist_white_urlMethod_enable_Ele.checked = applylist.nglist_white_urlMethod_enable;
                    }

                    this.SaveButtonFunc = this.ElementBlockerListStoSave.bind(this);
                    this.DelButtonFunc = this.ElementBlockerListStoDel.bind(this);
                    this.NewObjectButtonFunc = this.ElementBlockerListNewEditButton.bind(this);
                }

                async init() {
                    await super.init();
                    this.EditConfigObjectPage_Ele = document.createElement("div");
                    this.EditConfigObjectPage_Ele.style.display = "none";
                    this.EditConfigObjectPage_Ele.style.height = "calc(100% - 80px)";
                    this.EditConfigObjectPage_Ele.innerHTML = `
<style type="text/css">
  div.EditConfigObjectPage {
    height: 100%;
  }
  .ItemFrame_Border {
    position: relative;
    margin-top: 1em;
    padding: 12px;
    border: 1px solid black;
  }
  h1.ItemFrame_Title {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1em;
    padding: 0 4px;
    margin: 0;
    transform: translateY(-50%) translateX(6px);
    background-color: #ffffb2;
    white-space: nowrap;
  }
  select.ElementBlock_Select {
    width: 100%;
  }
</style>

<div id="ElementBlockConfig" class="EditConfigObjectPage">
  <div class="ItemFrame_Border">
    <h1 id="ElementBlockConfig1_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlockConfig1_Description"></p>
    <input id="ElementBlockConfig1_Input1" type="text" />
    <br />
    <label>
      <input id="ElementBlockConfig1_Input2" type="checkbox" />
      <span id="ElementBlockConfig1_Input2_SpanText"></span>
    </label>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="ElementBlockConfig2_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlockConfig2_Description"></p>
    <input id="ElementBlockConfig2_InputText" type="text" />
    <form id="ElementBlockConfig2_Form">
      <label>
        <input type="radio" name="pickerMethod" value="css" checked />
        <span id="ElementBlockConfig2_Form_Input1_SpanText"></span>
      </label>
      <label>
        <input type="radio" name="pickerMethod" value="xpath" />
        <span id="ElementBlockConfig2_Form_Input2_SpanText"></span>
      </label>
    </form>
    <button id="ElementBlockConfig2_Button"></button>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="ElementBlockConfig3_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlockConfig3_Description"></p>
    <input id="ElementBlockConfig3_InputText" type="text" />
    <form id="ElementBlockConfig3_Form">
      <label>
        <input type="radio" name="pickerMethod" value="css" checked />
        <span id="ElementBlockConfig3_Form_Input1_SpanText"></span>
      </label>
      <label>
        <input type="radio" name="pickerMethod" value="xpath" />
        <span id="ElementBlockConfig3_Form_Input2_SpanText"></span>
      </label>
    </form>
    <button id="ElementBlockConfig3_Button"></button>
    <form id="ElementBlockConfig3-2_From" class="ItemFrame_Border">
      <label>
        <input type="radio" name="propertyMode" value="text" checked />
        <span id="ElementBlockConfig3-2_Form_Input1_SpanText"></span>
      </label>
      <br />
      <label>
        <input type="radio" name="propertyMode" value="href" />
        <span id="ElementBlockConfig3-2_Form_Input2_SpanText"></span>
      </label>
      <br />
      <label>
        <input type="radio" name="propertyMode" value="style" />
        <span id="ElementBlockConfig3-2_Form_Input3_SpanText"></span>
        <input id="ElementBlockConfig3-2_Form_Input3_InputText" type="text" />
      </label>
    </form>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="ElementBlockConfig4_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlockConfig4_Description"></p>
    <select
      id="ElementBlockConfig4_Select"
      class="ElementBlock_Select"
      size="1"
    >
      <option value="">-----</option>
    </select>
    <div>
      <label>
        <input id="ElementBlockConfig4_Input1" type="checkbox" />
        <span id="ElementBlockConfig4_Input1_SpanText"></span>
      </label>
      <label>
        <input id="ElementBlockConfig4_Input2" type="checkbox" />
        <span id="ElementBlockConfig4_Input2_SpanText"></span>
      </label>
      <label>
        <input id="ElementBlockConfig4_Input3" type="checkbox" />
        <span id="ElementBlockConfig4_Input3_SpanText"></span>
      </label>
      <div class="ItemFrame_Border">
        <label>
          <input id="ElementBlockConfig4-2_Input1" type="checkbox" />
          <span id="ElementBlockkConfig4-2_Input1_SpanText"></span>
        </label>
        <select
          id="ElementBlockConfig4-2_Select"
          class="ElementBlock_Select"
          size="1"
        >
          <option value="">-----</option>
        </select>
        <div>
          <label>
            <input id="ElementBlockConfig4-2_Input2" type="checkbox" />
            <span id="ElementBlockConfig4-2_Input2_SpanText"></span>
          </label>
          <label>
            <input id="ElementBlockConfig4-2_Input3" type="checkbox" />
            <span id="ElementBlockConfig4-2_Input3_SpanText"></span>
          </label>
          <label>
            <input id="ElementBlockConfig4-2_Input4" type="checkbox" />
            <span id="ElementBlockConfig4-2_Input4_SpanText"></span>
          </label>
        </div>
      </div>
    </div>
  </div>
  <div>
    <button id="ElementBlockConfig_BackButton"></button>
  </div>
</div>
                    `
                    DashboardMain_div.append(this.EditConfigObjectPage_Ele);
                    settingsbox_2_ele_stack.push(this.EditConfigObjectPage_Ele);

                    RootShadow.getElementById("ElementBlockConfig1_Title").textContent = "URL";
                    RootShadow.getElementById("ElementBlockConfig1_Description").innerHTML = "このルールを有効にするサイトを指定します。 <br>正規表現がOFFの時「*」でワイルドカードを使用できます。";
                    RootShadow.getElementById("ElementBlockConfig1_Input2_SpanText").textContent = "正規表現";
                    RootShadow.getElementById("ElementBlockConfig2_Title").textContent = "非表示要素";
                    RootShadow.getElementById("ElementBlockConfig2_Description").textContent = "非表示する要素をCSS方式「querySelectorAll」かXPath方式「document.evaluate」で指定します。";
                    RootShadow.getElementById("ElementBlockConfig2_Form_Input1_SpanText").textContent = "CSS";
                    RootShadow.getElementById("ElementBlockConfig2_Form_Input2_SpanText").textContent = "XPath";
                    RootShadow.getElementById("ElementBlockConfig2_Button").textContent = "要素を選択する";
                    RootShadow.getElementById("ElementBlockConfig3_Title").textContent = "検索要素";
                    RootShadow.getElementById("ElementBlockConfig3_Description").textContent = "非表示するために検索する要素をCSS方式「querySelectorAll」かXPath方式「document.evaluate」で指定します。何も入力せず空欄にすると無条件で非表示要素を隠します。";
                    RootShadow.getElementById("ElementBlockConfig3_Form_Input1_SpanText").textContent = "CSS";
                    RootShadow.getElementById("ElementBlockConfig3_Form_Input2_SpanText").textContent = "XPath";
                    RootShadow.getElementById("ElementBlockConfig3_Button").textContent = "要素を選択する";
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input1_SpanText").textContent = "要素のテキストを検索する";
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input2_SpanText").textContent = "要素のリンクを検索する（検索要素に「a」要素が含まれている場合のみ）";
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input3_SpanText").textContent = "要素のスタイルシートを検索する（上級者向け）";
                    RootShadow.getElementById("ElementBlockConfig4_Title").textContent = "NGフィルタ";
                    RootShadow.getElementById("ElementBlockConfig4_Description").textContent = "要素検索に使用するNGフィルタを指定します。";
                    RootShadow.getElementById("ElementBlockConfig4_Input1_SpanText").textContent = "正規表現";
                    RootShadow.getElementById("ElementBlockConfig4_Input2_SpanText").textContent = "大文字小文字を区別";
                    RootShadow.getElementById("ElementBlockConfig4_Input3_SpanText").textContent = "URL専用の軽量処理をする";
                    RootShadow.getElementById("ElementBlockkConfig4-2_Input1_SpanText").textContent = "ホワイトリストも使用する";
                    RootShadow.getElementById("ElementBlockConfig4-2_Input2_SpanText").textContent = "正規表現";
                    RootShadow.getElementById("ElementBlockConfig4-2_Input3_SpanText").textContent = "大文字小文字を区別";
                    RootShadow.getElementById("ElementBlockConfig4-2_Input4_SpanText").textContent = "URL専用の軽量処理をする";
                    RootShadow.getElementById("ElementBlockConfig_BackButton").textContent = "←戻る";

                    this.url_Ele = RootShadow.getElementById("ElementBlockConfig1_Input1");
                    this.url_regex_enable_Ele = RootShadow.getElementById("ElementBlockConfig1_Input2");
                    this.elementHide_Ele = RootShadow.getElementById("ElementBlockConfig2_InputText");
                    this.elementHide_method_Ele = RootShadow.getElementById("ElementBlockConfig2_Form");
                    this.elementSearch_Ele = RootShadow.getElementById("ElementBlockConfig3_InputText");
                    this.elementSearch_method_Ele = RootShadow.getElementById("ElementBlockConfig3_Form");
                    this.elementSearch_property_Ele = RootShadow.getElementById("ElementBlockConfig3-2_From");
                    this.elementSearch_property_style_Ele = RootShadow.getElementById("ElementBlockConfig3-2_Form_Input3_InputText");
                    this.nglist_list_Ele = RootShadow.getElementById("ElementBlockConfig4_Select");
                    this.nglist_regex_enable_Ele = RootShadow.getElementById("ElementBlockConfig4_Input1");
                    this.nglist_lowuppDist_enable_Ele = RootShadow.getElementById("ElementBlockConfig4_Input2");
                    this.nglist_urlMethod_enable_Ele = RootShadow.getElementById("ElementBlockConfig4_Input3");
                    this.nglist_white_enable_Ele = RootShadow.getElementById("ElementBlockConfig4-2_Input1");
                    this.nglist_white_list_Ele = RootShadow.getElementById("ElementBlockConfig4-2_Select");
                    this.nglist_white_regex_enable_Ele = RootShadow.getElementById("ElementBlockConfig4-2_Input2");
                    this.nglist_white_lowuppDist_enable_Ele = RootShadow.getElementById("ElementBlockConfig4-2_Input3");
                    this.nglist_white_urlMethod_enable_Ele = RootShadow.getElementById("ElementBlockConfig4-2_Input4");

                    for (let i = 0; i < NGListStorage.length; i++) {
                        const settingsbox_2_3_4_1_2_option = document.createElement("option");
                        settingsbox_2_3_4_1_2_option.setAttribute("value", NGListStorage[i].name);
                        settingsbox_2_3_4_1_2_option.textContent = NGListStorage[i].name;
                        this.nglist_list_Ele.append(settingsbox_2_3_4_1_2_option);
                        this.nglist_white_list_Ele.append(settingsbox_2_3_4_1_2_option.cloneNode(true));
                    }

                    RootShadow.getElementById("ElementBlockConfig_BackButton").addEventListener("click", () => {
                        this.SettingsObjectListPage_Ele.style.display = "block";
                        this.EditConfigObjectPage_Ele.style.display = "none";
                    }, false);
                }

                async ElementBlockerListStoSave() {
                    const StoObj = {
                        name: this.name_Ele.value,
                        enable: this.enable_Ele.checked,
                        url: this.url_Ele.value,
                        url_regex_enable: this.url_regex_enable_Ele.checked,
                        elementHide: this.elementHide_Ele.value,
                        elementHide_method: this.elementHide_method_Ele.pickerMethod.value,
                        elementSearch: this.elementSearch_Ele.value,
                        elementSearch_method: this.elementSearch_method_Ele.pickerMethod.value,
                        // elementSearch_index_enable: this.elementSearch_index_enable_Ele.checked,
                        // elementSearch_index: this.elementSearch_index_Ele.value,
                        elementSearch_property: this.elementSearch_property_Ele.propertyMode.value,
                        elementSearch_property_style: this.elementSearch_property_style_Ele.value,
                        nglist_list: this.nglist_list_Ele.value,
                        nglist_regex_enable: this.nglist_regex_enable_Ele.checked,
                        nglist_lowuppDist_enable: this.nglist_lowuppDist_enable_Ele.checked,
                        nglist_urlMethod_enable: this.nglist_urlMethod_enable_Ele.checked,
                        nglist_white_enable: this.nglist_white_enable_Ele.checked,
                        nglist_white_list: this.nglist_white_list_Ele.value,
                        nglist_white_regex_enable: this.nglist_white_regex_enable_Ele.checked,
                        nglist_white_lowuppDist_enable: this.nglist_white_lowuppDist_enable_Ele.checked,
                        nglist_white_urlMethod_enable: this.nglist_white_urlMethod_enable_Ele.checked
                    }
                    await this.ListStoSave("ElementBlocker", StoObj);
                }

                async ElementBlockerListStoDel() {
                    await this.ListStoDel("ElementBlocker");
                }

                async ElementBlockerListNewEditButton(NewbuttonEle) {
                    if (await this.NewEditButton(NewbuttonEle)) {
                        this.enable_Ele.checked = false;
                        this.url_Ele.value = "";
                        this.url_regex_enable_Ele.checked = false;
                        this.elementHide_Ele.value = "";
                        this.elementHide_method_Ele.pickerMethod.value = "css";
                        this.elementSearch_Ele.value = "";
                        this.elementSearch_method_Ele.pickerMethod.value = "css";
                        // this.elementSearch_index_enable_Ele.checked = false;
                        // this.elementSearch_index_Ele.value = "";
                        this.elementSearch_property_Ele.propertyMode.value = "text";
                        this.elementSearch_property_style_Ele.value = "";
                        this.nglist_list_Ele.value = "";
                        this.nglist_regex_enable_Ele.checked = false;
                        this.nglist_lowuppDist_enable_Ele.checked = false;
                        this.nglist_urlMethod_enable_Ele.checked = false;
                        this.nglist_white_enable_Ele.checked = false;
                        this.nglist_white_list_Ele.value = "";
                        this.nglist_white_regex_enable_Ele.checked = false;
                        this.nglist_white_lowuppDist_enable_Ele.checked = false;
                        this.nglist_white_urlMethod_enable_Ele.checked = false;

                        this.enable_Ele.checked = true;
                        return 0;
                    }
                }

            }(ElementBlockerStorage).init();
        }

        async function settingsbox_2_5_PreferenceSet() {
            ArrayLast(settingsbox_2_ele_stack).style.display = "none";
            const settingsbox_2_5_div = document.createElement("div");
            settingsbox_2_5_div.innerHTML = `
<style type="text/css">
  div.PreferencesItem {
    display: block;
    margin: 0 0 20px 0;
  }
  #PreferencesPage p {
    margin: 0;
  }
</style>

<div id="PreferencesPage">
  <div id="ImportAndExport_Setting" class="PreferencesItem">
    <p id="ImportAndExport_Setting_Title"></p>
    <button id="ImportAndExport_Setting_Button"></button>
  </div>
  <div id="ButtonHide_Setting" class="PreferencesItem">
    <p id="ButtonHide_Setting_Title"></p>
    <label>
      <input id="ButtonHide_Setting_Input" type="checkbox" />
      <span id="ButtonHide_Setting_Input_SpanText"></span>
    </label>
  </div>
  <div id="SettingMainPageBack" class="PreferencesItem">
    <button id="PreferencesPageBack_Button"></button>
  </div>
</div>
            `
            DashboardMain_div.append(settingsbox_2_5_div);
            settingsbox_2_ele_stack.push(settingsbox_2_5_div);

            RootShadow.getElementById("ImportAndExport_Setting_Title").innerHTML = "エクスポート&インポート<br>設定内容をエクスポートまたはインポートします。";
            RootShadow.getElementById("ImportAndExport_Setting_Button").textContent = "エクスポート&インポート";
            RootShadow.getElementById("ButtonHide_Setting_Title").innerHTML = "右上のボタンを常時非表示にする<br>右上のボタンを常時非表示にします。<br>（注意：UserScriptマネージャーのメニュー画面から設定ウィンドウを呼び出せない場合、このオプションを使用すると再インストールしない限り二度と設定画面を表示することはできなくなります。（再インストールした場合設定内容はすべて消去されます。）";
            RootShadow.getElementById("ButtonHide_Setting_Input_SpanText").textContent = "ボタンを非表示にする";
            RootShadow.getElementById("PreferencesPageBack_Button").textContent = "←戻る";

            RootShadow.getElementById("ImportAndExport_Setting_Button").addEventListener("click", settingsbox_2_5_2_ExportImport, false);

            const ButtonHide_Setting_Input = RootShadow.getElementById("ButtonHide_Setting_Input");
            if (PreferenceSetting["hideButton"]) {
                ButtonHide_Setting_Input.checked = true;
            } else {
                ButtonHide_Setting_Input.checked = false;
            }
            ButtonHide_Setting_Input.addEventListener("change", async function () {
                if (this.checked) {
                    this.checked = false;
                    const res = confirm("UserScriptマネージャーのメニュー画面から設定ウィンドウを呼び出せない場合、再インストールしないと二度と設定画面を表示することはできなくなります。本当に常時ボタンを非表示にしてよろしいですか？");
                    if (res) {
                        this.checked = true;
                        PreferenceSetting["hideButton"] = true;
                        await StorageApiWrite("PreferenceSetting", JSON.stringify(PreferenceSetting));
                    }
                } else {
                    PreferenceSetting["hideButton"] = false;
                    await StorageApiWrite("PreferenceSetting", JSON.stringify(PreferenceSetting));
                }
            });

            RootShadow.getElementById("PreferencesPageBack_Button").addEventListener("click", () => {
                settingsbox_2_ele_stack.pop().remove();
                ArrayLast(settingsbox_2_ele_stack).style.display = "block";
            }, false);


            async function settingsbox_2_5_2_ExportImport() {
                async function settingsbox_2_5_2_JSONFormat(mode, importjson) {
                    if (mode === "export") {
                        try {
                            const KeyList = await StorageApiKeynamelist();
                            let JSONObject = new Object;
                            for (let i = 0; i < KeyList.length; i++) {
                                JSONObject[KeyList[i]] = await StorageApiRead(KeyList[i]);
                            }
                            return JSON.stringify(JSONObject);
                        } catch (e) {
                            console.error(e);
                            alert("エラー：エクスポートに失敗しました。詳細はコンソールログを参照してください。")
                            return undefined;
                        }
                    } else if (mode === "import") {
                        try {
                            const ExistKeyList = await StorageApiKeynamelist();
                            for (let i = 0; i < ExistKeyList.length; i++) {
                                await StorageApiDelete(ExistKeyList[i]);
                            }
                            let importset;
                            try {
                                importset = JSON.parse(importjson);
                            } catch (e) {
                                console.error(e);
                                alert("エラー：設定を読み込めませんでした。JSONファイル（テキスト）が壊れている可能性があります。エラーの詳細はコンソールログを参照してください。");
                                return undefined;
                            }
                            for (let key in importset) {
                                await StorageApiWrite(key, importset[key]);
                            }
                            StorageLoad();
                            return true;
                        } catch (e) {
                            console.error(e);
                            return undefined;
                        }
                    } else {
                        return undefined;
                    }
                }

                ArrayLast(settingsbox_2_ele_stack).style.display = "none";
                const settingsbox_2_5_2_div = document.createElement("div");
                settingsbox_2_5_2_div.innerHTML = `
<style type="text/css">
  div.PreferencesItem {
    display: block;
    margin: 0 0 20px 0;
  }
  #ExportAndImportPage {
    position: relative;
    margin-top: 1em;
    padding: 12px;
    border: 1px solid black;
  }
  #ExportAndImportPage p {
    margin: 0;
  }
  div.ItemFrame_Border {
    position: relative;
    margin-top: 1em;
    padding: 12px;
    border: 1px solid black;
  }
  h1.ItemFrame_Title {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1em;
    padding: 0 4px;
    margin: 0;
    transform: translateY(-50%) translateX(6px);
    background-color: #ffffb2;
    white-space: nowrap;
  }
  textarea#ExportAndImportConfig3_Textarea {
    resize: none;
    width: 98.5%;
    height: 300px;
  }
</style>

<div id="ExportAndImportPage">
  <div class="ItemFrame_Border">
    <h1 id="ExportAndImportConfig1_Title" class="ItemFrame_Title"></h1>
    <button id="ExportAndImportConfig1_Button1"></button>
    <button id="ExportAndImportConfig1_Button2"></button>
    <button id="ExportAndImportConfig1_Button3"></button>
    <span id="ExportAndImportConfig1_SpanText" style="display: none"></span>
  </div>
  <div class="ItemFrame_Border">
    <h1 id="ExportAndImportConfig2_Title" class="ItemFrame_Title"></h1>
    <div class="ItemFrame_Border">
      <span id="ExportAndImportConfig2-1_SpanText"></span>
      <input id="ExportAndImportConfig2-1_Input" type="file" />
    </div>
    <div class="ItemFrame_Border">
      <button id="ExportAndImportConfig2-2_Button"></button>
    </div>
    <span id="ExportAndImportConfig2_SpanText" style="display: none"></span>
  </div>
  <div class="ItemFrame_Border">
    <h1 id="ExportAndImportConfig3_Title" class="ItemFrame_Title"></h1>
    <textarea
      id="ExportAndImportConfig3_Textarea"
      spellcheck="false"
    ></textarea>
  </div>
  <button id="ExportAndImportConfig_BackButton"></button>
</div>
                `
                DashboardMain_div.append(settingsbox_2_5_2_div);
                settingsbox_2_ele_stack.push(settingsbox_2_5_2_div);

                RootShadow.getElementById("ExportAndImportConfig1_Title").textContent = "エクスポート";
                RootShadow.getElementById("ExportAndImportConfig1_Button1").textContent = "JSONファイルでエクスポート";
                RootShadow.getElementById("ExportAndImportConfig1_Button2").textContent = "JSON形式でクリップボードにコピー";
                RootShadow.getElementById("ExportAndImportConfig1_Button3").textContent = "テキストエリアにエクスポート（JSON形式）";
                RootShadow.getElementById("ExportAndImportConfig1_SpanText").textContent = "エクスポートしました。";
                RootShadow.getElementById("ExportAndImportConfig2_Title").textContent = "インポート";
                RootShadow.getElementById("ExportAndImportConfig2-1_SpanText").textContent = "JSONファイルからインポート";
                RootShadow.getElementById("ExportAndImportConfig2-2_Button").textContent = "テキストエリアからインポート（JSON形式）";
                RootShadow.getElementById("ExportAndImportConfig2_SpanText").textContent = "インポートしました。";
                RootShadow.getElementById("ExportAndImportConfig3_Title").textContent = "テキストエリア";
                RootShadow.getElementById("ExportAndImportConfig_BackButton").textContent = "←戻る";


                const ExportSuccessTextEle = RootShadow.getElementById("ExportAndImportConfig1_SpanText");
                const ImportSuccessTextEle = RootShadow.getElementById("ExportAndImportConfig2_SpanText");
                const TextareaEle = RootShadow.getElementById("ExportAndImportConfig3_Textarea");

                RootShadow.getElementById("ExportAndImportConfig1_Button1").addEventListener("click", async () => {
                    const setJSON = await settingsbox_2_5_2_JSONFormat("export");
                    if (setJSON) {
                        const d = new Date();
                        const filename = new String().concat("NagativeBlockerBackup_", d.getFullYear(), "-", d.getMonth(), "-", d.getDate(), "_", d.getHours(), "-", d.getMinutes(), "-", d.getSeconds(), ".json");

                        const blob = new Blob([setJSON], { type: 'text/plain' });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = filename;
                        a.click();
                        a.remove();
                        ExportSuccessTextEle.style.display = "block";
                    }
                }, false);

                RootShadow.getElementById("ExportAndImportConfig1_Button2").addEventListener("click", async () => {
                    const setJSON = await settingsbox_2_5_2_JSONFormat("export");
                    if (setJSON) {
                        copyTextToClipboard(setJSON);
                        ExportSuccessTextEle.style.display = "block";
                    }
                }, false);

                RootShadow.getElementById("ExportAndImportConfig1_Button3").addEventListener("click", async () => {
                    const setJSON = await settingsbox_2_5_2_JSONFormat("export");
                    if (setJSON) {
                        TextareaEle.value = setJSON;
                        ExportSuccessTextEle.style.display = "block";
                    }
                    TextareaEle.value = setJSON;
                }, false);

                RootShadow.getElementById("ExportAndImportConfig2-1_Input").addEventListener("change", async (evt) => {
                    if (evt.target.files[0]) {
                        const res = confirm("現在の設定内容をインポートしたデータですべて上書きします。よろしいですか？");
                        if (!res) {
                            return false;
                        }
                        const file = evt.target.files[0];
                        const reader = new FileReader();
                        reader.onload = async (evt) => {
                            const result = await settingsbox_2_5_2_JSONFormat("import", evt.target.result);
                            if (result) {
                                ImportSuccessTextEle.style.display = "block";
                            }
                        }
                        reader.readAsText(file);
                    }
                });

                RootShadow.getElementById("ExportAndImportConfig2-2_Button").addEventListener("click", async () => {
                    const res = confirm("現在の設定内容をインポートしたデータですべて上書きします。よろしいですか？");
                    if (!res) {
                        return false;
                    }
                    const result = await settingsbox_2_5_2_JSONFormat("import", TextareaEle.value);
                    if (result) {
                        ImportSuccessTextEle.style.display = "block";
                    }
                }, false);

                RootShadow.getElementById("ExportAndImportConfig_BackButton").addEventListener("click", () => {
                    settingsbox_2_ele_stack.pop().remove();
                    ArrayLast(settingsbox_2_ele_stack).style.display = "block";
                }, false);

            }
        }
    }

})();

