import { createAction } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';
import { AppDispatch, RootState } from './index';
import { Offer } from '../types/offer';
import { User } from '../types/user';
import { Review, ReviewPostData } from '../types/review';
import { AuthorizationStatus } from '../const';
import { TOKEN_KEY } from '../services/api';

export const changeCity = createAction<string>('app/changeCity');

export const loadOffers = createAction<Offer[]>('app/loadOffers');

export const setOffersDataLoading = createAction<boolean>('app/setOffersDataLoading');
export const setOffersDataError = createAction<string | null>('app/setOffersDataError');

export const updateOfferFavorite = createAction<{ id: string; isFavorite: boolean }>('offers/updateOfferFavorite');
export const updateOffer = createAction<Offer>('offers/updateOffer');

export const requireAuthorization = createAction<AuthorizationStatus>('user/requireAuthorization');
export const setUser = createAction<User | null>('user/setUser');

export const fetchOffersAction = () =>
  async (dispatch: AppDispatch, _getState: () => RootState, api: AxiosInstance) => {
    dispatch(setOffersDataLoading(true));
    dispatch(setOffersDataError(null));
    try {
      const { data } = await api.get<Offer[]>('/offers');
      dispatch(loadOffers(data));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Не удалось загрузить данные. Сервер недоступен.';
      dispatch(setOffersDataError(errorMessage));
    } finally {
      dispatch(setOffersDataLoading(false));
    }
  };

export const checkAuthAction = () =>
  async (dispatch: AppDispatch, _getState: () => RootState, api: AxiosInstance) => {
    try {
      const { data } = await api.get<User>('/login');
      dispatch(requireAuthorization(AuthorizationStatus.Auth));
      dispatch(setUser(data));
    } catch {
      dispatch(requireAuthorization(AuthorizationStatus.NoAuth));
      dispatch(setUser(null));
    }
  };

export const loginAction = (email: string, password: string) =>
  async (dispatch: AppDispatch, _getState: () => RootState, api: AxiosInstance) => {
    try {
      const { data } = await api.post<User>('/login', { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      dispatch(requireAuthorization(AuthorizationStatus.Auth));
      dispatch(setUser(data));
    } catch (error) {
      dispatch(requireAuthorization(AuthorizationStatus.NoAuth));
      throw error;
    }
  };

export const logout = createAction('user/logout');

export const logoutAction = () => (dispatch: AppDispatch) => {
  localStorage.removeItem(TOKEN_KEY);
  dispatch(logout());
};

export const toggleFavoriteAction = (offerId: string, isFavorite: boolean) =>
  async (dispatch: AppDispatch, _getState: () => RootState, api: AxiosInstance) => {
    const { data } = await api.post<Offer>(`/favorite/${offerId}/${isFavorite ? 1 : 0}`);
    dispatch(updateOffer(data));
  };

export const fetchFavoriteOffersAction = () =>
  async (dispatch: AppDispatch, _getState: () => RootState, api: AxiosInstance) => {
    const { data } = await api.get<Offer[]>('/favorite');
    const currentOffers = _getState().offers.offers;
    const updatedOffers = [...currentOffers];

    data.forEach((favoriteOffer) => {
      const updatedOffer = { ...favoriteOffer, isFavorite: true };
      const index = updatedOffers.findIndex((o) => o.id === favoriteOffer.id);
      if (index !== -1) {
        updatedOffers[index] = updatedOffer;
      } else {
        updatedOffers.push(updatedOffer);
      }
    });

    dispatch(loadOffers(updatedOffers));
  };

export const fetchOfferAction = (offerId: string) =>
  async (dispatch: AppDispatch, _getState: () => RootState, api: AxiosInstance) => {
    try {
      const { data } = await api.get<Offer>(`/offers/${offerId}`);
      const state = _getState();
      const currentOffers = state.offers.offers;
      const existingIndex = currentOffers.findIndex((o) => o.id === offerId);
      const isAuth = state.user.authorizationStatus === AuthorizationStatus.Auth;

      let isFavorite = data.isFavorite;

      if (isAuth) {
        try {
          const favoriteData = await api.get<Offer[]>('/favorite');
          const favoriteOffer = favoriteData.data.find((o) => o.id === offerId);
          if (favoriteOffer) {
            isFavorite = true;
          }
        } catch {
          if (existingIndex !== -1) {
            isFavorite = currentOffers[existingIndex].isFavorite;
          }
        }
      } else if (existingIndex !== -1) {
        isFavorite = currentOffers[existingIndex].isFavorite;
      }

      if (existingIndex !== -1) {
        const updatedData = { ...data, isFavorite };
        dispatch(updateOffer(updatedData));
      } else {
        const offerWithFavorite = { ...data, isFavorite };
        dispatch(loadOffers([...currentOffers, offerWithFavorite]));
      }
    } catch (error) {
      // Ошибка загрузки предложения
    }
  };

export const loadReviews = createAction<Review[]>('reviews/loadReviews');
export const setReviewsDataLoading = createAction<boolean>('reviews/setReviewsDataLoading');

export const fetchReviewsAction = (offerId: string) =>
  async (dispatch: AppDispatch, _getState: () => RootState, api: AxiosInstance) => {
    dispatch(setReviewsDataLoading(true));
    try {
      const { data } = await api.get<Review[]>(`/comments/${offerId}`);
      dispatch(loadReviews(data));
    } catch (error) {
      dispatch(loadReviews([]));
    } finally {
      dispatch(setReviewsDataLoading(false));
    }
  };

export const postReviewAction = (offerId: string, reviewData: ReviewPostData) =>
  async (dispatch: AppDispatch, _getState: () => RootState, api: AxiosInstance) => {
    await api.post<Review>(`/comments/${offerId}`, reviewData);
    dispatch(fetchReviewsAction(offerId));
  };
