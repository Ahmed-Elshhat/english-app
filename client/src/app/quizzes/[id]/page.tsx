import "./quiz.scss";

function QuizPage() {
  return (
    <div className="Quiz">
      <div className="question">
        <h2>
          What does <span>&quot;winter stock&quot;</span> refer to in a store?
        </h2>
      </div>

      <div className="solutions">
        <div className="solution">
          <span className="character">A</span> A special discount
        </div>
        <div className="solution">
          <span className="character">B</span> Old winter products
        </div>
        <div className="solution">
          <span className="character">C</span> New arrivals
        </div>
        <div className="solution">
          <span className="character">D</span> Store decorations
        </div>
      </div>

      <button className="next-btn">Next Question</button>
    </div>
  );
}

export default QuizPage;
