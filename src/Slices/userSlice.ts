import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {User} from '../Models/User';
import FirebaseManager from '../Managers/FirebaseManager';
import {RootState} from '../store';
import {NativeModules} from 'react-native';

interface State {
  user: User;
  error?: string;
  loading: 'pending' | 'uninit' | 'success';
}

const initialState: State = {
  user: {
    oldActivites: [],
  },
  loading: 'uninit',
};

export const postUserData = createAsyncThunk(
  'User/postUserData',
  async (_, {getState, rejectWithValue}) => {
    console.log('insinde postuserdata');
    try {
      const rootState = getState() as RootState;
      const state = rootState.users;

      console.log('sate->', state);
      const {error} = await FirebaseManager.updateUser(
        state.user.id ?? '',
        state.user,
      );
      console.log('error', error);

      if (error) {
        rejectWithValue(error);
      }
    } catch (err) {
      console.log('error', err);
      rejectWithValue(err);
    }
  },
);

export const openUserActivity = createAsyncThunk<void, any>(
  'User/openUserActivity',
  async (params, {getState, rejectWithValue}) => {
    console.log('insinde openUserActivity', params);
    try {
      await NativeModules.RNGoogleMaps.initiateGoogleMaps(params);
    } catch (err) {
      console.log('error in open user activity', err);
      rejectWithValue(err);
    }
  },
);

export const fetchStepsFromNative = createAsyncThunk(
  'User/fetchStepsFromNative',
  async (params, {getState, rejectWithValue}) => {
    try {
      console.log('+++++');
      const data = await NativeModules.RNGoogleMaps.getUpdatedSteps({});
      console.log('---steps', data);
      return data;
    } catch (error) {
      console.log('error in fetchStepsFromNative', error);
      rejectWithValue(error);
    }
  },
);

const userSlice = createSlice({
  name: 'User',
  initialState,
  reducers: {
    fetchInitials: (state, action) => {
      state.user.email = action.payload.email;
      state.user.name = action.payload.name;
      state.user.id = action.payload.id;
    },

    setUserData: (state, action) => {
      for (const key in action.payload) {
        state.user[key as keyof User] = action.payload[key];
      }
    },

    setError: (state, action) => {
      state.error = action.payload.error;
    },

    resetError: state => {
      state.error = undefined;
    },

    resetState: state => {
      state.error = undefined;
      state.loading = 'uninit';
      state.user = {
        oldActivites: [],
      };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(postUserData.pending, (state, action) => {
        console.log('--->>1', action);
        state.loading = 'pending';
      })
      .addCase(postUserData.fulfilled, (state, action) => {
        console.log('--->>2', action);
        state.loading = 'success';
      })
      .addCase(postUserData.rejected, (state, action) => {
        console.log('--->>3', action);
        state.loading = 'uninit';
        state.error = action.error.message || 'Error occurred';
      })
      .addCase(openUserActivity.fulfilled, (state, action) => {
        console.log('fulffileddd');
      })
      .addCase(fetchStepsFromNative.fulfilled, (state, action) => {
        state.user.lastFourDaysSteps = action.payload;
      });
  },
});

export const {fetchInitials, setUserData, setError, resetError, resetState} =
  userSlice.actions;
export default userSlice.reducer;
