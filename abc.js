"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chai = require("chai");

var _types = require("yaml/types");

var _noodlCommon = require("noodl-common");

var _Identify = _interopRequireDefault(require("../utils/Identify"));

describe((0, _noodlCommon.coolGold)('Identify'), function () {
  describe((0, _noodlCommon.italic)('references'), function () {
    describe('dot (.)', function () {
      describe('..formData.password', function () {
        var node = new _types.Scalar('..formData.password');
        it("should be considered a local reference", function () {
          (0, _chai.expect)(_Identify["default"].localReference(node)).to.be["true"];
        });
        it("should not be considered a root reference", function () {
          (0, _chai.expect)(_Identify["default"].rootReference(node)).to.be["false"];
        });
      });
      describe('.formData.password', function () {
        var node = new _types.Scalar('.formData.password');
        it("should be considered as a local reference", function () {
          (0, _chai.expect)(_Identify["default"].localReference(node)).to.be["true"];
        });
        it("should not be considered as a root reference", function () {
          (0, _chai.expect)(_Identify["default"].rootReference(node)).to.be["false"];
        });
      });
      describe('.Formdata.password', function () {
        var node = new _types.Scalar('.Formdata.password');
        it("should not be considered as a root reference", function () {
          (0, _chai.expect)(_Identify["default"].localReference(node)).to.be["false"];
        });
        it("should be considered as a root reference", function () {
          (0, _chai.expect)(_Identify["default"].rootReference(node)).to.be["true"];
        });
      });
      describe('..Formdata.password', function () {
        var node = new _types.Scalar('..FormData.password');
        it("should not be considered as a local reference", function () {
          (0, _chai.expect)(_Identify["default"].localReference(node)).to.be["false"];
        });
        it("should be considered as a root reference", function () {
          (0, _chai.expect)(_Identify["default"].rootReference(node)).to.be["true"];
        });
      });
    });
    describe("underline reverse traversal (___)", function () {
      var valid = ['.builtIn.__hello', '.builtIn.=._______hello', 'builtIn.__h', 'builtIn.__.__h'];
      var invalid = ['.builtIn.__.hello', '.builtIn.h__.hello', '.builtIn.h__hello', '.builtIn.=__hello', '.builtIn.=.hello', '.builtInhello', 'builtIn.__.', 'builtIn.__.__1', 'builtIn___.'];
      valid.forEach(function (str) {
        it("should consider \"".concat(str, "\" as a traverse reference"), function () {
          var node = new _types.Scalar(str);
          (0, _chai.expect)(_Identify["default"].traverseReference(node)).to.be["true"];
        });
      });
      invalid.forEach(function (str) {
        it("should not consider \"".concat(str, "\" as a traverse reference"), function () {
          var node = new _types.Scalar(str);
          (0, _chai.expect)(_Identify["default"].traverseReference(node)).to.be["false"];
        });
      });
    });
    describe("equal (=)", function () {
      var valid = ['=.builtIn.=global', '    =.dasds'];
      var invalid = ['.=', '=/', ' =', '@=', '@email', 'hello', '.    =sa', '=', '=.'];
      valid.forEach(function (s) {
        it("should consider \"".concat(s, "\" as an eval reference"), function () {
          var node = new _types.Scalar(s);
          (0, _chai.expect)(_Identify["default"].evalReference(node)).to.be["true"];
        });
      });
      invalid.forEach(function (s) {
        it("should not consider \"".concat(s, "\" as an eval reference"), function () {
          var node = new _types.Scalar(s);
          (0, _chai.expect)(_Identify["default"].evalReference(node)).to.be["false"];
        });
      });
    });
    describe("at (@)", function () {
      var valid = ['..appLink.url@', '.Global.currentUser.vertex.sk@', '.Global._nonce@', '..formData.checkMessage@'];
      var invalid = ['..@.', '@', 'hello@_'];
      valid.forEach(function (s) {
        it("should consider \"".concat(s, "\" as a apply reference"), function () {
          var node = new _types.Scalar(s);
          (0, _chai.expect)(_Identify["default"].applyReference(node)).to.be["true"];
        });
      });
      invalid.forEach(function (s) {
        it("should not consider \"".concat(s, "\" as a apply reference"), function () {
          var node = new _types.Scalar(s);
          (0, _chai.expect)(_Identify["default"].applyReference(node)).to.be["false"];
        });
      });
    });
  });
});