"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

function _default(babel) {
  var t = babel.types;
  console.log("babel object", babel);
  return {
    visitor: {
      Identifier: function Identifier(path, state) {
        console.log("path", path);
        console.log("path", state);
      },
      BinaryExpression: function BinaryExpression(path, state) {
        if (path.node.operator !== '===') return;
        path.node.left = t.identifier('ContentType');
        path.node.right = t.identifier('listObject');
      }
    }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9iYWJlbC9pbmRleC5qcyJdLCJuYW1lcyI6WyJiYWJlbCIsInQiLCJ0eXBlcyIsImNvbnNvbGUiLCJsb2ciLCJ2aXNpdG9yIiwiSWRlbnRpZmllciIsInBhdGgiLCJzdGF0ZSIsIkJpbmFyeUV4cHJlc3Npb24iLCJub2RlIiwib3BlcmF0b3IiLCJsZWZ0IiwiaWRlbnRpZmllciIsInJpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFFZSxrQkFBVUEsS0FBVixFQUFpQjtBQUFBLE1BQ2hCQyxDQURnQixHQUNWRCxLQURVLENBQ3ZCRSxLQUR1QjtBQUUvQkMsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLGlCQUE0QkosS0FBNUI7QUFFQSxTQUFPO0FBQ05LLElBQUFBLE9BQU8sRUFBRTtBQUNSQyxNQUFBQSxVQURRLHNCQUNHQyxJQURILEVBQ1NDLEtBRFQsRUFDZ0I7QUFDdkJMLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixTQUFvQkcsSUFBcEI7QUFDQUosUUFBQUEsT0FBTyxDQUFDQyxHQUFSLFNBQW9CSSxLQUFwQjtBQUNBLE9BSk87QUFLUkMsTUFBQUEsZ0JBTFEsNEJBS1NGLElBTFQsRUFLZUMsS0FMZixFQUtzQjtBQUM3QixZQUFJRCxJQUFJLENBQUNHLElBQUwsQ0FBVUMsUUFBVixLQUF1QixLQUEzQixFQUFrQztBQUNsQ0osUUFBQUEsSUFBSSxDQUFDRyxJQUFMLENBQVVFLElBQVYsR0FBaUJYLENBQUMsQ0FBQ1ksVUFBRixDQUFhLGFBQWIsQ0FBakI7QUFDQU4sUUFBQUEsSUFBSSxDQUFDRyxJQUFMLENBQVVJLEtBQVYsR0FBa0JiLENBQUMsQ0FBQ1ksVUFBRixDQUFhLFlBQWIsQ0FBbEI7QUFDQTtBQVRPO0FBREgsR0FBUDtBQWFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGJhYmVsKSB7XG5cdGNvbnN0IHsgdHlwZXM6IHQgfSA9IGJhYmVsXG5cdGNvbnNvbGUubG9nKGBiYWJlbCBvYmplY3RgLCBiYWJlbClcblxuXHRyZXR1cm4ge1xuXHRcdHZpc2l0b3I6IHtcblx0XHRcdElkZW50aWZpZXIocGF0aCwgc3RhdGUpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coYHBhdGhgLCBwYXRoKVxuXHRcdFx0XHRjb25zb2xlLmxvZyhgcGF0aGAsIHN0YXRlKVxuXHRcdFx0fSxcblx0XHRcdEJpbmFyeUV4cHJlc3Npb24ocGF0aCwgc3RhdGUpIHtcblx0XHRcdFx0aWYgKHBhdGgubm9kZS5vcGVyYXRvciAhPT0gJz09PScpIHJldHVyblxuXHRcdFx0XHRwYXRoLm5vZGUubGVmdCA9IHQuaWRlbnRpZmllcignQ29udGVudFR5cGUnKVxuXHRcdFx0XHRwYXRoLm5vZGUucmlnaHQgPSB0LmlkZW50aWZpZXIoJ2xpc3RPYmplY3QnKVxuXHRcdFx0fSxcblx0XHR9LFxuXHR9XG59XG4iXX0=