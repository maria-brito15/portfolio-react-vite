import type { Album } from '../../data/personal/types';
import type { PersonalState } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';
import AttributionFooter from './AttributionFooter';
import FeedState from './FeedState';
import PlaceholderBadge from './PlaceholderBadge';
import SourceBadge from './SourceBadge';
import StaleNotice from './StaleNotice';

// `start`: quantos itens vêm antes, para a numeração continuar entre as duas listas.
function AlbumList({ albums, start = 0 }: { albums: Album[]; start?: number }) {
  const { lang, t } = useLanguage();

  return (
    <ol className="pe-entries">
      {albums.map((album, i) => (
        <li key={album.id}>
          <span className="pe-num" aria-hidden="true">
            {String(start + i + 1).padStart(2, '0')}
          </span>
          <div>
            <p className="pe-entry-title">{album.title}</p>
            <p className="pe-entry-meta">
              <span>
                {album.artist}
                {album.year !== undefined && ` · ${album.year}`}
              </span>
              <SourceBadge provenance={album.provenance} />
            </p>
            {album.note && (
              <p className="pe-entry-note">
                <span className="pe-kicker">{t.personal.music.note}</span> {album.note[lang]}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Música (CL-23): curadoria manual, sem player nem terceiros. "Em rotação" primeiro, depois a
// lista de discos e artistas; cada um com uma nota editorial curta quando a Duda escreveu.
export default function MusicList({
  state,
  retry,
}: {
  state: PersonalState<Album>;
  retry: () => void;
}) {
  const { t } = useLanguage();
  const text = t.personal.music;

  return (
    <FeedState state={state} retry={retry}>
      {(feed) => {
        const rotation = feed.items.filter((a) => a.inRotation);
        const rest = feed.items.filter((a) => !a.inRotation);

        return (
          <>
            <PlaceholderBadge source={feed.source} />
            <StaleNotice stale={feed.stale} updatedAt={feed.updatedAt} />
            {feed.items.length === 0 ? (
              <p className="pe-state">{text.empty}</p>
            ) : (
              <>
                {rotation.length > 0 && (
                  <section className="pe-month">
                    <h2 className="pe-month-title">{text.rotation}</h2>
                    <AlbumList albums={rotation} />
                  </section>
                )}
                {rest.length > 0 && (
                  <section className="pe-month">
                    <h2 className="pe-month-title">{text.all}</h2>
                    <AlbumList albums={rest} start={rotation.length} />
                  </section>
                )}
              </>
            )}
            <AttributionFooter feed={feed} />
          </>
        );
      }}
    </FeedState>
  );
}
