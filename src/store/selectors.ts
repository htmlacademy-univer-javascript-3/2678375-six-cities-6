import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Offer } from '../types/offer';

export const getSelectedCity = (state: RootState) => state.app.city;
export const getAllOffers = (state: RootState) => state.offers.offers;
export const getOffersLoadingStatus = (state: RootState) => state.offers.isOffersDataLoading;
export const getOffersError = (state: RootState) => state.offers.offersDataError;
export const getAuthorizationStatus = (state: RootState) => state.user.authorizationStatus;
export const getUser = (state: RootState) => state.user.user;

export const getFilteredOffers = createSelector(
  [getAllOffers, getSelectedCity],
  (offers: Offer[], city: string) => offers.filter((offer) => offer.city.name === city)
);

export const getFavoriteOffersCount = createSelector(
  [getAllOffers],
  (offers: Offer[]) => offers.filter((offer) => offer.isFavorite).length
);

export const getReviews = (state: RootState) => state.reviews.reviews;
export const getReviewsLoadingStatus = (state: RootState) => state.reviews.isReviewsDataLoading;

