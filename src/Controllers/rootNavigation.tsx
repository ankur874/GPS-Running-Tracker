import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Login} from '../Views/Auth/Login';
import {Signup} from '../Views/Auth/Signup';
import {Onboarding} from '../Views/Onboarding/Onboarding';
import {Home} from '../Views/Home/Home';
import Icon from 'react-native-vector-icons/FontAwesome';
import {OldActivity} from '../Views/OldActivities/OldActivity';
import {Pressable, View} from 'react-native';
import FirebaseManager from '../Managers/FirebaseManager';
import {LIGHT_BG_COLOR} from '../Constants';

const AuthStackNav = createStackNavigator();
const RootTabNav = createStackNavigator();
const OnboardingStackNav = createStackNavigator();

export const AuthStack = () => {
  return (
    <AuthStackNav.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.FadeFromBottomAndroid,
      }}
      initialRouteName="Login">
      <AuthStackNav.Screen name="Login" component={Login} />
      <AuthStackNav.Screen name="Signup" component={Signup} />
    </AuthStackNav.Navigator>
  );
};

export const OnboardingStack = () => {
  return (
    <OnboardingStackNav.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Onboarding">
      <OnboardingStackNav.Screen name="Onboarding" component={Onboarding} />
    </OnboardingStackNav.Navigator>
  );
};

export const RootTab = () => {
  return (
    <RootTabNav.Navigator
      screenOptions={({route}) => ({
        headerStyle: {backgroundColor: LIGHT_BG_COLOR}, // Header background color
        headerTintColor: 'white', // Text color
        headerTitleStyle: {fontWeight: 'bold'},
        headerRight(props) {
          props.pressOpacity = 0.1;
          return (
            <Pressable
              style={{paddingHorizontal: 16}}
              onPress={() => {
                FirebaseManager.signOut();
              }}>
              <Icon name="inbox" size={28} color="white" />
            </Pressable>
          );
        },
      })}>
      <RootTabNav.Screen name="Home" component={Home} />
      <RootTabNav.Screen name="OldActivity" component={OldActivity} />
    </RootTabNav.Navigator>
  );
};
