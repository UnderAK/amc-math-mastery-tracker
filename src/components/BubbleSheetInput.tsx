import { useState } from "react";

interface BubbleSheetInputProps {
  answers: ("A" | "B" | "C" | "D" | "E" | "")[];
  setAnswers: React.Dispatch<React.SetStateAction<("A" | "B" | "C" | "D" | "E" | "")[]>>; // Use the correct setter type
}

export const BubbleSheetInput: React.FC<BubbleSheetInputProps> = ({
  answers,
  setAnswers,
}) => {
  const handleBubbleClick = (questionIndex: number, answer: "A" | "B" | "C" | "D" | "E" | "") => {
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      // If the same bubble is clicked again, unselect it
      if (newAnswers[questionIndex] === answer) {
        newAnswers[questionIndex] = "";
      } else {
        newAnswers[questionIndex] = answer;
      }
      return newAnswers;
    });
  };

  const totalQuestions = answers.length;
  const numColumns = 5; // Assuming a maximum of 5 columns based on your previous request
  const questionsPerColumn = Math.ceil(totalQuestions / numColumns);

  const renderColumns = () => {
    const columns = [];
    for (let col = 0; col < numColumns; col++) {
      const columnQuestions = [];
      for (let row = 0; row < questionsPerColumn; row++) {
        const questionIndex = col + row * numColumns;
        if (questionIndex < totalQuestions) {
          const selectedAnswer = answers[questionIndex];
          columnQuestions.push(
            <div key={questionIndex} className="flex items-center space-x-2">
              <span className="text-sm font-medium w-5 text-right flex-shrink-0">{questionIndex + 1}.</span>
              <div className="flex gap-1">
                {[("A"), ("B"), ("C"), ("D"), ("E")].map((option) => (
                  <button
                    key={option}
                    type="button" // Prevent form submission
                    className={`w-6 h-6 rounded-full border text-xs font-mono flex items-center justify-center 
                      ${selectedAnswer === option
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-muted-foreground text-muted-foreground hover:bg-muted/50"
                      }`}
                    onClick={() => handleBubbleClick(questionIndex, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          );
        }
      }
      columns.push(
        <div key={col} className="flex flex-col space-y-3">
          {columnQuestions}
        </div>
      );
    }
    return columns;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-4">
       {renderColumns()}
    </div>
  );
};
