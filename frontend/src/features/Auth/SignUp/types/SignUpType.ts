export type LoadingStoreType = {
  isLoading: boolean;
  setIsLoading: (type: boolean) => void;
};

export type SignUpMessageType = {
  message: string;
  setMessage: (type: string) => void;
};

export type EmailErrorType = {
  emailError: string;
  setEmailError: (error: string) => void;
};

export type SelectedAgeType = {
  selectedAge: string;
  setSelectedAge: (selectedAge: string) => void;
};

export type SelectedGenderType = {
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
};
