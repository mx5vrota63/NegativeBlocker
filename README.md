# NegativeBlocker

(日本語の説明は英語の後にあります。)  
(This text is a machine translation of a Japanese original into English.)

NegativeBlocker is a user script for pre-blocking negative or sensitive information on the Web.  
You can register your own negative or sensitive words, and if they match, you can delete or replace a sentence or remove an element.  
URLs can also be registered, and it is compatible with the uBlacklist format (Beta).

## How to install

### Windows, Mac, ChromeOS, Linux

1. Install the user script manager that corresponds to the browser you are using.

| UserScript Extension | Chrome                                                                                               | Firefox                                                           | Edge                                                                                                        |
| -------------------------- | :--------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Tampermonkey               | [Install](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)   | [Install](https://addons.mozilla.org/firefox/addon/tampermonkey)  | [Install](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)  |
| Violentmonkey              | [Install](https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag) | [Install](https://addons.mozilla.org/firefox/addon/violentmonkey) | [Install](https://microsoftedge.microsoft.com/addons/detail/violentmonkey/eeagobfjdenkkddmbclomhiblgggliao) |
| Greasemonkey               | ------                                                                                               | [Install](https://addons.mozilla.org/firefox/addon/greasemonkey)  | ------                                                                                                      |

(Only one user script manager should be installed.)

2. Click on the installation link below.

[Install](https://raw.githubusercontent.com/mx5vrota63/NegativeBlocker/main/NegativeBlocker.user.js)

Click Install to display the installation confirmation screen, and follow the instructions to install the user script.

### Android (Firefox Beta & Fennec & Iceraven)

[Firefox Beta](https://play.google.com/store/apps/details?id=org.mozilla.firefox_beta) is somewhat unstable.  
[Fennec](https://f-droid.org/packages/org.mozilla.fennec_fdroid) is an F-Droid application outside of Google Play.  
[Iceraven](https://github.com/fork-maintainers/iceraven-browser) is a non-Google Play application. We recommend that you install it from [FFUpdater](https://f-droid.org/packages/de.marmaro.krt.ffupdater) on F-Droid. It is easy to install and will notify you when there is an update.

1. Configure to use any add-on.([Reference](https://blog.mozilla.org/addons/2020/09/29/expanded-extension-support-in-firefox-for-android-nightly)) (Iceraven does not require any operation.)
   1. Tap on the three dot menu and select "Settings".
   2. Select "About Fennec" (About Firefox Beta) at the bottom.
   3. Tap the logo icon five times in succession. When the "Debug menu enabled" message appears, go back to the previous screen.
   4. "Custom Add-on collection" will appear in the "Advanced" column, select it.
   5. Enter the following information in the input field and tap "OK".

| Key                                | Value            |
| ----------------------------------- | :------------ |
| Collection owner (User ID) | 16344738 |
| Collection name | FFCustomAddon |

2. After restarting the app, tap on the three dot menu and select "Settings".
3. Select Add-ons in the "Advanced" column and install the user script manager of your choice from the list. (One of Tampermonkey or Violentmonkey).
4. Tap on the installation link below.

[Install](https://raw.githubusercontent.com/mx5vrota63/NegativeBlocker/main/NegativeBlocker.user.js)

Tap Install to display the installation confirmation screen, and follow the instructions to install the user script.

### iOS & iPadOS

~~Since this user script uses inherent storage APIs such as GM.setValue, there are currently no browsers that support them, to my knowledge.  
We will update this content when a user script manager that supports GM functions is available in the App Store, as iOS 15 now supports the extension.~~  
2022/11/6 Update  
The User Script Manager is now supported in Safari on iOS 15 or later, and the installation procedure is described below.

1. Install "Userscripts" from the AppStore.  
https://itunes.apple.com/us/app/userscripts/id1463298887
2. Refer to the next page to enable the use of user scripts.  
https://github.com/quoid/userscripts#usage
3. Tap the following link strongly and tap "Download Linked File".  

[Download](https://raw.githubusercontent.com/mx5vrota63/NegativeBlocker/main/NegativeBlocker.user.js)  

4. From the home screen, launch the "Files" app, locate the downloads folder,  
Move the "NegativeBlocker.user.js" to the "Set Userscripts Directory" folder that you set up in the "Userscripts" app.
5. Launch Safari and load the page to use it.  
(If NegativeBlocker does not load, exit Safari from the App Switcher and launch it again.)

Note: Safari on iOS and iPadOS has not been fully tested. Therefore, there may be Safari-specific bugs.  

## Usage

When you install the software and go to any page, a button will appear in the upper right corner. From there, you can configure various settings.  
As an example, I will explain how to block a sentence on the web that contains a certain word.

1. Go to "Settings page" -> "BlockListText Config" , "New" Click the button.
2. Enter a name, and click the "Settings editing" button.
3. In the text area, enter the word you want to block.
4. Click the "←Back" button at the bottom, and then click the "Save" button. After saving, click the "←Back" button.
5. Click "SentenceBlock Config" and then click the "New" button.
6. As in step 2, enter a name, and then click the "Settings editing" button.
7. From the list in the "BlockListText" column, select the name of the block list text setting you made in 2~4.
8. Enter the strings to be replaced in the "Replace string" field.
9. Click the "←Back" button at the bottom, and then click the "Save" button.
10. The next time you load the page, the sentence blocking feature will work.

As a sample, a pre-configured JSON file is also available. Right-click on the link below and click "Save Link As" to download the JSON file.  
To import the JSON file, click the button in the upper right corner of the screen, click "Settings" -> "Preferences" -> "Export & Import", and import the JSON file from the "Import from JSON file" field.  
(The settings are current as of October 9 2021, in the author's environment. The sample settings may not work due to changes in the site specifications.)  
(If you are using a Firefox-based browser on Android, you will need to have the [Google Search Fixer](https://addons.mozilla.org/firefox/addon/google-search-fixer) add-on installed.)

[Sample settings (for desktop)](https://raw.githubusercontent.com/mx5vrota63/NegativeBlocker/main/SampleJSON/NagativeBlocker_Sample_en_Desktop.json)  
[Sample settings (for mobile)](https://raw.githubusercontent.com/mx5vrota63/NegativeBlocker/main/SampleJSON/NagativeBlocker_Sample_en_Mobile.json)  

## Q&A

- It does not work on https://example.com/.  
  The button disappears and I can't access the dashboard anymore.

https://example.com/ is a page that runs in safe mode, which means that it will not run outside of the dashboard screen.  
In the unlikely event that you are unable to access the dashboard screen due to a configuration error, you can go to https://example.com/ and delete the offending configuration.  
Note that due to a bug in the user script, it may not work even in safe mode, so we recommend that you export and back up your data periodically. (If it doesn't work even in safe mode, you need to uninstall NegativeBlocker once and erase all data.)

- No block operation is performed.

It could be a bug in the user script, but it is more likely to be caused by a misconfiguration.  
In particular, the settings for element blocks are somewhat difficult to understand, so beginners should try setting them from the text block.  
Also, text on images and videos are not covered.

## Known Issues

1. Overall, the browser runs slower (especially on pages with a very large amount of text).
2. When using the extension "Dark Reader", the color of the dashboard cannot be changed and is fixed at yellow.
3. Buttons to access the dashboard become unresponsive on some pages.
4. Cannot select an element in an "iframe" in the element picker

## Why is the Issues field on GitHub disabled? (How can I make a pull request?)

Sorry. I have disabled the Issues field because I can't have a conversation with an unspecified number of people.  
The reason I created the user script is because I have a mental illness that makes me very sensitive to negative emotions (especially anger).  
However, the Internet is full of anger and hatred, especially on social media. In order to protect myself from this information, I tried the solutions described in the "Credits & Special Thanks" section, but I found them lacking in many areas, so I used them as a reference to develop this user script.  
Then, I decided to open it up to the public for now, hoping it would help someone else.  
Please note that we do not accept pull requests for the same reason.  
Still, if you want to improve this project, create a new repository and fork this project (Do not use GitHub's fork feature! Issues invalidation settings will also be fork.), Open Issue and Pull Request.

## Credits & Special Thanks

In order to create NegativeBlocker, I used the following solutions and others as references.

- [WebAborn](https://webaborn.herokuapp.com/) (I used part of the source code.(I guessed MIT License from the content of README.txt of the [desktop version](https://web.archive.org/web/20210113184513/https://github.com/itouhiro/webaborn/).))
- [CustomBlocker](https://github.com/maripo/CustomFilter) (I referred to UI, etc.)
- [uBlacklist](https://github.com/iorate/uBlacklist) (I used the UI and list format as a reference.)
- [xPath Finder](https://github.com/trembacz/xpath-finder) (I used part of the source code.)
- Great articles on [Qiita](https://qiita.com/),[StackOverflow](https://stackoverflow.com/),Other Blogs.

## License

[MIT License](LICENSE)

# NegativeBlocker

NegativeBlocker は、Web 上のネガティブやセンシティブな情報を事前にブロックするためのユーザースクリプトです。  
ネガティブワードやセンシティブワードを、自分で登録し、そのワードと一致する場合、一文章を削除または置換えたり、要素を削除することができます。  
URL も登録可能で、uBlacklist 形式と互換性があります(Beta)。

## インストール方法

### Windows、Mac、ChromeOS、Linux

1. 利用しているブラウザに対応するユーザースクリプトマネージャーをインストールします。

| ユーザースクリプト拡張機能 | Chrome                                                                                               | Firefox                                                           | Edge                                                                                                        |
| -------------------------- | :--------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Tampermonkey               | [Install](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)   | [Install](https://addons.mozilla.org/firefox/addon/tampermonkey)  | [Install](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)  |
| Violentmonkey              | [Install](https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag) | [Install](https://addons.mozilla.org/firefox/addon/violentmonkey) | [Install](https://microsoftedge.microsoft.com/addons/detail/violentmonkey/eeagobfjdenkkddmbclomhiblgggliao) |
| Greasemonkey               | ------                                                                                               | [Install](https://addons.mozilla.org/firefox/addon/greasemonkey)  | ------                                                                                                      |

(インストールするユーザースクリプトマネージャーは一つだけにしてください。)

2. 下にあるインストールのリンクをクリックしてください。

[Install](https://raw.githubusercontent.com/mx5vrota63/NegativeBlocker/main/NegativeBlocker.user.js)

Install をクリックするとインストール確認画面が表示されますので、指示に従ってインストールしてください。

### Android (Firefox Beta & Fennec & Iceraven)

[Firefox Beta](https://play.google.com/store/apps/details?id=org.mozilla.firefox_beta) は動作がやや不安定です。  
[Fennec](https://f-droid.org/packages/org.mozilla.fennec_fdroid) は Google Play 外の F-Droid アプリケーションとなります。  
[Iceraven](https://github.com/fork-maintainers/iceraven-browser) は Google Play 外のアプリケーションです。インストールする際は、 F-Droid にある [FFUpdater](https://f-droid.org/packages/de.marmaro.krt.ffupdater) からインストールすることをおすすめします。インストールが簡単にでき、アップデートがあった際に通知をしてくれます。

1. 任意のアドオンを使えるよう設定します。([参考](https://blog.mozilla.org/addons/2020/09/29/expanded-extension-support-in-firefox-for-android-nightly)) (Iceravenは操作不要)
   1. 3 つのドットメニューをタップし、「設定」を選択します。
   2. 一番下にある「Fennec について」(Firefox Beta について)を選択します。
   3. ロゴアイコンを 5 回連続タップします。「デバッグメニューが有効です」が表示されたら、1 つ前の画面に戻ります。
   4. 「詳細設定」の欄に「カスタムアドオンコレクション」が表示されるので、選択します。
   5. 入力欄に次の内容を入力して「OK」をタップします。

| 項目                                | 値            |
| ----------------------------------- | :------------ |
| コレクションの所有者（ユーザー ID） | 16344738      |
| コレクション名                      | FFCustomAddon |

2. アプリの再起動後、3 つのドットメニューをタップし、「設定」を選択します。
3. 「詳細設定」欄にあるアドオンを選択し、一覧から好みのユーザースクリプトマネージャーをインストールします。(Tampermonkey、Violentmonkey のどれか一つ)
4. 下にあるインストールのリンクをタップしてください。

[Install](https://raw.githubusercontent.com/mx5vrota63/NegativeBlocker/main/NegativeBlocker.user.js)

Install をタップするとインストール確認画面が表示されますので、指示に従ってインストールしてください。  
(Fennec を使用している場合、アドオンの設定画面などが英語で表示されてしまう問題がありますが、NegativeBlocker は Settings page → Preferences Config → Dashboard language から日本語で表示できます。)

### iOS & iPadOS

~~このユーザースクリプトには、GM.setValue などの固有のストレージ API を使用しているため、現在のところ、それらをサポートするブラウザは私の知る限り、存在しません。  
iOS 15 で拡張機能がサポートされたため、GM 関数をサポートするユーザースクリプトマネージャーが App Store で配信されたら、この内容をアップデートします。~~  
2022/11/6 追記  
iOS 15以降のSafariでユーザースクリプトマネージャーに対応しましたのでインストール手順を解説します。

1. AppStoreから "Userscripts" をインストールします。  
https://itunes.apple.com/us/app/userscripts/id1463298887
2. 次のページ（英語）を参考にユーザースクリプトを使用できるようにします。  
https://github.com/quoid/userscripts#usage
3. 次のリンクを強くタップし、"リンク先のファイルをダウンロード"をタップしてください。  

[ダウンロード](https://raw.githubusercontent.com/mx5vrota63/NegativeBlocker/main/NegativeBlocker.user.js)  

4. ホーム画面から "ファイル" アプリを起動し、ダウンロードフォルダを探し、"NegativeBlocker.user.js"を  
"Userscripts"アプリで設定した"Set Userscripts Directory"のフォルダに移動します。
5. Safariを起動してページを読み込むと、使用できるようになります。  
(NegativeBlockerが読み込まれない場合はマルチタスク画面(App Switcher)からSafariを一度終了させて再度起動してください。)

注意：iOS及びiPadOSのSafariは十分な動作テストをしていません。そのためSafari固有のバグがある可能性があります。

## 使い方

インストールし、適当なページを表示すると、右上にボタンが出現します。そこから各種設定を行っていきます。  
例として Web 上文章に特定のワードが含まれている場合、その一文章をブロックする設定を解説します。

1. 「設定画面」→「ブロックリストテキストを設定する」 に進み、「新規追加」ボタンをクリックします。
2. 名前を入力し、「設定編集」ボタンをクリックします。
3. テキストエリアにブロックしたいワードなどを入力していきます。
4. 一番下にある「← 戻る」ボタンをクリックし、「保存」ボタンをクリックします。保存したら「← 戻る」ボタンをクリックします。
5. 「文章ブロック機能を設定する」をクリックし、「新規追加」ボタンをクリックします。
6. 2.と同じように、名前を入力し、「設定編集」ボタンをクリックします。
7. 「ブロックリストテキスト」欄のリストから、2~4.で設定したブロックリストテキスト設定の名前を選択してください。
8. 「置換文字」の欄に置換する文字を入力します。
9. 一番下にある「← 戻る」ボタンをクリックし、「保存」ボタンをクリックします。
10. 次回以降、ページを読み込みすると、文章ブロック機能が動作するようになります。

サンプルとして、設定済みの JSON ファイルも用意しています。下記のリンクを右クリックし、「名前を付けてリンク先を保存」を保存をクリックすると、JSON ファイルがダウンロードできます。  
インポートする場合は、右上のボタンから、「設定画面」→「環境設定」→「エクスポート&インポート」をクリックし、「JSON ファイルからインポート」欄から JSON ファイルをインポートしてください。  
(設定内容は作者の環境で、 2021/10/9 現在の物になります。サイト側の仕様変更などにより、サンプルの設定が動作しない場合があります。)  
(AndroidのFirefox系のブラウザを使用している場合、 [Google Search Fixer](https://addons.mozilla.org/firefox/addon/google-search-fixer) アドオンがインストールされている必要があります。)

[設定サンプル(デスクトップ用)](https://raw.githubusercontent.com/mx5vrota63/NegativeBlocker/main/SampleJSON/NagativeBlocker_Sample_ja_Desktop.json)  
[設定サンプル(モバイル用)](https://raw.githubusercontent.com/mx5vrota63/NegativeBlocker/main/SampleJSON/NagativeBlocker_Sample_ja_Mobile.json)  

## Q&A

- https://example.com/ では動作しません。  
  ボタンが消えてしまい、ダッシュボードにアクセスできなくなりました。

https://example.com/ はセーフモード動作するページとなっており、ダッシュボード画面以外の動作はしないようになっています。  
万が一設定ミスなどで、ダッシュボード画面にアクセスできなくなった場合は、 https://example.com/ にアクセスし、問題のある設定を削除することができます。  
なお、ユーザースクリプトのバグにより、セーフモードでも動作しない場合もありますので、定期的にエクスポートして、バックアップすることをおすすめします。(セーフモードでも動作しない場合は一度 NegativeBlocker をアンインストールし、すべてのデータを消去する必要があります。)

- ブロック動作が行われません。

このユーザースクリプトのバグの可能性もありますが、多くの場合、設定ミスが原因と思われます。  
特に、要素ブロックの設定はやや難解であるため、初心者の方は文章ブロックから設定してみてください。  
また、画像や動画上の文字やニコニコ動画の画面上に流れてくるコメントなどは対象外です。

## 既知の問題

1. 全体的に、ブラウザの動作が遅くなる(特に文章量が非常に多いページ)
2. 拡張機能「DarkReader」を使用するとダッシュボードの色変更ができなくなり、黄色で固定される
3. 一部のページでダッシュボードにアクセスするためのボタンが反応しなくなる
4. 要素選択で iframe 内の要素を選択できない

## なぜ GitHub の Issues 欄は無効になっているのですか？(Pull request をしたいのですが？)

ごめんなさい。私は不特定多数の人のコミュニケーションができないため、Issues 欄を無効化しています。  
そもそもこのユーザースクリプトを制作したきっかけは、私は負の感情(特に、怒りの感情)をとても強く受けてしまう、精神疾患を抱えています。  
しかし、インターネットは SNS を中心に、怒りや憎しみで溢れかえっています。これらの情報から自分の身を守るため、「クレジット&スペシャルサンクス」のところに書かれているソリューションなどを試して見ましたが、物足りないところが多々あったため、参考にしつつ、このユーザースクリプトの開発に取り組みました。  
そしてとりあえず一般公開して誰かの助けになればと思い、一般公開に至りました。  
同様の理由で、Pull request を頂いても、受け付けておりませんのでご了承ください。  
それでも、このプロジェクトを改善したい場合は、新しいリポジトリを作成して、このプロジェクトをフォークし(GitHub の Fork 機能は使用しないでください！ Issues 無効化設定まで Fork されてしまいます。）、その新しいリポジトリ上で Issue や Pull request を開いてください。

## クレジット&スペシャルサンクス

NegativeBlocker を制作にあたり、次のソリューションなどを参考にさせてもらいました。

- [WebAborn](https://webaborn.herokuapp.com/) (ソースコードの一部を使用([デスクトップ版](https://web.archive.org/web/20210113184513/https://github.com/itouhiro/webaborn/)の README.txt の内容から MIT License と推測))
- [CustomBlocker](https://github.com/maripo/CustomFilter) (UI などを参考)
- [uBlacklist](https://github.com/iorate/uBlacklist) (UI やリストの形式などを参考)
- [xPath Finder](https://github.com/trembacz/xpath-finder) (ソースコードの一部を使用)
- 優良な記事だった [Qiita](https://qiita.com/)、[StackOverflow](https://stackoverflow.com/)、その他ブログ

## ライセンス

[MIT License](LICENSE)
