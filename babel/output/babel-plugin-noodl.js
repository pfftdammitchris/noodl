"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _core = require("@babel/core");

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

function _default(babel) {
  return {
    name: 'babel-plugin-noodl',
    visitor: {
      FunctionDeclaration: function FunctionDeclaration(path) {
        console.log(path);
      }
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2JhYmVsLXBsdWdpbi1ub29kbC5qcyJdLCJuYW1lcyI6WyJiYWJlbCIsIm5hbWUiLCJ2aXNpdG9yIiwiRnVuY3Rpb25EZWNsYXJhdGlvbiIsInBhdGgiLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFFZSxrQkFBVUEsS0FBVixFQUFpQjtBQUMvQixTQUFPO0FBQ05DLElBQUFBLElBQUksRUFBRSxvQkFEQTtBQUVOQyxJQUFBQSxPQUFPLEVBQUU7QUFDUkMsTUFBQUEsbUJBRFEsK0JBQ1lDLElBRFosRUFDa0I7QUFDekJDLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZRixJQUFaO0FBQ0E7QUFITztBQUZILEdBQVA7QUFRQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHRyYXZlcnNlLCB0eXBlcyBhcyB0LCB0ZW1wbGF0ZSB9IGZyb20gJ0BiYWJlbC9jb3JlJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGJhYmVsKSB7XG5cdHJldHVybiB7XG5cdFx0bmFtZTogJ2JhYmVsLXBsdWdpbi1ub29kbCcsXG5cdFx0dmlzaXRvcjoge1xuXHRcdFx0RnVuY3Rpb25EZWNsYXJhdGlvbihwYXRoKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHBhdGgpXG5cdFx0XHR9LFxuXHRcdH0sXG5cdH1cbn1cbiJdfQ==