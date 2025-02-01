import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../store';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  MutableRefObject,
  Ref,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  fetchInitials,
  postUserData,
  resetError,
  resetState,
  setError,
  setUserData,
} from '../../Slices/userSlice';
import FirebaseManager from '../../Managers/FirebaseManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, StackActions} from '@react-navigation/native';
import {GREEN_COLOR, INPUT_BG_COLOR, LIGHT_BG_COLOR} from '../../Constants';
import {ScrollView} from 'react-native-gesture-handler';

type OnboardingProps = {
  navigation: StackNavigationProp<any, 'Onboarding'>;
  route: RouteProp<any, 'Onboarding'>;
};

export const Onboarding = (props: OnboardingProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {user, error, loading} = useSelector((state: RootState) => {
    return state.users;
  });
  const {name, height, weight, gender, oneDayMaxSteps} = user;
  const {navigation} = props;

  const fetchUserInitials = async () => {
    const currentUser = FirebaseManager.getCurrentuser();
    const userName = await AsyncStorage.getItem('USERNAME');
    console.log('in onbparding', userName, currentUser);
    if (userName == null) {
      FirebaseManager.signOut();
    }
    dispatch(
      fetchInitials({
        name: userName,
        email: currentUser?.email,
        id: currentUser?.uid,
      }),
    );
  };

  useEffect(() => {
    fetchUserInitials();

    return () => {
      dispatch(resetState());
    };
  }, []);

  const GenderSelecterContainer = ({
    selectedGender,
  }: {
    selectedGender: string;
  }) => {
    return (
      <Pressable
        onPress={() => {
          dispatch(setUserData({gender: selectedGender}));
        }}
        style={[
          styles.genderContainer,
          {
            borderColor: selectedGender === gender ? GREEN_COLOR : 'gray',
            backgroundColor: selectedGender === gender ? GREEN_COLOR : 'gray',
          },
        ]}>
        <Text style={{color: 'black', fontSize: 16}}>{selectedGender}</Text>
      </Pressable>
    );
  };

  const didTapOnboardingComplete = () => {
    if (!gender || !height || !weight || !oneDayMaxSteps) {
      dispatch(setError({error: 'Please enter valid details'}));
      return;
    }
    dispatch(resetError());
    dispatch(postUserData());
  };

  const handleSuccess = async () => {
    await AsyncStorage.setItem('USER_ONBOARDED', 'true');
    navigation.replace('RootTab');
  };

  if (loading == 'success') {
    handleSuccess();
  }

  return (
    <View style={styles.mainContainer}>
      <View>
        <Text style={styles.headerText}>Hello {name}!</Text>
        <Text style={styles.subHeaderText}>Tell us more about you..</Text>
      </View>

      <View style={{height: '85%'}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <GenderSelecterContainer selectedGender="Male" />
          <GenderSelecterContainer selectedGender="Female" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputHeaderText}>Height</Text>
          <View style={styles.bottomBarInput}>
            <TextInput
              style={styles.inputs}
              placeholder="Cm"
              value={height?.toString()}
              onChangeText={e => {
                if (e.length == 0) {
                  dispatch(setUserData({height: ''}));
                  return;
                }
                const numberVal = Number(e);
                if (!isNaN(numberVal) && numberVal < 250) {
                  dispatch(setUserData({height: Number(e)}));
                }
              }}
            />

            <Text style={styles.unitsContainer}>CM</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputHeaderText}>Weight</Text>
          <View style={styles.bottomBarInput}>
            <TextInput
              style={styles.inputs}
              placeholder="Kg"
              value={weight?.toString()}
              onChangeText={e => {
                if (e.length == 0) {
                  dispatch(setUserData({weight: ''}));
                  return;
                }
                const numberVal = Number(e);
                if (!isNaN(numberVal) && numberVal < 200) {
                  dispatch(setUserData({weight: Number(e)}));
                }
              }}
            />

            <Text style={styles.unitsContainer}>KG</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputHeaderText}>Daily steps</Text>
          <View style={styles.bottomBarInput}>
            <TextInput
              style={styles.inputs}
              placeholder="Steps"
              value={oneDayMaxSteps?.toString()}
              onChangeText={e => {
                if (e.length == 0) {
                  dispatch(setUserData({oneDayMaxSteps: ''}));
                  return;
                }
                const numberVal = Number(e);
                if (!isNaN(numberVal) && numberVal < 15000) {
                  dispatch(setUserData({oneDayMaxSteps: Number(e)}));
                }
              }}
            />

            <Text style={styles.unitsContainer}>Stp</Text>
          </View>
        </View>

        <View style={styles.bottomBtn}>
          {error ? <Text style={{color: GREEN_COLOR}}>{error}</Text> : null}
          <Pressable
            style={styles.onboardingCompleteBtn}
            onPress={didTapOnboardingComplete}>
            {loading === 'pending' ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Text style={{fontSize: 16, fontWeight: '600'}}>Complete</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 28,
    fontWeight: '400',
    color: 'white',
  },
  subHeaderText: {
    fontSize: 26,
    fontWeight: '300',
    color: 'white',
  },
  mainContainer: {
    padding: 16,
    paddingTop: 100,
    height: '100%',
    justifyContent: 'space-between',
    backgroundColor: LIGHT_BG_COLOR,
  },
  inputContainer: {
    marginTop: 28,
    color: 'white',
  },
  inputHeaderText: {
    fontSize: 16,
    color: 'white',
  },
  inputs: {
    width: '80%',
    borderBottomWidth: 1,
    borderColor: 'black',
    marginTop: 10,
    fontWeight: '500',
    color: 'white',
    backgroundColor: INPUT_BG_COLOR,
    height: 50,
    paddingHorizontal: 16,

    borderRadius: 16,
  },
  unitsContainer: {
    backgroundColor: GREEN_COLOR,
    textAlign: 'center',
    lineHeight: 40,
    height: 40,
    width: 40,
    borderRadius: 8,
    overflow: 'hidden',
    color: 'black',
  },
  bottomBarInput: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  bottomBtn: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  onboardingCompleteBtn: {
    backgroundColor: GREEN_COLOR,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 25,
    marginVertical: 32,
  },
  genderContainer: {
    height: 50,
    width: '40%',
    borderRadius: 8,

    justifyContent: 'center',
    alignItems: 'center',
  },
});
