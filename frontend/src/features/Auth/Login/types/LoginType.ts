export type LoadingStoreType = {
  isLoading: boolean;
  setIsLoading: (type: boolean) => void;
};

export type LoginMessageType = {
  message: string;
  setMessage: (type: string) => void;
};

export type EmailErrorType = {
  emailError: string;
  setEmailError: (type: string) => void;
};
