import {useEffect} from 'react';
import {
  View,
  Text,
  Button,
  NativeModules,
  NativeEventEmitter,
  Dimensions,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState, store} from '../../store';
import {Activity} from '../../Models/Activity';
import {
  fetchStepsFromNative,
  openUserActivity,
  postUserData,
  resetState,
  setUserData,
} from '../../Slices/userSlice';
import {LiveActivity} from './LiveActivity';
import FirebaseManager from '../../Managers/FirebaseManager';
import {FlatList} from 'react-native-gesture-handler';
import {Steps} from '../Steps/Steps';
import {CARD_BG_COLOR, LIGHT_BG_COLOR} from '../../Constants';

const screenWidth = Dimensions.get('window').width;

export const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user, loading, error} = useSelector((state: RootState) => {
    return state.users;
  });

  const fetchUser = async () => {
    const {user} = await FirebaseManager.getUser();
    console.log('/////', user);
    dispatch(setUserData({...user}));
  };

  useEffect(() => {
    fetchUser();
    dispatch(fetchStepsFromNative());
    const RNEventEmitter = new NativeEventEmitter(NativeModules.RNEventEmitter);

    const onStartWorkoutListner = RNEventEmitter.addListener(
      'onStartWorkout',
      data => {
        console.log('onStartWorkout', data);
        dispatch(setUserData({liveActivity: data}));
      },
    );

    const onEndWorkoutListner = RNEventEmitter.addListener(
      'onEndWorkout',
      data => {
        // console.log(
        //   'oldActivites ---->>>>>',
        //   store.getState().users.user.oldActivites,
        // );
        console.log('onEndWorkout', data);
        const updatedActivites: Activity[] = [
          ...(store.getState().users.user.oldActivites ?? []), // Spread the existing activities
          {
            lob: data?.lob ?? 'self',
            type: data?.type ?? 'outdoor',
            subType: data?.subType ?? 'running',
            date: data?.date ?? '',
            isLive: data?.isLive ?? false,
            activityDetails: {
              startTime: data?.activityDetails?.startTime ?? '',
              endTime: data?.activityDetails?.endTime ?? '',
              duration: data?.activityDetails?.duration ?? '',
              length: data?.activityDetails?.length ?? '',
              averageSpeed: data?.activityDetails?.averageSpeed ?? '',
              coordinates: data?.activityDetails?.coordinates ?? [],
            },
          },
        ];
        // console.log(
        //   'updatedActivites ----->>>>1',
        //   store.getState().users.user.oldActivites,
        // );
        //console.log('updatedActivites ----->>>>2', updatedActivites?.length);
        dispatch(
          setUserData({liveActivity: null, oldActivites: updatedActivites}),
        );
        dispatch(postUserData());
      },
    );

    return () => {
      onStartWorkoutListner.remove();
      onEndWorkoutListner.remove();
      dispatch(resetState());
    };
  }, []);

  return (
    <View
      style={{
        padding: 16,
        paddingBottom: 40,
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: LIGHT_BG_COLOR,
      }}>
      {
        <Steps
          lastFourDaysSteps={[6000, 9000, 1000, 10000, 11000, 2000, 5000]}
          maxSteps={user?.oneDayMaxSteps}
        />
      }
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={{width: screenWidth * 0.45}}>
          <LiveActivity buttonText="Start Run" activity={user?.liveActivity} />
        </View>
        <View style={{width: screenWidth * 0.45, alignSelf: 'flex-start'}}>
          <LiveActivity buttonText="Past Runs" activity={{}} />
        </View>
      </View>

      <LiveActivity buttonText="Top Workout" activity={user?.topActivity} />
    </View>
  );
};
