import { mount } from './mount';
import './styles/tokens.css';
import './styles/ui.css';
import './styles/base.css';
import './styles/services.css';
import './styles/sections.css';
import './styles/responsive.css';
import './styles/terminal.css';
import './styles/shell.css';
import './styles/personal.css';
import './styles/resume.css';
import { announceInConsole } from './utils/consoleMessage';

announceInConsole();

// `hydrateRoot` quando o HTML pré-renderizado já está no `#root`; `createRoot` no `vite dev`.
mount(document.getElementById('root') as HTMLElement);
