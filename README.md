# PureScript IndexedDB [![](https://img.shields.io/badge/doc-pursuit-60b5cc.svg)](http://pursuit.purescript.org/packages/purescript-indexeddb) [![Build Status](https://travis-ci.org/truqu/purescript-indexedDB.svg?branch=master)](https://travis-ci.org/truqu/purescript-indexedDB)

This package offers complete bindings and type-safety upon the [IndexedDB API](https://w3c.github.io/IndexedDB).

## Overview

The `IDBCore` and `IDBFactory` are the two entry points required to create and connect to an
indexed database. From there, modules are divided such that each of them covers a specific IDB
interface.

They are designed to be used as qualified imports such that each method gets prefixed with a
menaingful namespace (e.g `IDBIndex.get`, `IDBObjectStore.openCursor` ...)

Here's a quick example of what it look likes.

```purescript
module Main where

import Prelude

import Control.Monad.Aff                 (Aff, launchAff_)
import Control.Monad.Aff.Console         (CONSOLE, log)
import Control.Monad.Eff.Exception       (EXCEPTION)
import Control.Monad.Eff                 (Eff)
import Data.Maybe                        (Maybe(..), maybe)

import Database.IndexedDB.Core
import Database.IndexedDB.IDBFactory      as IDBFactory
import Database.IndexedDB.IDBDatabase     as IDBDatabase
import Database.IndexedDB.IDBObjectStore  as IDBObjectStore
import Database.IndexedDB.IDBIndex        as IDBIndex
import Database.IndexedDB.IDBTransaction  as IDBTransaction
import Database.IndexedDB.IDBKeyRange     as IDBKeyRange


main :: Eff (idb :: IDB, exception :: EXCEPTION, console :: CONSOLE) Unit
main = launchAff_ do
  db <- IDBFactory.open "db" Nothing { onBlocked       : Nothing
                                     , onUpgradeNeeded : Just onUpgradeNeeded
                                     }

  tx    <- IDBDatabase.transaction db ["store"] ReadOnly
  store <- IDBTransaction.objectStore tx "store"
  (val :: Maybe String) <-  IDBObjectStore.get store (IDBKeyRange.only 1)
  log $ maybe "not found" id val


onUpgradeNeeded :: forall e. Database -> Transaction -> { oldVersion :: Int } -> Eff (idb :: IDB, exception :: EXCEPTION | e) Unit
onUpgradeNeeded db _ _ = launchAff_ do
  store <- IDBDatabase.createObjectStore db "store" IDBDatabase.defaultParameters
  _     <- IDBObjectStore.add store "patate" (Just 1)
  _     <- IDBObjectStore.add store { property: 42 } (Just 2)
  _     <- IDBObjectStore.createIndex store "index" ["property"] IDBObjectStore.defaultParameters
  pure unit
```

## Notes

### Errors

Errors normally thrown by the IDB\* interfaces are wrapped in the `Aff` Monad as `Error` where
the `name` corresponds to the error's name (e.g. "InvalidStateError"). Pattern matching can
therefore be done on any error to handle specific errors thrown by the API.

### Examples

The `test` folder contains a great amount of examples showing practical usage of
the IDB\* interfaces. Do not hesitate to have a peek should you wonder how to
use one of the module. The wrapper tries to keep as much as possible an API
consistent with the original IndexedDB API. Hence, it should be quite
straightforward to translate any JavaScript example to a PureScript one.

### TODO

Compare differences between [Indexed Database API 2.0](https://www.w3.org/TR/IndexedDB-2/) (W3C Recommendation, 30 January 2018) and [Indexed Database API 3.0](https://w3c.github.io/IndexedDB/) (Editor’s Draft, 6 October 2021).

## Changelog

### Not released yet

- Spago support added
- bower removed
- upgraded to purescript v0.14.4

### v3.0.0

- callback to `onUpgradeNeeded` event now provide a record with the database old version.

### v2.0.0

- review interface implementation (use of opaque classes to improve readability without compromising
  the reusability). The API doesn't really change from a user perspective though.

- make the Key more opaque (by having an IDBKey instance for Foreign types)

- Upgrade purescript-exceptions to 3.1.0 and leverage the new `name` accessor


### v1.0.0

- [Indexed Database API 2.0](https://w3c.github.io/IndexedDB/) totally covered apart from
  - `index.getAll` method (and the associated one for the IDBObjectStore)
  - binary keys

## Documentation

Module documentation is [published on Pursuit](http://pursuit.purescript.org/packages/purescript-indexeddb).

## Testing

Tested in the cloud on multiple browsers and operating systems thanks to [BrowserStack](https://www.browserstack.com)


| IE / Edge | Chrome | Firefox | Safari  | Opera | Android | iOS Safari |
| ----------| ------ | ------- | ------- | ----- | ------- | ---------- |
| -         | >= 57  | >= 51   | [^saf]  | >= 46 | >=10    | [^saf]     |

[^saf]: Safari (OSX, iOS) 2/52 tests fail (Oct 2021) ("openCursor()" & "openKeyCursor()")

<p align="center">
  <a href="https://www.browserstack.com"><img alt="browserstack" src=".github/browserstack.png" /></a>
</p>
