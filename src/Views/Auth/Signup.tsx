import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {RouteProp} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {StackNavigationProp} from '@react-navigation/stack';
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
import {User} from '../../Models/User';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface State {
  name: string;
  email: string;
  password: string;
  passwordSecond: string;
  loading: boolean;
  error: string | null;
}

type Action = {
  type:
    | 'SET_NAME'
    | 'SET_EMAIL'
    | 'SET_PASSWORD'
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'RESET'
    | 'SET_SECOND_PASSWORD';
  payload: any;
};

type SignupProps = {
  navigation: StackNavigationProp<any, 'Signup'>;
  route: RouteProp<any, 'Signup'>;
};

const initialState: State = {
  name: '',
  email: '',
  password: '',
  passwordSecond: '',
  loading: false,
  error: null,
};

const signupReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'SET_NAME':
      return {...state, name: action.payload.name};
    case 'SET_EMAIL':
      return {...state, email: action.payload.email};
    case 'SET_PASSWORD':
      return {...state, password: action.payload.password};
    case 'SET_SECOND_PASSWORD':
      return {...state, passwordSecond: action.payload.password};
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

export const Signup = (props: SignupProps) => {
  const [state, dispatch] = useReducer(signupReducer, initialState);
  const {navigation} = props;

  const loginBtnTapped = () => {
    dispatch({type: 'RESET', payload: {}});
    navigation.replace('Login');
  };

  const handleLocalError = () => {
    if (state.loading) return;
    if (state.password != state.passwordSecond) {
      dispatch({type: 'SET_ERROR', payload: {error: 'Passwords do not match'}});
      return;
    }
    if (state.email == '') {
      dispatch({
        type: 'SET_ERROR',
        payload: {error: 'Please Enter valid email'},
      });
      return;
    }
    if (state.name == '') {
      dispatch({
        type: 'SET_ERROR',
        payload: {error: 'Please Enter valid name'},
      });
      return;
    }
  };

  const addLoggedInUserToDB = async () => {
    const currentUser = FirebaseManager.getCurrentuser();
    const newUser: User = {
      email: state.email,
      id: currentUser?.uid,
      name: state.name,
    };
    const {error} = await FirebaseManager.addUserToCollection('Users', newUser);
    console.log('id3', error);
    if (error) {
      FirebaseManager.signOut();
      dispatch({
        type: 'SET_ERROR',
        payload: {error: error},
      });
    }
  };

  const storeUsernameIsAsync = async () => {
    await AsyncStorage.setItem('USERNAME', state.name);
  };

  const signupButtonTapped = async () => {
    handleLocalError();
    const userOnboardState = await AsyncStorage.getItem('USER_ONBOARDED');
    await AsyncStorage.setItem('USER_ONBOARDED', 'false');
    dispatch({type: 'SET_LOADING', payload: {loading: true}});
    console.log('eeee');
    const {user, error} = await FirebaseManager.createNewUserWithEmailPassword(
      state.email,
      state.password,
    );
    dispatch({type: 'SET_LOADING', payload: {loading: false}});
    if (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: {error: error},
      });
      await AsyncStorage.setItem('USER_ONBOARDED', userOnboardState ?? 'false');
      return;
    }
    storeUsernameIsAsync();
    FirebaseManager.updateFirebaseUserProfile({displayName: state.name});
    addLoggedInUserToDB();
  };

  const resetErrorOnFieldChange = () => {
    if (state.error) {
      dispatch({type: 'SET_ERROR', payload: {error: null}});
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding">
      <View style={styles.mainContainer}>
        <Text style={styles.mainText}>
          Get Started With Your Fitness Journey
        </Text>
        <TextInput
          placeholderTextColor="#a3a3a3"
          style={styles.inputs}
          placeholder="Name"
          value={state.name}
          onChangeText={e => {
            resetErrorOnFieldChange();
            dispatch({type: 'SET_NAME', payload: {name: e}});
          }}
        />
        <TextInput
          placeholderTextColor="#a3a3a3"
          style={styles.inputs}
          placeholder="Email"
          value={state.email}
          onChangeText={e => {
            resetErrorOnFieldChange();
            dispatch({type: 'SET_EMAIL', payload: {email: e}});
          }}
        />
        <TextInput
          placeholderTextColor="#a3a3a3"
          style={styles.inputs}
          placeholder="Password"
          value={state.password}
          onChangeText={e => {
            resetErrorOnFieldChange();
            dispatch({type: 'SET_PASSWORD', payload: {password: e}});
          }}
        />
        <TextInput
          placeholderTextColor="#a3a3a3"
          style={styles.inputs}
          placeholder="Confirm Password"
          value={state.passwordSecond}
          onChangeText={e => {
            resetErrorOnFieldChange();
            dispatch({type: 'SET_SECOND_PASSWORD', payload: {password: e}});
          }}
        />
        {state.error ? (
          <Text style={{color: '#4adf7e', alignSelf: 'flex-start'}}>
            {state.error}
          </Text>
        ) : null}
        <Pressable style={styles.signupButton} onPress={signupButtonTapped}>
          {state.loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.signupText}>Sign up</Text>
          )}
        </Pressable>
        <View style={styles.loginView}>
          <Text style={{color: 'white'}}>Already having an account? </Text>
          <Pressable onPress={loginBtnTapped}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputs: {
    height: 50,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 50,
    fontWeight: '500',
    borderRadius: 16,
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
