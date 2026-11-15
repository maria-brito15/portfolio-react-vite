import TrailCard from '../../trails/TrailCard';
import Cover from './Cover';
import EpigraphBand from './EpigraphBand';
import Sommaire from './Sommaire';
import LensChips from './LensChips';
import RecentActivity from './RecentActivity';

// Home do caderno (CD-10 a CD-16; revisão R1): capa, epígrafe, seções em tiles com as lentes logo
// abaixo, a atividade recente dos feeds e o cartão da trilha (CD-19: trilhas seguem como estão).
export default function NotebookHome() {
  return (
    <>
      <Cover />
      <EpigraphBand />
      <Sommaire />
      <LensChips />
      <RecentActivity />
      <div className="nb-trail">
        <TrailCard />
      </div>
    </>
  );
}
