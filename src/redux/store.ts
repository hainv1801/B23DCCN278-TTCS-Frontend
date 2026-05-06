import {
  Action,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlide';
import userReducer from './slice/userSlide';
import tourReducer from './slice/tourSlide';
import bookingReducer from './slice/bookingSlide';
import permissionReducer from './slice/permissionSlide';
import roleReducer from './slice/roleSlide';
import categoryReducer from './slice/categorySlide';
import tourScheduleReducer from './slice/tourScheduleSlide';
import destinationReducer from './slice/destinationSlide';
export const store = configureStore({
  reducer: {
    account: accountReducer,
    user: userReducer,
    tour: tourReducer,
    booking: bookingReducer,
    permission: permissionReducer,
    role: roleReducer,
    category: categoryReducer,
    tourSchedule: tourScheduleReducer,
    destination: destinationReducer,
  },
});


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;