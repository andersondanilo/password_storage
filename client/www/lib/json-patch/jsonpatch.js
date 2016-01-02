// Generated by CoffeeScript 1.7.1
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function(root, factory) {
    if (typeof exports !== 'undefined') {
      return factory(root, exports);
    } else if (typeof define === 'function' && define.amd) {
      return define(['exports'], function(exports) {
        return root.jsonpatch = factory(root, exports);
      });
    } else {
      return root.jsonpatch = factory(root, {});
    }
  })(this, function(root) {
    var AddPatch, CopyPatch, InvalidPatchError, InvalidPointerError, JSONPatch, JSONPatchError, JSONPointer, MovePatch, PatchConflictError, PatchTestFailed, RemovePatch, ReplacePatch, TestPatch, apply, compile, escapedSlash, escapedTilde, hasOwnProperty, isArray, isEqual, isObject, isString, operationMap, toString, _isEqual;
    toString = Object.prototype.toString;
    hasOwnProperty = Object.prototype.hasOwnProperty;
    isArray = function(obj) {
      return toString.call(obj) === '[object Array]';
    };
    isObject = function(obj) {
      return toString.call(obj) === '[object Object]';
    };
    isString = function(obj) {
      return toString.call(obj) === '[object String]';
    };
    _isEqual = function(a, b, stack) {
      var className, key, length, result, size;
      if (a === b) {
        return a !== 0 || 1 / a === 1 / b;
      }
      if (a === null || b === null) {
        return a === b;
      }
      className = toString.call(a);
      if (className !== toString.call(b)) {
        return false;
      }
      switch (className) {
        case '[object String]':
          String(a) === String(b);
          break;
        case '[object Number]':
          a = +a;
          b = +b;
          if (a !== a) {
            b !== b;
          } else {
            if (a === 0) {
              1 / a === 1 / b;
            } else {
              a === b;
            }
          }
          break;
        case '[object Boolean]':
          +a === +b;
      }
      if (typeof a !== 'object' || typeof b !== 'object') {
        return false;
      }
      length = stack.length;
      while (length--) {
        if (stack[length] === a) {
          return true;
        }
      }
      stack.push(a);
      size = 0;
      result = true;
      if (className === '[object Array]') {
        size = a.length;
        result = size === b.length;
        if (result) {
          while (size--) {
            if (!(result = __indexOf.call(a, size) >= 0 === __indexOf.call(b, size) >= 0 && _isEqual(a[size], b[size], stack))) {
              break;
            }
          }
        }
      } else {
        if (__indexOf.call(a, "constructor") >= 0 !== __indexOf.call(b, "constructor") >= 0 || a.constructor !== b.constructor) {
          return false;
        }
        for (key in a) {
          if (hasOwnProperty.call(a, key)) {
            size++;
            if (!(result = hasOwnProperty.call(b, key) && _isEqual(a[key], b[key], stack))) {
              break;
            }
          }
        }
        if (result) {
          for (key in b) {
            if (hasOwnProperty.call(b, key) && !size--) {
              break;
            }
          }
          result = !size;
        }
      }
      stack.pop();
      return result;
    };
    isEqual = function(a, b) {
      return _isEqual(a, b, []);
    };
    JSONPatchError = (function(_super) {
      __extends(JSONPatchError, _super);

      function JSONPatchError(message) {
        this.message = message != null ? message : 'JSON patch error';
        this.name = 'JSONPatchError';
      }

      return JSONPatchError;

    })(Error);
    InvalidPointerError = (function(_super) {
      __extends(InvalidPointerError, _super);

      function InvalidPointerError(message) {
        this.message = message != null ? message : 'Invalid pointer';
        this.name = 'InvalidPointer';
      }

      return InvalidPointerError;

    })(Error);
    InvalidPatchError = (function(_super) {
      __extends(InvalidPatchError, _super);

      function InvalidPatchError(message) {
        this.message = message != null ? message : 'Invalid patch';
        this.name = 'InvalidPatch';
      }

      return InvalidPatchError;

    })(JSONPatchError);
    PatchConflictError = (function(_super) {
      __extends(PatchConflictError, _super);

      function PatchConflictError(message) {
        this.message = message != null ? message : 'Patch conflict';
        this.name = 'PatchConflictError';
      }

      return PatchConflictError;

    })(JSONPatchError);
    PatchTestFailed = (function(_super) {
      __extends(PatchTestFailed, _super);

      function PatchTestFailed(message) {
        this.message = message != null ? message : 'Patch test failed';
        this.name = 'PatchTestFailed';
      }

      return PatchTestFailed;

    })(Error);
    escapedSlash = /~1/g;
    escapedTilde = /~0/g;
    JSONPointer = (function() {
      function JSONPointer(path) {
        var i, step, steps, _i, _len;
        steps = [];
        if (path && (steps = path.split('/')).shift() !== '') {
          throw new InvalidPointerError();
        }
        for (i = _i = 0, _len = steps.length; _i < _len; i = ++_i) {
          step = steps[i];
          steps[i] = step.replace(escapedSlash, '/').replace(escapedTilde, '~');
        }
        this.accessor = steps.pop();
        this.steps = steps;
        this.path = path;
      }

      JSONPointer.prototype.getReference = function(parent) {
        var step, _i, _len, _ref;
        _ref = this.steps;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          step = _ref[_i];
          if (isArray(parent)) {
            step = parseInt(step, 10);
          }
          if (!(step in parent)) {
            throw new PatchConflictError('Array location out of bounds or not an instance property');
          }
          parent = parent[step];
        }
        return parent;
      };

      JSONPointer.prototype.coerce = function(reference, accessor) {
        if (isArray(reference)) {
          if (isString(accessor)) {
            if (accessor === '-') {
              accessor = reference.length;
            } else if (/^[-+]?\d+$/.test(accessor)) {
              accessor = parseInt(accessor, 10);
            } else {
              throw new InvalidPointerError('Invalid array index number');
            }
          }
        }
        return accessor;
      };

      return JSONPointer;

    })();
    JSONPatch = (function() {
      function JSONPatch(patch) {
        if (!('path' in patch)) {
          throw new InvalidPatchError();
        }
        this.validate(patch);
        this.patch = patch;
        this.path = new JSONPointer(patch.path);
        this.initialize(patch);
      }

      JSONPatch.prototype.initialize = function() {};

      JSONPatch.prototype.validate = function(patch) {};

      JSONPatch.prototype.apply = function(document) {
        throw new Error('Method not implemented');
      };

      return JSONPatch;

    })();
    AddPatch = (function(_super) {
      __extends(AddPatch, _super);

      function AddPatch() {
        return AddPatch.__super__.constructor.apply(this, arguments);
      }

      AddPatch.prototype.validate = function(patch) {
        if (!('value' in patch)) {
          throw new InvalidPatchError();
        }
      };

      AddPatch.prototype.apply = function(document) {
        var accessor, reference, value;
        reference = this.path.getReference(document);
        accessor = this.path.accessor;
        value = this.patch.value;
        if (isArray(reference)) {
          accessor = this.path.coerce(reference, accessor);
          if (accessor < 0 || accessor > reference.length) {
            throw new PatchConflictError("Index " + accessor + " out of bounds");
          }
          reference.splice(accessor, 0, value);
        } else if (accessor == null) {
          document = value;
        } else {
          reference[accessor] = value;
        }
        return document;
      };

      return AddPatch;

    })(JSONPatch);
    RemovePatch = (function(_super) {
      __extends(RemovePatch, _super);

      function RemovePatch() {
        return RemovePatch.__super__.constructor.apply(this, arguments);
      }

      RemovePatch.prototype.apply = function(document) {
        var accessor, reference;
        reference = this.path.getReference(document);
        accessor = this.path.accessor;
        if (isArray(reference)) {
          accessor = this.path.coerce(reference, accessor);
          if (!(accessor in reference)) {
            throw new PatchConflictError("Value at " + accessor + " does not exist");
          }
          reference.splice(accessor, 1);
        } else {
          if (!(accessor in reference)) {
            throw new PatchConflictError("Value at " + accessor + " does not exist");
          }
          delete reference[accessor];
        }
        return document;
      };

      return RemovePatch;

    })(JSONPatch);
    ReplacePatch = (function(_super) {
      __extends(ReplacePatch, _super);

      function ReplacePatch() {
        return ReplacePatch.__super__.constructor.apply(this, arguments);
      }

      ReplacePatch.prototype.validate = function(patch) {
        if (!('value' in patch)) {
          throw new InvalidPatchError();
        }
      };

      ReplacePatch.prototype.apply = function(document) {
        var accessor, reference, value;
        reference = this.path.getReference(document);
        accessor = this.path.accessor;
        value = this.patch.value;
        if (accessor == null) {
          return value;
        }
        if (isArray(reference)) {
          accessor = this.path.coerce(reference, accessor);
          if (!(accessor in reference)) {
            throw new PatchConflictError("Value at " + accessor + " does not exist");
          }
          reference.splice(accessor, 1, value);
        } else {
          if (!(accessor in reference)) {
            throw new PatchConflictError("Value at " + accessor + " does not exist");
          }
          reference[accessor] = value;
        }
        return document;
      };

      return ReplacePatch;

    })(JSONPatch);
    TestPatch = (function(_super) {
      __extends(TestPatch, _super);

      function TestPatch() {
        return TestPatch.__super__.constructor.apply(this, arguments);
      }

      TestPatch.prototype.validate = function(patch) {
        if (!('value' in patch)) {
          throw new InvalidPatchError("'value' member is required");
        }
      };

      TestPatch.prototype.apply = function(document) {
        var accessor, reference, value;
        reference = this.path.getReference(document);
        accessor = this.path.accessor;
        value = this.patch.value;
        if (isArray(reference)) {
          accessor = this.path.coerce(reference, accessor);
        }
        if (!isEqual(reference[accessor], value)) {
          throw new PatchTestFailed();
        }
        return document;
      };

      return TestPatch;

    })(JSONPatch);
    MovePatch = (function(_super) {
      __extends(MovePatch, _super);

      function MovePatch() {
        return MovePatch.__super__.constructor.apply(this, arguments);
      }

      MovePatch.prototype.initialize = function(patch) {
        var i, len, within, _i;
        this.from = new JSONPointer(patch.from);
        len = this.from.steps.length;
        within = true;
        for (i = _i = 0; 0 <= len ? _i <= len : _i >= len; i = 0 <= len ? ++_i : --_i) {
          if (this.from.steps[i] !== this.path.steps[i]) {
            within = false;
            break;
          }
        }
        if (within) {
          if (this.path.steps.length !== len) {
            throw new InvalidPatchError("'to' member cannot be a descendent of 'path'");
          }
          if (this.from.accessor === this.path.accessor) {
            return this.apply = function(document) {
              return document;
            };
          }
        }
      };

      MovePatch.prototype.validate = function(patch) {
        if (!('from' in patch)) {
          throw new InvalidPatchError("'from' member is required");
        }
      };

      MovePatch.prototype.apply = function(document) {
        var accessor, reference, value;
        reference = this.from.getReference(document);
        accessor = this.from.accessor;
        if (isArray(reference)) {
          accessor = this.from.coerce(reference, accessor);
          if (!(accessor in reference)) {
            throw new PatchConflictError("Value at " + accessor + " does not exist");
          }
          value = reference.splice(accessor, 1)[0];
        } else {
          if (!(accessor in reference)) {
            throw new PatchConflictError("Value at " + accessor + " does not exist");
          }
          value = reference[accessor];
          delete reference[accessor];
        }
        reference = this.path.getReference(document);
        accessor = this.path.accessor;
        if (isArray(reference)) {
          accessor = this.path.coerce(reference, accessor);
          if (accessor < 0 || accessor > reference.length) {
            throw new PatchConflictError("Index " + accessor + " out of bounds");
          }
          reference.splice(accessor, 0, value);
        } else {
          if (accessor in reference) {
            throw new PatchConflictError("Value at " + accessor + " exists");
          }
          reference[accessor] = value;
        }
        return document;
      };

      return MovePatch;

    })(JSONPatch);
    CopyPatch = (function(_super) {
      __extends(CopyPatch, _super);

      function CopyPatch() {
        return CopyPatch.__super__.constructor.apply(this, arguments);
      }

      CopyPatch.prototype.apply = function(document) {
        var accessor, reference, value;
        reference = this.from.getReference(document);
        accessor = this.from.accessor;
        if (isArray(reference)) {
          accessor = this.from.coerce(reference, accessor);
          if (!(accessor in reference)) {
            throw new PatchConflictError("Value at " + accessor + " does not exist");
          }
          value = reference.slice(accessor, accessor + 1)[0];
        } else {
          if (!(accessor in reference)) {
            throw new PatchConflictError("Value at " + accessor + " does not exist");
          }
          value = reference[accessor];
        }
        reference = this.path.getReference(document);
        accessor = this.path.accessor;
        if (isArray(reference)) {
          accessor = this.path.coerce(reference, accessor);
          if (accessor < 0 || accessor > reference.length) {
            throw new PatchConflictError("Index " + accessor + " out of bounds");
          }
          reference.splice(accessor, 0, value);
        } else {
          if (accessor in reference) {
            throw new PatchConflictError("Value at " + accessor + " exists");
          }
          reference[accessor] = value;
        }
        return document;
      };

      return CopyPatch;

    })(MovePatch);
    operationMap = {
      add: AddPatch,
      remove: RemovePatch,
      replace: ReplacePatch,
      move: MovePatch,
      copy: CopyPatch,
      test: TestPatch
    };
    compile = function(patch) {
      var klass, ops, p, _i, _len;
      if (!isArray(patch)) {
        if (isObject(path)) {
          patch = [patch];
        } else {
          throw new InvalidPatchError('patch must be an object or array');
        }
      }
      ops = [];
      for (_i = 0, _len = patch.length; _i < _len; _i++) {
        p = patch[_i];
        if (!(klass = operationMap[p.op])) {
          throw new InvalidPatchError('invalid operation: ' + p.op);
        }
        ops.push(new klass(p));
      }
      return function(document) {
        var op, result, _j, _len1;
        result = document;
        for (_j = 0, _len1 = ops.length; _j < _len1; _j++) {
          op = ops[_j];
          result = op.apply(document);
        }
        return result;
      };
    };
    apply = function(document, patch) {
      return compile(patch)(document);
    };
    root.apply = apply;
    root.compile = compile;
    root.JSONPointer = JSONPointer;
    root.JSONPatch = JSONPatch;
    root.JSONPatchError = JSONPatchError;
    root.InvalidPointerError = InvalidPointerError;
    root.InvalidPatchError = InvalidPatchError;
    root.PatchConflictError = PatchConflictError;
    root.PatchTestFailed = PatchTestFailed;
    return root;
  });

}).call(this);
