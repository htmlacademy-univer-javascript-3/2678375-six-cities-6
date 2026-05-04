import { combineReducers } from '@reduxjs/toolkit';
import appProcess from './app-process/app-process';
import offersProcess from './offers-process/offers-process';
import userProcess from './user-process/user-process';
import reviewsProcess from './reviews-process/reviews-process';

const rootReducer = combineReducers({
  app: appProcess,
  offers: offersProcess,
  user: userProcess,
  reviews: reviewsProcess,
});

export default rootReducer;
