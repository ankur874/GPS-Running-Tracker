import {View, Text, Pressable, Image, StyleSheet} from 'react-native';
import {Activity, SubActivity} from '../../Models/Activity';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../store';
import {openUserActivity} from '../../Slices/userSlice';
import {CARD_BG_COLOR, GREEN_COLOR} from '../../Constants';

export interface ActivityProps {
  buttonText?: string;
  activity?: Activity;
  didTapButton?: (event: 'view' | 'begin' | 'past') => void;
}

export const LiveActivity = (props?: ActivityProps) => {
  const {activity} = props ?? {activity: undefined};
  const dispatch = useDispatch<AppDispatch>();
  const {user, loading, error} = useSelector((state: RootState) => {
    return state.users;
  });

  const startNewActivity = async () => {
    try {
      const newWorkoutContract: Activity = {
        lob: 'self',
        type: 'outdoor',
        subType: 'running',
        date: new Date().toDateString(),
        isLive: true,
        currentlyGoingOn: false,
      };
      console.log('new activity---++++', user);
      dispatch(openUserActivity({...newWorkoutContract}));
    } catch (error) {
      console.log('error init startNewActivity', error);
    }
  };

  const viewOldActivity = async () => {
    try {
      dispatch(openUserActivity({...activity, currentlyGoingOn: false}));
    } catch (error) {
      console.log('error init viewOldActivity', error);
    }
  };

  const viewLiveActivity = async () => {
    dispatch(
      openUserActivity({...activity, currentlyGoingOn: true, isLive: false}),
    );
  };

  const didTapActivityButton = (event: 'view' | 'begin') => {
    if (event === 'begin') {
      startNewActivity();
    } else if (event == 'view' && !user.liveActivity) {
      viewOldActivity();
    } else if (event == 'view' && user.liveActivity) {
      viewLiveActivity();
    }
  };

  return (
    <View
      style={{
        backgroundColor: CARD_BG_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        height: 200,
        borderRadius: 16,
      }}>
      <View
        style={{
          paddingVertical: 16,
          justifyContent: 'space-around',
          alignItems: 'flex-start',
        }}>
        {props?.activity ? (
          <View>
            <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold'}}>
              {activity?.activityDetails?.averageSpeed}
            </Text>
            <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold'}}>
              {activity?.activityDetails?.length}
            </Text>
            <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold'}}>
              Total Time: {activity?.activityDetails?.duration}
            </Text>
            <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold'}}>
              Start Time: {activity?.activityDetails?.startTime}
            </Text>
            <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold'}}>
              End Time: {activity?.activityDetails?.endTime}
            </Text>
            <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold'}}>
              Date: {activity?.date}
            </Text>
          </View>
        ) : (
          <Pressable>
            <Text
              style={{
                fontSize: 38,
                textAlign: 'center',
                fontWeight: 'bold',
                color: GREEN_COLOR,
              }}
              numberOfLines={2}>
              {props?.buttonText}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};
