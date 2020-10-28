"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ink_select_input_1 = __importDefault(require("ink-select-input"));
const ink_1 = require("ink");
const C = __importStar(require("./constants"));
const initialState = {
    script: {
        selected: '',
    },
};
function App() {
    const [state, setState] = react_1.default.useState(initialState);
    const scriptsList = [
        {
            label: 'Retrieve NOODL objects (JSON)',
            value: C.RETRIEVE_NOODL_OBJECTS_JSON,
        },
        {
            label: 'Retrieve NOODL objects (YML)',
            value: C.RETRIEVE_NOODL_OBJECTS_YML,
        },
        {
            label: 'Retrieve NOODL properties',
            value: C.RETRIEVE_NOODL_PROPERTIES,
        },
        {
            label: 'Retrieve NOODL objects with key(s)',
            value: C.RETRIEVE_NOODL_OBJECTS_WITH_KEYS,
        },
    ];
    const onHighlightScript = react_1.default.useCallback((item) => {
        // console.log(item)
    }, []);
    const onSelectScript = react_1.default.useCallback((item) => {
        // console.log(item)
    }, []);
    return (react_1.default.createElement(ink_1.Box, { padding: 3, flexDirection: "column" },
        react_1.default.createElement(ink_1.Text, { color: "yellow" },
            "Choose an option:",
            react_1.default.createElement(ink_1.Newline, null)),
        react_1.default.createElement(ink_1.Box, { flexDirection: "column" },
            react_1.default.createElement(ink_select_input_1.default, { items: scriptsList, indicatorComponent: ({ isSelected }) => isSelected ? react_1.default.createElement(ink_1.Text, { color: "magenta" }, '> ') : null, onHighlight: onHighlightScript, onSelect: onSelectScript }))));
}
exports.default = App;
//# sourceMappingURL=ui.js.map