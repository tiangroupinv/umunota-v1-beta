'use client';
import {Globe2} from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import {languageOptions,useLanguage} from './LanguageProvider';
export default function LanguageMenu(){const {lang,setLang,t}=useLanguage();return <CustomDropdown compact icon={Globe2} label={t('language')} value={lang} onChange={value=>setLang(value as any)} options={languageOptions.map(([value,label])=>({value,label}))}/>}
