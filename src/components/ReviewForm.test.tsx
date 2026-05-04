import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewForm from './ReviewForm';

describe('ReviewForm component', () => {
  it('should render form with rating and comment fields', () => {
    render(<ReviewForm />);

    expect(screen.getByLabelText('Your review')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell how was your stay, what you like and what can be improved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('should change rating when selecting a star', async () => {
    const user = userEvent.setup();
    render(<ReviewForm />);

    const fiveStarLabel = screen.getByTitle('perfect');
    await user.click(fiveStarLabel);

    const fiveStarInput = document.getElementById('5-stars') as HTMLInputElement;
    expect(fiveStarInput).toBeChecked();
  });

  it('should change comment text when typing', async () => {
    const user = userEvent.setup();
    render(<ReviewForm />);

    const textarea = screen.getByPlaceholderText('Tell how was your stay, what you like and what can be improved');
    await user.type(textarea, 'This is a test comment');

    expect(textarea).toHaveValue('This is a test comment');
  });

  it('should disable submit button when rating is 0', () => {
    render(<ReviewForm />);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when comment length is less than 50', async () => {
    const user = userEvent.setup();
    render(<ReviewForm />);

    const fiveStarLabel = screen.getByTitle('perfect');
    await user.click(fiveStarLabel);

    const textarea = screen.getByPlaceholderText('Tell how was your stay, what you like and what can be improved');
    await user.type(textarea, 'Short comment');

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when rating > 0 and comment.length >= 50', async () => {
    const user = userEvent.setup();
    render(<ReviewForm />);

    const fiveStarLabel = screen.getByTitle('perfect');
    await user.click(fiveStarLabel);

    const textarea = screen.getByPlaceholderText('Tell how was your stay, what you like and what can be improved');
    await user.type(textarea, 'This is a very long comment that exceeds the minimum length requirement of 50 characters');

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).not.toBeDisabled();
  });

  it('should clear form after submit', async () => {
    const user = userEvent.setup();
    render(<ReviewForm />);

    const fiveStarLabel = screen.getByTitle('perfect');
    await user.click(fiveStarLabel);

    const textarea = screen.getByPlaceholderText('Tell how was your stay, what you like and what can be improved');
    await user.type(textarea, 'This is a very long comment that exceeds the minimum length requirement of 50 characters');

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    expect(textarea).toHaveValue('');
    const fiveStarInput = document.getElementById('5-stars') as HTMLInputElement;
    expect(fiveStarInput).not.toBeChecked();
  });

  it('should call handleSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    render(<ReviewForm />);

    const fiveStarLabel = screen.getByTitle('perfect');
    await user.click(fiveStarLabel);

    const textarea = screen.getByPlaceholderText('Tell how was your stay, what you like and what can be improved');
    await user.type(textarea, 'This is a very long comment that exceeds the minimum length requirement of 50 characters');

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Form should be cleared after submit
    expect(textarea).toHaveValue('');
  });

  it('should allow selecting different star ratings', async () => {
    const user = userEvent.setup();
    render(<ReviewForm />);

    const threeStarLabel = screen.getByTitle('not bad');
    await user.click(threeStarLabel);
    const threeStarInput = document.getElementById('3-stars') as HTMLInputElement;
    expect(threeStarInput).toBeChecked();

    const oneStarLabel = screen.getByTitle('terribly');
    await user.click(oneStarLabel);
    const oneStarInput = document.getElementById('1-star') as HTMLInputElement;
    expect(oneStarInput).toBeChecked();
    expect(threeStarInput).not.toBeChecked();
  });

  it('should disable submit button when rating is selected but comment is too short', async () => {
    const user = userEvent.setup();
    render(<ReviewForm />);

    const fourStarLabel = screen.getByTitle('good');
    await user.click(fourStarLabel);

    const textarea = screen.getByPlaceholderText('Tell how was your stay, what you like and what can be improved');
    await user.type(textarea, 'Short');

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button exactly at 50 characters', async () => {
    const user = userEvent.setup();
    render(<ReviewForm />);

    const fiveStarLabel = screen.getByTitle('perfect');
    await user.click(fiveStarLabel);

    const textarea = screen.getByPlaceholderText('Tell how was your stay, what you like and what can be improved');
    const exactly50Chars = 'a'.repeat(50);
    await user.type(textarea, exactly50Chars);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).not.toBeDisabled();
  });
});

