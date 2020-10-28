"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
// import updateNotifier from 'update-notifier'
// import meow from 'meow'
const ink_1 = require("ink");
const ui_1 = __importDefault(require("./ui"));
// import pkg from '../package.json'
// Check if update is available
// updateNotifier({ pkg }).notify({ isGlobal: true })
// const cli = meow(
// 	`
// 	Usage
// 	  $ noodl-cli
// 	Options
// 		--name  Your name
// 	Examples
// 	  $ noodl-cli --name=Jane
// 	  Hello, Jane
// `,
// 	{
// 		flags: {
// 			name: {
// 				type: 'string',
// 			},
// 		},
// 	},
// )
ink_1.render(react_1.default.createElement(ui_1.default, null), {});
//# sourceMappingURL=cli.js.map