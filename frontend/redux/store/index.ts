import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { 
  persistStore, 
  persistReducer, 
  FLUSH, 
  REHYDRATE, 
  PAUSE, 
  PERSIST, 
  PURGE, 
  REGISTER 
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// Import từ file index thay vì trực tiếp từ file module
import authReducer from '../slices';
import { authApi, stripeApi, restaurantApi } from '../api';
import { userApi } from '../api/userApi';
import { orderApi } from '../api/order';
import { reservationApi } from '../api/reservationApi';
import userReducer from '../slices/userSlice';
import validateTokenApi from '../api/validateTokenApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'], // only auth and cart will be persisted
};

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [stripeApi.reducerPath]: stripeApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [restaurantApi.reducerPath]: restaurantApi.reducer,
  [validateTokenApi.reducerPath]: validateTokenApi.reducer,
  [reservationApi.reducerPath]: reservationApi.reducer,
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware, 
      stripeApi.middleware, 
      userApi.middleware, 
      orderApi.middleware,
      restaurantApi.middleware,
      validateTokenApi.middleware,
      reservationApi.middleware,
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
