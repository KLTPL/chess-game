export type Err = string | null;

export type ErrRef = { current: Err };

export type FieldData = {
  fieldText: string;
  keyword: string;
  inputType: React.HTMLInputTypeAttribute;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  errorRef: ErrRef;
  isNotRequired?: true;
};

type AuthFormProps = {
  fetchForm: () => Promise<void>;
  fields: FieldData[];
  headerText: string;
  submintText: string;
};

export function errRef(arg: Err): ErrRef {
  return { current: arg };
}

export default function AuthForm({
  fetchForm,
  fields,
  headerText,
  submintText,
}: AuthFormProps) {
  return (
    <>
      <h2 className="pb-3 text-center text-2xl">{headerText}</h2>
      <form
        onSubmit={(ev) => ev.preventDefault()}
        className="flex flex-col gap-3 rounded-md bg-bg2 px-2 py-3 sm:min-w-[70ch] sm:gap-4 sm:px-6"
      >
        {fields.map(
          (
            {
              errorRef,
              fieldText,
              inputRef,
              inputType,
              keyword,
              isNotRequired,
            },
            i
          ) => (
            <div className="flex flex-col items-stretch" key={keyword}>
              <div className="grid grid-cols-2 grid-rows-1 gap-2">
                <label htmlFor={keyword} className="flex flex-row items-center">
                  {fieldText}
                </label>
                <div className="flex flex-row items-center justify-stretch">
                  <input
                    type={inputType}
                    id={keyword}
                    name={keyword}
                    required={isNotRequired === true ? false : true}
                    className="h-min w-full rounded-md px-2 text-left text-black placeholder:text-center sm:py-1"
                    ref={inputRef}
                    placeholder={
                      isNotRequired === true ? "[opcjonalne]" : "[wymagane]"
                    }
                    autoFocus={i === 0}
                  />
                </div>
              </div>
              {errorRef.current !== null && (
                <div className="flex justify-center pt-1 text-red-600">
                  {errorRef.current}
                </div>
              )}
            </div>
          )
        )}
        <input
          type="submit"
          className="rounded-md bg-primary-b py-1 hover:bg-primary"
          value={submintText}
          onClick={fetchForm}
        />
      </form>
    </>
  );
}
