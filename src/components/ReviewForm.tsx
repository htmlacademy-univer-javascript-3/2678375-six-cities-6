import { useState, FormEvent, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { postReviewAction } from '../store/action';

function ReviewForm(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setRating(Number(evt.target.value));
    setError(null);
  };

  const handleCommentChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(evt.target.value);
    setError(null);
  };

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setError(null);

    if (!id) {
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(postReviewAction(id, { rating, comment }));
      setRating(0);
      setComment('');
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError('Failed to submit review. Please try again.');
        }
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = rating > 0 && comment.length >= 50 && comment.length <= 300;

  return (
    <form className="reviews__form form" action="#" method="post" onSubmit={(e) => {
      void handleSubmit(e);
    }}
    >
      <label className="reviews__label form__label" htmlFor="review">Your review</label>
      <div className="reviews__rating-form form__rating">
        <input
          className="form__rating-input visually-hidden"
          name="rating"
          value="5"
          id="5-stars"
          type="radio"
          checked={rating === 5}
          onChange={handleRatingChange}
          disabled={isSubmitting}
        />
        <label htmlFor="5-stars" className="reviews__rating-label form__rating-label" title="perfect">
          <svg className="form__star-image" width="37" height="33">
            <use href="#icon-star"></use>
          </svg>
        </label>

        <input
          className="form__rating-input visually-hidden"
          name="rating"
          value="4"
          id="4-stars"
          type="radio"
          checked={rating === 4}
          onChange={handleRatingChange}
          disabled={isSubmitting}
        />
        <label htmlFor="4-stars" className="reviews__rating-label form__rating-label" title="good">
          <svg className="form__star-image" width="37" height="33">
            <use href="#icon-star"></use>
          </svg>
        </label>

        <input
          className="form__rating-input visually-hidden"
          name="rating"
          value="3"
          id="3-stars"
          type="radio"
          checked={rating === 3}
          onChange={handleRatingChange}
          disabled={isSubmitting}
        />
        <label htmlFor="3-stars" className="reviews__rating-label form__rating-label" title="not bad">
          <svg className="form__star-image" width="37" height="33">
            <use href="#icon-star"></use>
          </svg>
        </label>

        <input
          className="form__rating-input visually-hidden"
          name="rating"
          value="2"
          id="2-stars"
          type="radio"
          checked={rating === 2}
          onChange={handleRatingChange}
          disabled={isSubmitting}
        />
        <label htmlFor="2-stars" className="reviews__rating-label form__rating-label" title="badly">
          <svg className="form__star-image" width="37" height="33">
            <use href="#icon-star"></use>
          </svg>
        </label>

        <input
          className="form__rating-input visually-hidden"
          name="rating"
          value="1"
          id="1-star"
          type="radio"
          checked={rating === 1}
          onChange={handleRatingChange}
          disabled={isSubmitting}
        />
        <label htmlFor="1-star" className="reviews__rating-label form__rating-label" title="terribly">
          <svg className="form__star-image" width="37" height="33">
            <use href="#icon-star"></use>
          </svg>
        </label>
      </div>
      <textarea
        className="reviews__textarea form__textarea"
        id="review"
        name="review"
        placeholder="Tell how was your stay, what you like and what can be improved"
        value={comment}
        onChange={handleCommentChange}
        disabled={isSubmitting}
        maxLength={300}
      />
      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '10px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <div className="reviews__button-wrapper">
        <p className="reviews__help">
          To submit review please make sure to set <span className="reviews__star">rating</span> and describe your stay with at least <b className="reviews__text-amount">50 characters</b>.
        </p>
        <button className="reviews__submit form__submit button" type="submit" disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;
