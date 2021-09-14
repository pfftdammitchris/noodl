import React from 'react';
import InkSpinnerComponent from 'ink-spinner';
// @ts-expect-error
const InkSpinner = InkSpinnerComponent.default;
function Spinner(props) {
    const implicitProps = { interval: 80 };
    return React.createElement(InkSpinner, { type: "point", ...props, ...implicitProps });
}
export default Spinner;
//# sourceMappingURL=Spinner.js.map