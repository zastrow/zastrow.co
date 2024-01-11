import './html-init';
import resizeWatcher from './resize';
import navSetup from './nav';
import articleUpdater from './article-getter';

navSetup();
resizeWatcher();
articleUpdater();
