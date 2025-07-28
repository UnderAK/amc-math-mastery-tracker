/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TestEntryForm } from './TestEntryForm';
import { Toaster } from '@/components/ui/toaster';

// Mock dependencies
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/hooks/use-test-grader', () => ({
  useTestGrader: vi.fn(() => ({
    isGrading: false,
    gradeTest: vi.fn().mockResolvedValue('🎉 Graded! Score: 20/25'),
  })),
}));

vi.mock('@/components/TopicInputForAllQuestions', () => ({
  TopicInputForAllQuestions: ({ onSubmit }: { onSubmit: (topics: any[]) => void }) => (
    <div>
      <h1>Topic Input</h1>
      <button onClick={() => onSubmit(Array(25).fill(''))}>Submit Topics</button>
    </div>
  ),
}));

vi.mock('./inputs/McqInput', () => ({
  McqInput: ({ userAnswers, setUserAnswers, answerKey, setAnswerKey }: any) => (
    <div>
      <input data-testid="mcq-user-answers" value={userAnswers.join('')} onChange={(e) => setUserAnswers(e.target.value.split(''))} />
      <input data-testid="mcq-answer-key" value={answerKey.join('')} onChange={(e) => setAnswerKey(e.target.value.split(''))} />
    </div>
  )
}));

vi.mock('./inputs/AnswerInput', () => ({
    AnswerInput: ({ value, onChange, label }: any) => (
        <div>
            <label>{label}</label>
            <input value={value} onChange={onChange} />
        </div>
    )
}));

describe('TestEntryForm', () => {
  const renderComponent = (mode: 'mcq' | 'text') => {
    render(
      <>
        <TestEntryForm inputMode={mode} />
        <Toaster />
      </>
    );
  };

  it('should render the form with the correct title', () => {
    renderComponent('text');
    expect(screen.getByText('Enter New Test Score')).toBeInTheDocument();
  });

  it('should show topic input popup when grade button is clicked with valid inputs', async () => {
    renderComponent('text');

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Your Answers/i), { target: { value: 'A'.repeat(25) } });
    fireEvent.change(screen.getByLabelText(/Answer Key/i), { target: { value: 'B'.repeat(25) } });
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.mouseDown(selects[0]);
    fireEvent.click(await screen.findByText('AMC 10'));

    fireEvent.mouseDown(selects[1]);
    fireEvent.click(await screen.findByText('2022'));

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Grade Test/i }));
    });

    expect(screen.getByText('Topic Input')).toBeInTheDocument();
  });

  it('should call the grading hook when topics are submitted', async () => {
    const { useTestGrader } = await import('@/hooks/use-test-grader');
    const gradeTestMock = vi.fn().mockResolvedValue('🎉 Graded! Score: 20/25');
    (useTestGrader as vi.Mock).mockReturnValue({ isGrading: false, gradeTest: gradeTestMock });

    renderComponent('text');

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Your Answers/i), { target: { value: 'A'.repeat(25) } });
    fireEvent.change(screen.getByLabelText(/Answer Key/i), { target: { value: 'B'.repeat(25) } });
    const selects = screen.getAllByRole('combobox');
    fireEvent.mouseDown(selects[0]);
    fireEvent.click(await screen.findByText('AMC 12'));
    fireEvent.mouseDown(selects[1]);
    fireEvent.click(await screen.findByText('2021'));

    // Open and submit topic input
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Grade Test/i }));
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Topics/i }));

    await waitFor(() => {
      expect(gradeTestMock).toHaveBeenCalled();
    });

    expect(await screen.findByText('🎉 Graded! Score: 20/25')).toBeInTheDocument();
  });
});
