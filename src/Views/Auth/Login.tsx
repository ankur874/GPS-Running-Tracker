import {useReducer} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import FirebaseManager from '../../Managers/FirebaseManager';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

interface State {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
}

type LoginProps = {
  navigation: StackNavigationProp<any, 'Login'>;
  route: RouteProp<any, 'Login'>;
};

type Action =
  | {type: 'SET_EMAIL'; payload: {email: string}}
  | {type: 'SET_PASSWORD'; payload: {password: string}}
  | {type: 'SET_LOADING'; payload: {loading: boolean}}
  | {type: 'SET_ERROR'; payload: {error: string | null}}
  | {type: 'RESET'; payload: {}};

const initialState: State = {
  email: '',
  password: '',
  loading: false,
  error: null,
};

const loginReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'SET_EMAIL':
      return {...state, email: action.payload.email};
    case 'SET_PASSWORD':
      return {...state, password: action.payload.password};
    case 'SET_LOADING':
      return {...state, loading: action.payload.loading};
    case 'SET_ERROR':
      return {...state, error: action.payload.error};
    case 'RESET':
      return {...initialState};
    default:
      return state;
  }
};

export const Login = (props: LoginProps) => {
  const [state, dispatch] = useReducer(loginReducer, initialState);
  const {navigation} = props;

  const resetErrorOnFieldChange = () => {
    if (state.error) {
      dispatch({type: 'SET_ERROR', payload: {error: null}});
    }
  };

  const signupButtonTapped = () => {
    navigation.replace('Signup');
  };

  const loginButtonTapped = async () => {
    if (state.email == '' || state.password == '') {
      dispatch({
        type: 'SET_ERROR',
        payload: {error: 'Please Enter valid details'},
      });
      return;
    }
    dispatch({type: 'SET_LOADING', payload: {loading: true}});
    const {user, error} = await FirebaseManager.loginUserWithEmailPassword(
      state.email,
      state.password,
    );
    dispatch({type: 'SET_LOADING', payload: {loading: false}});

    if (error) {
      FirebaseManager.signOut();
      dispatch({
        type: 'SET_ERROR',
        payload: {error: error},
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding">
      <View style={styles.mainContainer}>
        <Text style={styles.mainText} numberOfLines={2}>
          Get Started With Your Fitness Journey
        </Text>

        <TextInput
          style={styles.emailInput}
          placeholder="Email"
          value={state.email}
          placeholderTextColor="#a3a3a3"
          onChangeText={e => {
            resetErrorOnFieldChange();
            dispatch({type: 'SET_EMAIL', payload: {email: e}});
          }}
        />
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={state.password}
          placeholderTextColor="#a3a3a3"
          onChangeText={e => {
            resetErrorOnFieldChange();
            dispatch({type: 'SET_PASSWORD', payload: {password: e}});
          }}
        />
        {state.error ? <Text style={{color: ''}}>{state.error}</Text> : null}
        <Pressable
          style={styles.signupButton}
          onPress={() => {
            loginButtonTapped();
          }}>
          {state.loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.signupText}>Login</Text>
          )}
        </Pressable>
        <View style={styles.loginView}>
          <Text style={{color: 'white'}}>Create a new account? </Text>
          <Pressable onPress={signupButtonTapped}>
            <Text style={styles.loginText}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  emailInput: {
    height: 50,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 50,
    fontWeight: '500',
    borderRadius: 16,
    color: 'white',
    backgroundColor: '#2f2f2f',
  },
  passwordInput: {
    borderRadius: 16,
    marginBottom: 50,
    paddingHorizontal: 16,
    height: 50,
    width: '100%',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#2f2f2f',
  },
  mainContainer: {
    padding: 20,
    fontWeight: '500',
    height: '100%',
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButton: {
    backgroundColor: '#4adf7e',
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 25,
    marginVertical: 8,
  },
  signupText: {
    fontSize: 17,
    fontWeight: '600',
    color: 'black',
  },
  loginView: {
    flexDirection: 'row',
  },
  loginText: {
    color: '#4adf7e',
  },
  mainText: {
    color: 'white',
    marginHorizontal: 18,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 80,
    fontWeight: '600',
  },
});
