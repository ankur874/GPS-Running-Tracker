import {Dimensions, FlatList, Text, View} from 'react-native';
import {
  CARD_BG_COLOR,
  GREEN_COLOR,
  INPUT_BG_COLOR,
  LIGHT_TEXT_COLOR,
  ORANGE_COLOR,
} from '../../Constants';

export interface StepsProps {
  lastFourDaysSteps?: number[];
  maxSteps?: number;
}

export const Steps = (props?: StepsProps) => {
  const {lastFourDaysSteps, maxSteps} = props ?? {};
  return (
    <View
      style={{
        padding: 16,
        backgroundColor: CARD_BG_COLOR,
        borderRadius: 16,
        height: 180,
        flexDirection: 'row',
        justifyContent: 'flex-start',
      }}>
      <FlatList
        contentContainerStyle={{
          justifyContent: 'space-evenly',
          alignItems: 'center',
          flexGrow: 1,
        }}
        horizontal
        inverted
        scrollEnabled={false}
        data={lastFourDaysSteps}
        renderItem={({item, index}: {item: number; index: number}) => {
          const ms = 10000;
          const percentage = Math.min((item / ms) * 100, 100);
          const previousDate = new Date();
          previousDate.setDate(new Date().getDate() - index); // Subtract days
          const formattedDate = new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'short',
          }).format(previousDate);
          console.log(formattedDate);
          return (
            <View
              style={{
                marginHorizontal: 8,
                width: 20,
              }}>
              <View
                style={{
                  height: `${100}%`,
                  backgroundColor: LIGHT_TEXT_COLOR,
                  width: '100%',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}>
                <View
                  style={{
                    backgroundColor: GREEN_COLOR,
                    width: '100%',
                    height: `${percentage}%`,
                    borderRadius: 10,
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                  }}
                />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};
