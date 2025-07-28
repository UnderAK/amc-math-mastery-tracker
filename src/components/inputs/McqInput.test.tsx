import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { McqInput } from './McqInput';

describe('McqInput', () => {
  const mockOnUserAnswersChange = vi.fn();
  const mockOnAnswerKeyChange = vi.fn();

  const defaultProps = {
    userAnswers: 'A'.padEnd(25, ' '),
    answerKey: 'B'.padEnd(25, ' '),
    onUserAnswersChange: mockOnUserAnswersChange,
    onAnswerKeyChange: mockOnAnswerKeyChange,
  };

  it('should render 25 question rows for user answers and answer key', () => {
    render(<McqInput {...defaultProps} />);
    const answerButtons = screen.getAllByRole('button');
    // 25 questions * 5 options * 2 sections (user/key)
    expect(answerButtons.length).toBe(25 * 5 * 2);
  });

  it('should call onUserAnswersChange when a user answer button is clicked', () => {
    render(<McqInput {...defaultProps} />);
    // Get the first answer grid (user answers)
    const userAnswerGrid = screen.getAllByRole('grid')[0];
    // Click the 'B' button for the first question
    const buttonB = userAnswerGrid.querySelectorAll('button')[1];
    fireEvent.click(buttonB);

    expect(mockOnUserAnswersChange).toHaveBeenCalled();
  });

  it('should call onAnswerKeyChange when an answer key button is clicked', () => {
    render(<McqInput {...defaultProps} />);
    // Get the second answer grid (answer key)
    const answerKeyGrid = screen.getAllByRole('grid')[1];
    // Click the 'C' button for the first question
    const buttonC = answerKeyGrid.querySelectorAll('button')[2];
    fireEvent.click(buttonC);

    expect(mockOnAnswerKeyChange).toHaveBeenCalled();
  });
});
