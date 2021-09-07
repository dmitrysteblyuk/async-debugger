## [2.0.4-beta.2](https://github.com/dmitrysteblyuk/async-debugger/compare/v2.0.4-beta.1...v2.0.4-beta.2) (2021-09-07)


### Bug Fixes

* fix entry points ([9308704](https://github.com/dmitrysteblyuk/async-debugger/commit/9308704961d505a26e397f48b97f2bab073f2959))

## [2.0.4-beta.1](https://github.com/dmitrysteblyuk/async-debugger/compare/v2.0.3...v2.0.4-beta.1) (2021-09-07)


### Bug Fixes

* fix issue with babel cache ([ecc5d0e](https://github.com/dmitrysteblyuk/async-debugger/commit/ecc5d0e395e3bc1e235f74468aa84c17a60e6856))

## [2.0.3](https://github.com/dmitrysteblyuk/async-debugger/compare/v2.0.2...v2.0.3) (2021-07-25)


### Bug Fixes

* remove @babel/traverse from dependencies ([4d23f4c](https://github.com/dmitrysteblyuk/async-debugger/commit/4d23f4cdb1ab8e6fbb37e33fb81114a8b0daaf73))

## [2.0.2](https://github.com/dmitrysteblyuk/async-debugger/compare/v2.0.1...v2.0.2) (2021-07-24)


### Bug Fixes

* do not restore context properties if they were changed during debugging ([a949822](https://github.com/dmitrysteblyuk/async-debugger/commit/a9498220edebfd1051fdb5add57fd624fdd0b152))

## [2.0.1](https://github.com/dmitrysteblyuk/async-debugger/compare/v2.0.0...v2.0.1) (2021-07-23)


### Bug Fixes

* always override repl context ([e22ac93](https://github.com/dmitrysteblyuk/async-debugger/commit/e22ac9325aa5c9a8ed78dca2e6c17444095dbb1e))

# [2.0.0](https://github.com/dmitrysteblyuk/async-debugger/compare/v1.0.0...v2.0.0) (2021-07-23)


### Features

* add `overrideProperties` option to debugAsync ([4dccaf1](https://github.com/dmitrysteblyuk/async-debugger/commit/4dccaf17f76b8813953b8b40fc3ab65faf72f9ec))


### BREAKING CHANGES

* by default variables will override context properties; rename "babel" entry point to "babel-plugin"

# 1.0.0 (2021-07-22)


### Bug Fixes

* fix log ([3221e65](https://github.com/dmitrysteblyuk/async-debugger/commit/3221e650bb8a4396247c47b902ee805c4c9ae0e4))
* log info before starting repl ([bebec16](https://github.com/dmitrysteblyuk/async-debugger/commit/bebec164625dc9511fb1056b497a9fec9c7620b9))
* wait for repl to close ([5b1f73a](https://github.com/dmitrysteblyuk/async-debugger/commit/5b1f73a8313eac019bce77bc1aac6a0f8938d456))


### Features

* initial commit ([56659f9](https://github.com/dmitrysteblyuk/async-debugger/commit/56659f912896b233dc10d781d5a97de5a80c8a64))
