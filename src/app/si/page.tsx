import BackToFormula from "./BackToFormula";

export const metadata = {
  title: "SI Units | Lingua Formula",
  description: "The International System of Units (SI) — base units, derived units, and prefixes.",
};

export default function SIPage() {
  return (
    <div style={{ padding: "24px", maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <BackToFormula />
      </div>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}>
        SI Units: The International System
      </h1>
      <p style={{ color: "#444", fontSize: "16px", lineHeight: 1.6, marginBottom: "24px" }}>
        SI units are the International System of Units (Système international d&apos;unités),
        the globally agreed-upon standard for measuring physical quantities in science, engineering,
        and everyday life.
      </p>

      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginTop: "24px", marginBottom: "12px" }}>
        Purpose
      </h2>
      <p style={{ color: "#444", fontSize: "16px", lineHeight: 1.6, marginBottom: "12px" }}>
        SI units provide:
      </p>
      <ul style={{ marginLeft: "20px", marginBottom: "24px", color: "#444", lineHeight: 1.7 }}>
        <li>A consistent measurement framework worldwide</li>
        <li>Unambiguous communication of quantities</li>
        <li>A coherent system, where derived units come directly from base units without extra conversion factors</li>
      </ul>

      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginTop: "24px", marginBottom: "12px" }}>
        The 7 SI base units
      </h2>
      <p style={{ color: "#444", fontSize: "16px", lineHeight: 1.6, marginBottom: "12px" }}>
        Each base unit corresponds to a fundamental physical quantity:
      </p>
      <div style={{ overflowX: "auto", marginBottom: "24px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
              <th style={{ padding: "8px 12px" }}>Quantity</th>
              <th style={{ padding: "8px 12px" }}>Unit name</th>
              <th style={{ padding: "8px 12px" }}>Symbol</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Length", "meter", "m"],
              ["Mass", "kilogram", "kg"],
              ["Time", "second", "s"],
              ["Electric current", "ampere", "A"],
              ["Thermodynamic temperature", "kelvin", "K"],
              ["Amount of substance", "mole", "mol"],
              ["Luminous intensity", "candela", "cd"],
            ].map(([q, name, sym]) => (
              <tr key={q} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px 12px" }}>{q}</td>
                <td style={{ padding: "8px 12px" }}>{name}</td>
                <td style={{ padding: "8px 12px" }}>{sym}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginTop: "24px", marginBottom: "12px" }}>
        Derived SI units
      </h2>
      <p style={{ color: "#444", fontSize: "16px", lineHeight: 1.6, marginBottom: "12px" }}>
        Derived units are formed by algebraic combinations of base units. Examples:
      </p>
      <div style={{ overflowX: "auto", marginBottom: "24px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
              <th style={{ padding: "8px 12px" }}>Quantity</th>
              <th style={{ padding: "8px 12px" }}>Unit name</th>
              <th style={{ padding: "8px 12px" }}>Symbol</th>
              <th style={{ padding: "8px 12px" }}>In base units</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Force", "newton", "N", "kg·m·s⁻²"],
              ["Energy / Work", "joule", "J", "kg·m²·s⁻²"],
              ["Power", "watt", "W", "kg·m²·s⁻³"],
              ["Pressure", "pascal", "Pa", "kg·m⁻¹·s⁻²"],
              ["Electric charge", "coulomb", "C", "A·s"],
            ].map(([q, name, sym, base]) => (
              <tr key={q} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px 12px" }}>{q}</td>
                <td style={{ padding: "8px 12px" }}>{name}</td>
                <td style={{ padding: "8px 12px" }}>{sym}</td>
                <td style={{ padding: "8px 12px" }}>{base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginTop: "24px", marginBottom: "12px" }}>
        SI prefixes
      </h2>
      <p style={{ color: "#444", fontSize: "16px", lineHeight: 1.6, marginBottom: "12px" }}>
        Prefixes indicate powers of ten:
      </p>
      <div style={{ overflowX: "auto", marginBottom: "24px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
              <th style={{ padding: "8px 12px" }}>Prefix</th>
              <th style={{ padding: "8px 12px" }}>Symbol</th>
              <th style={{ padding: "8px 12px" }}>Factor</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["kilo", "k", "10³"],
              ["milli", "m", "10⁻³"],
              ["micro", "μ", "10⁻⁶"],
              ["nano", "n", "10⁻⁹"],
            ].map(([prefix, sym, factor]) => (
              <tr key={prefix} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px 12px" }}>{prefix}</td>
                <td style={{ padding: "8px 12px" }}>{sym}</td>
                <td style={{ padding: "8px 12px" }}>{factor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ color: "#444", fontSize: "16px", lineHeight: 1.6, marginBottom: "24px" }}>
        <strong>Example:</strong> 1 km = 10³ m &nbsp; &nbsp; 1 ms = 10⁻³ s
      </p>

      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginTop: "24px", marginBottom: "12px" }}>
        Modern definition
      </h2>
      <p style={{ color: "#444", fontSize: "16px", lineHeight: 1.6, marginBottom: "24px" }}>
        As of 2019, SI units are defined not by physical objects, but by fixing exact numerical values
        of fundamental constants (e.g., speed of light, Planck&apos;s constant). This makes the system
        stable, universal, and reproducible anywhere.
      </p>

      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginTop: "24px", marginBottom: "12px" }}>
        In short
      </h2>
      <p style={{ color: "#444", fontSize: "16px", lineHeight: 1.6, marginBottom: "24px" }}>
        SI units are the grammar of measurement: a shared, precise language that ensures quantities,
        equations, and experiments mean the same thing everywhere.
      </p>

      <div style={{ marginTop: "16px" }}>
        <BackToFormula />
      </div>
    </div>
  );
}
