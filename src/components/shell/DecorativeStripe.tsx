// Faixa decorativa de cinco cores (FR-038, TD-021): sem texto, sem foco, escondida de leitor de tela.
const COLORS = [1, 2, 3, 4, 5];

export default function DecorativeStripe() {
  return (
    <div className="deco-stripe" aria-hidden="true">
      {COLORS.map((n) => (
        <span key={n} className={`deco-${n}`} />
      ))}
    </div>
  );
}
