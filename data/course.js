// تجميع وحدات المقرر — المنصة النظرية
import { UNIT1 } from './unit1.js';
import { UNIT2 } from './unit2.js';
import { UNIT3 } from './unit3.js';
import { UNIT4 } from './unit4.js';
import { UNIT5 } from './unit5.js';

export const COURSE = {
  title: 'الاهتزازات والاتزان',
  // هوية تُقرأ في شاشة الترحيب — **الموضع الوحيد** لها، فلا تُكرَّر في js/ فتنحرف
  emoji: '〰️',
  tagline: 'افهم الموجة قبل أن تقيسها',
  audience: 'متدربو تقنية الصيانة الميكانيكية — دبلوم',
  code: '264 مصيم',
  units: [UNIT1, UNIT2, UNIT3, UNIT4, UNIT5],
};
