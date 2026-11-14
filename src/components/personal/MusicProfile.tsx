import { music, type MusicData } from '../../data/personal/music';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';
import CuratedEntry from './CuratedEntry';
import EditorialSection from './EditorialSection';
import InstrumentCard from './InstrumentCard';

// Parte da página de música que vem de `data/personal/music.ts` (sem rede, sem estado de
// carregamento): instrumentos, prática atual, artistas e músicas. Seção sem item não aparece.
// Os discos continuam em `MusicList` (mesma curadoria, passa pela fonte `manual`).
export default function MusicProfile({ data = music }: { data?: MusicData }) {
  const { lang } = useLanguage();
  const text = usePersonalText().music;
  const instrumentName = (id?: string) => data.instruments.find((i) => i.id === id)?.name[lang];

  return (
    <>
      {data.instruments.length > 0 && (
        <EditorialSection title={text.instruments}>
          <ul className="pe-cards">
            {data.instruments.map((instrument) => (
              <InstrumentCard key={instrument.id} instrument={instrument} />
            ))}
          </ul>
        </EditorialSection>
      )}
      {data.practice.length > 0 && (
        <EditorialSection title={text.practice}>
          <ol className="pe-entries">
            {data.practice.map((item, i) => (
              <CuratedEntry
                key={item.id}
                index={i}
                kicker={text.kicker.learning}
                title={item.title}
                meta={[item.artist, instrumentName(item.instrumentId)].filter(Boolean).join(' · ')}
                note={item.note?.[lang]}
                noteLabel={text.note}
              />
            ))}
          </ol>
        </EditorialSection>
      )}
      {data.artists.length > 0 && (
        <EditorialSection title={text.artists}>
          <ol className="pe-entries">
            {data.artists.map((artist, i) => (
              <CuratedEntry
                key={artist.id}
                index={i}
                title={artist.name}
                note={artist.note?.[lang]}
                noteLabel={text.note}
              />
            ))}
          </ol>
        </EditorialSection>
      )}
      {data.songs.length > 0 && (
        <EditorialSection title={text.songs}>
          <ol className="pe-entries">
            {data.songs.map((song, i) => (
              <CuratedEntry
                key={song.id}
                index={i}
                kicker={song.onRepeat ? text.kicker.onRepeat : undefined}
                title={song.title}
                meta={song.artist}
                note={song.note?.[lang]}
                noteLabel={text.note}
              />
            ))}
          </ol>
        </EditorialSection>
      )}
    </>
  );
}
