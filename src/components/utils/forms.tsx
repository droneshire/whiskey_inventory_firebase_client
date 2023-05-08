import React, { useCallback, useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DocumentSnapshot, updateDoc } from "firebase/firestore";
import TimezoneSelect, { Props as TimeZoneProps } from "react-timezone-select";
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
import { DateRange } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  SingleInputTimeRangeField,
  SingleInputTimeRangeFieldProps,
} from "@mui/x-date-pickers-pro/SingleInputTimeRangeField";

import { useAsyncAction } from "hooks/async";
import { useKeyPress } from "hooks/events";
import { usePrevious } from "hooks/misc";
import {
  DEFAULT_ALERT_END,
  DEFAULT_ALERT_START,
  DEFAULT_ALERT_START_MINUTES,
  DEFAULT_ALERT_END_MINUTES,
  getFixedTimeFromMinutes,
  getMinutesFromMidnight,
} from "utils/time";
import { NestedKeyOf } from "utils/generics";

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
  const [value, setValue] = useState(savedValue ?? 1);
  const {
    runAction: update,
    running: updating,
    error,
    clearError,
  } = useAsyncAction((value: number) =>
    updateDoc(docSnap.ref, fieldPath, value)
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

interface FirestoreBackedTimeRangeFieldProps<DocType extends object>
  extends SingleInputTimeRangeFieldProps<DateRange<Dayjs>> {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
  isValid?: string;
}

export function FirestoreBackedTimeRangeField<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  ...props
}: FirestoreBackedTimeRangeFieldProps<DocType>) {
  const backedValueMinutesSnap = docSnap.get(fieldPath); // current store value
  const {
    runAction: update,
    running: updating,
    error: updateError,
    clearError,
  } = useAsyncAction((value: number[]) =>
    updateDoc(docSnap.ref, fieldPath, value)
  );
  const previousUpdating = usePrevious(updating);

  let backedValue: DateRange<Dayjs>;
  if (backedValueMinutesSnap === undefined) {
    backedValue = [dayjs(DEFAULT_ALERT_START), dayjs(DEFAULT_ALERT_END)];
    update([DEFAULT_ALERT_START_MINUTES, DEFAULT_ALERT_END_MINUTES]);
  } else {
    backedValue = [
      dayjs(
        getFixedTimeFromMinutes(
          DEFAULT_ALERT_START,
          backedValueMinutesSnap[0] || DEFAULT_ALERT_START_MINUTES
        )
      ),
      dayjs(
        getFixedTimeFromMinutes(
          DEFAULT_ALERT_END,
          backedValueMinutesSnap[1] || DEFAULT_ALERT_END_MINUTES
        )
      ),
    ];
  }
  const [inputValue, setInputValue] = useState<DateRange<Dayjs>>(backedValue);

  useEffect(() => {
    if (!updating && previousUpdating) {
      setInputValue(backedValue);
    }
  }, [updating, previousUpdating, backedValue]);

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} {...props}>
        <Tooltip title="Specify the time range where alerts can be sent. They will aggregate during the silent period">
          <SingleInputTimeRangeField
            label={props.label ? props.label : ""}
            value={inputValue}
            onChange={(newValue) => {
              setInputValue([
                newValue[0]?.startOf("minute") || null,
                newValue[1]?.startOf("minute") || null,
              ]);
              const newDateRange: number[] = [
                getMinutesFromMidnight(
                  newValue[0]?.toDate() || DEFAULT_ALERT_START
                ),
                getMinutesFromMidnight(
                  newValue[1]?.toDate() || DEFAULT_ALERT_END
                ),
              ];
              update(newDateRange);
            }}
            disabled={disabled || updating}
            sx={{ marginBottom: "10px", maxWidth: 300 }}
          />
        </Tooltip>
        <Snackbar
          open={!!updateError}
          autoHideDuration={5000}
          onClose={clearError}
        >
          <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
            {`Failed to update: ${updateError}`}
          </Alert>
        </Snackbar>
      </LocalizationProvider>
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

type FirestoreBackedTimeZoneProps<DocType extends object> = Omit<
  TimeZoneProps,
  "value"
> & {
  docSnap: DocumentSnapshot<DocType>;
  fieldPath: NestedKeyOf<DocType>;
  disabled: boolean;
};

export function FirestoreBackedTimeZoneSelect<DocType extends object>({
  docSnap,
  fieldPath,
  disabled,
  ...props
}: FirestoreBackedTimeZoneProps<DocType>) {
  const savedValue =
    docSnap.get(fieldPath) ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
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
      <TimezoneSelect
        value={value}
        isDisabled={disabled || updating}
        onChange={(value: any) => {
          setValue(value);
          update(value);
        }}
      />
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
