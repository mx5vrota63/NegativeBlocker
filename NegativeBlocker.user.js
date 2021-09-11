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
    let Dashboard_Element;
    let DashboardMain_div;
    const Dashboard_Window_Ele_stack = new Array();
    let DashboardButtonEle;
    let BlockCounter = 0;

    let observerInterval = 0;
    let dateInterval = Date.now();
    /*
    let observerExecuteFlag = false;
    let observerExecuteFlag2 = false;
    */

    const SentenceBlock_ExecuteResultList = new Array();
    const ElementBlock_executeResultList = new Object();

    const SentenceBlock_TempDisableElementArray = new Array();
    const SentenceBlock_DuplicateList = new Array();

    let BlockListTextStorage;
    let SentenceBlockStorage;
    let ElementBlockStorage;
    let PreferenceSettingStorage;
    let SentenceBlockTempDisableArray;
    let fetchtimeStampGlobalStorage;

    class storageAPI {
        constructor() { }
        static async read(keyName) {
            let StorageValue = undefined;
            try {
                // eslint-disable-next-line no-undef
                StorageValue = await GM.getValue(keyName);
            } catch (e) {
                console.error(e);
                console.log("GM Function Not Detected");
            }
            return StorageValue;
        }
        static async write(keyName, setValue) {
            try {
                // eslint-disable-next-line no-undef
                await GM.setValue(keyName, setValue);
                return true;
            } catch (e) {
                console.error(e);
                console.log("GM Function Not Detected");
                return false;
            }
        }
        static async delete(keyName) {
            try {
                // eslint-disable-next-line no-undef
                await GM.deleteValue(keyName);
                return true;
            } catch (e) {
                console.error(e);
                console.log("GM Function Not Detected");
                return false;
            }
        }
        static async keynameList() {
            try {
                // eslint-disable-next-line no-undef
                return await GM.listValues();
            } catch (e) {
                console.error(e);
                console.log("GM Function Not Detected");
                return undefined;
            }
        }
    }

    const ArrayLast = array => array[array.length - 1];

    function XPathSelectorAll(expression, parentElement) {
        const XPathNode = new Array();
        const evaluateObj = document.evaluate(expression, parentElement || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < evaluateObj.snapshotLength; i++) {
            XPathNode.push(evaluateObj.snapshotItem(i));
        }
        return XPathNode;
    }

    function pauseSleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function copyTextToClipboard(text) {
        const textArea = document.createElement("textarea");

        textArea.style.position = "fixed";
        textArea.style.top = 0;
        textArea.style.left = 0;
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = 0;
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        textArea.value = text;
        document.body.append(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            const msg = successful ? 'successful' : 'failure';
            console.log('Clipboard Copy' + msg);
        } catch (e) {
            console.error(e);
            console.log('Copy Command ERROR');
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

    function typeDecision(obj, type) {
        if (!obj) return false;
        const result = {}.toString.call(obj).slice(8, -1).toLowerCase();
        if (result === type.toLowerCase()) return true;
        else return false;
    }



    async function StorageLoad() {
        BlockListTextStorage = await storageAPI.read("BlockListText");
        if (BlockListTextStorage) {
            BlockListTextStorage = JSON.parse(BlockListTextStorage);
        } else {
            BlockListTextStorage = new Array();
            await storageAPI.write("BlockListText", JSON.stringify(BlockListTextStorage));
        }

        SentenceBlockStorage = await storageAPI.read("SentenceBlock");
        if (SentenceBlockStorage) {
            SentenceBlockStorage = JSON.parse(SentenceBlockStorage);
        } else {
            SentenceBlockStorage = new Array();
            await storageAPI.write("SentenceBlock", JSON.stringify(SentenceBlockStorage));
        }

        ElementBlockStorage = await storageAPI.read("ElementBlock");
        if (ElementBlockStorage) {
            ElementBlockStorage = JSON.parse(ElementBlockStorage);
        } else {
            ElementBlockStorage = new Array();
            await storageAPI.write("ElementBlock", JSON.stringify(ElementBlockStorage));
        }

        PreferenceSettingStorage = await storageAPI.read("PreferenceSetting");
        if (PreferenceSettingStorage) {
            PreferenceSettingStorage = JSON.parse(PreferenceSettingStorage);
        } else {
            PreferenceSettingStorage = {
                performanceConfig: {
                    mode: "balance",
                    interval_balance: 10,
                    interval_performancePriority1: 100,
                    interval_performancePriority2: 100,
                    overRide_disable: "",
                    overRide_performancePriority1: "",
                    overRide_performancePriority2: "",
                    overRide_blockPriority: "",
                    overRide_balance: "",
                },
                hideButton: false,
                dashboardColor: "#ffffb2"
            };
            await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorage));
        }

        SentenceBlockTempDisableArray = await storageAPI.read("SentenceBlock_TempDisable");
        if (SentenceBlockTempDisableArray) {
            SentenceBlockTempDisableArray = JSON.parse(SentenceBlockTempDisableArray);
        } else {
            SentenceBlockTempDisableArray = new Array();
        }
        await storageAPI.write("SentenceBlock_TempDisable", JSON.stringify(new Array()));
    }
    await StorageLoad();

    async function BlockListText_feathLoad() {
        await Promise.all(BlockListTextStorage.map(async (BlockListText_Obj) => {
            if (BlockListText_Obj.fetch_enable) {
                let BlockListText_textObj = await storageAPI.read("BLT_" + BlockListText_Obj.name);
                try {
                    BlockListText_textObj = JSON.parse(BlockListText_textObj);
                    if (Date.now() - BlockListText_textObj.fetch_timeStamp >= 3600000) {
                        await fetch(BlockListText_Obj.fetch_url).then(async (response) => {
                            if (response.ok) {
                                BlockListText_textObj.text = await response.text();
                            } else {
                                throw new Error('[NegativeBlocker] FetchAPI Failure: ' + response.status);
                            }
                        }).catch((e) => {
                            console.error(e);
                        });
                        BlockListText_textObj.fetch_timeStamp = Date.now();
                        await storageAPI.write("BLT_" + BlockListText_Obj.name, JSON.stringify(BlockListText_textObj));
                    }
                } catch (e) {
                    console.error(e);
                    return false;
                }
            }
        }));
        await storageAPI.write("fetchLastTime", Date.now());
        console.log("fetch update");
    }

    fetchtimeStampGlobalStorage = await storageAPI.read("fetchLastTime");
    if (!fetchtimeStampGlobalStorage) {
        fetchtimeStampGlobalStorage = Date.now();
        await storageAPI.write("fetchLastTime", fetchtimeStampGlobalStorage);
    }
    if (Date.now() - fetchtimeStampGlobalStorage >= 3600000) {
        BlockListText_feathLoad();
    }


    // BackGround Fuction Start
    class BackGround_Func {
        constructor() {
            this.BlockListText_loadObj = new Object();
        }
        escapeRegExp(string) {
            return string.replace(/[/.*+?^${}()|[\]\\]/g, '\\$&');
        }

        escapeRegExpExcludewildcard(string) {
            return string.replace(/[/.+?^${}()|[\]\\]/g, '\\$&').replace(/[*]/g, '.$&');
        }

        async uBlacklistFormatSearch(BLT_uBL_Obj, source, mode) {
            const urlMatchPatterns = async (blockurlarray, SourceUrl) => {
                let DomainSplit;
                let pathSplit;
                let urlhitarray = new Array();

                try {
                    const URLSplit = SourceUrl.match(/(.*):\/\/([\w.-]+)(.*)/);
                    if (URLSplit === null) return false;
                    const [URLAll, URLProtocol, URLDomain, URLPath] = URLSplit;
                    if (URLAll === "") return false;

                    blockurlarray = blockurlarray.map((str) => {
                        if (str.slice(0, 4) === "*://" && (URLProtocol === "http" || URLProtocol === "https")) return str.slice(4);
                        if (str.slice(0, 7) === "http://" && URLProtocol === "http") return str.slice(7);
                        if (str.slice(0, 8) === "https://" && URLProtocol === "https") return str.slice(8);
                        if (str.slice(0, 5) === "ws://" && URLProtocol === "ws") return str.slice(5);
                        if (str.slice(0, 6) === "wss://" && URLProtocol === "wss") return str.slice(6);
                        if (str.slice(0, 6) === "ftp://" && URLProtocol === "ftp") return str.slice(6);
                        if (str.slice(0, 7) === "ftps://" && URLProtocol === "ftps") return str.slice(7);
                        return undefined;
                    });

                    DomainSplit = URLDomain.split(".");
                    let DomainLinking = "";
                    for (let i = 0; i < DomainSplit.length; i++) {
                        if (i + 1 < DomainSplit.length) {
                            DomainLinking = DomainLinking + "(?:" + DomainSplit[i] + "\\.|(?=\\*)(?:^\\*\\.)?)";
                        } else {
                            DomainLinking = "^((?:\\*\\.)?)" + DomainLinking + "(?:" + DomainSplit[i] + "|(?=\\*)(?:^\\*)?)(?:$|/.*$)";
                        }
                    }
                    urlhitarray = blockurlarray.filter(RegExp.prototype.test, new RegExp(DomainLinking));

                    if (urlhitarray.length) {
                        if (urlhitarray.some(RegExp.prototype.test, new RegExp(/^[^/]*\/\*$/))) return true;

                        pathSplit = URLPath.split("/");
                        pathSplit.splice(0, 1);
                        pathSplit[pathSplit.length - 1] = pathSplit[pathSplit.length - 1].replace(/#.*$/, "");
                        pathSplit = pathSplit.map((str) => {
                            return this.escapeRegExp(str);
                        });

                        let pathSimpleSeatch_regexp = "^[^/]*/";
                        for (let i = 0; i < pathSplit.length; i++) {
                            if (i + 1 < pathSplit.length) {
                                pathSimpleSeatch_regexp = pathSimpleSeatch_regexp + "(?:" + pathSplit[i] + "/|(?=\\*)(?:\\*/)?)";
                            } else {
                                if (pathSplit[i] === "") {
                                    pathSimpleSeatch_regexp = pathSimpleSeatch_regexp + "(?:$|\\*$)";
                                } else {
                                    pathSimpleSeatch_regexp = pathSimpleSeatch_regexp + "(?:" + pathSplit[i] + "|(?=\\*)(?:\\*)?)$";
                                }
                            }
                        }
                        if (urlhitarray.some(RegExp.prototype.test, new RegExp(pathSimpleSeatch_regexp))) return true;

                        const pathWildcardSearch_regexp = "^[^/]*/.*(?=[^/]*\\*[^/]+(/|$)|[^/]+\\*[^/]*(/|$)).*"
                        const pathWildcardSearch_Result = urlhitarray.filter(RegExp.prototype.test, new RegExp(pathWildcardSearch_regexp));
                        return pathWildcardSearch_Result.some((str) => {
                            str = str.replace(/^[^/]*(\/.*)$/g, "$1");
                            str = new RegExp(this.escapeRegExpExcludewildcard(str).replace(/(.*)/, "^$&$"));
                            return str.test(URLPath);
                        });
                    } else {
                        return false;
                    }
                } catch (e) {
                    console.error(e);
                    return false;
                }
            }

            const regexpAsync = async (regexpArray, source) => {
                return regexpArray.some((str) => {
                    try {
                        return new RegExp(str).test(source);
                    } catch (e) {
                        console.error(e);
                        return false;
                    }
                })
            }

            const regexpTitleAsync = async (regexpArray, source) => {
                return regexpArray.filter((str) => {
                    try {
                        return new RegExp(str).test(source);
                    } catch (e) {
                        console.error(e);
                        return false;
                    }
                })
            }

            let textURLArray = new Array();
            if (mode === "hrefandtext") {
                textURLArray = source.match(/(?:(?:https|http|ttp(?<!http)|ttps(?<!https)):\/\/)\S+\b\/?/g);
                if (textURLArray === null) textURLArray = new Array();
                const resultArray = await Promise.all([(async () => {
                    const resultTextArray = await Promise.all(textURLArray.map(async (textURL) => {
                        let sourceSearchURL = textURL;
                        if (sourceSearchURL.slice(0, 4) === "ttp:") sourceSearchURL = "h" + sourceSearchURL;
                        if (sourceSearchURL.slice(0, 5) === "ttps:") sourceSearchURL = "h" + sourceSearchURL;
                        const resultBoolArray = await Promise.all([urlMatchPatterns(BLT_uBL_Obj.matchPatterns, sourceSearchURL), regexpAsync(BLT_uBL_Obj.regexp, sourceSearchURL)]);
                        if (resultBoolArray.some(bool => bool === true)) {
                            return textURL;
                        } else {
                            return undefined;
                        }
                    }));
                    return resultTextArray.filter((str) => {
                        return str !== undefined;
                    })
                })(), (async () => {
                    let regexpTitlefilter = await regexpTitleAsync(BLT_uBL_Obj.titleRegexp, source);
                    return regexpTitlefilter.map((str) => {
                        try {
                            return new RegExp(str, "gi");
                        } catch (e) {
                            console.error(e);
                            return new RegExp("(?!)", "gi");
                        }
                    });
                })()]);
                return resultArray.reduce((pre, current) => {
                    pre.push(...current);
                    return pre;
                }, []);
            } else if (mode === "href") {
                const resultBoolArray = await Promise.all([urlMatchPatterns(BLT_uBL_Obj.matchPatterns, source), regexpAsync(BLT_uBL_Obj.regexp, source)]);
                if (resultBoolArray.some(bool => bool === true)) {
                    return new Array(source);
                } else {
                    return new Array();
                }
            } else if (mode === "text") {
                let regexpTitlefilter = await regexpTitleAsync(BLT_uBL_Obj.titleRegexp, source);
                return regexpTitlefilter.map((str) => {
                    try {
                        return new RegExp(str, "gi");
                    } catch (e) {
                        console.error(e);
                        return new RegExp("(?!)", "gi");
                    }
                });
            } else return new Array();
        }

        async BLT_loadFunction(keyName) {
            if (keyName === "") return false;
            if (this.BlockListText_loadObj[keyName]) return true;
            const BlockListText_Keyname = "BLT_" + keyName;
            let BlockListText_Obj = await storageAPI.read(BlockListText_Keyname);
            try {
                BlockListText_Obj = JSON.parse(BlockListText_Obj);
                const indexBLTSet = BlockListTextStorage.findIndex(({ name }) => name === keyName);
                Object.assign(BlockListText_Obj, BlockListTextStorage[indexBLTSet]);
            } catch (e) {
                console.error(e);
                return false;
            }
            if (BlockListText_Obj) {
                BlockListText_Obj.text = BlockListText_Obj.text.split("\n").filter(str => str !== "");
                if (BlockListText_Obj.uBlacklist) {
                    const uBlacklist_matchPatterns = BlockListText_Obj.text.filter((str) => {
                        if (!(str.slice(-1) === "/" && (str.slice(0, 1) === "/" || str.slice(0, 6) === "title/"))) return true;
                    });

                    const uBlacklist_regexp = BlockListText_Obj.text.filter((str) => {
                        if (str.slice(0, 1) === "/" && str.slice(-1) === "/") return true;
                    }).map((str) => {
                        return str.slice(1).slice(0, -1);
                    });

                    const uBlacklist_titleRegexp = BlockListText_Obj.text.filter((str) => {
                        if (str.slice(0, 6) === "title/" && str.slice(-1) === "/") return true;
                    }).map((str) => {
                        return str.slice(6).slice(0, -1);
                    });
                    BlockListText_Obj.text = {
                        matchPatterns: uBlacklist_matchPatterns,
                        regexp: uBlacklist_regexp,
                        titleRegexp: uBlacklist_titleRegexp
                    }
                } else if (BlockListText_Obj.regexp) {
                    let regexpFlag = 'g';
                    if (!BlockListText_Obj.caseSensitive) {
                        regexpFlag = regexpFlag + 'i';
                    }
                    BlockListText_Obj.text = await Promise.all(BlockListText_Obj.text.map(async (str) => {
                        try {
                            return new RegExp(str, regexpFlag);
                        } catch (e) {
                            console.error(e);
                            return new RegExp("(?!)", regexpFlag);
                        }
                    }));
                } else if (!BlockListText_Obj.caseSensitive) {
                    BlockListText_Obj.text = await Promise.all(BlockListText_Obj.text.map(async (str) => {
                        return str.toLowerCase();
                    }));
                }
                this.BlockListText_loadObj[keyName] = BlockListText_Obj;
                return true;
            }
            return false;
        }

        async BlockListText_StorageLoad(SettingArray) {
            await Promise.all(SettingArray.map(async (SetObj) => {
                await Promise.all(SetObj.BlockListText_list.map(async (BLT_name) => {
                    await this.BLT_loadFunction(BLT_name);
                }));
                await Promise.all(SetObj.BlockListText_exclude_list.map(async (BLT_name) => {
                    await this.BLT_loadFunction(BLT_name);
                }));
            }));
        }

        async BlockListTextSearch(BLT_name, sourceText, uBlacklistMode) {
            let hitTextReturn = new Array();
            if (this.BlockListText_loadObj[BLT_name]) {
                if (this.BlockListText_loadObj[BLT_name].uBlacklist) {
                    hitTextReturn = await this.uBlacklistFormatSearch(this.BlockListText_loadObj[BLT_name].text, sourceText, uBlacklistMode);
                } else if (this.BlockListText_loadObj[BLT_name].spaceIgnore) {
                    let spaceRemoveText = sourceText.replace(/\s+/g, "");
                    let hitArray = new Array();
                    const rehitArray = new Array();
                    if (this.BlockListText_loadObj[BLT_name].regexp) {
                        this.BlockListText_loadObj[BLT_name].text.forEach((searchText) => {
                            const searchResult = spaceRemoveText.match(searchText);
                            if (searchResult === null) return;
                            searchResult.forEach((hitText) => {
                                hitArray.push(hitText);
                            })
                        });
                    } else {
                        if (!this.BlockListText_loadObj[BLT_name].caseSensitive) {
                            spaceRemoveText = spaceRemoveText.toLowerCase();
                        }
                        if (this.BlockListText_loadObj[BLT_name].exact) {
                            hitArray = this.BlockListText_loadObj[BLT_name].text.filter(searchText => spaceRemoveText == searchText);
                        } else {
                            hitArray = this.BlockListText_loadObj[BLT_name].text.filter((searchText) => {
                                return spaceRemoveText.includes(searchText)
                            });
                        }
                    }
                    if (hitArray.length) {
                        hitArray.forEach((reSearchStr) => {
                            const escapeRegExpReSearchSpecial = (str) => {
                                return str.replace(/(?!(?<!^|\\s\*))[/.*+?^${}()|[\]\\]/g, '\\$&');
                            }
                            let regexpFlag = 'g';
                            if (!this.BlockListText_loadObj[BLT_name].caseSensitive) {
                                regexpFlag = regexpFlag + 'i';
                            }
                            const reSearchEscapeStr = escapeRegExpReSearchSpecial(reSearchStr.split("").join("\\s*"));
                            const reHitTextArray = sourceText.match(new RegExp(reSearchEscapeStr, regexpFlag));
                            if (reHitTextArray === null) return;
                            reHitTextArray.forEach((reHittext) => {
                                if (this.BlockListText_loadObj[BLT_name].regexp) {
                                    reHittext = new RegExp(this.escapeRegExp(reHittext), regexpFlag);
                                }
                                rehitArray.push(reHittext)
                            });
                        });
                    }
                    hitTextReturn = rehitArray;
                } else if (this.BlockListText_loadObj[BLT_name].regexp) {
                    hitTextReturn = this.BlockListText_loadObj[BLT_name].text.filter((searchText) => {
                        return searchText.test(sourceText);
                    });
                } else {
                    if (!this.BlockListText_loadObj[BLT_name].caseSensitive) {
                        sourceText = sourceText.toLowerCase();
                    }
                    if (this.BlockListText_loadObj[BLT_name].exact) {
                        hitTextReturn = this.BlockListText_loadObj[BLT_name].text.filter(searchText => sourceText == searchText);
                    } else {
                        hitTextReturn = this.BlockListText_loadObj[BLT_name].text.filter((searchText) => {
                            return sourceText.includes(searchText)
                        });
                    }
                }
                if (this.BlockListText_loadObj[BLT_name].notSearch) {
                    if (hitTextReturn.length) {
                        return new Array();
                    } else {
                        if (this.BlockListText_loadObj[BLT_name].regexp || this.BlockListText_loadObj[BLT_name].uBlacklist) {
                            return new Array(new RegExp(this.escapeRegExp(sourceText)));
                        } else {
                            return new Array(sourceText);
                        }
                    }
                }
                return hitTextReturn;
            } else return new Array();
        }
    }

    const BG_sentenceBlock_obj = new class extends BackGround_Func {
        constructor() {
            super();
            this.SentenceBlock_filter1 = null;
            this.SentenceBlock_filter2 = null;
            this.SentenceBlock_filter3 = null;
        }
        async init() {
            this.SentenceBlock_filter1 = SentenceBlockStorage.filter((setObj) => {
                if (setObj.url === "" && setObj.enable === true) return true;
                else return false;
            });
            await this.BlockListText_StorageLoad(this.SentenceBlock_filter1);

            const CurrentURL = location.href;
            this.SentenceBlock_filter2 = SentenceBlockStorage.filter((setObj) => {
                if (setObj.url !== "" && setObj.enable === true) {
                    if (setObj.url_mode === "regexp") {
                        try {
                            const result = new RegExp(setObj.url, 'gi').test(CurrentURL);
                            if (result) {
                                return true;
                            }
                        } catch (e) {
                            console.error(e);
                            return false;
                        }
                    } else if (setObj.url_mode === "wildcard") {
                        try {
                            const result = new RegExp(this.escapeRegExpExcludewildcard(setObj.url), 'gi').test(CurrentURL);
                            if (result) {
                                return true;
                            }
                        } catch (e) {
                            console.error(e);
                            return false;
                        }
                    }
                }
                return false;
            });
            await this.BlockListText_StorageLoad(this.SentenceBlock_filter2);

            const BLT1stCheck = SentenceBlockStorage.filter((setObj) => {
                if (setObj.url_BLT !== "" && setObj.enable === true && setObj.url_mode === "blt") return true;
                else return false;
            });
            const BLT2ndCheck = await Promise.all(BLT1stCheck.map(async (setObj) => {
                await this.BLT_loadFunction(setObj.url_BLT);
                const result = await this.BlockListTextSearch(setObj.url_BLT, CurrentURL, "href");
                if (result.length) return setObj
                else return null;
            }));
            this.SentenceBlock_filter3 = BLT2ndCheck.filter((arr) => arr !== null);
            await this.BlockListText_StorageLoad(this.SentenceBlock_filter3);
        }
        async Start(node) {
            this.SentenceBlock_BackgroundExecute(node, this.SentenceBlock_filter1);
            this.SentenceBlock_BackgroundExecute(node, this.SentenceBlock_filter2);
            this.SentenceBlock_BackgroundExecute(node, this.SentenceBlock_filter3);
        }
        async SentenceBlock_BackgroundExecute(node, SentenceBlock_settingArray) {
            const textReplaceExecute = async (EleObj, PropertyName) => {
                let sentenceReplaceFlag = false;

                const SB_dupCheck = SentenceBlock_DuplicateList.some(str => str === EleObj[PropertyName]);
                if (SB_dupCheck) return;

                await Promise.all(SentenceBlock_settingArray.map(async (SB_Obj) => {
                    if (SentenceBlockTempDisableArray.some(name => name === SB_Obj.name)) return;

                    if (sentenceReplaceFlag) return;

                    if (SB_Obj.aTag_replace_mode === "hrefexclude" && EleObj.nodeName === "href") return;
                    if (SB_Obj.aTag_replace_mode === "hrefonly" && EleObj.nodeName !== "href") return;

                    const searchResultArray = await Promise.all(SB_Obj.BlockListText_list.map(async (BLT_name) => {
                        return await this.BlockListTextSearch(BLT_name, EleObj[PropertyName], "hrefandtext");
                    }));

                    if (searchResultArray.some(arr => arr.length)) {
                        const searchExcludeResult = await Promise.all(SB_Obj.BlockListText_exclude_list.map(async (BLT_name) => {
                            return await this.BlockListTextSearch(BLT_name, EleObj[PropertyName], "hrefandtext");
                        }));

                        if (!searchExcludeResult.some(arr => arr.length)) {
                            if (SB_Obj.replace_mode === "sentence") {
                                EleObj[PropertyName] = SB_Obj.replace_string;
                                SentenceBlock_DuplicateList.push(EleObj[PropertyName]);
                                sentenceReplaceFlag = true;
                            } else if (SB_Obj.replace_mode === "word") {
                                await Promise.all(SB_Obj.BlockListText_list.map(async (BLT_name, index) => {
                                    if (this.BlockListText_loadObj[BLT_name].regexp || this.BlockListText_loadObj[BLT_name].uBlacklist) {
                                        searchResultArray[index].forEach((searchText) => {
                                            if (!typeDecision(searchText, "RegExp")) {
                                                searchText = new RegExp(this.escapeRegExp(searchText));
                                            }
                                            EleObj[PropertyName] = EleObj[PropertyName].replace(searchText, SB_Obj.replace_string);
                                        });
                                    } else {
                                        let regexpFlag = 'g';
                                        if (!this.BlockListText_loadObj[BLT_name].caseSensitive) {
                                            regexpFlag = regexpFlag + 'i';
                                        }
                                        searchResultArray[index].forEach((searchText) => {
                                            EleObj[PropertyName] = EleObj[PropertyName].replace(new RegExp(this.escapeRegExp(searchText), regexpFlag), SB_Obj.replace_string);
                                        });
                                    }
                                }));
                                SentenceBlock_DuplicateList.push(EleObj[PropertyName]);
                            }

                            const fiIndex = SentenceBlock_ExecuteResultList.findIndex(({ name }) => name === SB_Obj.name);
                            if (fiIndex !== -1) {
                                SentenceBlock_ExecuteResultList[fiIndex].count++;
                            } else {
                                SentenceBlock_ExecuteResultList.push({
                                    name: SB_Obj.name,
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
            const candidatesNode1 = new Array();
            for (let i = 0; i < candidates1.snapshotLength; i++) {
                candidatesNode1.push(candidates1.snapshotItem(i));
                // textReplaceExecute(candidates1.snapshotItem(i), "nodeValue");
            }
            const candidates2 = document.evaluate('.//input[not(@type="text")]/@value | .//img/@alt | .//*/@title | .//a/@href', node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            const candidatesNode2 = new Array();
            for (let i = 0; i < candidates2.snapshotLength; i++) {
                candidatesNode2.push(candidates2.snapshotItem(i));
                // textReplaceExecute(candidates2.snapshotItem(i), "value");
            }
            await Promise.all(candidatesNode1.map(async (arrNode) => { textReplaceExecute(arrNode, "nodeValue") }), candidatesNode2.map(async (arrNode) => { textReplaceExecute(arrNode, "value") }));
        }
    }

    const BG_elementBlock_Obj = new class extends BackGround_Func {
        constructor() {
            super();
            this.ElementBlock_filter1;
        }
        async init() {
            const CurrentURL = location.href;
            this.ElementBlock_filter1 = ElementBlockStorage.filter((setObj) => {
                if (setObj.url === "") return false;
                if (setObj.url_mode === "regexp" && setObj.enable === true) {
                    try {
                        const result = new RegExp(setObj.url, 'g').test(CurrentURL);
                        if (result) {
                            return true;
                        }
                    } catch (e) {
                        console.error(e);
                        return false;
                    }
                } else if (setObj.url_mode === "wildcard" && setObj.enable === true) {
                    try {
                        const result = new RegExp(this.escapeRegExpExcludewildcard(setObj.url), 'g').test(CurrentURL);
                        if (result) {
                            return true;
                        }
                    } catch (e) {
                        console.error(e);
                        return false;
                    }
                }
                return false;
            });
            await this.BlockListText_StorageLoad(this.ElementBlock_filter1);

            const BLT1stCheck = ElementBlockStorage.filter((setObj) => {
                if (setObj.url_BLT !== "" && setObj.enable === true && setObj.url_mode === "blt") return true;
                else return false;
            });
            const BLT2ndCheck = await Promise.all(BLT1stCheck.map(async (setObj) => {
                await this.BLT_loadFunction(setObj.url_BLT);
                const result = await this.BlockListTextSearch(setObj.url_BLT, CurrentURL, "href");
                if (result.length) return setObj
                else return null;
            }));
            this.ElementBlock_filter2 = BLT2ndCheck.filter((setObj) => setObj !== null);
            await this.BlockListText_StorageLoad(this.ElementBlock_filter2);
        }
        async Start(node) {
            await Promise.all([this.ElementBlockExecute(node, this.ElementBlock_filter1), this.ElementBlockExecute(node, this.ElementBlock_filter2)]);
        }
        async ElementBlockExecute(node, EleBlock_SettingArray) {
            await Promise.all(EleBlock_SettingArray.map(async (eleBlockSet) => {
                const ElementBlock_executeResultList_func = (eleSetObj, eleObj, searchPropertyText) => {
                    if (!ElementBlock_executeResultList[eleBlockSet.name]) {
                        ElementBlock_executeResultList[eleBlockSet.name] = new Array();
                    }
                    ElementBlock_executeResultList[eleBlockSet.name].push({
                        settingobj: eleSetObj,
                        element: eleObj,
                        searchProperty: searchPropertyText
                    });
                    BlockCounter++;
                    BlockCounterUpdate();
                }

                let elementNode;
                if (!node) return;
                try {
                    if (eleBlockSet.elementHide_method === "css") {
                        elementNode = node.querySelectorAll(eleBlockSet.elementHide);
                    } else if (eleBlockSet.elementHide_method === "xpath") {
                        elementNode = XPathSelectorAll(eleBlockSet.elementHide, node);
                    }
                } catch (e) {
                    console.error(e);
                    return;
                }

                await Promise.all(Array.from(elementNode).map(async (elementObj) => {
                    let firstblockflag;
                    try {
                        firstblockflag = ElementBlock_executeResultList[eleBlockSet.name].some((arr) => {
                            return arr.element === elementObj;
                        })
                    } catch (e) {
                        firstblockflag = false;
                    }
                    if (firstblockflag) {
                        return;
                    }

                    let SearchEleNode;
                    if (eleBlockSet.elementSearch === "") {
                        elementObj.style.display = "none";
                        ElementBlock_executeResultList_func(eleBlockSet, elementObj, "");
                        return;
                    }

                    try {
                        if (eleBlockSet.elementSearch_method === "css") {
                            SearchEleNode = elementObj.querySelectorAll(eleBlockSet.elementSearch);
                        } else if (eleBlockSet.elementSearch_method === "xpath") {
                            SearchEleNode = XPathSelectorAll(eleBlockSet.elementSearch, elementObj);
                        }
                        if (eleBlockSet.elementSearch_firstOnly && SearchEleNode.length) {
                            SearchEleNode = new Array(SearchEleNode[0]);
                        }
                    } catch (e) {
                        console.error(e);
                        return;
                    }

                    await Promise.all(Array.from(SearchEleNode).map(async (SearchEleObj) => {
                        let searchProperty;
                        try {
                            switch (eleBlockSet.elementSearch_property) {
                                case "text":
                                    searchProperty = SearchEleObj.textContent;
                                    break;
                                case "href":
                                    searchProperty = SearchEleObj.href;
                                    break;
                                case "style":
                                    if (eleBlockSet.elementSearch_property_style == "__proto__") {
                                        searchProperty = undefined;
                                        break;
                                    }
                                    searchProperty = window.getComputedStyle(SearchEleObj)[eleBlockSet.elementSearch_property_style];
                                    break;
                                case "advanced":
                                    if (eleBlockSet.elementSearch_property_advanced == "__proto__") {
                                        searchProperty = undefined;
                                        break;
                                    }
                                    searchProperty = SearchEleObj[eleBlockSet.elementSearch_property_advanced];
                                    break;
                                default:
                                    searchProperty = undefined;
                                    break;
                            }
                        } catch (e) {
                            console.error(e);
                            searchProperty = undefined;
                        }
                        if (searchProperty === undefined) {
                            return;
                        }

                        const searchResult = await Promise.all(eleBlockSet.BlockListText_list.map(async (BLT_name) => {
                            switch (eleBlockSet.uBlacklist_method) {
                                case "urlonly":
                                    return await this.BlockListTextSearch(BLT_name, searchProperty, "href");
                                case "titleonly":
                                    return await this.BlockListTextSearch(BLT_name, searchProperty, "text");
                                case "all":
                                    return await this.BlockListTextSearch(BLT_name, searchProperty, "hrefandtext");
                                default:
                                    return await this.BlockListTextSearch(BLT_name, searchProperty, "hrefandtext");
                            }
                        }));

                        if (searchResult.some(arr => arr.length)) {
                            const searchExcludeResult = await Promise.all(eleBlockSet.BlockListText_exclude_list.map(async (BLT_name) => {
                                switch (eleBlockSet.uBlacklist_method) {
                                    case "urlonly":
                                        return await this.BlockListTextSearch(BLT_name, searchProperty, "href");
                                    case "titleonly":
                                        return await this.BlockListTextSearch(BLT_name, searchProperty, "text");
                                    case "all":
                                        return await this.BlockListTextSearch(BLT_name, searchProperty, "hrefandtext");
                                    default:
                                        return await this.BlockListTextSearch(BLT_name, searchProperty, "hrefandtext");
                                }
                            }));

                            if (!searchExcludeResult.some(arr => arr.length)) {
                                if (eleBlockSet.elementHide_hideMethod === "displayNone") {
                                    if (elementObj.style.display !== "none") {
                                        elementObj.style.display = "none";
                                        ElementBlock_executeResultList_func(eleBlockSet, elementObj, searchProperty);
                                    }
                                } else if (eleBlockSet.elementHide_hideMethod === "remove") {
                                    elementObj.remove();
                                    ElementBlock_executeResultList_func(eleBlockSet, undefined, searchProperty);
                                }
                            }
                        }
                    }));
                }));
            }));
        }
    }

    const perModeObj = new class extends BackGround_Func {
        constructor() {
            super();
            this.performanceMode;
            this.Config_Obj = PreferenceSettingStorage.performanceConfig;
            this.interval_balance = parseInt(PreferenceSettingStorage.performanceConfig.interval_balance);
            this.interval_performancePriority1 = parseInt(PreferenceSettingStorage.performanceConfig.interval_performancePriority1);
            this.interval_performancePriority2 = parseInt(PreferenceSettingStorage.performanceConfig.interval_performancePriority2);
        }
        async BLTCheck(BLT_name) {
            if (BLT_name === "") return false;
            const CurrentURL = location.href;
            await this.BLT_loadFunction(BLT_name);
            const result = await this.BlockListTextSearch(BLT_name, CurrentURL, "href");
            if (result.length) return true;
            else return false;
        }
        async init() {
            if (await this.BLTCheck(this.Config_Obj.overRide_disable)) {
                this.performanceMode = "disable";
            } else if (await this.BLTCheck(this.Config_Obj.overRide_performancePriority1)) {
                this.performanceMode = "performance1";
            } else if (await this.BLTCheck(this.Config_Obj.overRide_performancePriority2)) {
                this.performanceMode = "performance2";
            } else if (await this.BLTCheck(this.Config_Obj.overRide_blockPriority)) {
                this.performanceMode = "block";
            } else if (await this.BLTCheck(this.Config_Obj.overRide_balance)) {
                this.performanceMode = "balance";
            } else {
                this.performanceMode = this.Config_Obj.mode;
            }
        }
    }

    async function initInsertElement() {
        if (!divElement_RootShadow) {
            divElement_RootShadow = document.createElement("div");
            divElement_RootShadow.style.all = "initial";
            divElement_RootShadow.attachShadow({ mode: "open" });
            document.body.append(divElement_RootShadow);

            if (!PreferenceSettingStorage.hideButton || PreferenceSettingStorage.hideButton === false) {
                if (!inIframeDetect()) {
                    DashboardButtonEle = document.createElement("button");
                    DashboardButtonEle.style.position = "fixed";
                    DashboardButtonEle.style.top = 0;
                    DashboardButtonEle.style.right = 0;
                    DashboardButtonEle.style.zIndex = 2147483647;
                    DashboardButtonEle.style.width = "60px";
                    DashboardButtonEle.style.height = "40px";
                    DashboardButtonEle.style.backgroundColor = "#AFFFAF";
                    DashboardButtonEle.addEventListener("click", DashboardWindow, false);
                    divElement_RootShadow.shadowRoot.append(DashboardButtonEle);
                    BlockCounterUpdate();
                }
            }

            try {
                // eslint-disable-next-line no-undef
                GM.registerMenuCommand("Dashboard", DashboardWindow, "D");
                return;
            } catch (e) {
                console.error(e);
            }
        }
    }

    async function BlockCounterUpdate() {
        if (DashboardButtonEle) {
            if (BlockCounter > 0) {
                DashboardButtonEle.style.backgroundColor = "#FFAFAF"
            }
            DashboardButtonEle.textContent = "NB:" + BlockCounter;
        }
    }

    async function StartExecute() {
        await BG_elementBlock_Obj.Start(document);
        await BG_sentenceBlock_obj.Start(document);
    }

    async function observerregister() {
        const observerConfig = {
            attributes: false,
            attributeOldValue: false,
            characterData: true,
            characterDataOldValue: false,
            childList: true,
            subtree: true
        }
        const observer = new MutationObserver(async () => {
            const interval = Date.now() - dateInterval
            if (interval > observerInterval) {
                StartExecute();
                dateInterval = Date.now();
            } else {
                observer.disconnect();
                await pauseSleep(interval);
                StartExecute();
                observer.observe(document.body, observerConfig);
                dateInterval = Date.now();
            }
        });
        observer.observe(document.body, observerConfig);
    }

    await perModeObj.init();

    if (perModeObj.performanceMode !== "disable") {
        await BG_sentenceBlock_obj.init();
        await BG_elementBlock_Obj.init();

        if (document.readyState == "complete") {
            StartExecute();
            switch (perModeObj.performanceMode) {
                case "balance":
                case "block":
                    observerInterval = 0;
                    break;
                case "performance1":
                    observerInterval = perModeObj.interval_performancePriority1;
                    break;
                case "performance2":
                    observerInterval = perModeObj.interval_performancePriority2;
                    break;
                default:
                    observerInterval = 0;
                    break;
            }
        } else {
            switch (perModeObj.performanceMode) {
                case "block":
                    observerInterval = 0;
                    break;
                case "balance":
                    observerInterval = perModeObj.interval_balance;
                    break;
                case "performance1":
                    observerInterval = perModeObj.interval_performancePriority1;
                    break;
                case "performance2":
                    observerInterval = perModeObj.interval_performancePriority2;
                    break;
                default:
                    observerInterval = 0;
                    break;
            }
            document.addEventListener("readystatechange", async (evt) => {
                switch (evt.target.readyState) {
                    case "interactive":
                        StartExecute();
                        break;
                    case "complete":
                        switch (perModeObj.performanceMode) {
                            case "balance":
                            case "block":
                                observerInterval = 0;
                                break;
                            case "performance1":
                                observerInterval = perModeObj.interval_performancePriority1;
                                break;
                            case "performance2":
                                observerInterval = perModeObj.interval_performancePriority2;
                                break;
                            default:
                                observerInterval = 0;
                                break;
                        }
                        break;
                }
            }, { capture: true });
        }

        if (document.body != null) {
            await observerregister();
            initInsertElement();
        } else {
            const observer = new MutationObserver(async () => {
                if (document.body != null) {
                    observer.disconnect();
                    await observerregister();
                    initInsertElement();
                }
            });
            observer.observe(document, {
                attributes: false,
                attributeOldValue: false,
                characterData: false,
                characterDataOldValue: false,
                childList: true,
                subtree: true
            })
        }

    } else {
        if (document.body != null) {
            initInsertElement();
        } else {
            const observer = new MutationObserver(async () => {
                if (document.body != null) {
                    observer.disconnect();
                    initInsertElement();
                }
            });
            observer.observe(document, {
                attributes: false,
                attributeOldValue: false,
                characterData: false,
                characterDataOldValue: false,
                childList: true,
                subtree: true
            })
        }
    }

    // BackGround Fuction End


    async function DashboardWindow() {
        if (Dashboard_Element) return;
        const RootShadow = divElement_RootShadow.shadowRoot;
        if (DashboardButtonEle) DashboardButtonEle.style.display = "none";

        Dashboard_Element = document.createElement("div");
        Dashboard_Element.innerHTML = `
<style type="text/css">
  div#FrameBack {
    --CustomBackgroundColor: #ffffb2;
    all: initial;
    position: fixed;
    top: 0;
    right: 1px;
    z-index: 2147483647;
    padding: 1px 2px;
    background-color: #ffffff;
    border: 1px solid #888888;
    border-radius: 10px;
    text-align: center;
    margin: 0em auto;
    height: calc(100vh - 150px);
    color: #000000;
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
    width: 100%;
    height: calc(100% - 60px);
    margin: 0em auto;
    margin-top: 2px;
    margin-bottom: 0px;
    word-wrap: break-word;
    padding: 5px;
    border: 1px solid black;
    text-align: left;
    font-size: medium;
    box-sizing: border-box;
    background-color: var(--CustomBackgroundColor);
  }
  div#DashboardMain div.ItemFrame_Border {
    position: relative;
    margin-top: 1em;
    padding: 12px;
    border: 1px solid black;
  }
  div#DashboardMain h1.ItemFrame_Title {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 1em;
    padding: 0 4px;
    margin: 0;
    transform: translateY(-50%) translateX(6px);
    background-color: var(--CustomBackgroundColor);
    white-space: nowrap;
  }
  div#DashboardMain input[type="text"] {
    width: 100%;
    height: 26px;
    box-sizing: border-box;
  }
  div#DashboardMain input[type="number"] {
    width: 100%;
    height: 26px;
    box-sizing: border-box;
  }
  div#DashboardMain button {
    min-width: 60px;
    height: 35px;
  }
  div#DashboardMain select {
    width: 100%;
  }
  div#DashboardMain input[type="checkbox"] {
    transform: scale(1.3);
  }
  div#DashboardMain input[type="radio"] {
    transform: scale(1.3);
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
        RootShadow.append(Dashboard_Element);
        if (PreferenceSettingStorage.dashboardColor) {
            RootShadow.getElementById("FrameBack").style.setProperty("--CustomBackgroundColor", PreferenceSettingStorage.dashboardColor);
        } else {
            RootShadow.getElementById("FrameBack").style.setProperty("--CustomBackgroundColor", "#ffffb2");
        }

        function DashboardFrameBackWidthLimit() {
            const DashboardFrameBack = RootShadow.getElementById("FrameBack");
            if (window.innerWidth <= 407) {
                DashboardFrameBack.style.width = "calc(100vw - 7px)";
            } else {
                DashboardFrameBack.style.width = "400px";
            }
            if (window.innerHeight <= 650) {
                DashboardFrameBack.style.height = "calc(100vh - 20px)";
            } else {
                DashboardFrameBack.style.height = "630px";
            }
        }
        DashboardFrameBackWidthLimit();
        window.addEventListener("resize", DashboardFrameBackWidthLimit);

        RootShadow.getElementById("FrameBackHeaderButton1").addEventListener("click", () => {
            Dashboard_Element.remove();
            Dashboard_Element = null;
            window.removeEventListener("resize", DashboardFrameBackWidthLimit);
            if (DashboardButtonEle) DashboardButtonEle.style.display = "block";
        })

        RootShadow.getElementById("FrameBackHeaderButton2").addEventListener("click", () => {
            Dashboard_Element.remove();
            Dashboard_Element = null;
            window.removeEventListener("resize", DashboardFrameBackWidthLimit);
            if (DashboardButtonEle) DashboardButtonEle.remove();
        })


        DashboardMain_div = RootShadow.getElementById("DashboardMain");

        const popup = new class popup {
            constructor() {
                this.popup_Element = document.createElement("div");
                this.popup_Element.innerHTML = `
<style type="text/css">
  div#PopupBack {
    width: calc(100% - 5px);
    height: calc(100% - 63px);
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
    position: absolute;
    top: 43px;
    left: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  div#PopupMessageBox {
    background-color: white;
    margin: 10px;
    border: 1px solid black;
    box-shadow: 0 0 10px;
  }
  div#PopupBack button {
    float: right;
    margin: 5px;
  }
</style>

<div id="PopupBack">
  <div id="PopupMessageBox">
    <p id="PopupMessage"></p>
    <button id="PopupMessageBox_Cancel"></button>
    <button id="PopupMessageBox_OK"></button>
  </div>
</div>
        `;
                this.popup_Element.style.display = "none";
                DashboardMain_div.append(this.popup_Element);

                this.message_Ele = RootShadow.getElementById("PopupMessage");
                this.buttonOK_Ele = RootShadow.getElementById("PopupMessageBox_OK");
                this.buttonCancel_Ele = RootShadow.getElementById("PopupMessageBox_Cancel");

                this.buttonOK_Ele.textContent = "OK";
                this.buttonCancel_Ele.textContent = "キャンセル";
            }

            async alert(message) {
                this.message_Ele.textContent = message;
                this.popup_Element.style.display = "";
                RootShadow.getElementById("PopupMessageBox_Cancel").style.display = "none";

                return new Promise((resolve) => {
                    const okClick = () => {
                        this.popup_Element.style.display = "none";
                        this.buttonOK_Ele.removeEventListener("click", okClick);
                        return resolve(true);
                    }

                    RootShadow.getElementById("PopupMessageBox_OK").addEventListener("click", okClick, false);
                });
            }

            async confirm(message) {
                this.message_Ele.textContent = message;
                this.popup_Element.style.display = "";
                RootShadow.getElementById("PopupMessageBox_Cancel").style.display = "";

                return new Promise((resolve) => {
                    const okClick = () => {
                        this.popup_Element.style.display = "none";
                        this.buttonOK_Ele.removeEventListener("click", okClick);
                        this.buttonCancel_Ele.removeEventListener("click", cancelClick);
                        return resolve(true);
                    }

                    const cancelClick = () => {
                        this.popup_Element.style.display = "none";
                        this.buttonOK_Ele.removeEventListener("click", okClick);
                        this.buttonCancel_Ele.removeEventListener("click", cancelClick);
                        return resolve(false);
                    }

                    RootShadow.getElementById("PopupMessageBox_OK").addEventListener("click", okClick, false);
                    RootShadow.getElementById("PopupMessageBox_Cancel").addEventListener("click", cancelClick, false);
                });
            }
        }



        {
            const DB_blockResult_div = document.createElement("div");
            DB_blockResult_div.innerHTML = `
<style type="text/css">
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
            Dashboard_Window_Ele_stack.push(DB_blockResult_div);
            DashboardMain_div.append(DB_blockResult_div);

            RootShadow.getElementById("Text-ResultSentenceBlockTitle").textContent = "Webあぼーん 適用リスト";
            RootShadow.getElementById("ItemFrame_SentenceBlock_Result_TempDisableButton").textContent = "一時無効を適用してリロード";
            RootShadow.getElementById("Text-ResultElementBlockTitle").textContent = "要素ブロック 適用リスト";
            RootShadow.getElementById("ItemFrame-SettingPageButton").textContent = "設定画面";

            {
                const SentenceBlock_div = RootShadow.getElementById("ItemFrame_SentenceBlock_Result");

                for (let i = 0; i < SentenceBlock_ExecuteResultList.length; i++) {
                    const span = document.createElement("span");
                    span.textContent = SentenceBlock_ExecuteResultList[i].name + "(" + SentenceBlock_ExecuteResultList[i].count + ")";
                    SentenceBlock_div.append(span);

                    const input = document.createElement("input");
                    input.setAttribute("type", "checkbox");
                    input.setAttribute("name", SentenceBlock_ExecuteResultList[i].name);
                    SentenceBlock_TempDisableElementArray.push(input);
                    SentenceBlock_div.append(input);

                    SentenceBlock_div.append(document.createElement("br"));
                }
            }

            RootShadow.getElementById("ItemFrame_SentenceBlock_Result_TempDisableButton").addEventListener("click", async () => {
                const tempDisable = new Array();
                SentenceBlock_TempDisableElementArray.forEach((ele) => {
                    if (ele.checked) {
                        tempDisable.push(ele.name);
                    }
                })
                await storageAPI.write("SentenceBlock_TempDisable", JSON.stringify(tempDisable));
                location.reload();
            }, false);

            {
                const ElementBlock_div = RootShadow.getElementById("ItemFrame_ElementBlock");

                Promise.all(Object.keys(ElementBlock_executeResultList).map(async (keyName) => {
                    let resultEnable = false;

                    const div = document.createElement("div");
                    div.style.border = "1px solid black"
                    ElementBlock_executeResultList[keyName].forEach((arr, index) => {
                        if (arr.settingobj.resultShow === "none") return;

                        if (arr.settingobj.resultShow === "number") {
                            const div_p = document.createElement("p")
                            const indexNumShow = index + 1;
                            div_p.textContent = indexNumShow + "件目";
                            div.append(div_p);
                        } else if (arr.settingobj.resultShow === "property") {
                            const div_p = document.createElement("p")
                            div_p.textContent = arr.searchProperty;
                            div.append(div_p);
                        } else {
                            const div_p = document.createElement("p")
                            div_p.textContent = "";
                            div.append(div_p);
                        }

                        if (arr.element) {
                            const div_button1 = document.createElement("button");
                            div_button1.textContent = "再表示する"
                            div_button1.addEventListener("click", () => {
                                arr.element.style.display = "";
                            })
                            div.append(div_button1);
                        }

                        const div_button2 = document.createElement("button");
                        div_button2.textContent = "コピー"
                        div_button2.addEventListener("click", () => {
                            copyTextToClipboard(arr.searchProperty);
                        })
                        div.append(div_button2);

                        resultEnable = true;
                    });

                    if (resultEnable) {
                        const span = document.createElement("span");
                        span.textContent = keyName
                        ElementBlock_div.append(span);
                        ElementBlock_div.append(div);
                    }
                }));
            }

            RootShadow.getElementById("ItemFrame-SettingPageButton").addEventListener("click", Dashboard_SettingsTop, false);

        }

        async function Dashboard_SettingsTop() {
            ArrayLast(Dashboard_Window_Ele_stack).style.display = "none";
            DashboardMain_div.scroll({ top: 0 });
            const DB_settingTop_div = document.createElement("div");
            Dashboard_Window_Ele_stack.push(DB_settingTop_div);
            DB_settingTop_div.innerHTML = `
<style type="text/css">
  #SettingMainPage p {
    margin: 0;
  }
</style>

<div id="SettingMainPage">
  <div id="BlockListText_Setting" class="ItemFrame_Border">
    <h1 id="BlockListText_Setting_Title" class="ItemFrame_Title"></h1>
    <p id="BlockListText_Setting_Description"></p>
    <button id="BlockListText_Setting_Button"></button>
  </div>
  <div id="SentenceBlock_Setting" class="ItemFrame_Border">
    <h1 id="SentenceBlock_Setting_Title" class="ItemFrame_Title"></h1>
    <p id="SentenceBlock_Setting_Description"></p>
    <button id="SentenceBlock_Setting_Button"></button>
  </div>
  <div id="ElementBlock_Setting" class="ItemFrame_Border">
    <h1 id="ElementBlock_Setting_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlock_Setting_Description"></p>
    <button id="ElementBlock_Setting_Button"></button>
  </div>
  <div id="Preferences_Setting" class="ItemFrame_Border">
    <h1 id="Preferences_Setting_Title" class="ItemFrame_Title"></h1>
    <p id="Preferences_Setting_Description"></p>
    <button id="Preferences_Setting_Button"></button>
  </div>
  <div id="SettingMainPageBack">
    <button id="SettingMainPageBack_Button"></button>
  </div>
</div>
            `
            DashboardMain_div.append(DB_settingTop_div);


            RootShadow.getElementById("BlockListText_Setting_Title").textContent = "ブロックリストテキスト設定";
            RootShadow.getElementById("BlockListText_Setting_Description").textContent = "グループ単位でブロックするテキストやURLなどを設定できます。";
            RootShadow.getElementById("BlockListText_Setting_Button").textContent = "NGフィルタを設定する";
            RootShadow.getElementById("BlockListText_Setting_Button").addEventListener("click", Dashboard_BlockListText, false);

            RootShadow.getElementById("SentenceBlock_Setting_Title").textContent = "文章ブロック機能";
            RootShadow.getElementById("SentenceBlock_Setting_Description").textContent = "Webの文章内にブロックリストテキストが含まれる場合、その一文章または単語を別の文字に置換します。";
            RootShadow.getElementById("SentenceBlock_Setting_Button").textContent = "Webあぼーん機能を設定する";
            RootShadow.getElementById("SentenceBlock_Setting_Button").addEventListener("click", Dashboard_SentenceBlock, false);

            RootShadow.getElementById("ElementBlock_Setting_Title").textContent = "要素ブロック機能";
            RootShadow.getElementById("ElementBlock_Setting_Description").textContent = "要素の文字またはプロパティにブロックリストテキストが含まれる場合、要素ごとブロックします。";
            RootShadow.getElementById("ElementBlock_Setting_Button").textContent = "要素ブロック機能を設定する";
            RootShadow.getElementById("ElementBlock_Setting_Button").addEventListener("click", Dashboard_ElementBlock, false);

            RootShadow.getElementById("Preferences_Setting_Title").textContent = "環境設定";
            RootShadow.getElementById("Preferences_Setting_Description").textContent = "拡張機能全体の設定をします。";
            RootShadow.getElementById("Preferences_Setting_Button").textContent = "環境設定";
            RootShadow.getElementById("Preferences_Setting_Button").addEventListener("click", Dashboard_PreferencePage, false);

            RootShadow.getElementById("SettingMainPageBack_Button").textContent = "←戻る";
            RootShadow.getElementById("SettingMainPageBack_Button").addEventListener("click", () => {
                Dashboard_Window_Ele_stack.pop().remove();
                ArrayLast(Dashboard_Window_Ele_stack).style.display = "block";
                DashboardMain_div.scroll({ top: 0 });
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
                this.li_cfunchandlers = new Array();
                this.li_cfuncinfunction = new Function();
                this.li_cfuncinfunction_arg = new Array();
                this.currentEle_li = null;
                this.currentEle_li_BGColorTemp = null;
                this.currentName = null;
                this.currentIndex = null;
                this.Editflag = false;

                this.SaveButtonFunc = new Function();
                this.DelButtonFunc = new Function();
                this.NewObjectButtonFunc = new Function();

                this.ListEditPage_Ele = null;
                this.EditConfigPage_Ele = null
            }

            async init() {
                ArrayLast(Dashboard_Window_Ele_stack).style.display = "none";
                DashboardMain_div.scroll({ top: 0 });
                this.ListEditPage_Ele = document.createElement("div");
                this.ListEditPage_Ele.style.height = "100%";
                Dashboard_Window_Ele_stack.push(this.ListEditPage_Ele);
                this.ListEditPage_Ele.innerHTML = `
<style type="text/css">
  div#SettingsObjectListPage {
    height: 100%;
  }
  div#ObjectLists_Frame {
    width: auto;
    height: calc(100% - 154px);
    overflow: auto;
    border: 2px solid black;
  }
  ol#ObjectLists_ol {
    background-color: #eee;
    list-style-position: inside;
    margin: 0 0 0 0;
    padding: 0 0 0 0;
  }
  div#SettingsObject_ConfigItems_Name {
    display: flex;
  }
  div#SettingsObject_ConfigItems div {
    margin: 2px 0 2px 0;
  }
  input#SettingsObject_ConfigItems_Name_Form {
    flex: 1;
    height: 20px;
  }
  select#SettingsObject_ConfigItems_Sort_Form {
    width: auto !important;
    transform: scale(1.2);
  }
  input#SettingsObject_ConfigItems_Enable_Form {
    transform: scale(1.3);
  }
</style>

<div id="SettingsObjectListPage">
  <div id="ObjectLists_Frame">
    <ol id="ObjectLists_ol"></ol>
  </div>
  <div id="SettingsObject_ConfigItems" style="display: none">
    <div id="SettingsObject_ConfigItems_Name">
      <span id="SettingsObject_ConfigItems_Name_Span"></span>
      <input
        id="SettingsObject_ConfigItems_Name_Form"
        type="text"
        spellcheck="false"
      />
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
                DashboardMain_div.append(this.ListEditPage_Ele);

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

                RootShadow.getElementById("SettingsObject_ConfigItems_Name_Form").addEventListener("change", () => {
                    this.Editflag = true;
                }, false);

                RootShadow.getElementById("SettingsObject_ConfigItems_Sort_Form").addEventListener("change", () => {
                    this.Editflag = true;
                }, false);

                RootShadow.getElementById("SettingsObject_ConfigItems_Enable_Form").addEventListener("change", () => {
                    this.Editflag = true;
                }, false);

                RootShadow.getElementById("SettingsObject_ConfigItems_EditConfig_Form").addEventListener("click", () => {
                    this.Editflag = true;
                    this.ListEditPage_Ele.style.display = "none";
                    this.EditConfigPage_Ele.style.display = "block";
                    DashboardMain_div.scroll({ top: 0 });
                }, false);

                RootShadow.getElementById("SettingsObject_ActionButton_Back").addEventListener("click", async () => {
                    if (this.Editflag) {
                        const res = await popup.confirm("トップ設定ページに戻ります。現在入力されている内容は失われますがよろしいですか？");
                        if (!res) {
                            return false;
                        }
                    }
                    Dashboard_Window_Ele_stack.pop().remove();
                    Dashboard_Window_Ele_stack.pop().remove();
                    ArrayLast(Dashboard_Window_Ele_stack).style.display = "block";
                    DashboardMain_div.scroll({ top: 0 });
                }, false);
                RootShadow.getElementById("SettingsObject_ActionButton_NewObject").addEventListener("click", async (evt) => await this.NewObjectButtonFunc(evt.target), false);
                RootShadow.getElementById("SettingsObject_ActionButton_DeleteObject").addEventListener("click", async () => await this.DelButtonFunc(), false);
                RootShadow.getElementById("SettingsObject_ActionButton_SaveObject").addEventListener("click", async () => await this.SaveButtonFunc(), false);
            }

            async ListStoSave(StoKey, StoObj) {
                if (StoObj.name === "") {
                    await popup.alert("エラー：名前を入力してください。");
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
                    await popup.alert("エラー：すでに同じ名前が存在します。");
                    return false;
                }
                if (fiindex !== -1) {
                    this.ListStorage.splice(fiindex, 1);
                }
                this.ListStorage.splice(this.index_Ele.value, 0, StoObj);
                await storageAPI.write(StoKey, JSON.stringify(this.ListStorage));

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
                    const res = await popup.confirm("[" + this.currentName + "]設定を削除してよろしいですか？");
                    if (!res) {
                        return false;
                    }
                    this.currentEle_li.remove();
                    this.SelectOption_Del()
                    this.ListStorage.splice(fiindex, 1);
                    await storageAPI.write(StoKey, JSON.stringify(this.ListStorage));
                    this.editarea_Ele.style.display = "none";
                    this.Editflag = false;
                    return true;
                } else {
                    return false;
                }
            }

            async NewEditButton(NewbuttonEle) {
                if (this.Editflag) {
                    const res = await popup.confirm("新規作成しますか？現在入力されている内容は失われます。");
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
                        const res = await popup.confirm("設定フィールドを変更しますか？現在入力されている内容は失われます。");
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
                const li = document.createElement("li");
                li.style.borderStyle = "solid";
                li.style.borderWidth = "1px";
                li.style.borderTopWidth = 0;
                li.style.borderColor = "silver";
                li.style.padding = "0 0 0 5px";
                li.style.cursor = "pointer";
                li.style.minHeight = "30px";
                li.textContent = this.ListStorage[index].name;
                this.li_cfuncinfunction_arg.unshift(li);
                li.addEventListener("click", await this.li_cfunc(this.li_cfunchandlers.length, Array.from(this.li_cfuncinfunction_arg)), false);
                if (index < this.ulol_Ele.childNodes.length) {
                    this.ulol_Ele.childNodes[index].before(li);
                } else {
                    this.ulol_Ele.append(li);
                }
                return li;
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
                const option = document.createElement("option");
                option.value = this.index_Ele.length;
                option.textContent = this.index_Ele.length + 1;
                this.index_Ele.append(option);
            }

            async SelectOption_Del() {
                this.index_Ele.lastChild.remove();
            }

        }

        async function Dashboard_BlockListText() {
            await new class extends ListEdit_Func {
                constructor(BLT_Storage) {
                    super(BLT_Storage);
                    this.textarea_Ele = null;
                    this.textareaDisable_Ele = null;
                    this.fetch_enable_Ele = null;
                    this.fetch_url_Ele = null;
                    this.regexp_Ele = null;
                    this.caseSensitive_Ele = null;
                    this.exact_Ele = null;
                    this.spaceIgnore_Ele = null;
                    this.notSearch_Ele = null;
                    this.uBlacklist_Ele = null;
                    this.li_cfuncinfunction = async () => {
                        const applylist = this.ListStorage[this.currentIndex];
                        this.fetch_enable_Ele.checked = applylist.fetch_enable;
                        this.fetch_url_Ele.value = applylist.fetch_url;
                        this.regexp_Ele.checked = applylist.regexp;
                        this.caseSensitive_Ele.checked = applylist.caseSensitive;
                        this.exact_Ele.checked = applylist.exact;
                        this.spaceIgnore_Ele.checked = applylist.spaceIgnore;
                        this.notSearch_Ele.checked = applylist.notSearch;
                        this.uBlacklist_Ele.checked = applylist.uBlacklist;

                        const BlockListText_Keyname = "BLT_" + applylist.name;
                        let BlockListText_Obj = await storageAPI.read(BlockListText_Keyname);
                        try {
                            BlockListText_Obj = JSON.parse(BlockListText_Obj);
                        } catch (e) {
                            console.error(e);
                            BlockListText_Obj = undefined;
                        }
                        if (BlockListText_Obj) {
                            this.textarea_Ele.value = BlockListText_Obj.text;
                        } else {
                            this.textarea_Ele.value = "";
                        }

                        if (applylist.fetch_enable) {
                            this.textarea_Ele.style.display = "none";
                            this.textareaDisable_Ele.style.display = "block";
                        } else {
                            this.textarea_Ele.style.display = "block";
                            this.textareaDisable_Ele.style.display = "none";
                        }
                    }
                    this.SaveButtonFunc = this.BlockListText_storageSave.bind(this);
                    this.DelButtonFunc = this.BlockListText_storageDelete.bind(this);
                    this.NewObjectButtonFunc = this.BlockListText_newEditButton.bind(this);
                }

                async init() {
                    await super.init();
                    this.EditConfigPage_Ele = document.createElement("div");
                    this.EditConfigPage_Ele.style.display = "none";
                    this.EditConfigPage_Ele.style.height = "100%";
                    this.EditConfigPage_Ele.innerHTML = `
<style type="text/css">
  div.EditConfigObjectPage {
    height: 100%;
  }
  div#BlockListText_Textarea_div {
    height: calc(100% - 110px);
  }
  textarea#BlockListText_Textarea {
    resize: none;
    margin-left: -10px;
    width: calc(100% + 20px);
    height: 100%;
    box-sizing: border-box;
  }
</style>

<div id="BlockListText" class="EditConfigObjectPage">
  <div id="BlockListText_Textarea_div" class="ItemFrame_Border">
    <h1 id="BlockListText_Textarea_Title" class="ItemFrame_Title"></h1>
    <textarea
      id="BlockListText_Textarea"
      spellcheck="false"
      wrap="off"
    ></textarea>
    <div id="BlockListText_Textarea_Disable" style="display: none">
      <span id="BlockListText_Textarea_Disable_SpanText"></span>
      <button id="BlockListText_Textarea_Disable_ShowButton"></button>
    </div>
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
    <br />
    <input id="BlockListText_Fetch_InputText" type="text" spellcheck="false" />
  </div>
  <div class="ItemFrame_Border">
    <h1 id="BlockListText_Config_Title" class="ItemFrame_Title"></h1>
    <label>
      <input id="BlockListText_Config1_Input" type="checkbox" />
      <span id="BlockListText_Config1_SpanText"></span>
    </label>
    <br />
    <label>
      <input id="BlockListText_Config2_Input" type="checkbox" />
      <span id="BlockListText_Config2_SpanText"></span>
    </label>
    <br />
    <label>
      <input id="BlockListText_Config3_Input" type="checkbox" />
      <span id="BlockListText_Config3_SpanText"></span>
    </label>
    <br />
    <label>
      <input id="BlockListText_Config4_Input" type="checkbox" />
      <span id="BlockListText_Config4_SpanText"></span>
    </label>
    <br />
    <label>
      <input id="BlockListText_Config5_Input" type="checkbox" />
      <span id="BlockListText_Config5_SpanText"></span>
    </label>
    <br />
    <label>
      <input id="BlockListText_Config6_Input" type="checkbox" />
      <span id="BlockListText_Config6_SpanText"></span>
    </label>
  </div>
  <div>
    <button id="BlockListText_BackButton"></button>
  </div>
</div>
            `
                    DashboardMain_div.append(this.EditConfigPage_Ele);
                    Dashboard_Window_Ele_stack.push(this.EditConfigPage_Ele);

                    RootShadow.getElementById("BlockListText_Textarea_Title").textContent = "ブロックリストテキスト";
                    RootShadow.getElementById("BlockListText_Textarea_Disable_SpanText").textContent = "URLから取得する設定になっているため自動的にブロックリストテキストは上書きされます。";
                    RootShadow.getElementById("BlockListText_Textarea_Disable_ShowButton").textContent = "テキストを表示";
                    RootShadow.getElementById("BlockListText_ReadFile_Title").textContent = "テキストファイルを読み込む";
                    RootShadow.getElementById("BlockListText_Fetch_Title").textContent = "URLから取得する";
                    RootShadow.getElementById("BlockListText_Fetch_InputCheckbox_SpanText").textContent = "有効";
                    RootShadow.getElementById("BlockListText_Config_Title").textContent = "オプション";
                    RootShadow.getElementById("BlockListText_Config1_SpanText").textContent = "正規表現";
                    RootShadow.getElementById("BlockListText_Config2_SpanText").textContent = "大文字と小文字を区別する";
                    RootShadow.getElementById("BlockListText_Config3_SpanText").textContent = "完全一致";
                    RootShadow.getElementById("BlockListText_Config4_SpanText").textContent = "空白スペースを無視する";
                    RootShadow.getElementById("BlockListText_Config5_SpanText").textContent = "NOT検索をする";
                    RootShadow.getElementById("BlockListText_Config6_SpanText").textContent = "uBlacklist形式を使用する";
                    RootShadow.getElementById("BlockListText_BackButton").textContent = "←戻る"

                    this.textareaDisable_Ele = RootShadow.getElementById("BlockListText_Textarea_Disable");

                    this.textarea_Ele = RootShadow.getElementById("BlockListText_Textarea");
                    this.fetch_enable_Ele = RootShadow.getElementById("BlockListText_Fetch_InputCheckbox");
                    this.fetch_url_Ele = RootShadow.getElementById("BlockListText_Fetch_InputText");
                    this.regexp_Ele = RootShadow.getElementById("BlockListText_Config1_Input");
                    this.caseSensitive_Ele = RootShadow.getElementById("BlockListText_Config2_Input");
                    this.exact_Ele = RootShadow.getElementById("BlockListText_Config3_Input");
                    this.spaceIgnore_Ele = RootShadow.getElementById("BlockListText_Config4_Input");
                    this.notSearch_Ele = RootShadow.getElementById("BlockListText_Config5_Input");
                    this.uBlacklist_Ele = RootShadow.getElementById("BlockListText_Config6_Input");

                    RootShadow.getElementById("BlockListText_ReadFile_Input").addEventListener("change", async (evt) => {
                        const targetElement = evt.target;
                        if (targetElement.files[0]) {
                            const res = await popup.confirm("現在入力されているテキストはファイルのテキストで上書きされます。よろしいですか？");
                            if (!res) {
                                targetElement.value = "";
                                return false;
                            }
                            const file = targetElement.files[0];
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                                this.textarea_Ele.value = evt.target.result;
                            }
                            reader.readAsText(file);
                            targetElement.value = "";
                        }
                    });

                    RootShadow.getElementById("BlockListText_Textarea_Disable_ShowButton").addEventListener("click", () => {
                        this.textarea_Ele.style.display = "block";
                        this.textareaDisable_Ele.style.display = "none";
                    }, false);

                    RootShadow.getElementById("BlockListText_BackButton").addEventListener("click", () => {
                        this.ListEditPage_Ele.style.display = "block";
                        this.EditConfigPage_Ele.style.display = "none";
                        DashboardMain_div.scroll({ top: 0 });
                    }, false);

                    RootShadow.getElementById("SettingsObject_ConfigItems_Enable").style.display = "none";
                }

                async BlockListText_storageUpdateOtherSetting(oldName, newName) {
                    const SentenceBlockStorageTemp = JSON.parse(await storageAPI.read("SentenceBlock"));
                    SentenceBlockStorageTemp.forEach((SentenceBlock_Obj) => {
                        const indexOldB = SentenceBlock_Obj.BlockListText_list.indexOf(oldName);
                        if (indexOldB != -1) {
                            if (newName) {
                                SentenceBlock_Obj.BlockListText_list[indexOldB] = newName;
                            } else {
                                SentenceBlock_Obj.BlockListText_list.splice(indexOldB, 1);
                            }
                        }
                        const indexOldE = SentenceBlock_Obj.BlockListText_exclude_list.indexOf(oldName);
                        if (indexOldE != -1) {
                            if (newName) {
                                SentenceBlock_Obj.BlockListText_exclude_list[indexOldE] = newName;
                            } else {
                                SentenceBlock_Obj.BlockListText_exclude_list.splice(indexOldE, 1);
                            }
                        }
                        if (SentenceBlock_Obj.url_BLT === oldName) {
                            SentenceBlock_Obj.url_BLT = newName;
                        }
                    });
                    await storageAPI.write("SentenceBlock", JSON.stringify(SentenceBlockStorageTemp));

                    const ElementBlockStorageTemp = JSON.parse(await storageAPI.read("ElementBlock"));
                    ElementBlockStorageTemp.forEach((ElementBlock_Obj) => {
                        const indexOldB = ElementBlock_Obj.BlockListText_list.indexOf(oldName);
                        if (indexOldB != -1) {
                            if (newName) {
                                ElementBlock_Obj.BlockListText_list[indexOldB] = newName;
                            } else {
                                ElementBlock_Obj.BlockListText_list.splice(indexOldB, 1);
                            }
                        }
                        const indexOldE = ElementBlock_Obj.BlockListText_exclude_list.indexOf(oldName);
                        if (indexOldE != -1) {
                            if (newName) {
                                ElementBlock_Obj.BlockListText_exclude_list[indexOldE] = newName;
                            } else {
                                ElementBlock_Obj.BlockListText_exclude_list.splice(indexOldE, 1);
                            }
                        }
                        if (ElementBlock_Obj.url_BLT === oldName) {
                            ElementBlock_Obj.url_BLT = newName;
                        }
                    });
                    await storageAPI.write("ElementBlock", JSON.stringify(ElementBlockStorageTemp));
                    StorageLoad();
                }

                async BlockListText_storageSave() {
                    const StoObj = {
                        name: this.name_Ele.value,
                        fetch_enable: this.fetch_enable_Ele.checked,
                        fetch_url: this.fetch_url_Ele.value,
                        regexp: this.regexp_Ele.checked,
                        caseSensitive: this.caseSensitive_Ele.checked,
                        exact: this.exact_Ele.checked,
                        spaceIgnore: this.spaceIgnore_Ele.checked,
                        notSearch: this.notSearch_Ele.checked,
                        uBlacklist: this.uBlacklist_Ele.checked
                    }
                    const StoObj_Text = {
                        text: this.textarea_Ele.value.trim(),
                        fetch_timeStamp: 0
                    }
                    if (await this.ListStoSave("BlockListText", StoObj)) {
                        const BlockListText_Keyname_Old = "BLT_" + this.currentName;
                        if (this.currentName !== "") {
                            await storageAPI.delete(BlockListText_Keyname_Old);
                        }
                        const BlockListText_Keyname_New = "BLT_" + StoObj.name;
                        await storageAPI.write(BlockListText_Keyname_New, JSON.stringify(StoObj_Text));
                        if (this.currentName !== "") {
                            this.BlockListText_storageUpdateOtherSetting(this.currentName, StoObj.name);
                        }
                    }
                    BlockListText_feathLoad();
                }

                async BlockListText_storageDelete() {
                    if (await this.ListStoDel("BlockListText")) {
                        const BlockListText_keyName = "BLT_" + this.currentName;
                        await storageAPI.delete(BlockListText_keyName);
                        this.BlockListText_storageUpdateOtherSetting(this.currentName, "");
                    }
                }

                async BlockListText_newEditButton(NewbuttonEle) {
                    if (await this.NewEditButton(NewbuttonEle)) {
                        this.textarea_Ele.value = "";
                        this.fetch_enable_Ele.checked = false;
                        this.fetch_url_Ele.value = "";
                        this.regexp_Ele.checked = false;
                        this.caseSensitive_Ele.checked = false;
                        this.exact_Ele.checked = false;
                        this.spaceIgnore_Ele.checked = false;
                        this.notSearch_Ele.checked = false;
                        this.uBlacklist_Ele.checked = false;

                        this.textarea_Ele.style.display = "block";
                        this.textareaDisable_Ele.style.display = "none";
                    }
                }

            }(BlockListTextStorage).init();
        }

        async function Dashboard_SentenceBlock() {
            await new class extends ListEdit_Func {
                constructor(SB_Storage) {
                    super(SB_Storage);
                    this.url_Ele = null;
                    this.url_BLT_Ele = null;
                    this.url_mode_Ele = null;
                    this.BlockListText_list_Ele = null;
                    this.BlockListText_exclude_list_Ele = null;
                    this.replace_string_Ele = null;
                    this.replace_mode_Ele = null;
                    this.aTag_replace_mode_ELe = null;
                    this.li_cfuncinfunction = async () => {
                        const applylist = this.ListStorage[this.currentIndex];
                        this.enable_Ele.checked = applylist.enable;
                        this.url_Ele.value = applylist.url;
                        this.url_BLT_Ele.value = applylist.url_BLT;
                        this.url_mode_Ele.url_mode.value = applylist.url_mode;
                        this.replace_string_Ele.value = applylist.replace_string;
                        this.replace_mode_Ele.replace_mode.value = applylist.replace_mode;
                        this.aTag_replace_mode_ELe.value = applylist.aTag_replace_mode;

                        this.urlModeChange();

                        Array.from(this.BlockListText_list_Ele.options).forEach((htmlOption) => {
                            if (applylist.BlockListText_list.indexOf(htmlOption.value) != -1) {
                                htmlOption.selected = true;
                            } else {
                                htmlOption.selected = false;
                            }
                        });
                        Array.from(this.BlockListText_exclude_list_Ele.options).forEach((htmlOption) => {
                            if (applylist.BlockListText_exclude_list.indexOf(htmlOption.value) != -1) {
                                htmlOption.selected = true;
                            } else {
                                htmlOption.selected = false;
                            }
                        });
                    }

                    this.SaveButtonFunc = this.SentenceBlock_ListStoSave.bind(this);
                    this.DelButtonFunc = this.SentenceBlock_ListStoDel.bind(this);
                    this.NewObjectButtonFunc = this.SentenceBlock_ListNewEditButton.bind(this);
                }

                async init() {
                    await super.init();
                    this.EditConfigPage_Ele = document.createElement("div");
                    this.EditConfigPage_Ele.style.display = "none";
                    this.EditConfigPage_Ele.style.height = "calc(100% - 80px)";
                    this.EditConfigPage_Ele.innerHTML = `
<style type="text/css">
  div.EditConfigObjectPage {
    height: 100%;
  }
  select.SentenceBlock_Select {
    overflow: scroll;
  }
  option.SentenceBlock_Option {
    display: table;
    min-width: 100%;
    box-sizing: border-box;
  }
</style>

<div id="SentenceBlockConfig" class="EditConfigObjectPage">
  <div class="ItemFrame_Border">
    <h1 id="SentenceBlockConfig1_Title" class="ItemFrame_Title"></h1>
    <p id="SentenceBlockConfig1_Description"></p>
    <input id="SentenceBlockConfig1_Input1" type="text" spellcheck="false" />
    <select id="SentenceBlockConfig1_Select" size="1" style="display: none">
      <option value="">-----</option>
    </select>
    <br />
    <form id="SentenceBlockConfig1_Form">
      <label>
        <input type="radio" name="url_mode" value="wildcard" checked />
        <span id="SentenceBlockConfig1_Form_Input1_SpanText"></span>
      </label>
      <br />
      <label>
        <input type="radio" name="url_mode" value="regexp" />
        <span id="SentenceBlockConfig1_Form_Input2_SpanText"></span>
      </label>
      <br />
      <label>
        <input type="radio" name="url_mode" value="blt" />
        <span id="SentenceBlockConfig1_Form_Input3_SpanText"></span>
      </label>
    </form>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="SentenceBlockConfig2_Title" class="ItemFrame_Title"></h1>
    <p id="SentenceBlockConfig2_Description"></p>
    <select
      id="SentenceBlockConfig2_Select"
      class="SentenceBlock_Select"
      size="7"
      multiple
    >
      <option value="">-----</option>
    </select>
    <div>
      <div class="ItemFrame_Border">
        <p id="SentenceBlockConfig2-2_Description"></p>
        <select
          id="SentenceBlockConfig2-2_Select"
          class="SentenceBlock_Select"
          size="7"
          multiple
        >
          <option value="">-----</option>
        </select>
      </div>
    </div>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="SentenceBlockConfig3_Title" class="ItemFrame_Title"></h1>
    <p id="SentenceBlockConfig3_Description"></p>
    <input id="SentenceBlockConfig3_InputText" type="text" spellcheck="false" />
    <form id="SentenceBlockConfig3_Form">
      <label>
        <input type="radio" name="replace_mode" value="sentence" checked />
        <span id="SentenceBlockConfig3_Form_Input1_SpanText"></span>
      </label>
      <label>
        <input type="radio" name="replace_mode" value="word" />
        <span id="SentenceBlockConfig3_Form_Input2_SpanText"></span>
      </label>
    </form>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="SentenceBlockConfig4_Title" class="ItemFrame_Title"></h1>
    <p id="SentenceBlockConfig4_Description"></p>
    <select
      id="SentenceBlockConfig4_Select"
      class="ElementBlock_Select"
      size="1"
    >
      <option
        id="SentenceBlockConfig4_Select_Option1"
        value="hrefexclude"
      ></option>
      <option
        id="SentenceBlockConfig4_Select_Option2"
        value="hrefonly"
      ></option>
      <option id="SentenceBlockConfig4_Select_Option3" value="all"></option>
    </select>
  </div>

  <div>
    <button id="SentenceBlockConfig_BackButton"></button>
  </div>
</div>
                    `
                    DashboardMain_div.append(this.EditConfigPage_Ele);
                    Dashboard_Window_Ele_stack.push(this.EditConfigPage_Ele);

                    RootShadow.getElementById("SentenceBlockConfig1_Title").textContent = "URL";
                    RootShadow.getElementById("SentenceBlockConfig1_Description").textContent = "このルールを有効にするサイトを指定します。何も入力せず空欄にするとすべてのサイトが対象になります。";
                    RootShadow.getElementById("SentenceBlockConfig1_Form_Input1_SpanText").textContent = "ワイルドカード";
                    RootShadow.getElementById("SentenceBlockConfig1_Form_Input2_SpanText").textContent = "正規表現";
                    RootShadow.getElementById("SentenceBlockConfig1_Form_Input3_SpanText").textContent = "ブロックリストテキスト";
                    RootShadow.getElementById("SentenceBlockConfig2_Title").textContent = "NGフィルタ";
                    RootShadow.getElementById("SentenceBlockConfig2_Description").textContent = "使用するNGフィルタを指定します。";
                    RootShadow.getElementById("SentenceBlockConfig2-2_Description").textContent = "除外リストも使用する場合は下のリストから選択してください。";
                    RootShadow.getElementById("SentenceBlockConfig3_Title").textContent = "置換文字";
                    RootShadow.getElementById("SentenceBlockConfig3_Description").textContent = "置換する文字列を入力します。";
                    RootShadow.getElementById("SentenceBlockConfig3_Form_Input1_SpanText").textContent = "一文章で置換える";
                    RootShadow.getElementById("SentenceBlockConfig3_Form_Input2_SpanText").textContent = "単語で置換える";
                    RootShadow.getElementById("SentenceBlockConfig4_Title").textContent = "aタグのリンク置換";
                    RootShadow.getElementById("SentenceBlockConfig4_Description").textContent = "aタグのリンクを置換をするかどうか設定します。（aタグのリンクを置換するとリンクが正常に機能しなくなります。）";
                    RootShadow.getElementById("SentenceBlockConfig4_Select_Option1").textContent = "aタグのリンクは置換えない";
                    RootShadow.getElementById("SentenceBlockConfig4_Select_Option2").textContent = "aタグのリンクのみ置換える";
                    RootShadow.getElementById("SentenceBlockConfig4_Select_Option3").textContent = "すべて置換する";
                    RootShadow.getElementById("SentenceBlockConfig_BackButton").textContent = "←戻る";

                    this.url_Ele = RootShadow.getElementById("SentenceBlockConfig1_Input1");
                    this.url_BLT_Ele = RootShadow.getElementById("SentenceBlockConfig1_Select");
                    this.url_mode_Ele = RootShadow.getElementById("SentenceBlockConfig1_Form");
                    this.BlockListText_list_Ele = RootShadow.getElementById("SentenceBlockConfig2_Select");
                    this.BlockListText_exclude_list_Ele = RootShadow.getElementById("SentenceBlockConfig2-2_Select");
                    this.replace_string_Ele = RootShadow.getElementById("SentenceBlockConfig3_InputText");
                    this.replace_mode_Ele = RootShadow.getElementById("SentenceBlockConfig3_Form");
                    this.aTag_replace_mode_ELe = RootShadow.getElementById("SentenceBlockConfig4_Select");

                    for (let i = 0; i < BlockListTextStorage.length; i++) {
                        const option = document.createElement("option");
                        option.className = "SentenceBlock_Option";
                        option.setAttribute("value", BlockListTextStorage[i].name);
                        option.textContent = BlockListTextStorage[i].name;
                        this.BlockListText_list_Ele.append(option);
                        this.BlockListText_exclude_list_Ele.append(option.cloneNode(true));
                        this.url_BLT_Ele.append(option.cloneNode(true));
                    }

                    RootShadow.getElementById("SentenceBlockConfig1_Form").addEventListener("change", () => {
                        this.urlModeChange();
                    }, false);

                    RootShadow.getElementById("SentenceBlockConfig_BackButton").addEventListener("click", () => {
                        this.ListEditPage_Ele.style.display = "block";
                        this.EditConfigPage_Ele.style.display = "none";
                        DashboardMain_div.scroll({ top: 0 });
                    }, false);
                }

                async urlModeChange() {
                    if (RootShadow.getElementById("SentenceBlockConfig1_Form").url_mode.value === "blt") {
                        this.url_Ele.style.display = "none";
                        this.url_BLT_Ele.style.display = "";
                    } else {
                        this.url_Ele.style.display = "";
                        this.url_BLT_Ele.style.display = "none";
                    }
                }

                async SentenceBlock_ListStoSave() {
                    const BLT_list_map = Array.from(this.BlockListText_list_Ele.selectedOptions).map((htmlOption) => {
                        return htmlOption.value;
                    });
                    const BLT_exclude_list_map = Array.from(this.BlockListText_exclude_list_Ele.selectedOptions).map((htmlOption) => {
                        return htmlOption.value;
                    });
                    const StoObj = {
                        name: this.name_Ele.value,
                        enable: this.enable_Ele.checked,
                        url: this.url_Ele.value,
                        url_BLT: this.url_BLT_Ele.value,
                        url_mode: this.url_mode_Ele.url_mode.value,
                        BlockListText_list: BLT_list_map,
                        BlockListText_exclude_list: BLT_exclude_list_map,
                        replace_string: this.replace_string_Ele.value,
                        replace_mode: this.replace_mode_Ele.replace_mode.value,
                        aTag_replace_mode: this.aTag_replace_mode_ELe.value
                    }
                    await this.ListStoSave("SentenceBlock", StoObj);
                }

                async SentenceBlock_ListStoDel() {
                    await this.ListStoDel("SentenceBlock");
                }

                async SentenceBlock_ListNewEditButton(NewbuttonEle) {
                    if (await this.NewEditButton(NewbuttonEle)) {
                        this.url_Ele.value = "";
                        this.url_BLT_Ele.value = "";
                        this.url_mode_Ele.url_mode.value = "wildcard";
                        this.BlockListText_list_Ele.value = "";
                        this.BlockListText_exclude_list_Ele.value = "";
                        this.replace_string_Ele.value = "";
                        this.replace_mode_Ele.replace_mode.value = "sentence";
                        this.aTag_replace_mode_ELe.value = "hrefexclude";

                        this.enable_Ele.checked = true;

                        this.urlModeChange();

                        return;
                    }
                }

            }(SentenceBlockStorage).init();
        }

        async function Dashboard_ElementBlock() {
            await new class extends ListEdit_Func {
                constructor(EB_Storage) {
                    super(EB_Storage);
                    this.url_Ele = null;
                    this.url_BLT_Ele = null;
                    this.url_mode_Ele = null;
                    this.elementHide_Ele = null;
                    this.elementHide_method_Ele = null;
                    this.elementHide_hideMethod_Ele = null;
                    this.elementSearch_Ele = null;
                    this.elementSearch_method_Ele = null;
                    this.elementSearch_firstOnly_Ele = null;
                    this.elementSearch_property_Ele = null;
                    this.elementSearch_property_style_Ele = null;
                    this.elementSearch_property_advanced_Ele = null;
                    this.BlockListText_list_Ele = null;
                    this.BlockListText_exclude_list_Ele = null;
                    this.uBlacklist_method_Ele = null;
                    this.resultShow_Ele = null;
                    this.li_cfuncinfunction = async () => {
                        const applylist = this.ListStorage[this.currentIndex];
                        this.enable_Ele.checked = applylist.enable;
                        this.url_Ele.value = applylist.url;
                        this.url_BLT_Ele.value = applylist.url_BLT;
                        this.url_mode_Ele.url_mode.value = applylist.url_mode;
                        this.elementHide_Ele.value = applylist.elementHide;
                        this.elementHide_method_Ele.pickerMethod.value = applylist.elementHide_method;
                        this.elementHide_hideMethod_Ele.hideMethod.value = applylist.elementHide_hideMethod;
                        this.elementSearch_Ele.value = applylist.elementSearch;
                        this.elementSearch_method_Ele.pickerMethod.value = applylist.elementSearch_method;
                        this.elementSearch_firstOnly_Ele.checked = applylist.elementSearch_firstOnly;
                        this.elementSearch_property_Ele.propertyMode.value = applylist.elementSearch_property;
                        this.elementSearch_property_style_Ele.value = applylist.elementSearch_property_style;
                        this.elementSearch_property_advanced_Ele.value = applylist.elementSearch_property_advanced;
                        this.uBlacklist_method_Ele.value = applylist.uBlacklist_method;
                        this.resultShow_Ele.resultShow.value = applylist.resultShow;

                        this.urlModeChange();

                        Array.from(this.BlockListText_list_Ele.options).forEach((htmlOption) => {
                            if (applylist.BlockListText_list.indexOf(htmlOption.value) != -1) {
                                htmlOption.selected = true;
                            } else {
                                htmlOption.selected = false;
                            }
                        });
                        Array.from(this.BlockListText_exclude_list_Ele.options).forEach((htmlOption) => {
                            if (applylist.BlockListText_exclude_list.indexOf(htmlOption.value) != -1) {
                                htmlOption.selected = true;
                            } else {
                                htmlOption.selected = false;
                            }
                        });
                    }

                    this.SaveButtonFunc = this.ElementBlock_ListStoSave.bind(this);
                    this.DelButtonFunc = this.ElementBlock_ListStoDel.bind(this);
                    this.NewObjectButtonFunc = this.ElementBlock_ListNewEditButton.bind(this);
                }

                async init() {
                    await super.init();
                    this.EditConfigPage_Ele = document.createElement("div");
                    this.EditConfigPage_Ele.style.display = "none";
                    this.EditConfigPage_Ele.style.height = "calc(100% - 80px)";
                    this.EditConfigPage_Ele.innerHTML = `
<style type="text/css">
  div.EditConfigObjectPage {
    height: 100%;
  }
  select.ElementBlock_Select {
    width: 100%;
    overflow: scroll;
  }
  option.ElementBlock_Option {
    display: table;
    min-width: 100%;
    box-sizing: border-box;
  }
</style>

<div id="ElementBlockConfig" class="EditConfigObjectPage">
  <div class="ItemFrame_Border">
    <h1 id="ElementBlockConfig1_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlockConfig1_Description"></p>
    <input id="ElementBlockConfig1_Input1" type="text" spellcheck="false" />
    <select id="ElementBlockConfig1_Select" size="1" style="display: none">
      <option value="">-----</option>
    </select>
    <br />
    <form id="ElementBlockConfig1_Form">
      <label>
        <input type="radio" name="url_mode" value="wildcard" checked />
        <span id="ElementBlockConfig1_Form_Input1_SpanText"></span>
      </label>
      <br />
      <label>
        <input type="radio" name="url_mode" value="regexp" />
        <span id="ElementBlockConfig1_Form_Input2_SpanText"></span>
      </label>
      <br />
      <label>
        <input type="radio" name="url_mode" value="blt" />
        <span id="ElementBlockConfig1_Form_Input3_SpanText"></span>
      </label>
    </form>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="ElementBlockConfig2_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlockConfig2_Description"></p>
    <input id="ElementBlockConfig2_InputText" type="text" spellcheck="false" />
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
    <div class="ItemFrame_Border">
      <form id="ElementBlockConfig2-2_From">
        <label>
          <input type="radio" name="hideMethod" value="displayNone" checked />
          <span id="ElementBlockConfig2-2_Form_Input1_SpanText"></span>
        </label>
        <br />
        <label>
          <input type="radio" name="hideMethod" value="remove" />
          <span id="ElementBlockConfig2-2_Form_Input2_SpanText"></span>
        </label>
      </form>
    </div>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="ElementBlockConfig3_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlockConfig3_Description"></p>
    <input id="ElementBlockConfig3_InputText" type="text" spellcheck="false" />
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
    <br />
    <label>
      <input id="ElementBlockConfig3_Input1" type="checkbox" />
      <span id="ElementBlockConfig3_Input1_SpanText"></span>
    </label>
    <div class="ItemFrame_Border">
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
          <br />
          <input
            id="ElementBlockConfig3-2_Form_Input3_InputText"
            type="text"
            spellcheck="false"
          />
        </label>
        <br />
        <label>
          <input type="radio" name="propertyMode" value="advanced" />
          <span id="ElementBlockConfig3-2_Form_Input4_SpanText"></span>
          <br />
          <input
            id="ElementBlockConfig3-2_Form_Input4_InputText"
            type="text"
            spellcheck="false"
          />
        </label>
      </form>
    </div>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="ElementBlockConfig4_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlockConfig4_Description"></p>
    <select
      id="ElementBlockConfig4_Select"
      class="ElementBlock_Select"
      size="8"
      multiple
    >
      <option value="">-----</option>
    </select>
    <div>
      <div class="ItemFrame_Border">
        <p id="ElementBlockConfig4-2_Description"></p>
        <select
          id="ElementBlockConfig4-2_Select"
          class="ElementBlock_Select"
          size="8"
          multiple
        >
          <option value="">-----</option>
        </select>
      </div>
    </div>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="ElementBlockConfig5_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlockConfig5_Description"></p>
    <select
      id="ElementBlockConfig5_Select"
      class="ElementBlock_Select"
      size="1"
    >
      <option id="ElementBlockConfig5_Select_Option1" value="urlonly"></option>
      <option
        id="ElementBlockConfig5_Select_Option2"
        value="titleonly"
      ></option>
      <option id="ElementBlockConfig5_Select_Option3" value="all"></option>
    </select>
  </div>

  <div class="ItemFrame_Border">
    <h1 id="ElementBlockConfig6_Title" class="ItemFrame_Title"></h1>
    <p id="ElementBlockConfig6_Description"></p>
    <form id="ElementBlockConfig6_Form">
      <label>
        <input type="radio" name="resultShow" value="none" checked />
        <span id="ElementBlockConfig6_Form_Input1_SpanText"></span>
      </label>
      <br />
      <label>
        <input type="radio" name="resultShow" value="number" />
        <span id="ElementBlockConfig6_Form_Input2_SpanText"></span>
      </label>
      <br />
      <label>
        <input type="radio" name="resultShow" value="property" />
        <span id="ElementBlockConfig6_Form_Input3_SpanText"></span>
      </label>
    </form>
  </div>

  <div>
    <button id="ElementBlockConfig_BackButton"></button>
  </div>
</div>
                    `
                    DashboardMain_div.append(this.EditConfigPage_Ele);
                    Dashboard_Window_Ele_stack.push(this.EditConfigPage_Ele);

                    RootShadow.getElementById("ElementBlockConfig1_Title").textContent = "URL";
                    RootShadow.getElementById("ElementBlockConfig1_Description").innerHTML = "このルールを有効にするサイトを指定します。 <br>正規表現がOFFの時「*」でワイルドカードを使用できます。";
                    RootShadow.getElementById("ElementBlockConfig1_Form_Input1_SpanText").textContent = "ワイルドカード";
                    RootShadow.getElementById("ElementBlockConfig1_Form_Input2_SpanText").textContent = "正規表現";
                    RootShadow.getElementById("ElementBlockConfig1_Form_Input3_SpanText").textContent = "ブロックリストテキスト";
                    RootShadow.getElementById("ElementBlockConfig2_Title").textContent = "非表示要素";
                    RootShadow.getElementById("ElementBlockConfig2_Description").textContent = "非表示する要素をCSS方式「querySelectorAll」かXPath方式「document.evaluate」で指定します。";
                    RootShadow.getElementById("ElementBlockConfig2_Form_Input1_SpanText").textContent = "CSS";
                    RootShadow.getElementById("ElementBlockConfig2_Form_Input2_SpanText").textContent = "XPath";
                    RootShadow.getElementById("ElementBlockConfig2_Button").textContent = "要素を選択する";
                    RootShadow.getElementById("ElementBlockConfig2-2_Form_Input1_SpanText").textContent = "非表示要素をCSSで非表示にする";
                    RootShadow.getElementById("ElementBlockConfig2-2_Form_Input2_SpanText").textContent = "非表示要素を削除する";
                    RootShadow.getElementById("ElementBlockConfig3_Title").textContent = "検索要素";
                    RootShadow.getElementById("ElementBlockConfig3_Description").textContent = "非表示するために検索する要素をCSS方式「querySelectorAll」かXPath方式「document.evaluate」で指定します。何も入力せず空欄にすると無条件で非表示要素を隠します。";
                    RootShadow.getElementById("ElementBlockConfig3_Form_Input1_SpanText").textContent = "CSS";
                    RootShadow.getElementById("ElementBlockConfig3_Form_Input2_SpanText").textContent = "XPath";
                    RootShadow.getElementById("ElementBlockConfig3_Button").textContent = "要素を選択する";
                    RootShadow.getElementById("ElementBlockConfig3_Input1_SpanText").textContent = "複数の要素が見つかった場合、最初に見つかった要素のみ検索する";
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input1_SpanText").textContent = "要素のテキストを検索する";
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input2_SpanText").textContent = "要素のリンクを検索する（検索要素に「a」要素が含まれている場合のみ）";
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input3_SpanText").textContent = "要素のスタイルシートを検索する（上級者向け）";
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input4_SpanText").textContent = "要素の要素のプロパティを直接指定する（上級者向け）";
                    RootShadow.getElementById("ElementBlockConfig4_Title").textContent = "NGフィルタ";
                    RootShadow.getElementById("ElementBlockConfig4_Description").textContent = "要素検索に使用するNGフィルタを指定します。";
                    RootShadow.getElementById("ElementBlockConfig4-2_Description").textContent = "除外リストも使用する場合は下のリストから選択してください。";
                    RootShadow.getElementById("ElementBlockConfig5_Title").textContent = "uBlacklist使用時の有効にする種類";
                    RootShadow.getElementById("ElementBlockConfig5_Description").textContent = "uBlacklist使用時に有効にする種類を指定します。";
                    RootShadow.getElementById("ElementBlockConfig5_Select_Option1").textContent = "マッチパターンと正規表現（検索対象の値がURLだけのみ有効）";
                    RootShadow.getElementById("ElementBlockConfig5_Select_Option2").textContent = "\"title/\" のテキストのみ";
                    RootShadow.getElementById("ElementBlockConfig5_Select_Option3").textContent = "すべての種類を使用する";
                    RootShadow.getElementById("ElementBlockConfig6_Title").textContent = "ブロック適用リストの表示";
                    RootShadow.getElementById("ElementBlockConfig6_Description").textContent = "ダッシュボードのトップページにあるブロック結果の表示方法を選択します。";
                    RootShadow.getElementById("ElementBlockConfig6_Form_Input1_SpanText").textContent = "非表示";
                    RootShadow.getElementById("ElementBlockConfig6_Form_Input2_SpanText").textContent = "番号で表示";
                    RootShadow.getElementById("ElementBlockConfig6_Form_Input3_SpanText").textContent = "検索要素のプロパティの値を表示";
                    RootShadow.getElementById("ElementBlockConfig_BackButton").textContent = "←戻る";

                    this.url_Ele = RootShadow.getElementById("ElementBlockConfig1_Input1");
                    this.url_BLT_Ele = RootShadow.getElementById("ElementBlockConfig1_Select");
                    this.url_mode_Ele = RootShadow.getElementById("ElementBlockConfig1_Form");
                    this.elementHide_Ele = RootShadow.getElementById("ElementBlockConfig2_InputText");
                    this.elementHide_method_Ele = RootShadow.getElementById("ElementBlockConfig2_Form");
                    this.elementHide_hideMethod_Ele = RootShadow.getElementById("ElementBlockConfig2-2_From");
                    this.elementSearch_Ele = RootShadow.getElementById("ElementBlockConfig3_InputText");
                    this.elementSearch_method_Ele = RootShadow.getElementById("ElementBlockConfig3_Form");
                    this.elementSearch_firstOnly_Ele = RootShadow.getElementById("ElementBlockConfig3_Input1");
                    this.elementSearch_property_Ele = RootShadow.getElementById("ElementBlockConfig3-2_From");
                    this.elementSearch_property_style_Ele = RootShadow.getElementById("ElementBlockConfig3-2_Form_Input3_InputText");
                    this.elementSearch_property_advanced_Ele = RootShadow.getElementById("ElementBlockConfig3-2_Form_Input4_InputText");
                    this.BlockListText_list_Ele = RootShadow.getElementById("ElementBlockConfig4_Select");
                    this.BlockListText_exclude_list_Ele = RootShadow.getElementById("ElementBlockConfig4-2_Select");
                    this.uBlacklist_method_Ele = RootShadow.getElementById("ElementBlockConfig5_Select");
                    this.resultShow_Ele = RootShadow.getElementById("ElementBlockConfig6_Form");

                    for (let i = 0; i < BlockListTextStorage.length; i++) {
                        const option = document.createElement("option");
                        option.className = "ElementBlock_Option";
                        option.setAttribute("value", BlockListTextStorage[i].name);
                        option.textContent = BlockListTextStorage[i].name;
                        this.BlockListText_list_Ele.append(option);
                        this.BlockListText_exclude_list_Ele.append(option.cloneNode(true));
                        this.url_BLT_Ele.append(option.cloneNode(true));
                    }

                    RootShadow.getElementById("ElementBlockConfig1_Form").addEventListener("change", () => {
                        this.urlModeChange();
                    }, false);

                    RootShadow.getElementById("ElementBlockConfig_BackButton").addEventListener("click", () => {
                        this.ListEditPage_Ele.style.display = "block";
                        this.EditConfigPage_Ele.style.display = "none";
                        DashboardMain_div.scroll({ top: 0 });
                    }, false);
                }

                async urlModeChange() {
                    if (RootShadow.getElementById("ElementBlockConfig1_Form").url_mode.value === "blt") {
                        this.url_Ele.style.display = "none";
                        this.url_BLT_Ele.style.display = "";
                    } else {
                        this.url_Ele.style.display = "";
                        this.url_BLT_Ele.style.display = "none";
                    }
                }

                async ElementBlock_ListStoSave() {
                    const BLT_list_map = Array.from(this.BlockListText_list_Ele.selectedOptions).map((htmlOption) => {
                        return htmlOption.value;
                    });
                    const BLT_exclude_list_map = Array.from(this.BlockListText_exclude_list_Ele.selectedOptions).map((htmlOption) => {
                        return htmlOption.value;
                    });
                    const StoObj = {
                        name: this.name_Ele.value,
                        enable: this.enable_Ele.checked,
                        url: this.url_Ele.value,
                        url_BLT: this.url_BLT_Ele.value,
                        url_mode: this.url_mode_Ele.url_mode.value,
                        elementHide: this.elementHide_Ele.value,
                        elementHide_method: this.elementHide_method_Ele.pickerMethod.value,
                        elementHide_hideMethod: this.elementHide_hideMethod_Ele.hideMethod.value,
                        elementSearch: this.elementSearch_Ele.value,
                        elementSearch_method: this.elementSearch_method_Ele.pickerMethod.value,
                        elementSearch_firstOnly: this.elementSearch_firstOnly_Ele.checked,
                        elementSearch_property: this.elementSearch_property_Ele.propertyMode.value,
                        elementSearch_property_style: this.elementSearch_property_style_Ele.value,
                        elementSearch_property_advanced: this.elementSearch_property_advanced_Ele.value,
                        BlockListText_list: BLT_list_map,
                        BlockListText_exclude_list: BLT_exclude_list_map,
                        uBlacklist_method: this.uBlacklist_method_Ele.value,
                        resultShow: this.resultShow_Ele.resultShow.value
                    }
                    await this.ListStoSave("ElementBlock", StoObj);
                }

                async ElementBlock_ListStoDel() {
                    await this.ListStoDel("ElementBlock");
                }

                async ElementBlock_ListNewEditButton(NewbuttonEle) {
                    if (await this.NewEditButton(NewbuttonEle)) {
                        this.enable_Ele.checked = false;
                        this.url_Ele.value = "";
                        this.url_BLT_Ele.value = "";
                        this.url_mode_Ele.url_mode.value = "wildcard";
                        this.elementHide_Ele.value = "";
                        this.elementHide_method_Ele.pickerMethod.value = "css";
                        this.elementHide_hideMethod_Ele.hideMethod.value = "displayNone";
                        this.elementSearch_Ele.value = "";
                        this.elementSearch_method_Ele.pickerMethod.value = "css";
                        this.elementSearch_firstOnly_Ele.checked = false;
                        this.elementSearch_property_Ele.propertyMode.value = "text";
                        this.elementSearch_property_style_Ele.value = "";
                        this.elementSearch_property_advanced_Ele.value = "";
                        this.BlockListText_list_Ele.value = "";
                        this.BlockListText_exclude_list_Ele.value = "";
                        this.uBlacklist_method_Ele.value = "urlonly";
                        this.resultShow_Ele.resultShow.value = "number";

                        this.enable_Ele.checked = true;

                        this.urlModeChange();

                        return;
                    }
                }

            }(ElementBlockStorage).init();
        }

        async function Dashboard_PreferencePage() {
            ArrayLast(Dashboard_Window_Ele_stack).style.display = "none";
            DashboardMain_div.scroll({ top: 0 });
            const DB_preference_div = document.createElement("div");
            DB_preference_div.innerHTML = `
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
  <div id="ImportAndExport" class="ItemFrame_Border">
    <h1 id="ImportAndExport_Title" class="ItemFrame_Title"></h1>
    <p id="ImportAndExport_Description"></p>
    <button id="ImportAndExport_Button"></button>
  </div>
  <div id="PerformanceConfig" class="ItemFrame_Border">
    <h1 id="PerformanceConfig_Title" class="ItemFrame_Title"></h1>
    <p id="PerformanceConfig_Description"></p>
    <button id="PerformanceConfig_Button"></button>
  </div>
  <div id="ButtonHide" class="ItemFrame_Border">
    <h1 id="ButtonHide_Title" class="ItemFrame_Title"></h1>
    <p id="ButtonHide_Description"></p>
    <label>
      <input id="ButtonHide_Input" type="checkbox" />
      <span id="ButtonHide_Input_SpanText"></span>
    </label>
  </div>
  <div id="DashboardColor" class="ItemFrame_Border">
    <h1 id="DashboardColor_Title" class="ItemFrame_Title"></h1>
    <p id="DashboardColor_Description"></p>
    <select id="DashboardColor_Select" size="1">
      <option id="DashboardColor_Select_Option1" value="#FFB2B2"></option>
      <option id="DashboardColor_Select_Option2" value="#ffffb2"></option>
      <option id="DashboardColor_Select_Option3" value="#B2FFB2"></option>
      <option id="DashboardColor_Select_Option4" value="#B2B2FF"></option>
    </select>
  </div>
  <div id="SettingMainPageBack" class="PreferencesItem">
    <button id="PreferencesPageBack_Button"></button>
  </div>
</div>
            `
            DashboardMain_div.append(DB_preference_div);
            Dashboard_Window_Ele_stack.push(DB_preference_div);

            RootShadow.getElementById("ImportAndExport_Title").textContent = "エクスポート&インポート";
            RootShadow.getElementById("ImportAndExport_Description").textContent = "設定内容をエクスポートまたはインポートします。";
            RootShadow.getElementById("ImportAndExport_Button").textContent = "エクスポート&インポート";
            RootShadow.getElementById("PerformanceConfig_Title").textContent = "パフォーマンス設定";
            RootShadow.getElementById("PerformanceConfig_Description").textContent = "拡張機能の動作頻度などのパフォーマンス関係の設定をします。";
            RootShadow.getElementById("PerformanceConfig_Button").textContent = "パフォーマンス設定";
            RootShadow.getElementById("ButtonHide_Title").textContent = "右上のボタンを常時非表示にする";
            RootShadow.getElementById("ButtonHide_Description").textContent = "右上のボタンを常時非表示にします。非表示後もUserScriptマネージャーのメニュー画面からダッシュボードにアクセスできます。";
            RootShadow.getElementById("ButtonHide_Input_SpanText").textContent = "ボタンを非表示にする";
            RootShadow.getElementById("DashboardColor_Title").textContent = "ダッシュボード背景色";
            RootShadow.getElementById("DashboardColor_Description").textContent = "ダッシュボード画面全体の背景色の色を指定します。";
            RootShadow.getElementById("DashboardColor_Select_Option1").textContent = "赤色";
            RootShadow.getElementById("DashboardColor_Select_Option2").textContent = "黄色";
            RootShadow.getElementById("DashboardColor_Select_Option3").textContent = "緑色";
            RootShadow.getElementById("DashboardColor_Select_Option4").textContent = "青色";
            RootShadow.getElementById("PreferencesPageBack_Button").textContent = "←戻る";

            RootShadow.getElementById("ImportAndExport_Button").addEventListener("click", DB_ExportImport, false);
            RootShadow.getElementById("PerformanceConfig_Button").addEventListener("click", DB_performanceConfig, false);

            const ButtonHide_Setting_Input = RootShadow.getElementById("ButtonHide_Input");
            if (PreferenceSettingStorage.hideButton) {
                ButtonHide_Setting_Input.checked = true;
            } else {
                ButtonHide_Setting_Input.checked = false;
            }
            ButtonHide_Setting_Input.addEventListener("change", async (evt) => {
                const targetElement = evt.target;
                if (targetElement.checked) {
                    try {
                        // eslint-disable-next-line no-undef
                        GM.registerMenuCommand("Dashboard", DashboardWindow, "D");
                    } catch (e) {
                        console.error(e);
                        targetElement.checked = false;
                        const res = await popup.confirm("メニューAPIが検出されませんでした。このまま非表示にすると、再インストールして設定をすべて消去しない限り二度と設定画面を表示することはできなくなります。本当に常時ボタンを非表示にしてよろしいですか？");
                        if (res) {
                            targetElement.checked = true;
                        } else {
                            return;
                        }
                    }
                    PreferenceSettingStorage.hideButton = true;
                    await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorage));
                } else {
                    PreferenceSettingStorage.hideButton = false;
                    await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorage));
                }
            });

            RootShadow.getElementById("DashboardColor_Select").value = PreferenceSettingStorage.dashboardColor;
            RootShadow.getElementById("DashboardColor_Select").addEventListener("change", async (evt) => {
                PreferenceSettingStorage.dashboardColor = evt.target.value;
                RootShadow.getElementById("FrameBack").style.setProperty("--CustomBackgroundColor", evt.target.value);
                await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorage));
            })

            RootShadow.getElementById("PreferencesPageBack_Button").addEventListener("click", () => {
                Dashboard_Window_Ele_stack.pop().remove();
                ArrayLast(Dashboard_Window_Ele_stack).style.display = "block";
                DashboardMain_div.scroll({ top: 0 });
            }, false);


            async function DB_ExportImport() {
                const DB_ExportImport_JSONFormat = async (mode, importjson) => {
                    if (mode === "export") {
                        try {
                            const KeyList = await storageAPI.keynameList();
                            let JSONObject = new Object;
                            await Promise.all(KeyList.map(async (keyName) => {
                                JSONObject[keyName] = await storageAPI.read(keyName);
                            }));
                            return JSON.stringify(JSONObject);
                        } catch (e) {
                            console.error(e);
                            await popup.alert("エラー：エクスポートに失敗しました。詳細はコンソールログを参照してください。")
                            return undefined;
                        }
                    } else if (mode === "import") {
                        try {
                            let importset;
                            try {
                                importset = JSON.parse(importjson);
                            } catch (e) {
                                console.error(e);
                                await popup.alert("エラー：設定を読み込めませんでした。JSONファイル（テキスト）が壊れている可能性があります。エラーの詳細はコンソールログを参照してください。");
                                return undefined;
                            }
                            const ExistKeyList = await storageAPI.keynameList();
                            await Promise.all(ExistKeyList.map(async (ExistKey) => {
                                await storageAPI.delete(ExistKey);
                            }));
                            await Promise.all(Object.keys(importset).map(async (keyName) => {
                                await storageAPI.write(keyName, importset[keyName]);
                            }));
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

                ArrayLast(Dashboard_Window_Ele_stack).style.display = "none";
                DashboardMain_div.scroll({ top: 0 });
                const DB_exportAndImport_div = document.createElement("div");
                DB_exportAndImport_div.innerHTML = `
<style type="text/css">
  div.PreferencesItem {
    display: block;
    margin: 0 0 20px 0;
  }
  #ExportAndImportPage p {
    margin: 0;
  }
  textarea#ExportAndImportConfig3_Textarea {
    resize: none;
    width: 100%;
    height: 300px;
    box-sizing: border-box;
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
                DashboardMain_div.append(DB_exportAndImport_div);
                Dashboard_Window_Ele_stack.push(DB_exportAndImport_div);

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
                    const setJSON = await DB_ExportImport_JSONFormat("export");
                    if (setJSON) {
                        const d = new Date();
                        const filename = "NagativeBlockerBackup_" + d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + "_" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds() + ".json";

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
                    const setJSON = await DB_ExportImport_JSONFormat("export");
                    if (setJSON) {
                        copyTextToClipboard(setJSON);
                        ExportSuccessTextEle.style.display = "block";
                    }
                }, false);

                RootShadow.getElementById("ExportAndImportConfig1_Button3").addEventListener("click", async () => {
                    const setJSON = await DB_ExportImport_JSONFormat("export");
                    if (setJSON) {
                        TextareaEle.value = setJSON;
                        ExportSuccessTextEle.style.display = "block";
                    }
                    TextareaEle.value = setJSON;
                }, false);

                RootShadow.getElementById("ExportAndImportConfig2-1_Input").addEventListener("change", async (evt) => {
                    const targetElement = evt.target;
                    if (targetElement.files[0]) {
                        const res = await popup.confirm("現在の設定内容をインポートしたデータですべて上書きします。よろしいですか？");
                        if (!res) {
                            targetElement.value = "";
                            return false;
                        }
                        const file = targetElement.files[0];
                        const reader = new FileReader();
                        reader.onload = async (evt) => {
                            const result = await DB_ExportImport_JSONFormat("import", evt.target.result);
                            if (result) {
                                ImportSuccessTextEle.style.display = "block";
                            }
                        }
                        reader.readAsText(file);
                        targetElement.value = "";
                    }
                });

                RootShadow.getElementById("ExportAndImportConfig2-2_Button").addEventListener("click", async () => {
                    const res = await popup.confirm("現在の設定内容をインポートしたデータですべて上書きします。よろしいですか？");
                    if (!res) {
                        return false;
                    }
                    const result = await DB_ExportImport_JSONFormat("import", TextareaEle.value);
                    if (result) {
                        ImportSuccessTextEle.style.display = "block";
                    }
                }, false);

                RootShadow.getElementById("ExportAndImportConfig_BackButton").addEventListener("click", () => {
                    Dashboard_Window_Ele_stack.pop().remove();
                    ArrayLast(Dashboard_Window_Ele_stack).style.display = "block";
                    DashboardMain_div.scroll({ top: 0 });
                }, false);

            }


            async function DB_performanceConfig() {
                ArrayLast(Dashboard_Window_Ele_stack).style.display = "none";
                DashboardMain_div.scroll({ top: 0 });
                const DB_performanceConfig_div = document.createElement("div");
                DB_performanceConfig_div.innerHTML = `
<style type="text/css">
  div.PreferencesItem {
    display: block;
    margin: 0 0 20px 0;
  }
  #PerformanceConfig p {
    margin: 0;
  }
</style>

<div id="PerformanceConfig">
  <div class="ItemFrame_Border">
    <h1 id="PerformanceConfig1_Title" class="ItemFrame_Title"></h1>
    <p id="PerformanceConfig1_Description1"></p>
    <p id="PerformanceConfig1_Description2"></p>
    <p id="PerformanceConfig1_Description3"></p>
    <p id="PerformanceConfig1_Description4"></p>
    <select id="PerformanceConfig1_Select">
      <option id="PerformanceConfig1_Select_Option1" value="block"></option>
      <option id="PerformanceConfig1_Select_Option2" value="balance"></option>
      <option
        id="PerformanceConfig1_Select_Option3"
        value="performance1"
      ></option>
      <option
        id="PerformanceConfig1_Select_Option4"
        value="performance2"
      ></option>
    </select>
  </div>
  <div class="ItemFrame_Border">
    <h1 id="PerformanceConfig2_Title" class="ItemFrame_Title"></h1>
    <p id="PerformanceConfig2_Description1"></p>
    <p id="PerformanceConfig2_Description2"></p>
    <p id="PerformanceConfig2_Description3"></p>
    <div class="ItemFrame_Border">
      <span id="PerformanceConfig2_input1_SpanText"></span>
      <input id="PerformanceConfig2_input1" type="number" value="100" />
    </div>
    <div class="ItemFrame_Border">
      <span id="PerformanceConfig2_input2_SpanText"></span>
      <input id="PerformanceConfig2_input2" type="number" value="10" />
    </div>
    <div class="ItemFrame_Border">
      <span id="PerformanceConfig2_input3_SpanText"></span>
      <input id="PerformanceConfig2_input3" type="number" value="10" />
    </div>
  </div>
  <div class="ItemFrame_Border">
    <h1 id="PerformanceConfig3_Title" class="ItemFrame_Title"></h1>
    <p id="PerformanceConfig3_Description1"></p>
    <p id="PerformanceConfig3_Description2"></p>
    <div class="ItemFrame_Border">
      <span id="PerformanceConfig3_Select1_SpanText"></span>
      <select id="PerformanceConfig3_Select1" size="1">
        <option value="">-----</option>
      </select>
    </div>
    <div class="ItemFrame_Border">
      <span id="PerformanceConfig3_Select2_SpanText"></span>
      <select id="PerformanceConfig3_Select2" size="1">
        <option value="">-----</option>
      </select>
    </div>
    <div class="ItemFrame_Border">
      <span id="PerformanceConfig3_Select3_SpanText"></span>
      <select id="PerformanceConfig3_Select3" size="1">
        <option value="">-----</option>
      </select>
    </div>
    <div class="ItemFrame_Border">
      <span id="PerformanceConfig3_Select4_SpanText"></span>
      <select id="PerformanceConfig3_Select4" size="1">
        <option value="">-----</option>
      </select>
    </div>
    <div class="ItemFrame_Border">
      <span id="PerformanceConfig3_Select5_SpanText"></span>
      <select id="PerformanceConfig3_Select5" size="1">
        <option value="">-----</option>
      </select>
    </div>
  </div>
  <div>
    <button id="PerformanceConfig_BackButton"></button>
    <button id="PerformanceConfig_SaveButton"></button>
    <span id="PerformanceConfig_SaveInfoText" style="display: none"></span>
  </div>
</div>
                `
                DashboardMain_div.append(DB_performanceConfig_div);
                Dashboard_Window_Ele_stack.push(DB_performanceConfig_div);

                RootShadow.getElementById("PerformanceConfig1_Title").textContent = "モード設定";
                RootShadow.getElementById("PerformanceConfig1_Description1").textContent = "パフォーマンスのモード設定をします。";
                RootShadow.getElementById("PerformanceConfig1_Description2").textContent = "ブロック優先にするとページに変更があった場合、すぐにブロック動作をしますが、ページが重たくなる可能性があります。";
                RootShadow.getElementById("PerformanceConfig1_Description3").textContent = "パフォーマンス優先にすると一定間隔でブロック動作をすることで処理を軽くしますが、一瞬ブロックする要素が表示される可能性があります。";
                RootShadow.getElementById("PerformanceConfig1_Description4").textContent = "バランスにするとページを表示して読み込みが終わるまで、パフォーマンス優先で動作をし、読み込み完了後はブロック優先で動作します。";
                RootShadow.getElementById("PerformanceConfig1_Select_Option1").textContent = "ブロック優先";
                RootShadow.getElementById("PerformanceConfig1_Select_Option2").textContent = "バランス";
                RootShadow.getElementById("PerformanceConfig1_Select_Option3").textContent = "パフォーマンス優先（設定1）";
                RootShadow.getElementById("PerformanceConfig1_Select_Option4").textContent = "パフォーマンス優先（設定2）";

                RootShadow.getElementById("PerformanceConfig2_Title").textContent = "動作間隔";
                RootShadow.getElementById("PerformanceConfig2_Description1").textContent = "パフォーマンス優先モードまたはバランスモードを選択時の動作間隔の設定をします。";
                RootShadow.getElementById("PerformanceConfig2_Description2").textContent = "ミリ単位で動作間隔の設定ができます。（1秒=1000ミリ）";
                RootShadow.getElementById("PerformanceConfig2_Description3").textContent = "数値を大きくするほど動作が軽くなりますが、ブロック処理がその分遅れます。";
                RootShadow.getElementById("PerformanceConfig2_input1_SpanText").textContent = "バランス";
                RootShadow.getElementById("PerformanceConfig2_input2_SpanText").textContent = "パフォーマンス優先（設定1）";
                RootShadow.getElementById("PerformanceConfig2_input3_SpanText").textContent = "パフォーマンス優先（設定2）";

                RootShadow.getElementById("PerformanceConfig3_Title").textContent = "サイト別設定";
                RootShadow.getElementById("PerformanceConfig3_Description1").textContent = "ブロックリストテキストのマッチするサイトで動作モードを上書きすることができます。";
                RootShadow.getElementById("PerformanceConfig3_Description2").textContent = "複数の設定でURLがマッチした場合、この設定項目に表示されている項目の一番上が優先されます。";
                RootShadow.getElementById("PerformanceConfig3_Select1_SpanText").textContent = "無効化";
                RootShadow.getElementById("PerformanceConfig3_Select2_SpanText").textContent = "パフォーマンス優先（設定1）";
                RootShadow.getElementById("PerformanceConfig3_Select3_SpanText").textContent = "パフォーマンス優先（設定2）";
                RootShadow.getElementById("PerformanceConfig3_Select4_SpanText").textContent = "ブロック優先";
                RootShadow.getElementById("PerformanceConfig3_Select5_SpanText").textContent = "バランス";

                RootShadow.getElementById("PerformanceConfig_BackButton").textContent = "←戻る";
                RootShadow.getElementById("PerformanceConfig_SaveButton").textContent = "保存";
                RootShadow.getElementById("PerformanceConfig_SaveInfoText").textContent = "保存しました。"


                const mode_ELe = RootShadow.getElementById("PerformanceConfig1_Select");
                const interval_balance_ELe = RootShadow.getElementById("PerformanceConfig2_input1");
                const interval_performancePriority1_ELe = RootShadow.getElementById("PerformanceConfig2_input2");
                const interval_performancePriority2_ELe = RootShadow.getElementById("PerformanceConfig2_input3");
                const overRide_disable_Ele = RootShadow.getElementById("PerformanceConfig3_Select1");
                const overRide_performancePriority1_Ele = RootShadow.getElementById("PerformanceConfig3_Select2");
                const overRide_performancePriority2_Ele = RootShadow.getElementById("PerformanceConfig3_Select3");
                const overRide_blockPriority_Ele = RootShadow.getElementById("PerformanceConfig3_Select4");
                const overRide_balance_Ele = RootShadow.getElementById("PerformanceConfig3_Select5");


                ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach((eventName) => {
                    [RootShadow.getElementById("PerformanceConfig2_input1"), RootShadow.getElementById("PerformanceConfig2_input2")].forEach((elemnetObj) => {
                        elemnetObj.addEventListener(eventName, (evt) => {
                            if (["-", "+", "e", "."].includes(evt.key)) {
                                evt.preventDefault();
                                return;
                            }
                            if (/^(?:\d*\.?\d*|0)$/.test(evt.target.value)) {
                                evt.target.oldValue = evt.target.value;
                            } else if ("oldValue" in evt.target) {
                                evt.target.value = evt.target.oldValue;
                            } else {
                                evt.target.value = "";
                            }
                        });
                    })
                });

                for (let i = 0; i < BlockListTextStorage.length; i++) {
                    const option = document.createElement("option");
                    option.className = "PerformanceConfig_Option";
                    option.setAttribute("value", BlockListTextStorage[i].name);
                    option.textContent = BlockListTextStorage[i].name;
                    overRide_disable_Ele.append(option);
                    overRide_performancePriority1_Ele.append(option.cloneNode(true));
                    overRide_performancePriority2_Ele.append(option.cloneNode(true));
                    overRide_blockPriority_Ele.append(option.cloneNode(true));
                    overRide_balance_Ele.append(option.cloneNode(true));
                }

                const Config_Obj = PreferenceSettingStorage.performanceConfig
                if (Config_Obj) {
                    mode_ELe.value = Config_Obj.mode;
                    interval_balance_ELe.value = Config_Obj.interval_balance;
                    interval_performancePriority1_ELe.value = Config_Obj.interval_performancePriority1;
                    interval_performancePriority2_ELe.value = Config_Obj.interval_performancePriority2;
                    overRide_disable_Ele.value = Config_Obj.overRide_disable;
                    overRide_performancePriority1_Ele.value = Config_Obj.overRide_performancePriority1;
                    overRide_performancePriority2_Ele.value = Config_Obj.overRide_performancePriority2;
                    overRide_blockPriority_Ele.value = Config_Obj.overRide_blockPriority;
                    overRide_balance_Ele.value = Config_Obj.overRide_balance;
                } else {
                    mode_ELe.value = "balance";
                    interval_balance_ELe.value = 10;
                    interval_performancePriority1_ELe.value = 100;
                    interval_performancePriority2_ELe.value = 100;
                    overRide_disable_Ele.value = "";
                    overRide_performancePriority1_Ele.value = "";
                    overRide_performancePriority2_Ele.value = "";
                    overRide_blockPriority_Ele.value = "";
                    overRide_balance_Ele.value = "";
                }

                RootShadow.getElementById("PerformanceConfig_SaveButton").addEventListener("click", async () => {
                    const performanceConfig_setObj = {
                        mode: mode_ELe.value,
                        interval_balance: parseInt(interval_balance_ELe.value),
                        interval_performancePriority1: parseInt(interval_performancePriority1_ELe.value),
                        interval_performancePriority2: parseInt(interval_performancePriority2_ELe.value),
                        overRide_disable: overRide_disable_Ele.value,
                        overRide_performancePriority1: overRide_performancePriority1_Ele.value,
                        overRide_performancePriority2: overRide_performancePriority2_Ele.value,
                        overRide_blockPriority: overRide_blockPriority_Ele.value,
                        overRide_balance: overRide_balance_Ele.value
                    }
                    PreferenceSettingStorage.performanceConfig = performanceConfig_setObj;
                    await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorage));
                    const saveInfo_Ele = RootShadow.getElementById("PerformanceConfig_SaveInfoText");
                    saveInfo_Ele.style.display = "";
                    await pauseSleep(3000);
                    saveInfo_Ele.style.display = "none";
                }, false);

                RootShadow.getElementById("PerformanceConfig_BackButton").addEventListener("click", () => {
                    Dashboard_Window_Ele_stack.pop().remove();
                    ArrayLast(Dashboard_Window_Ele_stack).style.display = "block";
                    DashboardMain_div.scroll({ top: 0 });
                }, false);
            }


        }
    }

})();

