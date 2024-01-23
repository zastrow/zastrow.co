import './html-init';
import './color-mode';
import './rotator';
import resizeWatcher from './resize';
import navSetup from './nav';
import articleUpdater from './article-getter';

navSetup();
resizeWatcher();
articleUpdater();
