## [1.12.1](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.12.0...v1.12.1) (2026-09-06)


### Bug Fixes

* Harden injection security ([#28](https://github.com/Gadzzaa/TrenchersPaperTrading/issues/28)) ([7ae5ae5](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7ae5ae576356a7f8b9bc3fda5e977e1b29750cef))
* harden injection's security ([7dd68a8](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7dd68a87e6a6a3056f891ff47af74de57b649ee8))

# [1.12.0](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.11.0...v1.12.0) (2026-09-05)


### Bug Fixes

* After logout, balance now updates ([ff4f975](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ff4f97558c21328592a29785c3967e560c77a7b7))
* BackendRequest would not retry if token expired ([7898fd2](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7898fd2f0a7f99c170709666029069448f803739))
* balanceValue could return null ([65ee605](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/65ee605b31efdc09610b1a04b44b7c117c245836))
* cachedSolBalance still existed after refactor ([854c886](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/854c886d571b060ccba00fd7d9ea7388f1420f0e))
* Chrome message could not send correctly ([da91704](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/da91704df3ac1a9c679a8bafb7deb2b5960b39a8))
* Dashboard would open without data syncing first ([2e4a988](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/2e4a98801e82a41914abe8c2de5f9d3febe8bacf))
* **Dashboard/StateManager:** double logs for error ([5e8a0b7](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/5e8a0b77af9193ae56f6efaf8aab96002d2c2d10))
* **Dashboard/StateManager:** double logs for error ([2cd96b1](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/2cd96b14703dec50b166d35c1a7361f0d680e57f))
* Duplicate permissions on release ([af39af4](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/af39af495d58d20408b5f336888ed0d046f70372))
* Edit-mode inconsistent display of value ([ae7beae](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ae7beae84e364d7999d45b61ea5ad42adc1344d9))
* Health would always return true or false if it previously returned the same ([a0a9d3d](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/a0a9d3dbbae7fb91c28d8a86fa26a5ff657ea39e))
* **InitHelper:** Remove redundant try/catch ([ead1fe2](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ead1fe2cd38bb9161a72af0a019746d5587612e9))
* Logout doesnt clear openPositions ([04a3d1b](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/04a3d1bd9f9b54b820e3ec3fbb107e9f1e5abe31))
* Messages between popup and service worker would not pass ([5482c16](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/5482c16aef94fba3e7fa4f7e695832fa40a8d389))
* **NotificationHelper:** if no sound was passed in parameters, error could occur ([456421c](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/456421c6b592a4178af4cfa420ca434d22a60a0a))
* PNLDataManager ([c4f54e9](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/c4f54e90a71ec36d06bc7fe5b185bf775d7ddf98))
* **PNLService:** double logs in case of error ([96e1aa8](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/96e1aa8b13c75bdf4a0821401caacfaa418806f2))
* **PNLService:** setActiveToken should handle errors locally ([3cdd975](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/3cdd97504f03ba7d4017f92bccbeadbfaea0f7b9))
* **PNLService:** this.lastUpdateTime never updated ([a814d83](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/a814d83325aa9f4ef75a144fd953c391d5e665ce))
* Popup would bring Notification if error occured ([1521c3b](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/1521c3b7da5676a73f5361f0a708dfbce84204ae))
* **PresetManager:** double logs in case of error ([338e0ab](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/338e0ab39c0a2757596015308ef9e8559fc363cc))
* Prices being display in dollars instead of euros ([ef68a79](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ef68a79249ea6e941d336c10e4dfea0b28421ecb))
* Rewatching token posiblity if sold 100% ([30550fa](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/30550fa3091abde24d475f2ada83e3c9404fd131))
* TradeLog not imported, causing lag ([ff18498](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ff18498fbf4dc0d593b368f7b3e05354634037db))
* **UIConfig:** Clear positions could receive pnlService is null ([f54c340](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/f54c340697f6757014da2b13731a4a0ea7241ac0))
* User holds token > User Resets Account > Token Sells Tab still active ([a36025f](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/a36025f6c8f607cbef6a9f3484c91520637a9e5e))


### Features

* API Class to manage API requests and accessToken ([3a2959d](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/3a2959da48d18d5cfe771ae9adbce81104d1b6eb))
* API request function to call requests ([26e5e73](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/26e5e73d0a4b5f9173b823ccad98ca55fb6ebdf2))
* AuthNotification validator for notifs ([204cb1d](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/204cb1d3a6cdeabb0b4ec1825be49260bad47901))
* Block actions when WS not connected ([4e93677](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/4e9367724ce51ae99cac671421f931347acc2b58))
* Blocker for multiple sessions ([a8826b8](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/a8826b85a1c4072148af6eaeabd14559bb1d55bb))
* Blocker for multiple-sessions ([#23](https://github.com/Gadzzaa/TrenchersPaperTrading/issues/23)) ([5343159](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/53431595d2c4b5872484032c9a1ad772ff4e21d9))
* Finished new API class ([9dfc798](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/9dfc798664972b8e71af4599556d490b36a1d98c))
* Func isTrustedInternalSender inside ChromeHandler ([b1ac837](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/b1ac837a216ab3114931d6ba865a216e62aa3966))
* Handle notifications only when workerRevision is valid ([ec1b8cb](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ec1b8cbbb475ddd7fd10561b2668b74116935621))
* Implement basic notifications with worker revision ([8db09b1](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/8db09b137651d56c0688268ba66433aceccf5fa2))
* Implement error handling with try/catch ([abe1d3f](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/abe1d3f22083a67d3fce570bbff7c626ff3aea5e))
* Implement new functions in the AccountLoader ([3b0cc40](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/3b0cc405840fcdbb1677f19fc793d85a135208b7))
* Implement the functions in ActionHelper and BalanceUpdater ([7a45c49](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7a45c4918685c30ecba3ceb75f58f881bdc4af88))
* Implement the new API in DataManager ([24b1fb3](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/24b1fb389a05e87eb34b0f47da0913a2bf10480b))
* Implement the new API in popup ([efdc05c](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/efdc05c06ad23f4cb2062daf3a955534fc1b3bd8))
* Implement the new API in SettingsManager ([0da02c7](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/0da02c701f435d90ca4fcfd3396d7c3c709dd8a2))
* Implement the new API in Subscriptions Manager ([e0f9057](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/e0f9057f79fcd49a32f394170172f9414a32d0c3))
* Implement the new API inside ServerStatus and ServerValidation ([dcb421b](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/dcb421bdd5d4620f9eab1833b30a3d9bd64d3a33))
* Implement the new API inside transaction manager ([1a5e105](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/1a5e105389146e377b545364d2c1a66ca4a8755e))
* Implement the new auth function from API ([0557037](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/055703738ededfa9ded37ec7166e4d6f32b12a83))
* Implement the new functions in popup helpers ([33b6ec1](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/33b6ec13c3d01bd71c41fbd9873ba029615180ab))
* Implement the new functions inside InitHelper ([21f7d46](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/21f7d46d18889ce014fc78d0b282007d58aa39df))
* Implement the updated function in IntervalHelper ([64b86d9](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/64b86d908b3b6e7d4c49331dd97d25d187243e82))
* Implement the updated functions in PNLService ([f49df2e](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/f49df2e10b2ee06e866e48113e0ddec30a43a332))
* Implementation of refresh during a request ([f929a86](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/f929a86d9e4b346a1278cdd8cdda826bceaca642))
* JWT Refresher functions ([e805159](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/e8051592e4feb5c92fb377703e76d1a66a655a9b))
* Migration Logic for poolAddress ([1860394](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/1860394dbf2f8759a3429233c2d5a2ddeb0fdbf8))
* MultipleWebsockets & WS Limits ([1915950](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/19159503c2a782fb9e572485c32dc5b0d8f7f20c))
* MultipleWebsockets support ([#22](https://github.com/Gadzzaa/TrenchersPaperTrading/issues/22)) ([ec0e3df](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ec0e3dfb9a7b92ec2843edaefbaa86ad6137dc7a))
* SubscriptionSelector redesign ([1ca9060](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/1ca9060b0129fc02b5fc4c48606ed0cc9b547c94))
* Worker to manage Auth Calls across Popup and Dashboard ([1e73328](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/1e733289101bd84e62a1a28fe93443307d15c494))


### Performance Improvements

* setPositions() & getPositions() ([c06b4aa](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/c06b4aa5d2607d62a30e7a6f04996156500ec656))
* syncTradeLog() ([83b3b58](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/83b3b582f8ed322cc966f77e71184c287cb017ac))

# [1.11.0](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.10.1...v1.11.0) (2026-04-24)


### Bug Fixes

*  getPresets called wrong ([8d4d074](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/8d4d0740dd34ef4781fb016d1345f9ce18778f8f))
* Adding a cause for errors in BackendReq ([aa5bfb3](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/aa5bfb3a62f66b96acf259ce247e6bafb5e80cd9))
* applyPreset using old format ([68417f5](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/68417f5a2759fc6ba53f8bfc711fc708a21e006b))
* Backend error not parsed through correctly ([c14d2c4](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/c14d2c470f8d1938a4da34fd7b7907c56259dc8e))
* Backend now returns the correct code for error ([b6a9c85](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/b6a9c85d274e2ecb588441c68b5a6e2e7f2708fc))
* BackendReq ([de795d4](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/de795d412a58406944d83e1871eebcceabea88a0))
* BackendRequest ([633b7f0](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/633b7f0de43e081e407647bbef24bff63be56078))
* BalanceUpdater ([36cbd3d](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/36cbd3d3436c92eeee4c01c2d93a723808a3e83f))
* clear was not clearing the UI completely ([e369b94](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/e369b94cf27ee475822827cc17000b5c04058f1c))
* Data not loaded after resetting account ([54d5e3c](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/54d5e3c063cb2a3f7caabb09f495c3163b44662b))
* Data Validation always throws ([494cdeb](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/494cdeb198fbf7f6de0ef810cc7f805d20503f29))
* Dialog message wrongfully checked ([8e2dd59](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/8e2dd59518fab33e8117a4c3f316919e749a3dda))
* Double Stringifying ([650004b](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/650004b380fdb305c61b1ac97ddead474a60cb38))
* Draggable zone was a little too small ([cefed37](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/cefed37903b46ae9ea07f071d0b62ecfc71da453))
* ErrorHandler imports ([6f07d21](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/6f07d217a088f920a5449a48d523154d0c40ce87))
* execNotification ([f7f8d59](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/f7f8d596962b7cf0e4ce92d3c3b1ad1b6f05090c))
* Imports missing .js, and wrong paths ([69c1140](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/69c114081274f2d79590c10ef947bbf13b0ed208))
* isActive() func inside PNLService ([0c87c1b](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/0c87c1b91d399586aed4dc505401daa35b0bcaf2))
* Load data in stateManager after init ([54e5145](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/54e5145a021bc82cc55909cb20c1f2ece30306a1))
* Login fails with the updates to BackendReq ([15a74a7](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/15a74a71deb221822b132a909196bcdc33022819))
* Make methods static ([df1eac6](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/df1eac66b8d3aa6219b0abcf506847e961cf23e9))
* make setQualityPreset static ([d62fb7a](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/d62fb7acfc29bf4ea55e58643483d2dbcaa0c011))
* Manifest version checker ([bae43ab](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/bae43ab5be5ecc95eacbbd91b139752065005fc7))
* methods being instance instead of static ([1972ec6](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/1972ec63a1c02284aab96ceeac518bc94ce49b01))
* NotificationHelper ([7bc7a17](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7bc7a17c305365cf20daf9b723efd020991e3f8b))
* NotificationManager ([9beaf65](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/9beaf6591149c69a61944f3b2cee7552515972a8))
* openPositions was not called correctly ([95ed4fa](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/95ed4fad8cae6c9e602cf68c906f9bbac6ce8fe9))
* pnlDataArray was wrong called ([f593692](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/f593692a5eaf7542226972e2dff9edc04d7e8238))
* pnlSlider spamming API ([4137aaf](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/4137aafeb6dd693bfd03a8477da7cbdaa5e7b04b))
* pnlUpdates for tokens ([c192c3f](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/c192c3f51ef74d85ceb764af3aa3cb033b302c2d))
* Presets would not load preset1 as default ([eb46f80](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/eb46f807840b8a477a35ac192d7db069b9a7f009))
* promise was not resolving/rejecting correctly ([1ba7b9b](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/1ba7b9b78fb437c93bc673855ee90ac91db9ba68))
* Promises inside storageHelper ([abcb619](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/abcb61970155f75b082e586d60f424460ffd369e))
* Save preset inside stateManager after applying ([56db3ac](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/56db3acd1c859d93973acdef248e550c434161a1))
* ServerStatus import directory ([3e46cab](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/3e46cabe1bc4761aa33c8964706f0bb3efc714de))
* ServerValidation ([202049e](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/202049e1f1c8809761f273288b7de1e707fa9f46))
* showNotification was using old format ([f5c9f6c](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/f5c9f6c8c813f291dacd049a7d5c18e6a7a6de76))
* Temporary remove disableUI from fetch ([c7bdebe](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/c7bdebe9aa94fbd2924ccca0a36b4add4d28b0ad))
* toggleSellsTab, invalid quantity provided ([7af31c8](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7af31c85965d9015545f0cc5aaa2b70b960910cf))
* TradeLog doesnt rethrow error ([9b1f0bf](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/9b1f0bf916e6da7fe47fff1c108eb22fd4584257))
* UI Manager functions ([8d9dac8](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/8d9dac85db6ca9015ff670dccfeaa98f7a19ee03))
* Unhandled errors ([5ccc187](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/5ccc187b156c38d528e557a88390f318fc60f352))
* utils.js calls > Utils Class ([41f09be](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/41f09be5264012700cee550d50d06892cec156fb))
* Variables holding password, exploit possible ([73b7e87](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/73b7e87be9ffd18de72e933538a3a9b681a37cd3))
* WebsocketManager ([667fe78](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/667fe7827cd3549dc91a37f0e5feda41f0379e12))


### Features

* AccountValidator ([a9b30ea](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/a9b30eabb49f40948e36b2e8eddd116322e527a5))
* add a refreshTime var ([7199fa9](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7199fa97061adfdb1c66be8ff5153bc672827434))
* AuthManager ([27ba847](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/27ba847105fcb2ea757a2bd21b231b1d4146e47a))
* Background Health Checks ([ffcdce7](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ffcdce7f55cd347f68e497cfc90793eb2e52d4a1))
* Base Dashboard drawer ([7cfc4ed](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7cfc4ed0cec31b77ca16cba11c449d5d44989c2f))
* Basic Errors -> AppErrors and Handling ([545123e](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/545123e14d12d6c22b1c5e759c6fed3d6eaf1e2e))
* Dashboard refactor ([ace7ac8](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ace7ac8f3af4f90838879f836f7d8ad692049ce5))
* DataManager ([8cfac71](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/8cfac71d50f83575380d9c9179a1e3f9b9311e06))
* ErrorHandler supports popup now ([7611b77](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7611b77df1ccdb33a2f88e87328cf228146c15af))
* ErrorHandler.js ([46021c5](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/46021c50b88eeaba9aa74724e7d55228d9940257))
* Global Variables instead of localStorage ([e954a4d](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/e954a4deb2ee5fd2194cf8108a0c25caffa946eb))
* Implement ErrorHandling in classes ([3823101](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/382310160c6e6052393b1cab1b021a4428f29d99))
* JWT Tokens implementation ([9d70546](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/9d70546741c93e7d025407b1130fa9e22abcae8d))
* Modularized blocker dialog ([aebbfaa](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/aebbfaa04ed4e3b26ac1aab00900fa9602fb3498))
* Modularized blockers inside Popup ([63aba9e](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/63aba9e299028deb39b7b15a318e19873dc48a5a))
* More ErrorCodes added ([4057720](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/4057720858e689d154d0af24d58218a6452a3d53))
* pnlHandler > Classes, refactor ([6ab5630](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/6ab5630877925e18279b05d6f481be4453a49b2f))
* PNLHandler refactor ([04678fb](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/04678fbb83fbd36a5fa37f79b3bf6c8b711a229d))
* Popup now displays errors inside drawers ([ef7ac8b](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ef7ac8bbb42b5fc014d28a19e282d7470ad018a2))
* Preset Classes ([c13c5b8](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/c13c5b88c9b86401d2b60976917da69d07b0b10b))
* removeFromStorage func ([6b72bce](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/6b72bce11c9166ab4bd2ee5957f0df1beff8a51f))
* SettingsManager.js ([7e7d7c8](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7e7d7c83d7b086a7b4f8ed9a9bec2f64fa8abf88))
* stop() function ([85ceb29](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/85ceb2978e8707fdb30cc15b94539c143e7881a3))
* SubscriptionManager.js ([526ab7b](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/526ab7b1065273c1770196ca3f50167d70d938aa))
* TransactionManager ([9a215ad](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/9a215ad0632cac93c4909b0cccfc9b42f0ceb7d8))

## [1.10.1](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.10.0...v1.10.1) (2026-01-05)


### Bug Fixes

* temporary center the sub drawer ([da0334c](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/da0334c499891a00000629d478f0dae3640f6e96))

# [1.10.0](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.9.0...v1.10.0) (2026-01-05)


### Features

* Subscription Selector ([498f541](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/498f541a629b0dce6e539855d19b081b2dab50ff))

# [1.9.0](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.8.1...v1.9.0) (2026-01-04)


### Features

* Save Premium settings to DB ([a7f8db5](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/a7f8db57810a6da43bbe3402c3aba6d06b9e38f4))

## [1.8.1](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.8.0...v1.8.1) (2026-01-03)


### Bug Fixes

* Restrict premium features to premium ([4b2a911](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/4b2a911dd17afa48fd182b8ba4126555ddcac9d8))

# [1.8.0](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.7.0...v1.8.0) (2026-01-03)


### Bug Fixes

* Switching accounts doesnt reset text ([b86fc41](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/b86fc4184cc7ef3fd8a1d2ecfbaf79756de21f75))


### Features

* Ability to subscribe ([f94617a](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/f94617ab9196dc007462fc5fa90845c5487bd389))

# [1.7.0](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.6.1...v1.7.0) (2025-11-24)


### Bug Fixes

* Extension injection ([660f0b1](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/660f0b101d983b2b33dabadb2a29b5e811b6d7a8))
* Overflow in popup ([2906907](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/2906907871176aab3c5362db14fe4e17c9eece41))
* prevent publishing ([cc4ec15](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/cc4ec1550f74b436f5d32bb3733a9339c1bc8a44))


### Features

* new logo ([7bf91c9](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7bf91c98f999b54724f36d38189db3df64db292a))

## [1.6.1](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.6.0...v1.6.1) (2025-10-30)


### Bug Fixes

* Host issues ([7cd8a20](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/7cd8a20a695dad850f998eab5ada81961c1a7c90))
* permissions ([ecbfdde](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ecbfdde96ab3be6382f3ff414b6e4b7fab32d8c8))

# [1.6.0](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.5.2...v1.6.0) (2025-10-29)


### Bug Fixes

* remove rate limit for server calls ([c9d0c2d](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/c9d0c2d133802bc5c09378775ac69cb08b80522d))
* Server connection endpoints ([b96309f](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/b96309f5e4dfb45814c49e75802561f6631c85be))


### Features

* Implement comprehensive security and stability improvements for Chrome extension ([6f0df98](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/6f0df9860d3141da53f8b73e02293cfd0fdc8616))

## [1.5.2](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.5.1...v1.5.2) (2025-10-23)


### Bug Fixes

* publish to truster testers ([a8f4e8f](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/a8f4e8fc5810674958945d790db3ef8cde2731df))

## [1.5.1](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.5.0...v1.5.1) (2025-10-23)


### Bug Fixes

* github actions ([ef12b09](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/ef12b095bd41aea7ff267fc8436e15a738ac0f2f))

# [1.5.0](https://github.com/Gadzzaa/TrenchersPaperTrading/compare/v1.4.0...v1.5.0) (2025-10-23)


### Features

* github actions check version for webstore and if newer update ([9702b19](https://github.com/Gadzzaa/TrenchersPaperTrading/commit/9702b1907ff25e714146179f9c3e925f74b272eb))
