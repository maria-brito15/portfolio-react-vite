import type { Album } from '../../data/personal/types';
import type { PersonalState } from '../../hooks/usePersonal';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';
import AttributionFooter from './AttributionFooter';
import EditorialSection from './EditorialSection';
import FeedState from './FeedState';
import PlaceholderBadge from './PlaceholderBadge';
import SourceBadge from './SourceBadge';
import StaleNotice from './StaleNotice';
import { Empty } from './States';

// `start`: quantos itens vêm antes, para a numeração continuar entre as duas listas.
function AlbumList({ albums, start = 0 }: { albums: Album[]; start?: number }) {
  const { lang } = useLanguage();
  const p = usePersonalText();

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
                <span className="pe-kicker">{p.music.note}</span> {album.note[lang]}
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
  const p = usePersonalText();
  const text = p.music;

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
              <Empty>{text.empty}</Empty>
            ) : (
              <>
                {rotation.length > 0 && (
                  <EditorialSection title={text.rotation}>
                    <AlbumList albums={rotation} />
                  </EditorialSection>
                )}
                {rest.length > 0 && (
                  <EditorialSection title={text.all}>
                    <AlbumList albums={rest} start={rotation.length} />
                  </EditorialSection>
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
