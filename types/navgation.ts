export type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
};

export interface ValidationErrors {
  username?: string;
  password?: string;
}

export interface SignInFormProps {
  onSignInSuccess: () => void;
}