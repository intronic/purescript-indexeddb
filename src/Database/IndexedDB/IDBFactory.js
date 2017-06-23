const $Core = require('Database.IndexedDB.Core/foreign');

const noOp2 = $Core.noOp2;
const errorHandler = $Core.errorHandler;
const eventHandler = $Core.eventHandler;


exports.deleteDatabase = function deleteDatabase(name) {
    return function aff(success, error) {
        const request = indexedDB.deleteDatabase(name);

        request.onsuccess = function onSuccess(e) {
            success(e.oldVersion);
        };

        request.onerror = errorHandler(error);
    };
};

exports._open = function _open(fromMaybe, name, mver, req) {
    const ver = fromMaybe(undefined)(mver);

    return function aff(success, error) {
        const request = indexedDB.open(name, ver);
        request.onsuccess = function onSuccess(e) {
            success(e.target.result);
        };

        request.onerror = errorHandler(error);
        request.onblocked = eventHandler(fromMaybe(noOp2)(req.onBlocked));
        request.onupgradeneeded = eventHandler(fromMaybe(noOp2)(req.onUpgradeNeeded));
    };
};