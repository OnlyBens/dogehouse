import { Formik } from "formik";
import { useAtom } from "jotai";
import React from "react";
import { useMutation } from "react-query";
import { object, pattern, size, string } from "superstruct";
import { wsFetch } from "@dogehouse/feta";
import { setMeAtom } from "../atoms";
import { BaseUser } from "@dogehouse/feta";
import { showErrorToast } from "@dogehouse/feta";
import { validateStruct } from "@dogehouse/feta";
import { Button } from "./Button";
import { FieldSpacer } from "./form-fields/FieldSpacer";
import { InputField } from "./form-fields/InputField";
import { Modal } from "./Modal";

const profileStruct = object({
  displayName: size(string(), 2, 50),
  username: pattern(string(), /^(\w){4,15}$/),
  bio: size(string(), 2, 160),
});

interface Shared {
  user: BaseUser;
  onRequestClose: () => void;
}

interface EditProfileModalProps extends Shared {
  isOpen: boolean;
}

const validateFn = validateStruct(profileStruct);

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onRequestClose,
  user,
}) => {
  const { mutateAsync, isLoading } = useMutation(wsFetch);
  const [, setMe] = useAtom(setMeAtom);
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      {isOpen ? (
        <Formik
          initialValues={{
            displayName: user.displayName,
            username: user.username,
            bio: user.bio,
          }}
          validateOnChange={false}
          validate={validateFn}
          onSubmit={async (data) => {
            const { isUsernameTaken } = ((await mutateAsync({
              op: "edit_profile",
              d: { data },
            })) as unknown) as { isUsernameTaken: boolean };
            if (isUsernameTaken) {
              showErrorToast("username taken");
            } else {
              setMe((me) => (!me ? me : { ...me, ...data }));
              onRequestClose();
            }
          }}
        >
          {({ handleSubmit }) => (
            <div>
              <InputField
                errorMsg="length 2 to 50 characters"
                label="Display Name"
                name="displayName"
              />
              <FieldSpacer />
              <InputField
                errorMsg="length 4 to 15 characters and only alphanumeric/underscore"
                label="Username"
                name="username"
              />
              <FieldSpacer />
              <InputField
                errorMsg="length 2 to 160 characters"
                label="Bio"
                textarea
                name="bio"
              />
              <div className={`flex mt-12`}>
                <Button
                  type="button"
                  onClick={onRequestClose}
                  className={`mr-0.5`}
                  color="secondary"
                >
                  cancel
                </Button>
                <Button
                  type="button"
                  loading={isLoading}
                  onClick={() => handleSubmit()}
                  className={`ml-0.5`}
                >
                  save
                </Button>
              </div>
            </div>
          )}
        </Formik>
      ) : null}
    </Modal>
  );
};
