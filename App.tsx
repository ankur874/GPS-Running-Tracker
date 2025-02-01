import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {
  AuthStack,
  OnboardingStack,
  RootTab,
} from './src/Controllers/rootNavigation';
import {Provider} from 'react-redux';
import {store} from './src/store';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FirebaseUser = FirebaseAuthTypes.User | null;

function App(): React.JSX.Element {
  const [user, setUser] = useState(auth().currentUser);
  const [isUserOnboarded, setIsUserOnboarded] = useState<boolean | undefined>(
    undefined,
  );
  const RootNav = createStackNavigator();

  const onAuthStateChanged = (user: FirebaseUser) => {
    isOnboardingDone();
    setUser(user);
  };

  const isOnboardingDone = async () => {
    const isUserOnboarded = await AsyncStorage.getItem('USER_ONBOARDED');
    if (isUserOnboarded === 'true') {
      setIsUserOnboarded(true);
      return;
    }
    setIsUserOnboarded(false);
  };

  useEffect(() => {
    isOnboardingDone();
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  return (
    <NavigationContainer>
      <Provider store={store}>
        {user ? (
          isUserOnboarded ? (
            <RootTab />
          ) : (
            <RootNav.Navigator screenOptions={{headerShown: false}}>
              <RootNav.Screen name="Onboarding" component={OnboardingStack} />
              <RootNav.Screen name="RootTab" component={RootTab} />
            </RootNav.Navigator>
          )
        ) : (
          <AuthStack />
        )}
      </Provider>
    </NavigationContainer>
  );
}

export default App;
