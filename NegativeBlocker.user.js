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

    const safeModeURL = "https://www.example.com/"

    const SentenceBlock_ExecuteResultList = new Array();
    const ElementBlock_executeResultList = new Object();

    const SentenceBlock_TempDisableElementArray = new Array();
    const SentenceBlock_DuplicateList = new Array();

    let BlockListTextStorage;
    let SentenceBlockStorage;
    let ElementBlockStorage;
    let PreferenceSettingStorage;
    let SentenceBlockTempDisableArray;
    let fetchGlobalFlagStorage;

    let localeText;


    const localeText_en = {
        OKButton: "OK",
        cancelButton: "Cancel",
        backButton: "←Back",
        DB_blockResult: {
            sentenceBlock: "SentenceBlock Apply list",
            sentenceBlock_tempDisableButton: "Apply temporary disable and then reload.",
            elementBlock: "ElementBlock Apply list",
            elementBlock_Countcase: "Case",
            settingPageButton: "Settings page",
            reDisplay: "Redisplay",
            copy: "Copy properties"
        },
        DB_settingsTop: {
            blockListText_title: "BlockListText",
            blockListText_description: "You can set the text, URL, etc. to be blocked for each group.",
            blockListText_button: "BlockListText Config",
            sentenceBlock_title: "SentenceBlock",
            sentenceBlock_description: "If a BlockListText is included in a Web sentence, it will replace that one sentence or word with another character.",
            sentenceBlock_button: "SentenceBlock Config",
            elementBlock_title: "ElementBlock",
            elementBlock_description: "If an element's characters or properties contain BlockListText, the entire element will be blocked.",
            elementBlock_button: "ElementBlock Config",
            preferences_title: "Preferences",
            preferences_description: "Configure the entire Extensions settings.",
            preferences_button: "Preferences Config"
        },
        listEdit_Func: {
            name: "Name:",
            sort: "SortIndex:",
            enable: "Enable:",
            config: "Settings editing:",
            config_button: "Settings editing",
            new: "New",
            delete: "Delete",
            save: "Save",
            editFlag_back: "You will be returned to the Top Settings page. The information currently entered will be lost, are you sure?",
            editFlag_new: "Do you want to create a new one? The currently entered information will be lost.",
            editFlag_change: "Do you want to change the configuration field? The currently entered information will be lost.",
            deleteConfirm: "Are you sure you want to delete the settings?",
            error_nameEmpty: "error: Please enter your name.",
            error_nameDuplication: "error: The same name already exists."
        },
        DB_blockListText: {
            blockListText_title: "BlockListText",
            blockListText_URLoverWrite: "The BlockListText will be automatically overwritten because it is set to be retrieved from the URL.",
            blockListText_show: "Show Text",
            textFile_title: "Load a text file",
            textFile_overWrite: "The currently entered BlockListText will be overwritten by the text in the file. Are you sure?",
            URLget_title: "Get from URL",
            URLget_enable: "Enable",
            option_title: "Option",
            option_regexp: "RegExp",
            option_caseSensitive: "Case Sensitive",
            option_exact: "Exact",
            option_spaceIgnore: "Ignore white space",
            option_notSearch: "Do a NOT search",
            option_uBlacklist: "Use uBlacklist Format (Beta)"
        },
        DB_sentenceBlock: {
            URL_title: "URL",
            URL_description: "Specify the sites for which you want to enable this rule. If you leave this field blank, all sites will be included.",
            URL_wildcard: "Wildcard(*)",
            URL_regexp: "RegExp",
            URL_BLT: "BlockListText",
            BLT_title: "BlockListText",
            BLT_description: "Specify the BlockListText to be used. holding down the Ctrl key (Command key on Mac) while clicking to specify multiple text.",
            BLT_exclude: "Please select from the list below if you want to use the exclusion settings. (Can be more than one)",
            replace_title: "Replace string",
            replace_description: "Enter the string to be replaced.",
            replace_sentence: "Replace with a single sentence",
            replace_word: "Replace with a word",
            aTag_title: "Link replacement for \"a\" tag",
            aTag_description: "Set whether to replace the \"a\" tag link.(If you replace links in \"a\" tags, the links will not work properly.)",
            aTag_hrefExclude: "Do not replace \"a\" tag links.",
            aTag_hrefOnly: "Only replace links in \"a\" tags.",
            aTag_all: "Replace all"
        },
        DB_elementBlock: {
            URL_title: "URL",
            URL_description: "Specify the sites for which you want to enable this rule.",
            URL_wildcard: "Wildcard(*)",
            URL_regexp: "RegExp",
            URL_BLT: "BlockListText",
            css: "CSS",
            XPath: "XPath",
            elementPicker: "Element Picker(Beta)",
            elementPicker_message: "After pressing the OK button, click on the element.",
            eleHide_title: "Hidden elements",
            eleHide_description: "Specify the elements to be hidden using the CSS method [querySelectorAll] or XPath method [document.evaluate].",
            eleHide_displayNone: "Hiding Hidden elements with CSS",
            eleHide_remove: "Remove an Hidden elements",
            eleSearch_title: "Search elements",
            eleSearch_description: "Specify the elements to be searched for in order to hide them using the CSS method [querySelectorAll] or XPath method [document.evaluate]. If you leave the field blank, the hidden element will be unconditionally hidden.",
            eleSearch_firstOnly: "If more than one element is found, search only the first element found.",
            eleSearch_methodText: "Search the text of an element",
            eleSearch_methodHref: "Search for links in elements (only if the search element is an [a] tag element).",
            eleSearch_methodStyle: "Search the CSS of an element (Advanced)",
            eleSearch_methodAdvanced: "Specifying element properties directly (Advanced)",
            BLT_title: "BlockListText",
            BLT_description: "Specify the BlockListText to be used. holding down the Ctrl key (Command key on Mac) while clicking to specify multiple text.",
            BLT_exclude: "Please select from the list below if you want to use the exclusion settings. (Can be more than one)",
            uBlacklist_title: "Types to enable when using uBlacklist",
            uBlacklist_description: "Specifies the type to be enabled when using uBlacklist.",
            uBlacklist_urlOnly: "URL match patterns and URL RegExp (Only valid if the value to be searched is a URL.)",
            uBlacklist_titleOnly: "Only text in \"title/\"",
            uBlacklist_all: "Use all types",
            resultShow_title: "Display the Block Apply list",
            resultShow_description: "Select how you want to view the block results on the top page of the dashboard.",
            resultShow_none: "Hide",
            resultShow_number: "Display by number",
            resultShow_property: "Display the value of a property of a search element."
        },
        elementPicker: {
            thisElement: "This Element"
        },
        DB_preference: {
            importAndExport_title: "Export & Import",
            importAndExport_description: "Exports or imports the settings.",
            importAndExport_button: "Export & Import",
            performanceConfig_title: "Performance settings",
            performanceConfig_description: "Configure performance-related settings such as the operation interval of the Extensions.",
            performanceConfig_button: "Performance settings",
            buttonHide_title: "Always hide the top right button.",
            buttonHide_description: "Always hide the button in the upper right corner. You can access the dashboard from the UserScript Manager menu screen even after hiding it.",
            buttonHide_boxText: "Hide the button",
            buttonHide_warning: "The menu API was not detected. If you hide it, you can access the dashboard only from \"" + safeModeURL + "\" . Are you sure you want to hide it?",
            nowLoadSet_title: "Apply settings immediately(Beta)",
            nowLoadSet_description: "Normally, the settings will be applied after reloading, but if you check this checkbox, the settings will be applied immediately.",
            nowLoadSet_boxText: "Apply settings immediately",
            fetchInterval_title: "Interval to get from URL",
            fetchInterval_Description: "Sets the update interval when retrieving text from URL in BlockListText.",
            fetchInterval_300000: "5 min",
            fetchInterval_900000: "15 min",
            fetchInterval_1800000: "30 min",
            fetchInterval_3600000: "1 hour",
            fetchInterval_7200000: "2 hour",
            fetchInterval_18000000: "5 hour",
            dashboardColor_title: "Dashboard background color",
            dashboardColor_Description: "Specifies the color of the background color for the entire dashboard screen.",
            dashboardColor_red: "Red",
            dashboardColor_yellow: "Yellow",
            dashboardColor_green: "Green",
            dashboardColor_blue: "Blue",
            language_title: "Dashboard language",
            language_Description: "Specifies the display language of the dashboard screen. This will take effect after the page reload.",
            language_en: "English",
            language_ja_jp: "日本語"
        },
        DB_exportImport: {
            export_title: "Export",
            export_file: "Export as JSON file",
            export_copy: "Copy to clipboard in JSON format",
            export_textArea: "Export to textarea (JSON format)",
            export_success: "Exported.",
            import_title: "Import",
            import_file: "Importing from JSON files",
            import_textArea: "Import from textarea (JSON format)",
            import_addImport: "Add and import the settings without overwriting them. (Preferences will not be changed.)",
            import_success: "Imported.",
            import_overWrite: "All current settings will be overwritten with the imported data. Are you sure?",
            import_addImportConfirm: "Add import settings to the current settings. Are you sure?",
            textArea_title: "text area",
            error_export: "error: Export failed. Please refer to the console log for details.",
            error_import: "error: Import failed, the JSON file (text) may be corrupted. Please refer to the console log for error details."
        },
        DB_performanceConfig: {
            disable: "Disable",
            blockPriority: "Block priority",
            balance: "Balance",
            performancePriority1: "Performance priority (Config1)",
            performancePriority2: "Performance priority (Config2)",
            mode_title: "Mode setting",
            mode_description1: "Sets the mode setting for the operation interval.",
            mode_description2: "If you set block priority, the blocking action will be taken as soon as there is a change in the page, but it may slow down the browser.",
            mode_description3: "When you select the performance priority mode, the system will block at regular intervals to lighten the load, but there is a possibility that the blocking elements will appear momentarily.",
            mode_description4: "If you select balanced, the page will be displayed and run with performance priority until it finishes loading, and then run with block priority after it finishes loading.",
            interval_title: "operating interval",
            interval_description1: "Sets the operation interval when performance priority mode or balanced mode is selected.",
            interval_description2: "The operation interval can be set in millimeter increments. (1sec = 1000millisec)",
            interval_description3: "The larger the value, the lighter the operation becomes, but the block processing will be delayed.",
            overRide_title: "Site Specific Settings",
            overRide_description1: "You can override the mode of operation with a matching site in the BlockListText.",
            overRide_description2: "If URLs are matched in multiple settings, the top item displayed in this settings section will take precedence.",
            save: "Save",
            saveInfo: "Saveed."
        }
    }

    const localeText_ja_jp = {
        OKButton: "OK",
        cancelButton: "キャンセル",
        backButton: "←戻る",
        DB_blockResult: {
            sentenceBlock: "文章ブロック 適用リスト",
            sentenceBlock_tempDisableButton: "一時無効を適用してリロード",
            elementBlock: "要素ブロック 適用リスト",
            elementBlock_Countcase: "件目",
            settingPageButton: "設定画面",
            reDisplay: "再表示する",
            copy: "プロパティをコピー"
        },
        DB_settingsTop: {
            blockListText_title: "ブロックリストテキスト設定",
            blockListText_description: "グループ単位でブロックするテキストやURLなどを設定できます。",
            blockListText_button: "ブロックリストテキストを設定する",
            sentenceBlock_title: "文章ブロック機能",
            sentenceBlock_description: "Webの文章内にブロックリストテキストが含まれる場合、その一文章または単語を別の文字に置換します。",
            sentenceBlock_button: "文章ブロック機能を設定する",
            elementBlock_title: "要素ブロック機能",
            elementBlock_description: "要素の文字またはプロパティにブロックリストテキストが含まれる場合、要素ごとブロックします。",
            elementBlock_button: "要素ブロック機能を設定する",
            preferences_title: "環境設定",
            preferences_description: "拡張機能全体の設定をします。",
            preferences_button: "環境設定"
        },
        listEdit_Func: {
            name: "名前：",
            sort: "並び替え：",
            enable: "有効：",
            config: "設定編集：",
            config_button: "設定編集",
            new: "新規追加",
            delete: "削除",
            save: "保存",
            editFlag_back: "トップ設定ページに戻ります。現在入力されている内容は失われますがよろしいですか？",
            editFlag_new: "新規作成しますか？現在入力されている内容は失われます。",
            editFlag_change: "設定フィールドを変更しますか？現在入力されている内容は失われます。",
            deleteConfirm: "設定を削除してよろしいですか？",
            error_nameEmpty: "エラー：名前を入力してください。",
            error_nameDuplication: "エラー：すでに同じ名前が存在します。"
        },
        DB_blockListText: {
            blockListText_title: "ブロックリストテキスト",
            blockListText_URLoverWrite: "URLから取得する設定になっているため自動的にブロックリストテキストは上書きされます。",
            blockListText_show: "テキストを表示",
            textFile_title: "テキストファイルを読み込む",
            textFile_overWrite: "現在入力されているブロックリストテキストはファイルのテキストで上書きされます。よろしいですか？",
            URLget_title: "URLから取得する",
            URLget_enable: "有効",
            option_title: "オプション",
            option_regexp: "正規表現",
            option_caseSensitive: "大文字と小文字を区別する",
            option_exact: "完全一致",
            option_spaceIgnore: "空白スペースを無視する",
            option_notSearch: "NOT検索をする",
            option_uBlacklist: "uBlacklist形式を使用する(Beta)"
        },
        DB_sentenceBlock: {
            URL_title: "URL",
            URL_description: "このルールを有効にするサイトを指定します。何も入力せず空欄にするとすべてのサイトが対象になります。",
            URL_wildcard: "ワイルドカード(*)",
            URL_regexp: "正規表現",
            URL_BLT: "ブロックリストテキスト",
            BLT_title: "ブロックリストテキスト",
            BLT_description: "使用するブロックリストテキストを指定します。Ctrlキー(MacはCommandキー）を押しながらクリックすると複数指定ができます。",
            BLT_exclude: "除外設定を使用する場合は下のリストから選択してください。(複数可)",
            replace_title: "置換文字",
            replace_description: "置換する文字列を入力します。",
            replace_sentence: "一文章で置換える",
            replace_word: "単語で置換える",
            aTag_title: "aタグのリンク置換",
            aTag_description: "aタグのリンクを置換をするかどうか設定します。(aタグのリンクを置換するとリンクが正常に機能しなくなります。)",
            aTag_hrefExclude: "aタグのリンクは置換えない",
            aTag_hrefOnly: "aタグのリンクのみ置換える",
            aTag_all: "すべて置換する"
        },
        DB_elementBlock: {
            URL_title: "URL",
            URL_description: "このルールを有効にするサイトを指定します。",
            URL_wildcard: "ワイルドカード(*)",
            URL_regexp: "正規表現",
            URL_BLT: "ブロックリストテキスト",
            css: "CSS",
            XPath: "XPath",
            elementPicker: "要素を選択する(Beta)",
            elementPicker_message: "OKボタンを押した後、要素をクリックしてください。",
            eleHide_title: "非表示要素",
            eleHide_description: "非表示する要素をCSS方式[querySelectorAll]かXPath方式[document.evaluate]で指定します。",
            eleHide_displayNone: "非表示要素をCSSで非表示にする",
            eleHide_remove: "非表示要素を削除する",
            eleSearch_title: "検索要素",
            eleSearch_description: "非表示するために検索する要素をCSS方式[querySelectorAll]かXPath方式[document.evaluate]で指定します。何も入力せず空欄にすると無条件で非表示要素を隠します。",
            eleSearch_firstOnly: "複数の要素が見つかった場合、最初に見つかった要素のみ検索する",
            eleSearch_methodText: "要素のテキストを検索する",
            eleSearch_methodHref: "要素のリンクを検索する(検索要素が[a]要素の場合のみ)",
            eleSearch_methodStyle: "要素のスタイルシートを検索する(上級者向け)",
            eleSearch_methodAdvanced: "要素のプロパティを直接指定する(上級者向け)",
            BLT_title: "ブロックリストテキスト",
            BLT_description: "使用するブロックリストテキストを指定します。Ctrlキー(MacはCommandキー）を押しながらクリックすると複数指定ができます。",
            BLT_exclude: "除外設定を使用する場合は下のリストから選択してください。(複数可)",
            uBlacklist_title: "uBlacklist使用時の有効にする種類",
            uBlacklist_description: "uBlacklist使用時に有効にする種類を指定します。",
            uBlacklist_urlOnly: "URLマッチパターンとURL正規表現(検索対象の値がURLだけのみ有効)",
            uBlacklist_titleOnly: "\"title/\" のテキストのみ",
            uBlacklist_all: "すべての種類を使用する",
            resultShow_title: "ブロック適用リストの表示",
            resultShow_description: "ダッシュボードのトップページにあるブロック結果の表示方法を選択します。",
            resultShow_none: "非表示",
            resultShow_number: "番号で表示",
            resultShow_property: "検索要素のプロパティの値を表示"
        },
        elementPicker: {
            thisElement: "選択した要素"
        },
        DB_preference: {
            importAndExport_title: "エクスポート&インポート",
            importAndExport_description: "設定内容をエクスポートまたはインポートします。",
            importAndExport_button: "エクスポート&インポート",
            performanceConfig_title: "パフォーマンス設定",
            performanceConfig_description: "拡張機能の動作間隔などのパフォーマンス関係の設定をします。",
            performanceConfig_button: "パフォーマンス設定",
            buttonHide_title: "右上のボタンを常時非表示にする",
            buttonHide_description: "右上のボタンを常時非表示にします。非表示後もUserScriptマネージャーのメニュー画面からダッシュボードにアクセスできます。",
            buttonHide_boxText: "ボタンを非表示にする",
            buttonHide_warning: "メニューAPIが検出されませんでした。非表示にすると、 \"" + safeModeURL + "\" からのみダッシュボードにアクセスできます。非表示にしてよろしいですか？",
            nowLoadSet_title: "設定の即時適用(Beta)",
            nowLoadSet_description: "通常は設定した内容は、リロード後に適用されますが、このチェックボックスを入れるとすぐに設定内容が適用されます。",
            nowLoadSet_boxText: "設定を即時適用する",
            fetchInterval_title: "URLから取得する間隔",
            fetchInterval_Description: "ブロックリストテキストでURLからテキストを取得する際の更新間隔を設定します。",
            fetchInterval_300000: "5分",
            fetchInterval_900000: "15分",
            fetchInterval_1800000: "30分",
            fetchInterval_3600000: "1時間",
            fetchInterval_7200000: "2時間",
            fetchInterval_18000000: "5時間",
            dashboardColor_title: "ダッシュボード背景色",
            dashboardColor_Description: "ダッシュボード画面全体の背景色の色を指定します。",
            dashboardColor_red: "赤色",
            dashboardColor_yellow: "黄色",
            dashboardColor_green: "緑色",
            dashboardColor_blue: "青色",
            language_title: "ダッシュボードの言語",
            language_Description: "ダッシュボード画面の表示言語を指定します。ページのリロード後に有効になります。",
            language_en: "English",
            language_ja_jp: "日本語"
        },
        DB_exportImport: {
            export_title: "エクスポート",
            export_file: "JSONファイルでエクスポート",
            export_copy: "JSON形式でクリップボードにコピー",
            export_textArea: "テキストエリアにエクスポート(JSON形式)",
            export_success: "エクスポートしました。",
            import_title: "インポート",
            import_file: "JSONファイルからインポート",
            import_textArea: "テキストエリアからインポート(JSON形式)",
            import_addImport: "インポートする際、上書きせず設定を追加してインポートする(環境設定は変更されません)",
            import_success: "インポートしました。",
            import_overWrite: "現在の設定内容をインポートしたデータですべて上書きします。よろしいですか？",
            import_addImportConfirm: "現在の設定内容にインポートする設定を追加します。よろしいですか？",
            textArea_title: "テキストエリア",
            error_export: "エラー：エクスポートに失敗しました。詳細はコンソールログを参照してください。",
            error_import: "エラー：インポートに失敗しました。JSONファイル(テキスト)が壊れている可能性があります。エラーの詳細はコンソールログを参照してください。"
        },
        DB_performanceConfig: {
            disable: "無効化",
            blockPriority: "ブロック優先",
            balance: "バランス",
            performancePriority1: "パフォーマンス優先(設定1)",
            performancePriority2: "パフォーマンス優先(設定2)",
            mode_title: "モード設定",
            mode_description1: "動作間隔のモード設定をします。",
            mode_description2: "ブロック優先にするとページに変更があった場合、すぐにブロック動作をしますが、ブラウザの動作が遅くなる可能性があります。",
            mode_description3: "パフォーマンス優先にすると一定間隔でブロック動作をすることで処理を軽くしますが、一瞬ブロックする要素が表示される可能性があります。",
            mode_description4: "バランスにするとページを表示して読み込みが終わるまで、パフォーマンス優先で動作をし、読み込み完了後はブロック優先で動作します。",
            interval_title: "動作間隔",
            interval_description1: "パフォーマンス優先モードまたはバランスモードを選択時の動作間隔の設定をします。",
            interval_description2: "ミリ単位で動作間隔の設定ができます。(1秒=1000ミリ秒)",
            interval_description3: "数値を大きくするほど動作が軽くなりますが、ブロック処理がその分遅れます。",
            overRide_title: "サイト別設定",
            overRide_description1: "ブロックリストテキストのマッチするサイトで動作モードを上書きすることができます。",
            overRide_description2: "複数の設定でURLがマッチした場合、この設定項目に表示されている項目の一番上が優先されます。",
            save: "保存",
            saveInfo: "保存しました。"
        }
    }


    class storageAPI {
        constructor() { }
        static async read(keyName) {
            let StorageValue = undefined;
            try {
                // eslint-disable-next-line no-undef
                StorageValue = await GM.getValue(keyName);
            } catch (e) {
                console.error(e);
                console.log("NegativeBlocker: GM Function Not Detected");
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
                console.log("NegativeBlocker: GM Function Not Detected");
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
                console.log("NegativeBlocker: GM Function Not Detected");
                return false;
            }
        }
        static async keynameList() {
            try {
                // eslint-disable-next-line no-undef
                return await GM.listValues();
            } catch (e) {
                console.error(e);
                console.log("NegativeBlocker: GM Function Not Detected");
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
            console.log('NegativeBlocker: Clipboard Copy' + msg);
        } catch (e) {
            console.error(e);
            console.log('NegativeBlocker: Copy Command ERROR');
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
            let languageCode = "en";
            const langCodeTemp = navigator.languages[0];
            if (langCodeTemp == "ja" | "ja-jp") {
                languageCode = "ja-jp";
            }
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
                nowLoadSet: false,
                fetchInterval: 3600000,
                dashboardColor: "#FFFFB2",
                language: languageCode
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

        fetchGlobalFlagStorage = await storageAPI.read("FetchGlobalFlag");
        if (fetchGlobalFlagStorage) {
            fetchGlobalFlagStorage = JSON.parse(fetchGlobalFlagStorage);
        } else {
            fetchGlobalFlagStorage = {
                globalFetchTime: Date.now(),
                fetchRetryIntervalTime: Date.now(),
                retryFlag: false
            };
            await storageAPI.write("FetchGlobalFlag", JSON.stringify(fetchGlobalFlagStorage));
        }
    }

    async function BlockListText_feathLoad() {
        const fetchResultArray = await Promise.all(BlockListTextStorage.map(async (BlockListText_Obj) => {
            if (BlockListText_Obj.fetch_enable) {
                let errorFlag = false;
                let BlockListText_textObj = await storageAPI.read("BLT_" + BlockListText_Obj.name);
                try {
                    BlockListText_textObj = JSON.parse(BlockListText_textObj);
                    if (Date.now() - BlockListText_textObj.fetch_timeStamp >= PreferenceSettingStorage.fetchInterval) {
                        await fetch(BlockListText_Obj.fetch_url).then(async (response) => {
                            if (response.ok) {
                                BlockListText_textObj.text = await response.text();
                            } else {
                                throw new Error("NegativeBlocker: FetchAPI Failure: [ " + BlockListText_Obj.name + " ] status: " + response.status);
                            }
                        }).catch((e) => {
                            console.error(e);
                            errorFlag = true;
                        });
                        if (errorFlag) return false;
                        BlockListText_textObj.fetch_timeStamp = Date.now();
                        await storageAPI.write("BLT_" + BlockListText_Obj.name, JSON.stringify(BlockListText_textObj));
                        return true;
                    } else {
                        return undefined;
                    }
                } catch (e) {
                    console.error(e);
                    return undefined;
                }
            }
            return undefined;
        }));
        if (fetchResultArray.every(arr => arr !== false)) {
            console.log("NegativeBlocker: Fetch All Update");
            fetchGlobalFlagStorage.retryFlag = false;
        } else {
            fetchGlobalFlagStorage.retryFlag = true;
        }
        await storageAPI.write("FetchGlobalFlag", JSON.stringify(fetchGlobalFlagStorage));
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
            if (sourceText == null | undefined) return new Array();
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
            this.textNodeArray = new Array();
            this.optionNodeArray = new Array();
            this.SentenceBlock_filter1;
            this.SentenceBlock_filter2;
            this.SentenceBlock_filter3;
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
            let textNode;
            let optionNode;
            if (node) {
                await Promise.all([(async () => {
                    const candidates1 = document.evaluate('.//text()[not(parent::style) and not(parent::textarea) and not(parent::script)]', node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                    textNode = new Array();
                    for (let i = 0; i < candidates1.snapshotLength; i++) {
                        textNode.push(candidates1.snapshotItem(i));
                    }
                    return true;
                })(), (async () => {
                    const candidates2 = document.evaluate('.//input[not(@type="text")]/@value | .//img/@alt | .//*/@title | .//a/@href', node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                    optionNode = new Array();
                    for (let i = 0; i < candidates2.snapshotLength; i++) {
                        optionNode.push(candidates2.snapshotItem(i));
                    }
                    return true;
                })()]);
            } else {
                const textNodeTemp = this.textNodeArray.slice();
                this.textNodeArray.splice(0);
                const optionNodeTemp = this.optionNodeArray.slice();
                this.optionNodeArray.splice(0);
                textNode = [...new Set(textNodeTemp)];
                optionNode = [...new Set(optionNodeTemp)];
            }

            await Promise.all([this.SentenceBlock_BackgroundExecute(this.SentenceBlock_filter1, textNode, optionNode),
            this.SentenceBlock_BackgroundExecute(this.SentenceBlock_filter2, textNode, optionNode),
            this.SentenceBlock_BackgroundExecute(this.SentenceBlock_filter3, textNode, optionNode)]);
        }
        async SentenceBlock_BackgroundExecute(SentenceBlock_settingArray, textNode, optionNode) {
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
            await Promise.all(textNode.map(async (arrNode) => { textReplaceExecute(arrNode, "nodeValue") }), optionNode.map(async (arrNode) => { textReplaceExecute(arrNode, "value") }));
            return true;
        }
    }

    const BG_elementBlock_Obj = new class extends BackGround_Func {
        constructor() {
            super();
            this.ElementBlock_filter1;
            this.ElementBlock_filter2;
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
                if (!eleBlockSet.elementHide) return;
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

                    if (eleBlockSet.elementSearch === "") {
                        if (eleBlockSet.elementHide_hideMethod === "displayNone") {
                            if (elementObj.style.display !== "none") {
                                elementObj.style.display = "none";
                                ElementBlock_executeResultList_func(eleBlockSet, elementObj, "");
                            }
                        } else if (eleBlockSet.elementHide_hideMethod === "remove") {
                            elementObj.remove();
                            ElementBlock_executeResultList_func(eleBlockSet, undefined, "");
                        }
                        return;
                    }

                    let SearchEleNode;
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

    class BG_performanceMode extends BackGround_Func {
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

    async function localeTextSetFunction() {
        const langCode = PreferenceSettingStorage.language;
        if (langCode == "ja-jp") {
            localeText = localeText_ja_jp;
        } else {
            localeText = localeText_en;
        }
    }

    async function DashboardButton_InsertElement() {
        if (!divElement_RootShadow) {
            divElement_RootShadow = document.createElement("div");
            divElement_RootShadow.style.all = "initial";
            divElement_RootShadow.attachShadow({ mode: "open" });
            document.body.append(divElement_RootShadow);

            await localeTextSetFunction();

            if (!PreferenceSettingStorage.hideButton || location.href == safeModeURL) {
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

    async function DashboardButtonInsertOnly() {
        if (document.body != null) {
            DashboardButton_InsertElement();
        } else {
            const observer = new MutationObserver(async () => {
                if (document.body != null) {
                    observer.disconnect();
                    DashboardButton_InsertElement();
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

    async function BlockCounterUpdate() {
        if (DashboardButtonEle) {
            if (BlockCounter > 0) {
                DashboardButtonEle.style.backgroundColor = "#FFAFAF"
            }
            DashboardButtonEle.textContent = "NB:" + BlockCounter;
        }
    }

    async function firstStartExecute() {
        await BG_elementBlock_Obj.Start(document);
        await BG_sentenceBlock_obj.Start(document);
    }

    async function SentenceBlock_textNodeArrayPush(mutationList) {
        if (mutationList[0].type == "characterData") {
            Promise.all(mutationList.map(async (mutation) => {
                const textNode = mutation.target;
                if (textNode.parentElement) {
                    if (textNode.parentElement.tagName !== "STYLE" && textNode.parentElement.tagName !== "TEXTAREA" && textNode.parentElement.tagName !== "SCRIPT") {
                        BG_sentenceBlock_obj.textNodeArray.push(textNode);
                    }
                }
            }));
        }
        if (mutationList[0].type == "childList") {
            Promise.all(mutationList.map(async (mutation) => {
                const candidates1 = document.evaluate('.//text()[not(parent::style) and not(parent::textarea) and not(parent::script)]',
                    mutation.target, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                for (let i = 0; i < candidates1.snapshotLength; i++) {
                    BG_sentenceBlock_obj.textNodeArray.push(candidates1.snapshotItem(i));
                }
                const candidates2 = document.evaluate('.//input[not(@type="text")]/@value | .//img/@alt | .//*/@title | .//a/@href',
                    mutation.target, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                for (let i = 0; i < candidates2.snapshotLength; i++) {
                    BG_sentenceBlock_obj.optionNodeArray.push(candidates2.snapshotItem(i));
                }
            }));
        }
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

        const observerTextNode = new MutationObserver(async (mutationList) => {
            SentenceBlock_textNodeArrayPush(mutationList);
        });

        const observer = new MutationObserver(async (mutationList) => {
            const interval = Date.now() - dateInterval;
            if (interval > observerInterval) {
                await SentenceBlock_textNodeArrayPush(mutationList);
                BG_elementBlock_Obj.Start(document);
                BG_sentenceBlock_obj.Start();
                dateInterval = Date.now();
            } else {
                observer.disconnect();
                observerTextNode.observe(document, observerConfig);
                await SentenceBlock_textNodeArrayPush(mutationList);
                await pauseSleep(observerInterval - interval);
                BG_elementBlock_Obj.Start(document);
                observerTextNode.disconnect();
                BG_sentenceBlock_obj.Start();
                observer.observe(document, observerConfig);
                dateInterval = Date.now();
            }
        });
        observer.observe(document, observerConfig);
    }

    // Background Processing Start
    await StorageLoad();
    if (location.href != safeModeURL) {
        const BG_perModeObj = new BG_performanceMode;
        await BG_perModeObj.init();
        const globalFetchTimeDiff = Date.now() - fetchGlobalFlagStorage.globalFetchTime
        const fetchRetryIntervalTimeDiff = Date.now() - fetchGlobalFlagStorage.fetchRetryIntervalTime;
        if (globalFetchTimeDiff >= PreferenceSettingStorage.fetchInterval) {
            fetchGlobalFlagStorage.globalFetchTime = Date.now();
            fetchGlobalFlagStorage.fetchRetryIntervalTime = Date.now();
            await storageAPI.write("FetchGlobalFlag", JSON.stringify(fetchGlobalFlagStorage));
            BlockListText_feathLoad();
        } else if (fetchGlobalFlagStorage.retryFlag == true && fetchRetryIntervalTimeDiff >= 300000) {
            fetchGlobalFlagStorage.fetchRetryIntervalTime = Date.now();
            await storageAPI.write("FetchGlobalFlag", JSON.stringify(fetchGlobalFlagStorage));
            BlockListText_feathLoad();
        }

        if (BG_perModeObj.performanceMode !== "disable") {
            await BG_sentenceBlock_obj.init();
            await BG_elementBlock_Obj.init();

            if (document.readyState == "complete") {
                if (document.body != null) {
                    firstStartExecute();
                }
                switch (BG_perModeObj.performanceMode) {
                    case "balance":
                    case "block":
                        observerInterval = 0;
                        break;
                    case "performance1":
                        observerInterval = BG_perModeObj.interval_performancePriority1;
                        break;
                    case "performance2":
                        observerInterval = BG_perModeObj.interval_performancePriority2;
                        break;
                    default:
                        observerInterval = 0;
                        break;
                }
            } else {
                switch (BG_perModeObj.performanceMode) {
                    case "block":
                        observerInterval = 0;
                        break;
                    case "balance":
                        observerInterval = BG_perModeObj.interval_balance;
                        break;
                    case "performance1":
                        observerInterval = BG_perModeObj.interval_performancePriority1;
                        break;
                    case "performance2":
                        observerInterval = BG_perModeObj.interval_performancePriority2;
                        break;
                    default:
                        observerInterval = 0;
                        break;
                }
                document.addEventListener("readystatechange", async (evt) => {
                    switch (evt.target.readyState) {
                        case "interactive":
                            if (document.body != null) {
                                firstStartExecute();
                            }
                            break;
                        case "complete":
                            switch (BG_perModeObj.performanceMode) {
                                case "balance":
                                case "block":
                                    observerInterval = 0;
                                    break;
                                case "performance1":
                                    observerInterval = BG_perModeObj.interval_performancePriority1;
                                    break;
                                case "performance2":
                                    observerInterval = BG_perModeObj.interval_performancePriority2;
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
                DashboardButton_InsertElement();
            } else {
                const observer = new MutationObserver(async (mutationList) => {
                    if (document.body != null) {
                        observer.disconnect();
                        await SentenceBlock_textNodeArrayPush(mutationList);
                        await observerregister();
                        DashboardButton_InsertElement();
                    }
                });
                observer.observe(document, {
                    attributes: false,
                    attributeOldValue: false,
                    characterData: true,
                    characterDataOldValue: false,
                    childList: true,
                    subtree: true
                })
            }

        } else {
            DashboardButtonInsertOnly();
        }
    } else {
        DashboardButtonInsertOnly();
    }
    // Background Processing End


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
        `;
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
            if (DashboardButtonEle) DashboardButtonEle.style.display = "";
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
        height: calc(100% - 62px);
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

    div#PopupMessageBox p {
        margin-left: 5px;
        margin-right: 5px;
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

                this.buttonOK_Ele.textContent = localeText.OKButton;
                this.buttonCancel_Ele.textContent = localeText.cancelButton;
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


        class ElementPicker {
            constructor() {
                this.li_cfunchandlers = new Array();
                this.li_cfuncArgTemp = new Array();
                this.li_elementArray = new Array();
                this.overlayHighlight_EleArray = new Array();
                this.overlayHighlight_counter = 0;
                this.rootElementArray = new Array();
                this.documentOnClickFunc = new Function();
                this.currentElement;
                this.li_EleSelect_BGColorTemp;
                this.mode;

                this.flameElement_Ele = null;
                this.overlay_PositionFixed_Ele = null;
                this.picker_text_Ele = null;
                this.picker_button_ELe = null;
                this.OK_Ele = null;
                this.cancel_Ele = null;
                this.ul_ELe = null;
                this.li_EleSelect_Ele = null;
            }

            async init() {
                this.flameElement_Ele = document.createElement("div");
                this.flameElement_Ele.innerHTML = `
<style type="text/css">
    div#ElementPicker_PositionFixed {
        position: fixed;
        top: 0;
        width: calc(100vw - (100vw - 100%));
        height: calc(100vh - (100vh - 100%));
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
        z-index: 2147483647;
        pointer-events: none;
    }

    div#ElementPicker_FrameBack {
        all: initial;
        right: 1px;
        padding: 1px 2px;
        background-color: #ffffff;
        border: 1px solid #888888;
        border-radius: 10px;
        text-align: center;
        width: 300px;
        height: 300px;
        color: #000000;
        font-size: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }

    div#ElementPicker_FrameBack button {
        min-width: 60px;
        height: 35px;
        font-size: medium;
    }

    div#ElementPicker_Header {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-end;
        margin: 4px 0 0 0;
        height: calc(100% - 267px);
        box-sizing: border-box;
    }

    div#ElementPicker_Window {
        width: auto;
        height: calc(100% - 78px);
        box-sizing: border-box;
        overflow: auto;
        border: 2px solid black;
        font-size: medium;
    }

    div#ElementPicker_Window ul {
        margin: 0;
        padding: 0;
        text-align: left;
        background-color: #eee;
    }

    div#ElementPicker_Window ul li {
        border-style: solid;
        border-width: 1px;
        border-top-width: 0;
        border-color: silver;
        padding: 0 0 0 5px;
        cursor: pointer;
        min-height: 30px;
        word-break: break-all;
    }

    div#ElementPicker_Text {
        box-sizing: border-box;
        margin: 4px 0 1px 0;
    }

    input#ElementPicker_Text_Input {
        width: calc(100% - 47px);
        height: 26px;
        box-sizing: border-box;
        margin: 0 5px 0 0;
    }

    button#ElementPicker_Text_Button {
        max-width: 40px;
        min-width: 40px !important;
        padding: 0;
    }
</style>

<div id="ElementPicker_PositionFixed" style="justify-content: flex-end; align-items: flex-end">
    <div id="ElementPicker_FrameBack" style="display: none">
        <div id="ElementPicker_Header">
            <button id="ElementPicker_FrameMove">Move</button>
            <button id="ElementPicker_ReSelect">↻</button>
            <button id="ElementPicker_ReSelect_5SecDelay">5↻</button>
            <button id="ElementPicker_Cancel">×</button>
            <button id="ElementPicker_OK">〇</button>
        </div>
        <div id="ElementPicker_Text">
            <input id="ElementPicker_Text_Input" type="text" spellcheck="false" />
            <button id="ElementPicker_Text_Button">0</button>
        </div>
        <div id="ElementPicker_Window">
            <ul id="ElementPicker_ul">
                <li id="ElementPicker_li_Top">↑</li>
            </ul>
        </div>
    </div>
</div>
    `;
                RootShadow.append(this.flameElement_Ele);

                this.overlay_PositionFixed_Ele = RootShadow.getElementById("ElementPicker_PositionFixed");
                this.overlay_FrameBack_Ele = RootShadow.getElementById("ElementPicker_FrameBack");
                this.picker_text_Ele = RootShadow.getElementById("ElementPicker_Text_Input");
                this.ul_ELe = RootShadow.getElementById("ElementPicker_ul");
                this.picker_button_ELe = RootShadow.getElementById("ElementPicker_Text_Button");
                this.OK_Ele = RootShadow.getElementById("ElementPicker_OK");
                this.cancel_Ele = RootShadow.getElementById("ElementPicker_Cancel");

                RootShadow.getElementById("ElementPicker_FrameMove").addEventListener("click", () => {
                    if (this.overlay_PositionFixed_Ele.style.alignItems == "flex-end") {
                        if (this.overlay_PositionFixed_Ele.style.justifyContent == "flex-start") {
                            this.overlay_PositionFixed_Ele.style.justifyContent = "flex-end";
                        } else {
                            this.overlay_PositionFixed_Ele.style.alignItems = "flex-start";
                        }
                    } else {
                        if (this.overlay_PositionFixed_Ele.style.justifyContent == "flex-end") {
                            this.overlay_PositionFixed_Ele.style.justifyContent = "flex-start";
                        } else {
                            this.overlay_PositionFixed_Ele.style.alignItems = "flex-end";
                        }
                    }
                }, false);

                RootShadow.getElementById("ElementPicker_ReSelect").addEventListener("click", async () => {
                    this.li_Remove();
                    await this.overlayHighlight_Remove();
                    this.picker_text_Ele.value = "";
                    this.picker_button_ELe.textContent = 0;
                    this.overlay_FrameBack_Ele.style.display = "none";
                    this.overlay_PositionFixed_Ele.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                    document.addEventListener("click", this.documentOnClickFunc, true);
                }, false);

                RootShadow.getElementById("ElementPicker_ReSelect_5SecDelay").addEventListener("click", async () => {
                    this.li_Remove();
                    await this.overlayHighlight_Remove();
                    this.picker_text_Ele.value = "";
                    this.picker_button_ELe.textContent = 0;
                    this.overlay_FrameBack_Ele.style.display = "none";
                    await pauseSleep(5000);
                    this.overlay_PositionFixed_Ele.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                    document.addEventListener("click", this.documentOnClickFunc, true);
                }, false);

                RootShadow.getElementById("ElementPicker_li_Top").addEventListener("click", () => {
                    if (this.currentElement && this.currentElement != this.currentElement.ownerDocument.documentElement) {
                        this.li_Remove();
                        this.currentElement = this.currentElement.parentElement;
                        this.ElementNameListAdd(Array.from(this.currentElement.children));
                    }
                }, false);

                this.picker_button_ELe.addEventListener("click", async (evt) => {
                    await this.overlayHighlight_Remove();
                    if (await this.overlayHighlight_Add(this.picker_text_Ele.value)) {
                        this.picker_text_Ele.style.backgroundColor = "";
                    } else {
                        this.picker_text_Ele.style.backgroundColor = "#FFB2B2";
                    }
                    evt.target.textContent = this.overlayHighlight_counter;
                }, false);

                this.documentOnClickFunc = (evt) => {
                    this.currentElement = evt.target.parentElement;
                    if (this.mode == "css") {
                        this.li_Add(localeText.elementPicker.thisElement, this.CSSselectorString(evt.target, false));
                    } else if (this.mode == "xpath") {
                        this.li_Add(localeText.elementPicker.thisElement, this.XPathString(evt.target, false));
                    }
                    if (this.currentElement) {
                        this.ElementNameListAdd(Array.from(this.currentElement.children));
                    } else {
                        this.ElementNameListAdd(Array.from([evt.target]));
                    }

                    evt.stopPropagation();
                    evt.preventDefault();
                    this.overlay_FrameBack_Ele.style.display = "";
                    this.overlay_PositionFixed_Ele.style.backgroundColor = "";
                    document.removeEventListener("click", this.documentOnClickFunc, true);
                    return false;
                }
            }

            async Start(mode, pickerString, pickerStringMode) {
                this.mode = mode;
                if (pickerString) {
                    try {
                        if (pickerStringMode == "css") {
                            this.rootElementArray = Array.from(document.querySelectorAll(pickerString));
                        } else if (pickerStringMode == "xpath") {
                            const evaluateObj = document.evaluate(pickerString, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                            for (let i = 0; i < evaluateObj.snapshotLength; i++) {
                                this.rootElementArray.push(evaluateObj.snapshotItem(i));
                            }
                        } else {
                            this.rootElementArray = [document];
                        }
                    } catch (e) {
                        console.error(e);
                        this.rootElementArray = [document];
                    }
                } else {
                    this.rootElementArray = [document];
                }

                this.overlay_PositionFixed_Ele.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                document.addEventListener("click", this.documentOnClickFunc, true);
                return new Promise((resolve) => {
                    this.OK_Ele.addEventListener("click", async () => {
                        const returnValue = this.picker_text_Ele.value;
                        await this.overlayHighlight_Remove();
                        this.flameElement_Ele.remove();
                        return resolve(returnValue);
                    }, false);
                    this.cancel_Ele.addEventListener("click", async () => {
                        await this.overlayHighlight_Remove();
                        this.flameElement_Ele.remove();
                        return resolve("");
                    }, false);
                });
            }

            async ElementNameListAdd(childElementArray) {
                const tagElements = new Array();
                childElementArray.forEach((tagElement) => {
                    if (!tagElements.some(ele => ele.tagName === tagElement.tagName)) {
                        tagElements.push(tagElement);
                    }
                });
                const tagAndClassElements = new Array();
                childElementArray.forEach((tagAndClassElement) => {
                    if (tagAndClassElement.className &&
                        !tagAndClassElements.some(ele => ele.tagName === tagAndClassElement.tagName && ele.className === tagAndClassElement.className)) {
                        tagAndClassElements.push(tagAndClassElement);
                    }
                });

                tagElements.forEach((ele) => {
                    if (this.mode == "css") {
                        this.li_Add(ele.tagName.toLowerCase(), this.CSSselectorString(ele, true));
                    } else if (this.mode == "xpath") {
                        this.li_Add(ele.tagName.toLowerCase(), this.XPathString(ele, true));
                    }
                });
                tagAndClassElements.forEach((ele) => {
                    if (this.mode == "css") {
                        this.li_Add(ele.tagName.toLowerCase() + "." + ele.className.split(" ").join("."), this.CSSselectorString(ele, true, ele.className));
                    } else if (this.mode == "xpath") {
                        this.li_Add(ele.tagName.toLowerCase() + "." + ele.className.split(" ").join("."), this.XPathString(ele, true, ele.className));
                    }
                });
            }

            async overlayHighlight_Add(selecterString) {
                this.overlayHighlight_counter = 0;
                let returnBool = true;
                this.rootElementArray.forEach((rootEle) => {
                    let pickerEleArray = new Array();
                    try {
                        if (this.mode == "css") {
                            pickerEleArray = Array.from(rootEle.querySelectorAll(selecterString));
                        } else if (this.mode == "xpath") {
                            const evaluateObj = document.evaluate(selecterString, rootEle, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                            for (let i = 0; i < evaluateObj.snapshotLength; i++) {
                                pickerEleArray.push(evaluateObj.snapshotItem(i));
                            }
                        }
                    } catch (e) {
                        console.error(e);
                        this.overlayHighlight_counter = 0;
                        returnBool = false;
                        return;
                    }
                    pickerEleArray.forEach((pickerEle) => {
                        const overlayHighlight_Ele = document.createElement("div");
                        overlayHighlight_Ele.style.position = "absolute";
                        overlayHighlight_Ele.style.backgroundColor = "rgba(119, 182, 255, 0.5)";


                        let olhlTop = pickerEle.offsetTop;
                        let olhlLeft = pickerEle.offsetLeft;
                        let offsetElementParent = pickerEle;
                        while (offsetElementParent.offsetParent) {
                            olhlTop = olhlTop + offsetElementParent.offsetParent.offsetTop;
                            olhlLeft = olhlLeft + offsetElementParent.offsetParent.offsetLeft;
                            offsetElementParent = offsetElementParent.offsetParent;
                        }

                        overlayHighlight_Ele.style.top = olhlTop + "px";
                        overlayHighlight_Ele.style.left = olhlLeft + "px";
                        overlayHighlight_Ele.style.width = pickerEle.offsetWidth + "px";
                        overlayHighlight_Ele.style.height = pickerEle.offsetHeight + "px";
                        overlayHighlight_Ele.style.border = "1px solid black";
                        overlayHighlight_Ele.style.zIndex = 2147483646;
                        this.flameElement_Ele.append(overlayHighlight_Ele);
                        this.overlayHighlight_EleArray.push(overlayHighlight_Ele);
                        this.overlayHighlight_counter++;
                    });
                });
                return returnBool;
            }

            async overlayHighlight_Remove() {
                this.overlayHighlight_EleArray.forEach((Ele) => {
                    Ele.remove();
                });
                this.overlayHighlight_EleArray.splice(0);
            }

            async li_Add(text, pickerString) {
                const li = document.createElement("li");
                li.textContent = text;
                const li_cfuncinfunction_arg = [li, pickerString];
                li.addEventListener("click", await this.li_cfunc(this.li_cfunchandlers.length, Array.from(li_cfuncinfunction_arg)), false);
                this.ul_ELe.append(li);
                this.li_elementArray.push(li);
            }

            async li_Remove() {
                this.li_elementArray.forEach((li) => {
                    li.remove();
                })
                this.li_elementArray.splice(0);
            }

            async li_EleSelect(Ele) {
                if (this.li_EleSelect_Ele) {
                    this.li_EleSelect_Ele.style.backgroundColor = this.li_EleSelect_BGColorTemp;
                }
                this.li_EleSelect_Ele = Ele;
                this.li_EleSelect_BGColorTemp = Ele.style.backgroundColor;
                Ele.style.backgroundColor = "lightskyblue";
            }

            async li_cfunc(cfunchandlersIndex, cfuncinfunction_arg) {
                return this.li_cfunchandlers[cfunchandlersIndex] || (this.li_cfunchandlers[cfunchandlersIndex] = async () => {
                    this.li_cfuncArgTemp[0] = cfunchandlersIndex;
                    this.li_cfuncArgTemp[1] = cfuncinfunction_arg;

                    this.li_EleSelect(cfuncinfunction_arg[0]);
                    this.picker_text_Ele.value = cfuncinfunction_arg[1];
                    await this.overlayHighlight_Remove();
                    if (await this.overlayHighlight_Add(cfuncinfunction_arg[1])) {
                        this.picker_text_Ele.style.backgroundColor = "";
                    } else {
                        this.picker_text_Ele.style.backgroundColor = "#FFB2B2";
                    }
                    this.picker_button_ELe.textContent = this.overlayHighlight_counter;
                });
            }

            CSSselectorString(el, firstFlag, className) {
                var names = [];
                while (el.parentNode && this.rootElementArray.every(ele => ele != el)) {
                    if (el.id && !firstFlag) {
                        names.unshift('#' + el.id);
                        break;
                    }
                    else if (className) {
                        names.unshift(el.tagName.toLowerCase() + "." + className.split(" ").join("."));
                        break;
                    } else {
                        if (el == el.ownerDocument.documentElement) names.unshift(el.tagName.toLowerCase());
                        else if (firstFlag) {
                            names.unshift(el.tagName.toLowerCase());
                        }
                        else {
                            let nthChildCount = 1;
                            for (let e = el; e.previousElementSibling; e = e.previousElementSibling, nthChildCount++);
                            names.unshift(el.tagName.toLowerCase() + ":nth-child(" + nthChildCount + ")");
                        }
                        el = el.parentNode;
                    }
                    firstFlag = false;
                }
                return names.join(" > ");
            }

            XPathString(el, firstFlag, classname) {
                let nodeElem = el;
                let relativePathFlag = false;
                const parts = [];
                while (nodeElem && nodeElem.nodeType === Node.ELEMENT_NODE) {
                    if (this.rootElementArray.some(ele => ele == nodeElem)) {
                        parts.push('.');
                        relativePathFlag = true;
                        break;
                    }
                    let nbOfPreviousSiblings = 0;
                    let hasNextSiblings = false;
                    let sibling = nodeElem.previousSibling;
                    while (sibling) {
                        if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE && sibling.nodeName === nodeElem.nodeName) {
                            nbOfPreviousSiblings++;
                        }
                        sibling = sibling.previousSibling;
                    }
                    sibling = nodeElem.nextSibling;
                    while (sibling) {
                        if (sibling.nodeName === nodeElem.nodeName) {
                            hasNextSiblings = true;
                            break;
                        }
                        sibling = sibling.nextSibling;
                    }
                    const prefix = nodeElem.prefix ? nodeElem.prefix + ':' : '';
                    let nth;
                    if (firstFlag) {
                        if (classname) {
                            nth = `[@class='${classname}']`;
                        } else {
                            nth = '';
                        }
                    } else {
                        nth = nbOfPreviousSiblings || hasNextSiblings ? `[${nbOfPreviousSiblings + 1}]` : '';
                    }
                    parts.push(prefix + nodeElem.localName + nth);
                    nodeElem = nodeElem.parentNode;
                    firstFlag = false;
                }
                if (relativePathFlag) {
                    return parts.length ? parts.reverse().join('/') : '';
                } else {
                    return parts.length ? '/' + parts.reverse().join('/') : '';
                }
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
            `;
            Dashboard_Window_Ele_stack.push(DB_blockResult_div);
            DashboardMain_div.append(DB_blockResult_div);

            RootShadow.getElementById("Text-ResultSentenceBlockTitle").textContent = localeText.DB_blockResult.sentenceBlock;
            RootShadow.getElementById("ItemFrame_SentenceBlock_Result_TempDisableButton").textContent = localeText.DB_blockResult.sentenceBlock_tempDisableButton;
            RootShadow.getElementById("Text-ResultElementBlockTitle").textContent = localeText.DB_blockResult.elementBlock;
            RootShadow.getElementById("ItemFrame-SettingPageButton").textContent = localeText.DB_blockResult.settingPageButton;

            {
                const SentenceBlock_div = RootShadow.getElementById("ItemFrame_SentenceBlock_Result");

                for (let i = 0; i < SentenceBlock_ExecuteResultList.length; i++) {
                    const label = document.createElement("label");
                    label.style.display = "block";
                    label.style.margin = "0 0 5px 0";
                    {
                        const input = document.createElement("input");
                        input.setAttribute("type", "checkbox");
                        input.setAttribute("name", SentenceBlock_ExecuteResultList[i].name);
                        SentenceBlock_TempDisableElementArray.push(input);
                        label.append(input);

                        const span = document.createElement("span");
                        span.textContent = SentenceBlock_ExecuteResultList[i].name + "(" + SentenceBlock_ExecuteResultList[i].count + ")";
                        label.append(span);
                    }
                    SentenceBlock_div.append(label);
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
                    div.style.border = "1px solid black";
                    ElementBlock_executeResultList[keyName].forEach((arr, index) => {
                        if (arr.settingobj.resultShow === "none") return;

                        if (arr.settingobj.resultShow === "number") {
                            const div_p = document.createElement("p");
                            const indexNumShow = index + 1;
                            div_p.textContent = indexNumShow + localeText.DB_blockResult.elementBlock_Countcase;
                            div.append(div_p);
                        } else if (arr.settingobj.resultShow === "property") {
                            const div_p = document.createElement("p");
                            div_p.textContent = arr.searchProperty;
                            div.append(div_p);
                        } else {
                            const div_p = document.createElement("p");
                            div_p.textContent = "";
                            div.append(div_p);
                        }

                        if (arr.element) {
                            const div_button1 = document.createElement("button");
                            div_button1.textContent = localeText.DB_blockResult.reDisplay;
                            div_button1.addEventListener("click", () => {
                                arr.element.style.display = "";
                            })
                            div.append(div_button1);
                        }

                        const div_button2 = document.createElement("button");
                        div_button2.textContent = localeText.DB_blockResult.copy;
                        div_button2.addEventListener("click", () => {
                            if (arr.searchProperty === "") return;
                            copyTextToClipboard(arr.searchProperty);
                        })
                        div.append(div_button2);

                        resultEnable = true;
                    });

                    if (resultEnable) {
                        const span = document.createElement("span");
                        span.textContent = keyName;
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
            `;
            DashboardMain_div.append(DB_settingTop_div);


            RootShadow.getElementById("BlockListText_Setting_Title").textContent = localeText.DB_settingsTop.blockListText_title;
            RootShadow.getElementById("BlockListText_Setting_Description").textContent = localeText.DB_settingsTop.blockListText_description;
            RootShadow.getElementById("BlockListText_Setting_Button").textContent = localeText.DB_settingsTop.blockListText_button;
            RootShadow.getElementById("BlockListText_Setting_Button").addEventListener("click", Dashboard_BlockListText, false);

            RootShadow.getElementById("SentenceBlock_Setting_Title").textContent = localeText.DB_settingsTop.sentenceBlock_title;
            RootShadow.getElementById("SentenceBlock_Setting_Description").textContent = localeText.DB_settingsTop.sentenceBlock_description;
            RootShadow.getElementById("SentenceBlock_Setting_Button").textContent = localeText.DB_settingsTop.sentenceBlock_button;
            RootShadow.getElementById("SentenceBlock_Setting_Button").addEventListener("click", Dashboard_SentenceBlock, false);

            RootShadow.getElementById("ElementBlock_Setting_Title").textContent = localeText.DB_settingsTop.elementBlock_title;
            RootShadow.getElementById("ElementBlock_Setting_Description").textContent = localeText.DB_settingsTop.elementBlock_description;
            RootShadow.getElementById("ElementBlock_Setting_Button").textContent = localeText.DB_settingsTop.elementBlock_button;
            RootShadow.getElementById("ElementBlock_Setting_Button").addEventListener("click", Dashboard_ElementBlock, false);

            RootShadow.getElementById("Preferences_Setting_Title").textContent = localeText.DB_settingsTop.preferences_title;
            RootShadow.getElementById("Preferences_Setting_Description").textContent = localeText.DB_settingsTop.preferences_description;
            RootShadow.getElementById("Preferences_Setting_Button").textContent = localeText.DB_settingsTop.preferences_button;
            RootShadow.getElementById("Preferences_Setting_Button").addEventListener("click", Dashboard_PreferencePage, false);

            RootShadow.getElementById("SettingMainPageBack_Button").textContent = localeText.backButton;
            RootShadow.getElementById("SettingMainPageBack_Button").addEventListener("click", () => {
                Dashboard_Window_Ele_stack.pop().remove();
                ArrayLast(Dashboard_Window_Ele_stack).style.display = "";
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
                this.NewObjectButton_Ele = null;
                this.DelButton_Ele = null;
                this.SaveButton_Ele = null;
                this.li_cfuncArgTemp = new Array();
                this.li_cfunchandlers = new Array();
                this.li_cfuncinfunction = new Function();
                this.li_cfuncinfunction_arg = new Array();
                this.currentEle_li = null;
                this.currentEle_li_BGColorTemp = null;
                this.currentName = null;
                this.currentIndex = null;
                this.Editflag = false;

                this.NewObjectButtonFunc = new Function();
                this.DelButtonFunc = new Function();
                this.SaveButtonFunc = new Function();

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
        height: calc(100% - 160px);
        overflow: auto;
        border: 2px solid black;
    }

    ol#ObjectLists_ol {
        background-color: #eee;
        list-style-position: inside;
        margin: 0 0 0 0;
        padding: 0 0 0 0;
    }

    #ObjectLists_ol li {
        border-style: solid;
        border-width: 1px;
        border-top-width: 0;
        border-color: silver;
        padding: 0 0 0 5px;
        cursor: pointer;
        min-height: 30px;
        word-break: break-all;
    }

    div#SettingsObject_ConfigItems {
        margin: 0 13px 0 0;
    }

    div#SettingsObject_ConfigItems div {
        margin: 2px 0 4px 0;
    }

    div#SettingsObject_ConfigItems_Name {
        display: flex;
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
            <input id="SettingsObject_ConfigItems_Name_Form" type="text" spellcheck="false" />
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
        <button id="SettingsObject_ActionButton_DeleteObject" disabled></button>
        <button id="SettingsObject_ActionButton_SaveObject" disabled></button>
    </div>
</div>
                `;
                DashboardMain_div.append(this.ListEditPage_Ele);

                RootShadow.getElementById("SettingsObject_ConfigItems_Name_Span").textContent = localeText.listEdit_Func.name;
                RootShadow.getElementById("SettingsObject_ConfigItems_Sort_Span").textContent = localeText.listEdit_Func.sort;
                RootShadow.getElementById("SettingsObject_ConfigItems_Enable_Span").textContent = localeText.listEdit_Func.enable;
                RootShadow.getElementById("SettingsObject_ConfigItems_EditConfig_Span").textContent = localeText.listEdit_Func.config;
                RootShadow.getElementById("SettingsObject_ConfigItems_EditConfig_Form").textContent = localeText.listEdit_Func.config_button;
                RootShadow.getElementById("SettingsObject_ActionButton_Back").textContent = localeText.backButton;
                RootShadow.getElementById("SettingsObject_ActionButton_NewObject").textContent = localeText.listEdit_Func.new;
                RootShadow.getElementById("SettingsObject_ActionButton_DeleteObject").textContent = localeText.listEdit_Func.delete;
                RootShadow.getElementById("SettingsObject_ActionButton_SaveObject").textContent = localeText.listEdit_Func.save;

                this.ulol_Ele = RootShadow.getElementById("ObjectLists_ol");
                this.editarea_Ele = RootShadow.getElementById("SettingsObject_ConfigItems");
                this.name_Ele = RootShadow.getElementById("SettingsObject_ConfigItems_Name_Form");
                this.index_Ele = RootShadow.getElementById("SettingsObject_ConfigItems_Sort_Form");
                this.enable_Ele = RootShadow.getElementById("SettingsObject_ConfigItems_Enable_Form");
                this.NewObjectButton_Ele = RootShadow.getElementById("SettingsObject_ActionButton_NewObject");
                this.DelButton_Ele = RootShadow.getElementById("SettingsObject_ActionButton_DeleteObject");
                this.SaveButton_Ele = RootShadow.getElementById("SettingsObject_ActionButton_SaveObject");

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
                    this.EditConfigPage_Ele.style.display = "";
                    DashboardMain_div.scroll({ top: 0 });
                }, false);

                RootShadow.getElementById("SettingsObject_ActionButton_Back").addEventListener("click", async () => {
                    if (this.Editflag) {
                        const res = await popup.confirm(localeText.listEdit_Func.editFlag_back);
                        if (!res) {
                            return false;
                        }
                    }
                    Dashboard_Window_Ele_stack.pop().remove();
                    Dashboard_Window_Ele_stack.pop().remove();
                    ArrayLast(Dashboard_Window_Ele_stack).style.display = "";
                    DashboardMain_div.scroll({ top: 0 });
                }, false);

                this.NewObjectButton_Ele.addEventListener("click", async (evt) => await this.NewObjectButtonFunc(evt.target), false);
                this.DelButton_Ele.addEventListener("click", async () => await this.DelButtonFunc(), false);
                this.SaveButton_Ele.addEventListener("click", async () => await this.SaveButtonFunc(), false);
            }

            async ListStoSave(StoKey, StoObj) {
                if (StoObj.name === "") {
                    await popup.alert(localeText.listEdit_Func.error_nameEmpty);
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
                    await popup.alert(localeText.listEdit_Func.error_nameDuplication);
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
                this.DelButton_Ele.disabled = true;
                this.SaveButton_Ele.disabled = true;
                this.Editflag = false;

                return true;
            }

            async ListStoDel(StoKey) {
                const fiindex = this.ListStorage.findIndex(({ name }) => name === this.currentName);
                if (fiindex !== -1) {
                    const res = await popup.confirm("[" + this.currentName + "]" + localeText.listEdit_Func.deleteConfirm);
                    if (!res) {
                        return false;
                    }
                    this.currentEle_li.remove();
                    this.SelectOption_Del()
                    this.ListStorage.splice(fiindex, 1);
                    await storageAPI.write(StoKey, JSON.stringify(this.ListStorage));
                    this.editarea_Ele.style.display = "none";
                    this.DelButton_Ele.disabled = true;
                    this.SaveButton_Ele.disabled = true;
                    this.Editflag = false;
                    return true;
                } else {
                    return false;
                }
            }

            async NewEditButton(NewbuttonEle) {
                if (this.Editflag) {
                    const res = await popup.confirm(localeText.listEdit_Func.editFlag_new);
                    if (!res) {
                        return false;
                    }
                }
                this.currentName = "";
                this.name_Ele.value = "";
                this.index_Ele.lastChild.style.display = "";
                this.index_Ele.selectedIndex = this.ListStorage.length;
                this.li_EleSelect(NewbuttonEle);
                this.DelButton_Ele.disabled = true;
                this.SaveButton_Ele.disabled = false;
                this.Editflag = false;
                return true;
            }

            async li_cfunc(cfunchandlersIndex, cfuncinfunction_arg) {
                return this.li_cfunchandlers[cfunchandlersIndex] || (this.li_cfunchandlers[cfunchandlersIndex] = async () => {
                    this.li_cfuncArgTemp[0] = cfunchandlersIndex;
                    this.li_cfuncArgTemp[1] = cfuncinfunction_arg;

                    if (this.Editflag) {
                        const res = await popup.confirm(localeText.listEdit_Func.editFlag_change);
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
                    await this.li_cfuncinfunction(cfuncinfunction_arg);
                    this.Editflag = false;
                });
            }

            async li_Add(index) {
                const li = document.createElement("li");
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
                this.editarea_Ele.style.display = "";
                this.DelButton_Ele.disabled = false;
                this.SaveButton_Ele.disabled = false;
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

            async immediatelyLoadSettings() {
                if (PreferenceSettingStorage.nowLoadSet) {
                    await StorageLoad();
                    await BG_sentenceBlock_obj.init();
                    await BG_elementBlock_Obj.init();
                    firstStartExecute();
                }
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
                            this.textareaDisable_Ele.style.display = "";
                        } else {
                            this.textarea_Ele.style.display = "";
                            this.textareaDisable_Ele.style.display = "none";
                        }

                        this.optionCheckboxDisableChange();
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
        font-size: 16px;
        font-family: Arial;
        resize: none;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }

    label.BlockListText_Label {
        display: block;
        margin: 5px 0 0 0;
    }
</style>

<div id="BlockListText" class="EditConfigObjectPage">
    <div id="BlockListText_Textarea_div" class="ItemFrame_Border">
        <h1 id="BlockListText_Textarea_Title" class="ItemFrame_Title"></h1>
        <textarea id="BlockListText_Textarea" spellcheck="false" wrap="off"></textarea>
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
        <label class="BlockListText_Label">
            <input id="BlockListText_Fetch_InputCheckbox" type="checkbox" />
            <span id="BlockListText_Fetch_InputCheckbox_SpanText"></span>
        </label>
        <input id="BlockListText_Fetch_InputText" type="text" spellcheck="false" />
    </div>
    <div class="ItemFrame_Border">
        <h1 id="BlockListText_Config_Title" class="ItemFrame_Title"></h1>
        <div id="BlockListText_Config_Div">
            <label class="BlockListText_Label">
                <input id="BlockListText_Config1_Input" type="checkbox" />
                <span id="BlockListText_Config1_SpanText"></span>
            </label>
            <label class="BlockListText_Label">
                <input id="BlockListText_Config2_Input" type="checkbox" />
                <span id="BlockListText_Config2_SpanText"></span>
            </label>
            <label class="BlockListText_Label">
                <input id="BlockListText_Config3_Input" type="checkbox" />
                <span id="BlockListText_Config3_SpanText"></span>
            </label>
            <label class="BlockListText_Label">
                <input id="BlockListText_Config4_Input" type="checkbox" />
                <span id="BlockListText_Config4_SpanText"></span>
            </label>
            <label class="BlockListText_Label">
                <input id="BlockListText_Config5_Input" type="checkbox" />
                <span id="BlockListText_Config5_SpanText"></span>
            </label>
            <label class="BlockListText_Label">
                <input id="BlockListText_Config6_Input" type="checkbox" />
                <span id="BlockListText_Config6_SpanText"></span>
            </label>
        </div>
    </div>
    <div>
        <button id="BlockListText_BackButton"></button>
    </div>
</div>
            `;
                    DashboardMain_div.append(this.EditConfigPage_Ele);
                    Dashboard_Window_Ele_stack.push(this.EditConfigPage_Ele);

                    RootShadow.getElementById("BlockListText_Textarea_Title").textContent = localeText.DB_blockListText.blockListText_title;
                    RootShadow.getElementById("BlockListText_Textarea_Disable_SpanText").textContent = localeText.DB_blockListText.blockListText_URLoverWrite;
                    RootShadow.getElementById("BlockListText_Textarea_Disable_ShowButton").textContent = localeText.DB_blockListText.blockListText_show;
                    RootShadow.getElementById("BlockListText_ReadFile_Title").textContent = localeText.DB_blockListText.textFile_title;
                    RootShadow.getElementById("BlockListText_Fetch_Title").textContent = localeText.DB_blockListText.URLget_title;
                    RootShadow.getElementById("BlockListText_Fetch_InputCheckbox_SpanText").textContent = localeText.DB_blockListText.URLget_enable;
                    RootShadow.getElementById("BlockListText_Config_Title").textContent = localeText.DB_blockListText.option_title;
                    RootShadow.getElementById("BlockListText_Config1_SpanText").textContent = localeText.DB_blockListText.option_regexp;
                    RootShadow.getElementById("BlockListText_Config2_SpanText").textContent = localeText.DB_blockListText.option_caseSensitive;
                    RootShadow.getElementById("BlockListText_Config3_SpanText").textContent = localeText.DB_blockListText.option_exact;
                    RootShadow.getElementById("BlockListText_Config4_SpanText").textContent = localeText.DB_blockListText.option_spaceIgnore;
                    RootShadow.getElementById("BlockListText_Config5_SpanText").textContent = localeText.DB_blockListText.option_notSearch;
                    RootShadow.getElementById("BlockListText_Config6_SpanText").textContent = localeText.DB_blockListText.option_uBlacklist;
                    RootShadow.getElementById("BlockListText_BackButton").textContent = localeText.backButton;

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
                            const res = await popup.confirm(localeText.DB_blockListText.textFile_overWrite);
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
                        this.textarea_Ele.style.display = "";
                        this.textareaDisable_Ele.style.display = "none";
                    }, false);

                    RootShadow.getElementById("BlockListText_Config_Div").addEventListener("change", () => {
                        this.optionCheckboxDisableChange();
                    });

                    RootShadow.getElementById("BlockListText_BackButton").addEventListener("click", () => {
                        this.ListEditPage_Ele.style.display = "";
                        this.EditConfigPage_Ele.style.display = "none";
                        DashboardMain_div.scroll({ top: 0 });
                    }, false);

                    RootShadow.getElementById("SettingsObject_ConfigItems_Enable").style.display = "none";
                }

                async optionCheckboxDisableChange() {
                    if (this.uBlacklist_Ele.checked) {
                        this.regexp_Ele.disabled = true;
                        this.regexp_Ele.parentElement.style.textDecoration = "line-through";
                        this.caseSensitive_Ele.disabled = true;
                        this.caseSensitive_Ele.parentElement.style.textDecoration = "line-through";
                        this.exact_Ele.disabled = true;
                        this.exact_Ele.parentElement.style.textDecoration = "line-through";
                        this.spaceIgnore_Ele.disabled = true;
                        this.spaceIgnore_Ele.parentElement.style.textDecoration = "line-through";
                    } else {
                        this.regexp_Ele.disabled = false;
                        this.regexp_Ele.parentElement.style.textDecoration = "";
                        this.caseSensitive_Ele.disabled = false;
                        this.caseSensitive_Ele.parentElement.style.textDecoration = "";
                        this.spaceIgnore_Ele.disabled = false;
                        this.spaceIgnore_Ele.parentElement.style.textDecoration = "";
                        if (this.regexp_Ele.checked) {
                            this.exact_Ele.disabled = true;
                            this.exact_Ele.parentElement.style.textDecoration = "line-through";
                        } else {
                            this.exact_Ele.disabled = false;
                            this.exact_Ele.parentElement.style.textDecoration = "";
                        }
                    }
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

                    const PreferenceSettingStorageTemp = JSON.parse(await storageAPI.read("PreferenceSetting"));
                    if (PreferenceSettingStorageTemp.performanceConfig.overRide_disable == oldName) {
                        PreferenceSettingStorageTemp.performanceConfig.overRide_disable = newName;
                    }
                    if (PreferenceSettingStorageTemp.performanceConfig.overRide_performancePriority1 === oldName) {
                        PreferenceSettingStorageTemp.performanceConfig.overRide_performancePriority1 = newName;
                    }
                    if (PreferenceSettingStorageTemp.performanceConfig.overRide_performancePriority2 === oldName) {
                        PreferenceSettingStorageTemp.performanceConfig.overRide_performancePriority2 = newName;
                    }
                    if (PreferenceSettingStorageTemp.performanceConfig.overRide_blockPriority === oldName) {
                        PreferenceSettingStorageTemp.performanceConfig.overRide_blockPriority = newName;
                    }
                    if (PreferenceSettingStorageTemp.performanceConfig.overRide_balance === oldName) {
                        PreferenceSettingStorageTemp.performanceConfig.overRide_balance = newName;
                    }
                    await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorageTemp));

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
                        text: this.textarea_Ele.value,
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
                    await BlockListText_feathLoad();
                    this.immediatelyLoadSettings();
                }

                async BlockListText_storageDelete() {
                    if (await this.ListStoDel("BlockListText")) {
                        const BlockListText_keyName = "BLT_" + this.currentName;
                        await storageAPI.delete(BlockListText_keyName);
                        this.BlockListText_storageUpdateOtherSetting(this.currentName, "");
                    }
                    this.immediatelyLoadSettings();
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

                        this.textarea_Ele.style.display = "";
                        this.textareaDisable_Ele.style.display = "none";

                        this.optionCheckboxDisableChange();
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
                            if (applylist.BlockListText_list.includes(htmlOption.value)) {
                                htmlOption.selected = true;
                            } else {
                                htmlOption.selected = false;
                            }
                        });
                        Array.from(this.BlockListText_exclude_list_Ele.options).forEach((htmlOption) => {
                            if (applylist.BlockListText_exclude_list.includes(htmlOption.value)) {
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

    label.SentenceBlock_Label {
        display: block;
        margin: 5px 0 0 0;
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
            <label class="SentenceBlock_Label">
                <input type="radio" name="url_mode" value="wildcard" checked />
                <span id="SentenceBlockConfig1_Form_Input1_SpanText"></span>
            </label>
            <label class="SentenceBlock_Label">
                <input type="radio" name="url_mode" value="regexp" />
                <span id="SentenceBlockConfig1_Form_Input2_SpanText"></span>
            </label>
            <label class="SentenceBlock_Label">
                <input type="radio" name="url_mode" value="blt" />
                <span id="SentenceBlockConfig1_Form_Input3_SpanText"></span>
            </label>
        </form>
    </div>

    <div class="ItemFrame_Border">
        <h1 id="SentenceBlockConfig2_Title" class="ItemFrame_Title"></h1>
        <p id="SentenceBlockConfig2_Description"></p>
        <select id="SentenceBlockConfig2_Select" class="SentenceBlock_Select" size="7" multiple>
            <option value="">-----</option>
        </select>
        <div>
            <div class="ItemFrame_Border">
                <p id="SentenceBlockConfig2-2_Description"></p>
                <select id="SentenceBlockConfig2-2_Select" class="SentenceBlock_Select" size="7" multiple>
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
            <label class="SentenceBlock_Label">
                <input type="radio" name="replace_mode" value="sentence" checked />
                <span id="SentenceBlockConfig3_Form_Input1_SpanText"></span>
            </label>
            <label class="SentenceBlock_Label">
                <input type="radio" name="replace_mode" value="word" />
                <span id="SentenceBlockConfig3_Form_Input2_SpanText"></span>
            </label>
        </form>
    </div>

    <div class="ItemFrame_Border">
        <h1 id="SentenceBlockConfig4_Title" class="ItemFrame_Title"></h1>
        <p id="SentenceBlockConfig4_Description"></p>
        <select id="SentenceBlockConfig4_Select" class="ElementBlock_Select" size="1">
            <option id="SentenceBlockConfig4_Select_Option1" value="hrefexclude"></option>
            <option id="SentenceBlockConfig4_Select_Option2" value="hrefonly"></option>
            <option id="SentenceBlockConfig4_Select_Option3" value="all"></option>
        </select>
    </div>

    <div>
        <button id="SentenceBlockConfig_BackButton"></button>
    </div>
</div>
                    `;
                    DashboardMain_div.append(this.EditConfigPage_Ele);
                    Dashboard_Window_Ele_stack.push(this.EditConfigPage_Ele);

                    RootShadow.getElementById("SentenceBlockConfig1_Title").textContent = localeText.DB_sentenceBlock.URL_title;
                    RootShadow.getElementById("SentenceBlockConfig1_Description").textContent = localeText.DB_sentenceBlock.URL_description;
                    RootShadow.getElementById("SentenceBlockConfig1_Form_Input1_SpanText").textContent = localeText.DB_sentenceBlock.URL_wildcard;
                    RootShadow.getElementById("SentenceBlockConfig1_Form_Input2_SpanText").textContent = localeText.DB_sentenceBlock.URL_regexp;
                    RootShadow.getElementById("SentenceBlockConfig1_Form_Input3_SpanText").textContent = localeText.DB_sentenceBlock.URL_BLT;
                    RootShadow.getElementById("SentenceBlockConfig2_Title").textContent = localeText.DB_sentenceBlock.BLT_title;
                    RootShadow.getElementById("SentenceBlockConfig2_Description").textContent = localeText.DB_sentenceBlock.BLT_description;
                    RootShadow.getElementById("SentenceBlockConfig2-2_Description").textContent = localeText.DB_sentenceBlock.BLT_exclude;
                    RootShadow.getElementById("SentenceBlockConfig3_Title").textContent = localeText.DB_sentenceBlock.replace_title;
                    RootShadow.getElementById("SentenceBlockConfig3_Description").textContent = localeText.DB_sentenceBlock.replace_description;
                    RootShadow.getElementById("SentenceBlockConfig3_Form_Input1_SpanText").textContent = localeText.DB_sentenceBlock.replace_sentence;
                    RootShadow.getElementById("SentenceBlockConfig3_Form_Input2_SpanText").textContent = localeText.DB_sentenceBlock.replace_word;
                    RootShadow.getElementById("SentenceBlockConfig4_Title").textContent = localeText.DB_sentenceBlock.aTag_title;
                    RootShadow.getElementById("SentenceBlockConfig4_Description").textContent = localeText.DB_sentenceBlock.aTag_description;
                    RootShadow.getElementById("SentenceBlockConfig4_Select_Option1").textContent = localeText.DB_sentenceBlock.aTag_hrefExclude;
                    RootShadow.getElementById("SentenceBlockConfig4_Select_Option2").textContent = localeText.DB_sentenceBlock.aTag_hrefOnly;
                    RootShadow.getElementById("SentenceBlockConfig4_Select_Option3").textContent = localeText.DB_sentenceBlock.aTag_all;
                    RootShadow.getElementById("SentenceBlockConfig_BackButton").textContent = localeText.backButton;

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
                        this.ListEditPage_Ele.style.display = "";
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
                    this.immediatelyLoadSettings();
                }

                async SentenceBlock_ListStoDel() {
                    await this.ListStoDel("SentenceBlock");
                    this.immediatelyLoadSettings();
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
                            if (applylist.BlockListText_list.includes(htmlOption.value)) {
                                htmlOption.selected = true;
                            } else {
                                htmlOption.selected = false;
                            }
                        });
                        Array.from(this.BlockListText_exclude_list_Ele.options).forEach((htmlOption) => {
                            if (applylist.BlockListText_exclude_list.includes(htmlOption.value)) {
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

    label.ElementBlock_Label {
        display: block;
        margin: 5px 0 0 0;
    }

    form#ElementBlockConfig2_Form {
        margin: 5px 0 5px 0;
    }

    form#ElementBlockConfig3_Form {
        margin: 5px 0 5px 0;
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
        <form id="ElementBlockConfig1_Form">
            <label class="ElementBlock_Label">
                <input type="radio" name="url_mode" value="wildcard" checked />
                <span id="ElementBlockConfig1_Form_Input1_SpanText"></span>
            </label>
            <label class="ElementBlock_Label">
                <input type="radio" name="url_mode" value="regexp" />
                <span id="ElementBlockConfig1_Form_Input2_SpanText"></span>
            </label>
            <label class="ElementBlock_Label">
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
                <label class="ElementBlock_Label">
                    <input type="radio" name="hideMethod" value="displayNone" checked />
                    <span id="ElementBlockConfig2-2_Form_Input1_SpanText"></span>
                </label>
                <label class="ElementBlock_Label">
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
        <label class="ElementBlock_Label">
            <input id="ElementBlockConfig3_Input1" type="checkbox" />
            <span id="ElementBlockConfig3_Input1_SpanText"></span>
        </label>
        <div class="ItemFrame_Border">
            <form id="ElementBlockConfig3-2_From" class="ItemFrame_Border">
                <label class="ElementBlock_Label">
                    <input type="radio" name="propertyMode" value="text" checked />
                    <span id="ElementBlockConfig3-2_Form_Input1_SpanText"></span>
                </label>
                <label class="ElementBlock_Label">
                    <input type="radio" name="propertyMode" value="href" />
                    <span id="ElementBlockConfig3-2_Form_Input2_SpanText"></span>
                </label>
                <label class="ElementBlock_Label">
                    <input type="radio" name="propertyMode" value="style" />
                    <span id="ElementBlockConfig3-2_Form_Input3_SpanText"></span>
                    <br />
                    <input id="ElementBlockConfig3-2_Form_Input3_InputText" type="text" spellcheck="false" />
                </label>
                <label class="ElementBlock_Label">
                    <input type="radio" name="propertyMode" value="advanced" />
                    <span id="ElementBlockConfig3-2_Form_Input4_SpanText"></span>
                    <br />
                    <input id="ElementBlockConfig3-2_Form_Input4_InputText" type="text" spellcheck="false" />
                </label>
            </form>
        </div>
    </div>

    <div class="ItemFrame_Border">
        <h1 id="ElementBlockConfig4_Title" class="ItemFrame_Title"></h1>
        <p id="ElementBlockConfig4_Description"></p>
        <select id="ElementBlockConfig4_Select" class="ElementBlock_Select" size="8" multiple>
            <option value="">-----</option>
        </select>
        <div>
            <div class="ItemFrame_Border">
                <p id="ElementBlockConfig4-2_Description"></p>
                <select id="ElementBlockConfig4-2_Select" class="ElementBlock_Select" size="8" multiple>
                    <option value="">-----</option>
                </select>
            </div>
        </div>
    </div>

    <div class="ItemFrame_Border">
        <h1 id="ElementBlockConfig5_Title" class="ItemFrame_Title"></h1>
        <p id="ElementBlockConfig5_Description"></p>
        <select id="ElementBlockConfig5_Select" class="ElementBlock_Select" size="1">
            <option id="ElementBlockConfig5_Select_Option1" value="urlonly"></option>
            <option id="ElementBlockConfig5_Select_Option2" value="titleonly"></option>
            <option id="ElementBlockConfig5_Select_Option3" value="all"></option>
        </select>
    </div>

    <div class="ItemFrame_Border">
        <h1 id="ElementBlockConfig6_Title" class="ItemFrame_Title"></h1>
        <p id="ElementBlockConfig6_Description"></p>
        <form id="ElementBlockConfig6_Form">
            <label class="ElementBlock_Label">
                <input type="radio" name="resultShow" value="none" checked />
                <span id="ElementBlockConfig6_Form_Input1_SpanText"></span>
            </label>
            <label class="ElementBlock_Label">
                <input type="radio" name="resultShow" value="number" />
                <span id="ElementBlockConfig6_Form_Input2_SpanText"></span>
            </label>
            <label class="ElementBlock_Label">
                <input type="radio" name="resultShow" value="property" />
                <span id="ElementBlockConfig6_Form_Input3_SpanText"></span>
            </label>
        </form>
    </div>

    <div>
        <button id="ElementBlockConfig_BackButton"></button>
    </div>
</div>
                    `;
                    DashboardMain_div.append(this.EditConfigPage_Ele);
                    Dashboard_Window_Ele_stack.push(this.EditConfigPage_Ele);

                    RootShadow.getElementById("ElementBlockConfig1_Title").textContent = localeText.DB_elementBlock.URL_title;
                    RootShadow.getElementById("ElementBlockConfig1_Description").innerHTML = localeText.DB_elementBlock.URL_description;
                    RootShadow.getElementById("ElementBlockConfig1_Form_Input1_SpanText").textContent = localeText.DB_elementBlock.URL_wildcard;
                    RootShadow.getElementById("ElementBlockConfig1_Form_Input2_SpanText").textContent = localeText.DB_elementBlock.URL_regexp;
                    RootShadow.getElementById("ElementBlockConfig1_Form_Input3_SpanText").textContent = localeText.DB_elementBlock.URL_BLT;
                    RootShadow.getElementById("ElementBlockConfig2_Title").textContent = localeText.DB_elementBlock.eleHide_title;
                    RootShadow.getElementById("ElementBlockConfig2_Description").textContent = localeText.DB_elementBlock.eleHide_description;
                    RootShadow.getElementById("ElementBlockConfig2_Form_Input1_SpanText").textContent = localeText.DB_elementBlock.css;
                    RootShadow.getElementById("ElementBlockConfig2_Form_Input2_SpanText").textContent = localeText.DB_elementBlock.XPath;
                    RootShadow.getElementById("ElementBlockConfig2_Button").textContent = localeText.DB_elementBlock.elementPicker;
                    RootShadow.getElementById("ElementBlockConfig2-2_Form_Input1_SpanText").textContent = localeText.DB_elementBlock.eleHide_displayNone;
                    RootShadow.getElementById("ElementBlockConfig2-2_Form_Input2_SpanText").textContent = localeText.DB_elementBlock.eleHide_remove;
                    RootShadow.getElementById("ElementBlockConfig3_Title").textContent = localeText.DB_elementBlock.eleSearch_title;
                    RootShadow.getElementById("ElementBlockConfig3_Description").textContent = localeText.DB_elementBlock.eleSearch_description;
                    RootShadow.getElementById("ElementBlockConfig3_Form_Input1_SpanText").textContent = localeText.DB_elementBlock.css;
                    RootShadow.getElementById("ElementBlockConfig3_Form_Input2_SpanText").textContent = localeText.DB_elementBlock.XPath;
                    RootShadow.getElementById("ElementBlockConfig3_Button").textContent = localeText.DB_elementBlock.elementPicker;
                    RootShadow.getElementById("ElementBlockConfig3_Input1_SpanText").textContent = localeText.DB_elementBlock.eleSearch_firstOnly;
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input1_SpanText").textContent = localeText.DB_elementBlock.eleSearch_methodText;
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input2_SpanText").textContent = localeText.DB_elementBlock.eleSearch_methodHref;
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input3_SpanText").textContent = localeText.DB_elementBlock.eleSearch_methodStyle;
                    RootShadow.getElementById("ElementBlockConfig3-2_Form_Input4_SpanText").textContent = localeText.DB_elementBlock.eleSearch_methodAdvanced;
                    RootShadow.getElementById("ElementBlockConfig4_Title").textContent = localeText.DB_elementBlock.BLT_title;
                    RootShadow.getElementById("ElementBlockConfig4_Description").textContent = localeText.DB_elementBlock.BLT_description;
                    RootShadow.getElementById("ElementBlockConfig4-2_Description").textContent = localeText.DB_elementBlock.BLT_exclude;
                    RootShadow.getElementById("ElementBlockConfig5_Title").textContent = localeText.DB_elementBlock.uBlacklist_title;
                    RootShadow.getElementById("ElementBlockConfig5_Description").textContent = localeText.DB_elementBlock.uBlacklist_description;
                    RootShadow.getElementById("ElementBlockConfig5_Select_Option1").textContent = localeText.DB_elementBlock.uBlacklist_urlOnly;
                    RootShadow.getElementById("ElementBlockConfig5_Select_Option2").textContent = localeText.DB_elementBlock.uBlacklist_titleOnly;
                    RootShadow.getElementById("ElementBlockConfig5_Select_Option3").textContent = localeText.DB_elementBlock.uBlacklist_all;
                    RootShadow.getElementById("ElementBlockConfig6_Title").textContent = localeText.DB_elementBlock.resultShow_title;
                    RootShadow.getElementById("ElementBlockConfig6_Description").textContent = localeText.DB_elementBlock.resultShow_description;
                    RootShadow.getElementById("ElementBlockConfig6_Form_Input1_SpanText").textContent = localeText.DB_elementBlock.resultShow_none;
                    RootShadow.getElementById("ElementBlockConfig6_Form_Input2_SpanText").textContent = localeText.DB_elementBlock.resultShow_number;
                    RootShadow.getElementById("ElementBlockConfig6_Form_Input3_SpanText").textContent = localeText.DB_elementBlock.resultShow_property;
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

                    RootShadow.getElementById("ElementBlockConfig2_Button").addEventListener("click", async () => {
                        await popup.alert(localeText.DB_elementBlock.elementPicker_message);
                        Dashboard_Element.style.display = "none";
                        const pickerObj = new ElementPicker();
                        const pickerMethod = this.elementHide_method_Ele.pickerMethod.value;
                        await pickerObj.init();
                        const selectorString = await pickerObj.Start(pickerMethod);
                        Dashboard_Element.style.display = "";
                        if (selectorString) {
                            this.elementHide_Ele.value = selectorString;
                        }
                    }, false);

                    RootShadow.getElementById("ElementBlockConfig3_Button").addEventListener("click", async () => {
                        await popup.alert(localeText.DB_elementBlock.elementPicker_message);
                        Dashboard_Element.style.display = "none";
                        const pickerObj = new ElementPicker();
                        const pickerMethod = this.elementSearch_method_Ele.pickerMethod.value;
                        const elementHide_pickerString = this.elementHide_Ele.value;
                        const elementHide_pickerMethod = this.elementHide_method_Ele.pickerMethod.value
                        await pickerObj.init();
                        const selectorString = await pickerObj.Start(pickerMethod, elementHide_pickerString, elementHide_pickerMethod);
                        Dashboard_Element.style.display = "";
                        if (selectorString) {
                            this.elementSearch_Ele.value = selectorString;
                        }
                    }, false);

                    RootShadow.getElementById("ElementBlockConfig_BackButton").addEventListener("click", () => {
                        this.ListEditPage_Ele.style.display = "";
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
                    this.immediatelyLoadSettings();
                }

                async ElementBlock_ListStoDel() {
                    await this.ListStoDel("ElementBlock");
                    this.immediatelyLoadSettings();
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

    <div id="immediatelyLoadSettings" class="ItemFrame_Border">
        <h1 id="immediatelyLoadSettings_Title" class="ItemFrame_Title"></h1>
        <p id="immediatelyLoadSettings_Description"></p>
        <label>
            <input id="immediatelyLoadSettings_Input" type="checkbox" />
            <span id="immediatelyLoadSettings_Input_SpanText"></span>
        </label>
    </div>

    <div id="FetchInterval" class="ItemFrame_Border">
        <h1 id="FetchInterval_Title" class="ItemFrame_Title"></h1>
        <p id="FetchInterval_Description"></p>
        <select id="FetchInterval_Select" size="1">
            <option id="FetchInterval_Select_Option1" value="300000"></option>
            <option id="FetchInterval_Select_Option2" value="900000"></option>
            <option id="FetchInterval_Select_Option3" value="1800000"></option>
            <option id="FetchInterval_Select_Option4" value="3600000"></option>
            <option id="FetchInterval_Select_Option5" value="7200000"></option>
            <option id="FetchInterval_Select_Option6" value="18000000"></option>
        </select>
    </div>

    <div id="DashboardColor" class="ItemFrame_Border">
        <h1 id="DashboardColor_Title" class="ItemFrame_Title"></h1>
        <p id="DashboardColor_Description"></p>
        <select id="DashboardColor_Select" size="1">
            <option id="DashboardColor_Select_Option1" value="#FFCDCD"></option>
            <option id="DashboardColor_Select_Option2" value="#FFFFB2"></option>
            <option id="DashboardColor_Select_Option3" value="#D0FFCA"></option>
            <option id="DashboardColor_Select_Option4" value="#BAD4FF"></option>
        </select>
    </div>

    <div id="Language" class="ItemFrame_Border">
        <h1 id="Language_Title" class="ItemFrame_Title"></h1>
        <p id="Language_Description"></p>
        <select id="Language_Select" size="1">
            <option id="Language_Select_Option1" value="en"></option>
            <option id="Language_Select_Option2" value="ja-jp"></option>
        </select>
    </div>

    <div id="SettingMainPageBack" class="PreferencesItem">
        <button id="PreferencesPageBack_Button"></button>
    </div>
</div>
            `;
            DashboardMain_div.append(DB_preference_div);
            Dashboard_Window_Ele_stack.push(DB_preference_div);

            RootShadow.getElementById("ImportAndExport_Title").textContent = localeText.DB_preference.importAndExport_title;
            RootShadow.getElementById("ImportAndExport_Description").textContent = localeText.DB_preference.importAndExport_description;
            RootShadow.getElementById("ImportAndExport_Button").textContent = localeText.DB_preference.importAndExport_button;
            RootShadow.getElementById("PerformanceConfig_Title").textContent = localeText.DB_preference.performanceConfig_title;
            RootShadow.getElementById("PerformanceConfig_Description").textContent = localeText.DB_preference.performanceConfig_description;
            RootShadow.getElementById("PerformanceConfig_Button").textContent = localeText.DB_preference.performanceConfig_button;
            RootShadow.getElementById("ButtonHide_Title").textContent = localeText.DB_preference.buttonHide_title;
            RootShadow.getElementById("ButtonHide_Description").textContent = localeText.DB_preference.buttonHide_description;
            RootShadow.getElementById("ButtonHide_Input_SpanText").textContent = localeText.DB_preference.buttonHide_boxText;
            RootShadow.getElementById("immediatelyLoadSettings_Title").textContent = localeText.DB_preference.nowLoadSet_title;
            RootShadow.getElementById("immediatelyLoadSettings_Description").textContent = localeText.DB_preference.nowLoadSet_description;
            RootShadow.getElementById("immediatelyLoadSettings_Input_SpanText").textContent = localeText.DB_preference.nowLoadSet_boxText;

            RootShadow.getElementById("FetchInterval_Title").textContent = localeText.DB_preference.fetchInterval_title;
            RootShadow.getElementById("FetchInterval_Description").textContent = localeText.DB_preference.fetchInterval_Description;
            RootShadow.getElementById("FetchInterval_Select_Option1").textContent = localeText.DB_preference.fetchInterval_300000;
            RootShadow.getElementById("FetchInterval_Select_Option2").textContent = localeText.DB_preference.fetchInterval_900000;
            RootShadow.getElementById("FetchInterval_Select_Option3").textContent = localeText.DB_preference.fetchInterval_1800000;
            RootShadow.getElementById("FetchInterval_Select_Option4").textContent = localeText.DB_preference.fetchInterval_3600000;
            RootShadow.getElementById("FetchInterval_Select_Option5").textContent = localeText.DB_preference.fetchInterval_7200000;
            RootShadow.getElementById("FetchInterval_Select_Option6").textContent = localeText.DB_preference.fetchInterval_18000000;

            RootShadow.getElementById("DashboardColor_Title").textContent = localeText.DB_preference.dashboardColor_title;
            RootShadow.getElementById("DashboardColor_Description").textContent = localeText.DB_preference.dashboardColor_Description;
            RootShadow.getElementById("DashboardColor_Select_Option1").textContent = localeText.DB_preference.dashboardColor_red;
            RootShadow.getElementById("DashboardColor_Select_Option2").textContent = localeText.DB_preference.dashboardColor_yellow;
            RootShadow.getElementById("DashboardColor_Select_Option3").textContent = localeText.DB_preference.dashboardColor_green;
            RootShadow.getElementById("DashboardColor_Select_Option4").textContent = localeText.DB_preference.dashboardColor_blue;

            RootShadow.getElementById("Language_Title").textContent = localeText.DB_preference.language_title;
            RootShadow.getElementById("Language_Description").textContent = localeText.DB_preference.language_Description;
            RootShadow.getElementById("Language_Select_Option1").textContent = localeText.DB_preference.language_en;
            RootShadow.getElementById("Language_Select_Option2").textContent = localeText.DB_preference.language_ja_jp;

            RootShadow.getElementById("PreferencesPageBack_Button").textContent = localeText.backButton;


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
                        const res = await popup.confirm(localeText.DB_preference.buttonHide_warning);
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

            const immediatelyLoadSettings_Input = RootShadow.getElementById("immediatelyLoadSettings_Input");
            if (PreferenceSettingStorage.nowLoadSet) {
                immediatelyLoadSettings_Input.checked = true;
            } else {
                immediatelyLoadSettings_Input.checked = false;
            }
            immediatelyLoadSettings_Input.addEventListener("change", async (evt) => {
                const targetElement = evt.target;
                if (targetElement.checked) {
                    PreferenceSettingStorage.nowLoadSet = true;
                    await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorage));
                } else {
                    PreferenceSettingStorage.nowLoadSet = false;
                    await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorage));
                }
            });

            RootShadow.getElementById("FetchInterval_Select").value = PreferenceSettingStorage.fetchInterval;
            RootShadow.getElementById("FetchInterval_Select").addEventListener("change", async (evt) => {
                PreferenceSettingStorage.fetchInterval = parseInt(evt.target.value);
                await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorage));
            });

            RootShadow.getElementById("DashboardColor_Select").value = PreferenceSettingStorage.dashboardColor;
            RootShadow.getElementById("DashboardColor_Select").addEventListener("change", async (evt) => {
                PreferenceSettingStorage.dashboardColor = evt.target.value;
                RootShadow.getElementById("FrameBack").style.setProperty("--CustomBackgroundColor", evt.target.value);
                await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorage));
            });

            RootShadow.getElementById("Language_Select").value = PreferenceSettingStorage.language;
            RootShadow.getElementById("Language_Select").addEventListener("change", async (evt) => {
                PreferenceSettingStorage.language = evt.target.value;
                await storageAPI.write("PreferenceSetting", JSON.stringify(PreferenceSettingStorage));
            });

            RootShadow.getElementById("PreferencesPageBack_Button").addEventListener("click", () => {
                Dashboard_Window_Ele_stack.pop().remove();
                ArrayLast(Dashboard_Window_Ele_stack).style.display = "";
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
                            await popup.alert(localeText.DB_exportImport.error_export);
                            return undefined;
                        }
                    } else if (mode === "import") {
                        try {
                            const importset = JSON.parse(importjson);
                            const ExistKeyList = await storageAPI.keynameList();
                            // JSON.parse Test
                            await Promise.all(Object.keys(importset).map(async (keyName) => {
                                JSON.parse(importset[keyName]);
                            }));
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
                            await popup.alert(localeText.DB_exportImport.error_import);
                            return false;
                        }
                    } else if (mode === "addimport") {
                        try {
                            const importset = JSON.parse(importjson);
                            const BlockListTextTemp = JSON.parse(importset.BlockListText);
                            const SentenceBlockTemp = JSON.parse(importset.SentenceBlock)
                            const ElementBlockTemp = JSON.parse(importset.ElementBlock)
                            const nameDuplicateRename = (name, currentSetting, newSetting) => {
                                let nameDuplicate_Name = name;
                                let nameDuplicate_loopFlag = false;
                                let nameDuplicate_renameNumber = 0;
                                if (nameDuplicate_Name == "") {
                                    nameDuplicate_renameNumber++;
                                    nameDuplicate_Name = name + "_" + nameDuplicate_renameNumber;
                                }
                                do {
                                    nameDuplicate_loopFlag = false;
                                    const dupCheckCurrent = currentSetting.some(currentSetObj => nameDuplicate_Name == currentSetObj.name);
                                    const dupCheckNew = newSetting.some(currentSetObj => nameDuplicate_Name == currentSetObj.name);
                                    if (dupCheckCurrent || dupCheckNew) {
                                        nameDuplicate_loopFlag = true;
                                        nameDuplicate_renameNumber++;
                                        nameDuplicate_Name = name + "_" + nameDuplicate_renameNumber;
                                    }
                                } while (nameDuplicate_loopFlag);
                                return nameDuplicate_Name;
                            }

                            const BLTStorageTemp = new Array();
                            BlockListTextTemp.forEach((settingObj) => {
                                const newName = nameDuplicateRename(settingObj.name, BlockListTextStorage, BlockListTextTemp);
                                const oldName = settingObj.name;
                                BLTStorageTemp.push({
                                    keyName: "BLT_" + newName,
                                    setValue: importset["BLT_" + oldName]
                                });
                                if (oldName != newName) {
                                    settingObj.name = newName;

                                    SentenceBlockTemp.forEach((SentenceBlock_Obj) => {
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

                                    ElementBlockTemp.forEach((ElementBlock_Obj) => {
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
                                }
                            });
                            const BlockListTextStorage_writeReady = [...BlockListTextStorage, ...BlockListTextTemp];

                            SentenceBlockTemp.forEach((settingObj) => {
                                const newName = nameDuplicateRename(settingObj.name, SentenceBlockStorage, SentenceBlockTemp);
                                const oldName = settingObj.name;
                                if (oldName != newName) {
                                    settingObj.name = newName;
                                }
                            });
                            const SentenceBlockStorage_writeReady = [...SentenceBlockStorage, ...SentenceBlockTemp];

                            ElementBlockTemp.forEach((settingObj) => {
                                const newName = nameDuplicateRename(settingObj.name, ElementBlockStorage, ElementBlockTemp);
                                const oldName = settingObj.name;
                                if (oldName != newName) {
                                    settingObj.name = newName;
                                }
                            });
                            const ElementBlockStorage_writeReady = [...ElementBlockStorage, ...ElementBlockTemp];

                            await Promise.all(BLTStorageTemp.map(async (writeObj) => {
                                await storageAPI.write(writeObj.keyName, writeObj.setValue);
                            }));
                            await storageAPI.write("BlockListText", JSON.stringify(BlockListTextStorage_writeReady));
                            await storageAPI.write("SentenceBlock", JSON.stringify(SentenceBlockStorage_writeReady));
                            await storageAPI.write("ElementBlock", JSON.stringify(ElementBlockStorage_writeReady));
                            StorageLoad();
                            return true;
                        } catch (e) {
                            console.error(e);
                            await popup.alert(localeText.DB_exportImport.error_import);
                            return false;
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

    #ExportAndImportPage button {
        display: block;
        margin: 5px 0 0 0;
    }

    textarea#ExportAndImportConfig3_Textarea {
        font-size: 16px;
        font-family: Arial;
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
        <div class="ItemFrame_Border">
            <label class="ExportAndImportConfig2-3_Label">
                <input id="ExportAndImportConfig2-3_Input" type="checkbox" />
                <span id="ExportAndImportConfig2-3_SpanText"></span>
            </label>
        </div>
        <span id="ExportAndImportConfig2_SpanText" style="display: none"></span>
    </div>
    <div class="ItemFrame_Border">
        <h1 id="ExportAndImportConfig3_Title" class="ItemFrame_Title"></h1>
        <textarea id="ExportAndImportConfig3_Textarea" spellcheck="false"></textarea>
    </div>
    <button id="ExportAndImportConfig_BackButton"></button>
</div>
                `;
                DashboardMain_div.append(DB_exportAndImport_div);
                Dashboard_Window_Ele_stack.push(DB_exportAndImport_div);

                RootShadow.getElementById("ExportAndImportConfig1_Title").textContent = localeText.DB_exportImport.export_title;
                RootShadow.getElementById("ExportAndImportConfig1_Button1").textContent = localeText.DB_exportImport.export_file;
                RootShadow.getElementById("ExportAndImportConfig1_Button2").textContent = localeText.DB_exportImport.export_copy;
                RootShadow.getElementById("ExportAndImportConfig1_Button3").textContent = localeText.DB_exportImport.export_textArea;
                RootShadow.getElementById("ExportAndImportConfig1_SpanText").textContent = localeText.DB_exportImport.export_success;
                RootShadow.getElementById("ExportAndImportConfig2_Title").textContent = localeText.DB_exportImport.import_title;
                RootShadow.getElementById("ExportAndImportConfig2-1_SpanText").textContent = localeText.DB_exportImport.import_file;
                RootShadow.getElementById("ExportAndImportConfig2-2_Button").textContent = localeText.DB_exportImport.import_textArea;
                RootShadow.getElementById("ExportAndImportConfig2-3_SpanText").textContent = localeText.DB_exportImport.import_addImport;
                RootShadow.getElementById("ExportAndImportConfig2_SpanText").textContent = localeText.DB_exportImport.import_success;
                RootShadow.getElementById("ExportAndImportConfig3_Title").textContent = localeText.DB_exportImport.textArea_title;
                RootShadow.getElementById("ExportAndImportConfig_BackButton").textContent = localeText.backButton;

                const ExportSuccessTextEle = RootShadow.getElementById("ExportAndImportConfig1_SpanText");
                const ImportSuccessTextEle = RootShadow.getElementById("ExportAndImportConfig2_SpanText");
                const TextareaEle = RootShadow.getElementById("ExportAndImportConfig3_Textarea");
                const addImport_ELe = RootShadow.getElementById("ExportAndImportConfig2-3_Input");

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
                        let res;
                        if (addImport_ELe.checked) {
                            res = await popup.confirm(localeText.DB_exportImport.import_addImportConfirm);
                        } else {
                            res = await popup.confirm(localeText.DB_exportImport.import_overWrite);
                        }
                        if (!res) {
                            targetElement.value = "";
                            return false;
                        }
                        const file = targetElement.files[0];
                        const reader = new FileReader();
                        reader.onload = async (evt) => {
                            let result;
                            if (addImport_ELe.checked) {
                                result = await DB_ExportImport_JSONFormat("addimport", evt.target.result);
                            } else {
                                result = await DB_ExportImport_JSONFormat("import", evt.target.result);
                            }
                            if (result) {
                                ImportSuccessTextEle.style.display = "block";
                            }
                        }
                        reader.readAsText(file);
                        targetElement.value = "";
                    }
                });

                RootShadow.getElementById("ExportAndImportConfig2-2_Button").addEventListener("click", async () => {
                    let res;
                    if (addImport_ELe.checked) {
                        res = await popup.confirm(localeText.DB_exportImport.import_addImportConfirm);
                    } else {
                        res = await popup.confirm(localeText.DB_exportImport.import_overWrite);
                    }
                    if (!res) {
                        return false;
                    }

                    let result;
                    if (addImport_ELe.checked) {
                        result = await DB_ExportImport_JSONFormat("addimport", TextareaEle.value);
                    } else {
                        result = await DB_ExportImport_JSONFormat("import", TextareaEle.value);
                    }
                    if (result) {
                        ImportSuccessTextEle.style.display = "block";
                    }
                }, false);

                RootShadow.getElementById("ExportAndImportConfig_BackButton").addEventListener("click", () => {
                    Dashboard_Window_Ele_stack.pop().remove();
                    ArrayLast(Dashboard_Window_Ele_stack).style.display = "";
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
        margin: 8px 0 0 0;
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
            <option id="PerformanceConfig1_Select_Option3" value="performance1"></option>
            <option id="PerformanceConfig1_Select_Option4" value="performance2"></option>
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
                `;
                DashboardMain_div.append(DB_performanceConfig_div);
                Dashboard_Window_Ele_stack.push(DB_performanceConfig_div);

                RootShadow.getElementById("PerformanceConfig1_Title").textContent = localeText.DB_performanceConfig.mode_title;
                RootShadow.getElementById("PerformanceConfig1_Description1").textContent = localeText.DB_performanceConfig.mode_description1;
                RootShadow.getElementById("PerformanceConfig1_Description2").textContent = localeText.DB_performanceConfig.mode_description2;
                RootShadow.getElementById("PerformanceConfig1_Description3").textContent = localeText.DB_performanceConfig.mode_description3;
                RootShadow.getElementById("PerformanceConfig1_Description4").textContent = localeText.DB_performanceConfig.mode_description4;
                RootShadow.getElementById("PerformanceConfig1_Select_Option1").textContent = localeText.DB_performanceConfig.blockPriority;
                RootShadow.getElementById("PerformanceConfig1_Select_Option2").textContent = localeText.DB_performanceConfig.balance;
                RootShadow.getElementById("PerformanceConfig1_Select_Option3").textContent = localeText.DB_performanceConfig.performancePriority1;
                RootShadow.getElementById("PerformanceConfig1_Select_Option4").textContent = localeText.DB_performanceConfig.performancePriority2;

                RootShadow.getElementById("PerformanceConfig2_Title").textContent = localeText.DB_performanceConfig.interval_title;
                RootShadow.getElementById("PerformanceConfig2_Description1").textContent = localeText.DB_performanceConfig.interval_description1;
                RootShadow.getElementById("PerformanceConfig2_Description2").textContent = localeText.DB_performanceConfig.interval_description2;
                RootShadow.getElementById("PerformanceConfig2_Description3").textContent = localeText.DB_performanceConfig.interval_description3;
                RootShadow.getElementById("PerformanceConfig2_input1_SpanText").textContent = localeText.DB_performanceConfig.balance;
                RootShadow.getElementById("PerformanceConfig2_input2_SpanText").textContent = localeText.DB_performanceConfig.performancePriority1;
                RootShadow.getElementById("PerformanceConfig2_input3_SpanText").textContent = localeText.DB_performanceConfig.performancePriority2;

                RootShadow.getElementById("PerformanceConfig3_Title").textContent = localeText.DB_performanceConfig.overRide_title;
                RootShadow.getElementById("PerformanceConfig3_Description1").textContent = localeText.DB_performanceConfig.overRide_description1;
                RootShadow.getElementById("PerformanceConfig3_Description2").textContent = localeText.DB_performanceConfig.overRide_description2;
                RootShadow.getElementById("PerformanceConfig3_Select1_SpanText").textContent = localeText.DB_performanceConfig.disable;
                RootShadow.getElementById("PerformanceConfig3_Select2_SpanText").textContent = localeText.DB_performanceConfig.performancePriority1;
                RootShadow.getElementById("PerformanceConfig3_Select3_SpanText").textContent = localeText.DB_performanceConfig.performancePriority2;
                RootShadow.getElementById("PerformanceConfig3_Select4_SpanText").textContent = localeText.DB_performanceConfig.blockPriority;
                RootShadow.getElementById("PerformanceConfig3_Select5_SpanText").textContent = localeText.DB_performanceConfig.balance;

                RootShadow.getElementById("PerformanceConfig_BackButton").textContent = localeText.backButton;
                RootShadow.getElementById("PerformanceConfig_SaveButton").textContent = localeText.DB_performanceConfig.save;
                RootShadow.getElementById("PerformanceConfig_SaveInfoText").textContent = localeText.DB_performanceConfig.saveInfo;


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
                    ArrayLast(Dashboard_Window_Ele_stack).style.display = "";
                    DashboardMain_div.scroll({ top: 0 });
                }, false);
            }


        }
    }

})();

