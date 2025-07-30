export interface Question {
  number: number;
  text: string;
  options: { [key: string]: string };
  answer: string;
}

export interface AmcTest {
  id: string; // e.g., 'amc10-2023'
  type: 'AMC 10' | 'AMC 12';
  year: number;
  questions: Question[];
}

// A small sample of questions for demonstration purposes.
export const tests: AmcTest[] = [
  {
    id: 'amc10-2023',
    type: 'AMC 10',
    year: 2023,
    questions: [
      {
        number: 1,
        text: "What is the value of $(20-23)(20+23)$?",
        options: { A: '-129', B: '-43', C: '43', D: '129', E: '800' },
        answer: 'A'
      },
      {
        number: 2,
        text: "What is the least prime number that is a divisor of $13^4 - 11^4$?",
        options: { A: '2', B: '3', C: '5', D: '7', E: '11' },
        answer: 'C'
      },
      {
        number: 3,
        text: "What is the value of $1 - 2 + 3 - 4 + \\dots + 99 - 100$?",
        options: { A: '-100', B: '-50', C: '0', D: '50', E: '100' },
        answer: 'B'
      },
      {
        number: 4,
        text: "A rectangle has area 24 and perimeter 20. What is the length of its diagonal?",
        options: { A: '8', B: '10', C: '12', D: 'sqrt(136)', E: 'sqrt(148)' },
        answer: 'D'
      },
      {
        number: 5,
        text: "A point is chosen at random from within a circular region. What is the probability that the point is closer to the center of the region than to its boundary?",
        options: { A: '1/4', B: '1/3', C: '1/2', D: '2/3', E: '3/4' },
        answer: 'A'
      }
    ]
  },
  {
    id: 'amc12-2023',
    type: 'AMC 12',
    year: 2023,
    questions: [
       {
        number: 1,
        text: "What is the value of $2^0 - 2^3$?",
        options: { A: '-7', B: '-6', C: '1', D: '7', E: '8' },
        answer: 'A'
      },
      {
        number: 2,
        text: "What is the hundreds digit of $(20! - 15!)$?",
        options: { A: '0', B: '1', C: '2', D: '4', E: '9' },
        answer: 'E'
      }
    ]
  }
];

export const getTestById = (id: string) => tests.find(t => t.id === id);
