const GenerateQuestions = () => {
  return [
    {
      questionText: "What is React?",
      type: "multiple-choice",
      options: ["Library", "Framework", "Language"],
    },
    {
      questionText: "What is the capital of France?",
      type: "multiple-choice",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
    },
    {
      questionText: "What is the tallest mountain in the world?",
      type: "multiple-choice",
      options: ["K2", "Mount Everest", "Kangchenjunga", "Lhotse"],
    },
    {
      questionText: "Who wrote the play 'Hamlet'?",
      type: "multiple-choice",
      options: [
        "William Shakespeare",
        "Charles Dickens",
        "Mark Twain",
        "George Orwell",
      ],
    },
    {
      questionText: "What is the boiling point of water at sea level (in °C)?",
      type: "multiple-choice",
      options: ["100", "90", "110", "80"],
    },
    {
      questionText: "Which planet is known as the Red Planet?",
      type: "multiple-choice",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
    },
    {
      questionText: "What is the largest ocean on Earth?",
      type: "multiple-choice",
      options: [
        "Atlantic Ocean",
        "Indian Ocean",
        "Arctic Ocean",
        "Pacific Ocean",
      ],
    },
    {
      questionText: "Who painted the Mona Lisa?",
      type: "multiple-choice",
      options: [
        "Vincent van Gogh",
        "Pablo Picasso",
        "Leonardo da Vinci",
        "Claude Monet",
      ],
    },
  ];
};

export default GenerateQuestions;
