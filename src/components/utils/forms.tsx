import React, { useCallback, useEffect, useRef, useState } from "react";
import { DocumentSnapshot, updateDoc } from "firebase/firestore";
import {
  Switch,
  Snackbar,
  Alert,
  SwitchProps,
  Checkbox,
  FormControlLabelProps,
  TextField,
  TextFieldProps,
  InputAdornment,
  CircularProgress,
  Tooltip,
  SliderProps,
  Slider,
} from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import CheckCircle from "@mui/icons-material/CheckCircleOutline";
import { IMaskInput } from "react-imask";

import { useAsyncAction } from "hooks/async";
import { useKeyPress } from "hooks/events";
import { NestedKeyOf } from "utils/generics";
import { usePrevious } from "hooks/misc";

interface FirestoreBackedSwitchProps<DocType extends object>
  extends SwitchProps {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
  labelProps?: Omit<FormControlLabelProps, "control">;
  checkBox?: boolean;
}

// Switch that disables while updating and alerts/logs any errors
export function FirestoreBackedSwitch<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  labelProps,
  checkBox,
  ...props
}: FirestoreBackedSwitchProps<DocType>) {
  const {
    runAction: update,
    running: updating,
    error,
    clearError,
  } = useAsyncAction((enabled: boolean) =>
    updateDoc(docSnap.ref, fieldPath, enabled)
  );
  const C = checkBox ? Checkbox : Switch;
  return (
    <>
      <C
        checked={docSnap.get(fieldPath)}
        disabled={disabled || updating}
        onChange={(_, checked) => update(checked)}
        {...props}
      />
      <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to update: ${error}`}
        </Alert>
      </Snackbar>
    </>
  );
}

interface FirestoreBackedSiderProps<DocType extends object>
  extends SliderProps {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
}

export function FirestoreBackedSlider<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  ...props
}: FirestoreBackedSiderProps<DocType>) {
  const savedValue = docSnap.get(fieldPath);
  const [value, setValue] = useState(savedValue);
  const {
    runAction: update,
    running: updating,
    error,
    clearError,
  } = useAsyncAction((enabled: number) =>
    updateDoc(docSnap.ref, fieldPath, enabled)
  );

  useEffect(() => {
    if (!updating) {
      setValue(savedValue);
    }
  }, [savedValue, updating]);

  return (
    <>
      <Slider
        value={value}
        disabled={disabled || updating}
        onChange={(_, value) => setValue(value)}
        onChangeCommitted={(_, value) => update(value as number)}
        {...props}
      />
      <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to update: ${error}`}
        </Alert>
      </Snackbar>
    </>
  );
}

type FirestoreBackedTextFieldProps<DocType extends object> = Omit<
  TextFieldProps,
  "error" | "helperText"
> & {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
  isValid?: (value: string) => boolean;
  helperText?: (value: string, isValid: boolean) => string | undefined;
  hideEditIcon?: boolean;
};

// Update the backing store on loss of focus or pressing `Enter`. Reset to the backed store state
// with `Escape`
export function FirestoreBackedTextField<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  isValid,
  helperText,
  hideEditIcon,
  InputProps,
  ...props
}: FirestoreBackedTextFieldProps<DocType>) {
  const [editing, setEditing] = useState(false);
  const backedValue = docSnap.get(fieldPath); // current store value
  const [inputValue, setInputValue] = useState(backedValue); // current display value
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    runAction: update,
    running: updating,
    error: updateError,
    clearError,
  } = useAsyncAction((value: string) =>
    updateDoc(docSnap.ref, fieldPath, value)
  );
  const previousUpdating = usePrevious(updating);
  const fieldError = isValid ? !isValid(inputValue) : undefined;
  const fieldHelperText = helperText
    ? helperText(inputValue, !fieldError)
    : undefined;
  const hasUnsavedChanges = inputValue !== backedValue;

  const doUpdate = useCallback(() => {
    if (editing && !fieldError && hasUnsavedChanges) {
      update(inputValue);
    }
  }, [editing, inputValue, fieldError, update, hasUnsavedChanges]);

  const endAdornment =
    !hideEditIcon && (editing || updating) ? (
      <InputAdornment position="end">
        {updating ? (
          <CircularProgress size={20} />
        ) : !hasUnsavedChanges ? (
          <Tooltip title="changes saved">
            <CheckCircle color="success" fontSize="small" />
          </Tooltip>
        ) : (
          <Tooltip title="unsaved edits">
            <Edit color="primary" fontSize="small" />
          </Tooltip>
        )}
      </InputAdornment>
    ) : undefined;

  const doReset = useCallback(() => {
    setInputValue(backedValue);
  }, [backedValue]);

  const handleActionKey = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === "Enter") {
        doUpdate();
      } else if (key === "Escape") {
        doReset();
      }
    },
    [doUpdate, doReset]
  );

  // Handle actions on the input
  useKeyPress(["Enter", "Escape"], handleActionKey, inputRef);

  const onFocusOut = useCallback(() => {
    doUpdate();
    setEditing(false);
  }, [doUpdate]);

  useEffect(() => {
    const currentRef = inputRef.current;
    if (!currentRef) return;
    function onFocus() {
      setEditing(true);
    }
    currentRef.addEventListener("focus", onFocus);
    currentRef.addEventListener("focusout", onFocusOut);
    return () => {
      currentRef.removeEventListener("focus", onFocus);
      currentRef.removeEventListener("focusout", onFocusOut);
    };
  }, [inputRef, onFocusOut]);

  // When not editing, ensure that the value is consistent with the backed value
  useEffect(() => {
    if (!editing) {
      setInputValue(backedValue);
    }
  }, [editing, backedValue]);
  // after updating, always set the input to the backed value to ensure consistency
  useEffect(() => {
    if (!updating && previousUpdating) {
      setInputValue(backedValue);
    }
  }, [updating, previousUpdating, backedValue]);

  return (
    <>
      <TextField
        inputRef={inputRef}
        value={inputValue}
        disabled={disabled || updating}
        error={fieldError}
        helperText={fieldHelperText}
        onChange={(e) => setInputValue(e.target.value)}
        InputProps={{ endAdornment, ...InputProps }}
        {...props}
      />
      <Snackbar
        open={!!updateError}
        autoHideDuration={5000}
        onClose={clearError}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to update: ${updateError}`}
        </Alert>
      </Snackbar>
    </>
  );
}

interface CustomTextFieldProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}
export const IntegerInput = React.forwardRef<HTMLElement, CustomTextFieldProps>(
  (props, ref) => {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={Number}
        scale={0}
        inputRef={ref as any}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  }
);

export const PhoneNumberInput = React.forwardRef<
  HTMLElement,
  CustomTextFieldProps
>((props, ref) => {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(#00) 000-0000"
      definitions={{
        "#": /[1-9]/,
      }}
      inputRef={ref as any}
      onAccept={(value: any) =>
        onChange({ target: { name: props.name, value } })
      }
      overwrite
    />
  );
});

export const EmailInput = React.forwardRef<HTMLElement, CustomTextFieldProps>(
  (props, ref) => {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={/^\S*@?\S*$/}
        inputRef={ref as any}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  }
);
