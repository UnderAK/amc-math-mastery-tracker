import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
  AnswerInput: (props: any) => (
    <div>
      <label htmlFor="user-answers">Your Answers</label>
      <input id="user-answers" value={props.userAnswers} onChange={e => props.onUserAnswersChange(e.target.value)} />
      <label htmlFor="answer-key">Answer Key</label>
      <input id="answer-key" value={props.answerKey} onChange={e => props.onAnswerKeyChange(e.target.value)} />
    </div>
  ),
  InputMode: {
    TYPING: 'typing',
    MCQ: 'mcq',
  }
}));

describe('TestEntryForm', () => {
  const renderComponent = (mode: 'mcq' | 'typing') => {
    render(
      <>
        <TestEntryForm inputMode={mode} />
        <Toaster />
      </>
    );
  };

  it('should render the form with the correct title', () => {
    renderComponent('typing');
    expect(screen.getByText('New Test Entry')).toBeInTheDocument();
  });

  it('should show topic input popup when grade button is clicked with valid inputs', async () => {
    renderComponent('typing');

    // Fill out the form
        await userEvent.type(screen.getByLabelText(/Your Answers/i), 'A'.repeat(25));
    await userEvent.type(screen.getByLabelText(/Answer Key/i), 'B'.repeat(25));
    
    await userEvent.click(screen.getByRole('combobox', { name: /Select AMC test type/i }));
    await userEvent.click(await screen.findByText('AMC 10'));

    await userEvent.type(screen.getByPlaceholderText(/Enter Year/i), '2022');

    await userEvent.click(screen.getByRole('button', { name: /Grade Test/i }));

    expect(await screen.findByText('Topic Input')).toBeInTheDocument();
  });

  it('should call the grading hook when topics are submitted', async () => {
    const { useTestGrader } = await import('@/hooks/use-test-grader');
    const gradeTestMock = vi.fn().mockResolvedValue('🎉 Graded! Score: 20/25');
    (useTestGrader as vi.Mock).mockReturnValue({ isGrading: false, gradeTest: gradeTestMock });

    renderComponent('typing');

    // Fill out the form
        await userEvent.type(screen.getByLabelText(/Your Answers/i), 'A'.repeat(25));
    await userEvent.type(screen.getByLabelText(/Answer Key/i), 'B'.repeat(25));

    await userEvent.click(screen.getByRole('combobox', { name: /Select AMC test type/i }));
    await userEvent.click(await screen.findByText('AMC 12'));

    await userEvent.type(screen.getByPlaceholderText(/Enter Year/i), '2021');

    // Open and submit topic input
    await userEvent.click(screen.getByRole('button', { name: /Grade Test/i }));
    await userEvent.click(await screen.findByRole('button', { name: /Submit Topics/i }));

    await waitFor(() => {
      expect(gradeTestMock).toHaveBeenCalled();
    });

    expect(await screen.findByText('🎉 Graded! Score: 20/25')).toBeInTheDocument();
  });
});
