import { copy } from '../content/copy'
import { Icon } from './ui/Icon'

/** Die vier Vorteile unter dem Hero (Entwurf „Hero – Desktop 1586“, styles/hero.css); unter 1280 px untereinander. */
export function Vertrauensleiste() {
  return (
    <section id="vorteile" aria-label={copy.vertrauen.label}>
      <ul className="hd-vorteile">
        {copy.vertrauen.punkte.map((punkt) => (
          <li key={punkt.titel} className="hd-vorteil">
            <span className="hd-vorteil-kreis">
              <Icon name={punkt.icon} className={`hd-vorteil-icon ${punkt.icon}`} />
            </span>
            <div className="hd-vorteil-text">
              <h3>{punkt.titel}</h3>
              <p>
                {punkt.text[0]}
                <br />
                {punkt.text[1]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
