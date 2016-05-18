'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)();

exports.default = function (Model, _ref) {
  var _ref$deletedAt = _ref.deletedAt;
  var deletedAt = _ref$deletedAt === undefined ? 'deletedAt' : _ref$deletedAt;
  var _ref$_isDeleted = _ref._isDeleted;

  var _isDeleted = _ref$_isDeleted === undefined ? '_isDeleted' : _ref$_isDeleted;

  var _ref$scrub = _ref.scrub;
  var scrub = _ref$scrub === undefined ? false : _ref$scrub;

  debug('SoftDelete mixin for Model %s', Model.modelName);

  debug('options', { deletedAt: deletedAt, _isDeleted: _isDeleted, scrub: scrub });

  var properties = Model.definition.properties;

  var scrubbed = {};
  if (scrub !== false) {
    var propertiesToScrub = scrub;
    if (!Array.isArray(propertiesToScrub)) {
      propertiesToScrub = (0, _keys2.default)(properties).filter(function (prop) {
        return !properties[prop].id && prop !== _isDeleted;
      });
    }
    scrubbed = propertiesToScrub.reduce(function (obj, prop) {
      return (0, _extends7.default)({}, obj, (0, _defineProperty3.default)({}, prop, null));
    }, {});
  }

  Model.defineProperty(deletedAt, { type: Date, required: false });
  Model.defineProperty(_isDeleted, { type: Boolean, required: true, default: false });

  Model.destroyAll = function softDestroyAll(where, cb) {
    var _extends3;

    return Model.updateAll(where, (0, _extends7.default)({}, scrubbed, (_extends3 = {}, (0, _defineProperty3.default)(_extends3, deletedAt, new Date()), (0, _defineProperty3.default)(_extends3, _isDeleted, true), _extends3))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.remove = Model.destroyAll;
  Model.deleteAll = Model.destroyAll;

  Model.destroyById = function softDestroyById(id, cb) {
    var _extends4;

    return Model.updateAll({ id: id }, (0, _extends7.default)({}, scrubbed, (_extends4 = {}, (0, _defineProperty3.default)(_extends4, deletedAt, new Date()), (0, _defineProperty3.default)(_extends4, _isDeleted, true), _extends4))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.removeById = Model.destroyById;
  Model.deleteById = Model.destroyById;

  Model.prototype.destroy = function softDestroy(options, cb) {
    var _extends5;

    var callback = cb === undefined && typeof options === 'function' ? options : cb;

    return this.updateAttributes((0, _extends7.default)({}, scrubbed, (_extends5 = {}, (0, _defineProperty3.default)(_extends5, deletedAt, new Date()), (0, _defineProperty3.default)(_extends5, _isDeleted, true), _extends5))).then(function (result) {
      return typeof cb === 'function' ? callback(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? callback(error) : _promise2.default.reject(error);
    });
  };

  Model.prototype.remove = Model.prototype.destroy;
  Model.prototype.delete = Model.prototype.destroy;

  // Emulate default scope but with more flexibility.
  var queryNonDeleted = { _isDeleted: false };

  var _findOrCreate = Model.findOrCreate;
  Model.findOrCreate = function findOrCreateDeleted() {
    var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (!query.deleted) {
      if (!query.where) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return _findOrCreate.call.apply(_findOrCreate, [Model, query].concat(rest));
  };

  var _find = Model.find;
  Model.find = function findDeleted() {
    var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (!query.deleted) {
      if (!query.where) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return _find.call.apply(_find, [Model, query].concat(rest));
  };

  var _count = Model.count;
  Model.count = function countDeleted() {
    var where = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    // Because count only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = { and: [where, queryNonDeleted] };

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };

  var _update = Model.update;
  Model.update = Model.updateAll = function updateDeleted() {
    var where = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    // Because update/updateAll only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = { and: [where, queryNonDeleted] };

    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QTRDO0FBQUEsUUFBckIsS0FBcUIseURBQWIsRUFBYTs7O0FBRTNFLFFBQU0sa0JBQWtCLEVBQUUsS0FBSyxDQUFFLEtBQUYsRUFBUyxlQUFULENBQVAsRUFBeEI7O0FBRjJFLHVDQUFOLElBQU07QUFBTixVQUFNO0FBQUE7O0FBRzNFLFdBQU8sUUFBUSxJQUFSLGlCQUFhLEtBQWIsRUFBb0IsZUFBcEIsU0FBd0MsSUFBeEMsRUFBUDtBQUNELEdBSkQ7QUFLRCxDIiwiZmlsZSI6InNvZnQtZGVsZXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF9kZWJ1ZyBmcm9tICcuL2RlYnVnJztcbmNvbnN0IGRlYnVnID0gX2RlYnVnKCk7XG5cbmV4cG9ydCBkZWZhdWx0IChNb2RlbCwgeyBkZWxldGVkQXQgPSAnZGVsZXRlZEF0JywgX2lzRGVsZXRlZCA9ICdfaXNEZWxldGVkJywgc2NydWIgPSBmYWxzZSB9KSA9PiB7XG4gIGRlYnVnKCdTb2Z0RGVsZXRlIG1peGluIGZvciBNb2RlbCAlcycsIE1vZGVsLm1vZGVsTmFtZSk7XG5cbiAgZGVidWcoJ29wdGlvbnMnLCB7IGRlbGV0ZWRBdCwgX2lzRGVsZXRlZCwgc2NydWIgfSk7XG5cbiAgY29uc3QgcHJvcGVydGllcyA9IE1vZGVsLmRlZmluaXRpb24ucHJvcGVydGllcztcblxuICBsZXQgc2NydWJiZWQgPSB7fTtcbiAgaWYgKHNjcnViICE9PSBmYWxzZSkge1xuICAgIGxldCBwcm9wZXJ0aWVzVG9TY3J1YiA9IHNjcnViO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzVG9TY3J1YikpIHtcbiAgICAgIHByb3BlcnRpZXNUb1NjcnViID0gT2JqZWN0LmtleXMocHJvcGVydGllcylcbiAgICAgICAgLmZpbHRlcihwcm9wID0+ICFwcm9wZXJ0aWVzW3Byb3BdLmlkICYmIHByb3AgIT09IF9pc0RlbGV0ZWQpO1xuICAgIH1cbiAgICBzY3J1YmJlZCA9IHByb3BlcnRpZXNUb1NjcnViLnJlZHVjZSgob2JqLCBwcm9wKSA9PiAoeyAuLi5vYmosIFtwcm9wXTogbnVsbCB9KSwge30pO1xuICB9XG5cbiAgTW9kZWwuZGVmaW5lUHJvcGVydHkoZGVsZXRlZEF0LCB7dHlwZTogRGF0ZSwgcmVxdWlyZWQ6IGZhbHNlfSk7XG4gIE1vZGVsLmRlZmluZVByb3BlcnR5KF9pc0RlbGV0ZWQsIHt0eXBlOiBCb29sZWFuLCByZXF1aXJlZDogdHJ1ZSwgZGVmYXVsdDogZmFsc2V9KTtcblxuICBNb2RlbC5kZXN0cm95QWxsID0gZnVuY3Rpb24gc29mdERlc3Ryb3lBbGwod2hlcmUsIGNiKSB7XG4gICAgcmV0dXJuIE1vZGVsLnVwZGF0ZUFsbCh3aGVyZSwgeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCksIFtfaXNEZWxldGVkXTogdHJ1ZSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlID0gTW9kZWwuZGVzdHJveUFsbDtcbiAgTW9kZWwuZGVsZXRlQWxsID0gTW9kZWwuZGVzdHJveUFsbDtcblxuICBNb2RlbC5kZXN0cm95QnlJZCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QnlJZChpZCwgY2IpIHtcbiAgICByZXR1cm4gTW9kZWwudXBkYXRlQWxsKHsgaWQ6IGlkIH0sIHsgLi4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpLCBbX2lzRGVsZXRlZF06IHRydWUgfSlcbiAgICAgIC50aGVuKHJlc3VsdCA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKG51bGwsIHJlc3VsdCkgOiByZXN1bHQpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihlcnJvcikgOiBQcm9taXNlLnJlamVjdChlcnJvcikpO1xuICB9O1xuXG4gIE1vZGVsLnJlbW92ZUJ5SWQgPSBNb2RlbC5kZXN0cm95QnlJZDtcbiAgTW9kZWwuZGVsZXRlQnlJZCA9IE1vZGVsLmRlc3Ryb3lCeUlkO1xuXG4gIE1vZGVsLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gc29mdERlc3Ryb3kob3B0aW9ucywgY2IpIHtcbiAgICBjb25zdCBjYWxsYmFjayA9IChjYiA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSA/IG9wdGlvbnMgOiBjYjtcblxuICAgIHJldHVybiB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMoeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCksIFtfaXNEZWxldGVkXTogdHJ1ZSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2FsbGJhY2sobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNhbGxiYWNrKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucHJvdG90eXBlLnJlbW92ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuICBNb2RlbC5wcm90b3R5cGUuZGVsZXRlID0gTW9kZWwucHJvdG90eXBlLmRlc3Ryb3k7XG5cbiAgLy8gRW11bGF0ZSBkZWZhdWx0IHNjb3BlIGJ1dCB3aXRoIG1vcmUgZmxleGliaWxpdHkuXG4gIGNvbnN0IHF1ZXJ5Tm9uRGVsZXRlZCA9IHtfaXNEZWxldGVkOiBmYWxzZX07XG5cbiAgY29uc3QgX2ZpbmRPckNyZWF0ZSA9IE1vZGVsLmZpbmRPckNyZWF0ZTtcbiAgTW9kZWwuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gZmluZE9yQ3JlYXRlRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlKSB7XG4gICAgICAgIHF1ZXJ5LndoZXJlID0gcXVlcnlOb25EZWxldGVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSB7IGFuZDogWyBxdWVyeS53aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2ZpbmRPckNyZWF0ZS5jYWxsKE1vZGVsLCBxdWVyeSwgLi4ucmVzdCk7XG4gIH07XG5cbiAgY29uc3QgX2ZpbmQgPSBNb2RlbC5maW5kO1xuICBNb2RlbC5maW5kID0gZnVuY3Rpb24gZmluZERlbGV0ZWQocXVlcnkgPSB7fSwgLi4ucmVzdCkge1xuICAgIGlmICghcXVlcnkuZGVsZXRlZCkge1xuICAgICAgaWYgKCFxdWVyeS53aGVyZSkge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHF1ZXJ5Tm9uRGVsZXRlZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXJ5LndoZXJlID0geyBhbmQ6IFsgcXVlcnkud2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZCBdIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9maW5kLmNhbGwoTW9kZWwsIHF1ZXJ5LCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfY291bnQgPSBNb2RlbC5jb3VudDtcbiAgTW9kZWwuY291bnQgPSBmdW5jdGlvbiBjb3VudERlbGV0ZWQod2hlcmUgPSB7fSwgLi4ucmVzdCkge1xuICAgIC8vIEJlY2F1c2UgY291bnQgb25seSByZWNlaXZlcyBhICd3aGVyZScsIHRoZXJlJ3Mgbm93aGVyZSB0byBhc2sgZm9yIHRoZSBkZWxldGVkIGVudGl0aWVzLlxuICAgIGNvbnN0IHdoZXJlTm90RGVsZXRlZCA9IHsgYW5kOiBbIHdoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgIHJldHVybiBfY291bnQuY2FsbChNb2RlbCwgd2hlcmVOb3REZWxldGVkLCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfdXBkYXRlID0gTW9kZWwudXBkYXRlO1xuICBNb2RlbC51cGRhdGUgPSBNb2RlbC51cGRhdGVBbGwgPSBmdW5jdGlvbiB1cGRhdGVEZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIHVwZGF0ZS91cGRhdGVBbGwgb25seSByZWNlaXZlcyBhICd3aGVyZScsIHRoZXJlJ3Mgbm93aGVyZSB0byBhc2sgZm9yIHRoZSBkZWxldGVkIGVudGl0aWVzLlxuICAgIGNvbnN0IHdoZXJlTm90RGVsZXRlZCA9IHsgYW5kOiBbIHdoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgIHJldHVybiBfdXBkYXRlLmNhbGwoTW9kZWwsIHdoZXJlTm90RGVsZXRlZCwgLi4ucmVzdCk7XG4gIH07XG59O1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
