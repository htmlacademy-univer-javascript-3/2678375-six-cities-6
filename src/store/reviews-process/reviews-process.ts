import { createReducer } from '@reduxjs/toolkit';
import { Review } from '../../types/review';
import { loadReviews, setReviewsDataLoading } from '../action';

interface ReviewsState {
  reviews: Review[];
  isReviewsDataLoading: boolean;
}

const initialState: ReviewsState = {
  reviews: [],
  isReviewsDataLoading: false,
};

const reviewsProcess = createReducer(initialState, (builder) => {
  builder
    .addCase(loadReviews, (state, action) => {
      state.reviews = action.payload;
    })
    .addCase(setReviewsDataLoading, (state, action) => {
      state.isReviewsDataLoading = action.payload;
    });
});

export default reviewsProcess;

