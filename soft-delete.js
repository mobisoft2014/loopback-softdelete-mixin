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

  debug('options', {
    deletedAt: deletedAt, _isDeleted: _isDeleted, scrub: scrub
  });

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

  Model.defineProperty(deletedAt, {
    type: Date,
    required: false
  });
  Model.defineProperty(_isDeleted, {
    type: Boolean,
    required: true,
    default: false
  });

  Model.destroyAll = function softDestroyAll(where, options, cb) {
    var _extends3;

    if (options === undefined && cb === undefined) {
      if (typeof where === 'function') {
        cb = where;
        where = {};
      }
    } else if (cb === undefined) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
    }

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

    return Model.updateAll({
      id: id
    }, (0, _extends7.default)({}, scrubbed, (_extends4 = {}, (0, _defineProperty3.default)(_extends4, deletedAt, new Date()), (0, _defineProperty3.default)(_extends4, _isDeleted, true), _extends4))).then(function (result) {
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
  var queryNonDeleted = {
    _isDeleted: false
  };

  var _findOrCreate = Model.findOrCreate;
  Model.findOrCreate = function findOrCreateDeleted() {
    var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (!query.deleted) {
      if (!query.where) {
        query.where = queryNonDeleted;
      } else {
        query.where = {
          and: [query.where, queryNonDeleted]
        };
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
        query.where = {
          and: [query.where, queryNonDeleted]
        };
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
    var whereNotDeleted = {
      and: [where, queryNonDeleted]
    };

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };

  var _update = Model.update;
  Model.update = Model.updateAll = function updateDeleted() {
    var where = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    // Because update/updateAll only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = {
      and: [where, queryNonDeleted]
    };

    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUFhOzs7QUFFdkQsUUFBTSxrQkFBa0I7QUFDdEIsV0FBSyxDQUFDLEtBQUQsRUFBUSxlQUFSO0FBRGlCLEtBQXhCOztBQUZ1RCx1Q0FBTixJQUFNO0FBQU4sVUFBTTtBQUFBOztBQUt2RCxXQUFPLE9BQU8sSUFBUCxnQkFBWSxLQUFaLEVBQW1CLGVBQW5CLFNBQXVDLElBQXZDLEVBQVA7QUFDRCxHQU5EOztBQVFBLE1BQU0sVUFBVSxNQUFNLE1BQXRCO0FBQ0EsUUFBTSxNQUFOLEdBQWUsTUFBTSxTQUFOLEdBQWtCLFNBQVMsYUFBVCxHQUE0QztBQUFBLFFBQXJCLEtBQXFCLHlEQUFiLEVBQWE7OztBQUUzRSxRQUFNLGtCQUFrQjtBQUN0QixXQUFLLENBQUMsS0FBRCxFQUFRLGVBQVI7QUFEaUIsS0FBeEI7O0FBRjJFLHVDQUFOLElBQU07QUFBTixVQUFNO0FBQUE7O0FBSzNFLFdBQU8sUUFBUSxJQUFSLGlCQUFhLEtBQWIsRUFBb0IsZUFBcEIsU0FBd0MsSUFBeEMsRUFBUDtBQUNELEdBTkQ7QUFPRCxDIiwiZmlsZSI6InNvZnQtZGVsZXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF9kZWJ1ZyBmcm9tICcuL2RlYnVnJztcbmNvbnN0IGRlYnVnID0gX2RlYnVnKCk7XG5cbmV4cG9ydCBkZWZhdWx0IChNb2RlbCwge1xuICBkZWxldGVkQXQgPSAnZGVsZXRlZEF0JywgX2lzRGVsZXRlZCA9ICdfaXNEZWxldGVkJywgc2NydWIgPSBmYWxzZVxufSkgPT4ge1xuICBkZWJ1ZygnU29mdERlbGV0ZSBtaXhpbiBmb3IgTW9kZWwgJXMnLCBNb2RlbC5tb2RlbE5hbWUpO1xuXG4gIGRlYnVnKCdvcHRpb25zJywge1xuICAgIGRlbGV0ZWRBdCwgX2lzRGVsZXRlZCwgc2NydWJcbiAgfSk7XG5cbiAgY29uc3QgcHJvcGVydGllcyA9IE1vZGVsLmRlZmluaXRpb24ucHJvcGVydGllcztcblxuICBsZXQgc2NydWJiZWQgPSB7fTtcbiAgaWYgKHNjcnViICE9PSBmYWxzZSkge1xuICAgIGxldCBwcm9wZXJ0aWVzVG9TY3J1YiA9IHNjcnViO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzVG9TY3J1YikpIHtcbiAgICAgIHByb3BlcnRpZXNUb1NjcnViID0gT2JqZWN0LmtleXMocHJvcGVydGllcylcbiAgICAgICAgLmZpbHRlcihwcm9wID0+ICFwcm9wZXJ0aWVzW3Byb3BdLmlkICYmIHByb3AgIT09IF9pc0RlbGV0ZWQpO1xuICAgIH1cbiAgICBzY3J1YmJlZCA9IHByb3BlcnRpZXNUb1NjcnViLnJlZHVjZSgob2JqLCBwcm9wKSA9PiAoey4uLm9iaiwgW3Byb3BdOiBudWxsXG4gICAgfSksIHt9KTtcbiAgfVxuXG4gIE1vZGVsLmRlZmluZVByb3BlcnR5KGRlbGV0ZWRBdCwge1xuICAgIHR5cGU6IERhdGUsXG4gICAgcmVxdWlyZWQ6IGZhbHNlXG4gIH0pO1xuICBNb2RlbC5kZWZpbmVQcm9wZXJ0eShfaXNEZWxldGVkLCB7XG4gICAgdHlwZTogQm9vbGVhbixcbiAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICBkZWZhdWx0OiBmYWxzZVxuICB9KTtcblxuICBNb2RlbC5kZXN0cm95QWxsID0gZnVuY3Rpb24gc29mdERlc3Ryb3lBbGwod2hlcmUsIG9wdGlvbnMsIGNiKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCAmJiBjYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIHdoZXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNiID0gd2hlcmU7XG4gICAgICAgIHdoZXJlID0ge307XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2IgPSBvcHRpb25zO1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE1vZGVsLnVwZGF0ZUFsbCh3aGVyZSwgey4uLnNjcnViYmVkLCBbZGVsZXRlZEF0XTogbmV3IERhdGUoKSwgW19pc0RlbGV0ZWRdOiB0cnVlXG4gICAgICB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlID0gTW9kZWwuZGVzdHJveUFsbDtcbiAgTW9kZWwuZGVsZXRlQWxsID0gTW9kZWwuZGVzdHJveUFsbDtcblxuICBNb2RlbC5kZXN0cm95QnlJZCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QnlJZChpZCwgY2IpIHtcbiAgICByZXR1cm4gTW9kZWwudXBkYXRlQWxsKHtcbiAgICAgICAgaWQ6IGlkXG4gICAgICB9LCB7Li4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpLCBbX2lzRGVsZXRlZF06IHRydWVcbiAgICAgIH0pXG4gICAgICAudGhlbihyZXN1bHQgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihudWxsLCByZXN1bHQpIDogcmVzdWx0KVxuICAgICAgLmNhdGNoKGVycm9yID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IoZXJyb3IpIDogUHJvbWlzZS5yZWplY3QoZXJyb3IpKTtcbiAgfTtcblxuICBNb2RlbC5yZW1vdmVCeUlkID0gTW9kZWwuZGVzdHJveUJ5SWQ7XG4gIE1vZGVsLmRlbGV0ZUJ5SWQgPSBNb2RlbC5kZXN0cm95QnlJZDtcblxuICBNb2RlbC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIHNvZnREZXN0cm95KG9wdGlvbnMsIGNiKSB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSAoY2IgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykgPyBvcHRpb25zIDogY2I7XG5cbiAgICByZXR1cm4gdGhpcy51cGRhdGVBdHRyaWJ1dGVzKHsuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCksIFtfaXNEZWxldGVkXTogdHJ1ZVxuICAgICAgfSlcbiAgICAgIC50aGVuKHJlc3VsdCA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNhbGxiYWNrKG51bGwsIHJlc3VsdCkgOiByZXN1bHQpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYWxsYmFjayhlcnJvcikgOiBQcm9taXNlLnJlamVjdChlcnJvcikpO1xuICB9O1xuXG4gIE1vZGVsLnByb3RvdHlwZS5yZW1vdmUgPSBNb2RlbC5wcm90b3R5cGUuZGVzdHJveTtcbiAgTW9kZWwucHJvdG90eXBlLmRlbGV0ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuXG4gIC8vIEVtdWxhdGUgZGVmYXVsdCBzY29wZSBidXQgd2l0aCBtb3JlIGZsZXhpYmlsaXR5LlxuICBjb25zdCBxdWVyeU5vbkRlbGV0ZWQgPSB7XG4gICAgX2lzRGVsZXRlZDogZmFsc2VcbiAgfTtcblxuICBjb25zdCBfZmluZE9yQ3JlYXRlID0gTW9kZWwuZmluZE9yQ3JlYXRlO1xuICBNb2RlbC5maW5kT3JDcmVhdGUgPSBmdW5jdGlvbiBmaW5kT3JDcmVhdGVEZWxldGVkKHF1ZXJ5ID0ge30sIC4uLnJlc3QpIHtcbiAgICBpZiAoIXF1ZXJ5LmRlbGV0ZWQpIHtcbiAgICAgIGlmICghcXVlcnkud2hlcmUpIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHtcbiAgICAgICAgICBhbmQ6IFtxdWVyeS53aGVyZSwgcXVlcnlOb25EZWxldGVkXVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZE9yQ3JlYXRlLmNhbGwoTW9kZWwsIHF1ZXJ5LCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfZmluZCA9IE1vZGVsLmZpbmQ7XG4gIE1vZGVsLmZpbmQgPSBmdW5jdGlvbiBmaW5kRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlKSB7XG4gICAgICAgIHF1ZXJ5LndoZXJlID0gcXVlcnlOb25EZWxldGVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSB7XG4gICAgICAgICAgYW5kOiBbcXVlcnkud2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZF1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2ZpbmQuY2FsbChNb2RlbCwgcXVlcnksIC4uLnJlc3QpO1xuICB9O1xuXG4gIGNvbnN0IF9jb3VudCA9IE1vZGVsLmNvdW50O1xuICBNb2RlbC5jb3VudCA9IGZ1bmN0aW9uIGNvdW50RGVsZXRlZCh3aGVyZSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgLy8gQmVjYXVzZSBjb3VudCBvbmx5IHJlY2VpdmVzIGEgJ3doZXJlJywgdGhlcmUncyBub3doZXJlIHRvIGFzayBmb3IgdGhlIGRlbGV0ZWQgZW50aXRpZXMuXG4gICAgY29uc3Qgd2hlcmVOb3REZWxldGVkID0ge1xuICAgICAgYW5kOiBbd2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZF1cbiAgICB9O1xuICAgIHJldHVybiBfY291bnQuY2FsbChNb2RlbCwgd2hlcmVOb3REZWxldGVkLCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfdXBkYXRlID0gTW9kZWwudXBkYXRlO1xuICBNb2RlbC51cGRhdGUgPSBNb2RlbC51cGRhdGVBbGwgPSBmdW5jdGlvbiB1cGRhdGVEZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIHVwZGF0ZS91cGRhdGVBbGwgb25seSByZWNlaXZlcyBhICd3aGVyZScsIHRoZXJlJ3Mgbm93aGVyZSB0byBhc2sgZm9yIHRoZSBkZWxldGVkIGVudGl0aWVzLlxuICAgIGNvbnN0IHdoZXJlTm90RGVsZXRlZCA9IHtcbiAgICAgIGFuZDogW3doZXJlLCBxdWVyeU5vbkRlbGV0ZWRdXG4gICAgfTtcbiAgICByZXR1cm4gX3VwZGF0ZS5jYWxsKE1vZGVsLCB3aGVyZU5vdERlbGV0ZWQsIC4uLnJlc3QpO1xuICB9O1xufTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
