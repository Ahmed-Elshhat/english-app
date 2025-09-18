import "./quiz.scss";

function QuizPage() {
  return (
    <div className="Quiz">
      <div className="question">
        <h2>
          What does <span>&quot;winter stock&quot;</span> refer to in a store?
        </h2>
        <p className="translation">
          ماذا تعني عبارة &quot;مخزون الشتاء&quot; في المتجر؟
        </p>
      </div>

      <div className="solutions">
        <div className="solution wrong">
          <span className="character">A</span> A special discount
          <p className="translation">خصم خاص</p>
        </div>
        <div className="solution wrong">
          <span className="character">B</span> Old winter products
          <p className="translation">منتجات شتوية قديمة</p>
        </div>
        <div className="solution wrong">
          <span className="character">C</span> New arrivals
          <p className="translation">وصولات جديدة</p>
        </div>
        <div className="solution right">
          <span className="character">D</span> Store decorations
          <p className="translation">زينة المتجر</p>
        </div>
      </div>

      <button className="next-btn">Next Question</button>
    </div>
  );
}

export default QuizPage;
