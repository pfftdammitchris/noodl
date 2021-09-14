import React from 'react';
import { produce } from 'immer';
import { configExists } from '../utils/remote.js';
const initialState = {
    config: '',
    isNotFound: false,
    valid: false,
    validating: false,
    lastTried: '',
    lastConfigSubmitted: '',
};
function useConfigInput({ initialValue, onValidateStart, onValidateEnd, onValidated, onError, onNotFound, }) {
    const [inputValue, setInputValue] = React.useState('');
    const [state, _setState] = React.useState(initialState);
    const setState = React.useCallback((fn) => {
        _setState(produce(fn));
    }, []);
    const onChange = React.useCallback((value) => {
        if (value && state.isNotFound) {
            setState((draft) => void (draft.isNotFound = false));
        }
        setInputValue(value);
    }, [state.isNotFound]);
    const validate = React.useCallback(async (configKey) => {
        let isValid = false;
        if (configKey) {
            onValidateStart?.(configKey);
            setState((draft) => {
                draft.lastTried = configKey;
                draft.validating = true;
                draft.valid && (draft.valid = false);
                draft.isNotFound && (draft.isNotFound = false);
            });
            setInputValue('');
            const exists = await configExists(configKey);
            if (exists === true) {
                isValid = true;
                setState((draft) => {
                    draft.config = configKey;
                    draft.valid = true;
                    draft.validating = false;
                });
                onValidated?.(configKey);
            }
            else if (exists === false) {
                setState((draft) => {
                    draft.validating = false;
                    draft.isNotFound = true;
                });
                setInputValue('');
                onNotFound?.(configKey);
            }
            else if (exists instanceof Error) {
                onError?.(exists, configKey);
                setInputValue(configKey);
                setState((draft) => void (draft.validating = false));
            }
            onValidateEnd?.(configKey);
        }
        return isValid;
    }, []);
    React.useEffect(() => {
        initialValue && validate(initialValue);
    }, []);
    return {
        ...state,
        validate,
        inputValue,
        setInputValue: onChange,
    };
}
export default useConfigInput;
//# sourceMappingURL=useConfigInput.js.map