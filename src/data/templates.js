// Templates are imported directly as ES modules — no fetch(), no file:// CORS
// issue, and Vite bundles them at build time. To add a new brand: drop a
// {id}.json file here (same shape as the others) and add it to this list.
import end from './end.json';
import goat from './goat.json';
import nike from './nike.json';
import stockx from './stockx.json';
import apple from './apple.json';
import ebay from './ebay.json';
import lv from './lv.json';
import patagonia from './patagonia.json';
import amazon from './amazon.json';
import goyard from './goyard.json';
import supreme from './supreme.json';
import ovo from './ovo.json';

export const TEMPLATES = [end, goat, nike, stockx, apple, ebay, lv, patagonia, amazon, goyard, supreme, ovo];

export const CATS = { fashion: 'Fashion', tech: 'Technology', market: 'Marketplaces', apparel: 'Apparel', streetwear: 'Streetwear' };
export const CAT_ORDER = ['fashion', 'tech', 'market', 'apparel', 'streetwear'];
