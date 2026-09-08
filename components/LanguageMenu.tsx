'use client';
import {Globe2} from 'lucide-react';
import {languageOptions,useLanguage} from './LanguageProvider';
export default function LanguageMenu(){const {lang,setLang,t}=useLanguage();return <label className="languageSwitcher"><Globe2 size={16}/><select aria-label={t('language')} value={lang} onChange={e=>setLang(e.target.value as any)}>{languageOptions.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>}
