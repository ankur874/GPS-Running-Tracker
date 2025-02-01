import {FlatList, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../store';
import {Activity} from '../../Models/Activity';
import {LiveActivity} from '../Home/LiveActivity';
import {useEffect} from 'react';
import {resetState} from '../../Slices/userSlice';

export const OldActivity = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {user, loading} = useSelector((state: RootState) => {
    return state.users;
  });
  const {oldActivites} = user;
  console.log('----+++', oldActivites);

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, []);

  return (
    <View>
      <FlatList
        data={oldActivites}
        renderItem={({item, index}: {item: Activity; index: number}) => {
          return (
            <View style={{padding: 16}}>
              <LiveActivity buttonText="View" activity={item} />
            </View>
          );
        }}
      />
    </View>
  );
};
