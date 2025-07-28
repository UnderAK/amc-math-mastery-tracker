import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnswerInput, InputMode } from './AnswerInput';
import { TooltipProvider } from '@/components/ui/tooltip';

describe('AnswerInput', () => {
  const mockOnUserAnswersChange = vi.fn();
  const mockOnAnswerKeyChange = vi.fn();

  const renderComponent = (mode: InputMode) => {
    render(
      <TooltipProvider>
        <AnswerInput
          mode={mode}
          userAnswers=""
          answerKey=""
          onUserAnswersChange={mockOnUserAnswersChange}
          onAnswerKeyChange={mockOnAnswerKeyChange}
        />
      </TooltipProvider>
    );
  };

  it('should render McqInput when mode is "mcq"', () => {
    renderComponent('mcq' as InputMode);
    expect(screen.getByText('Your Answers')).toBeInTheDocument();
    expect(screen.getByText('Official Answer Key')).toBeInTheDocument();
  });

  it('should render TypingInput when mode is "typing"', () => {
    renderComponent('typing' as InputMode);
    expect(screen.getByPlaceholderText('Enter Your Answers (25 letters A–E only)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Official Answer Key (25 letters A–E only)')).toBeInTheDocument();
  });

  it('should call onUserAnswersChange when user types in TypingInput', async () => {
    renderComponent('typing' as InputMode);
    const input = screen.getByPlaceholderText('Enter Your Answers (25 letters A–E only)') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ABC' } });
    await waitFor(() => {
      expect(mockOnUserAnswersChange).toHaveBeenCalledWith('ABC');
    });
  });
});
