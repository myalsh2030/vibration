// تجميع بنوك الأسئلة: التشخيصي + القبلية + نقاط التفتيش — المنصة النظرية
import { U1_QUIZZES, U1_DIAG } from './unit1.js';
import { U2_QUIZZES, U2_DIAG } from './unit2.js';
import { U3_QUIZZES, U3_DIAG } from './unit3.js';
import { U4_QUIZZES, U4_DIAG } from './unit4.js';
import { U5_QUIZZES, U5_DIAG } from './unit5.js';

export const QUIZZES = {
  ...U1_QUIZZES,
  ...U2_QUIZZES,
  ...U3_QUIZZES,
  ...U4_QUIZZES,
  ...U5_QUIZZES,
  diag: {
    title: 'الاختبار التشخيصي الشامل',
    questions: [...U1_DIAG, ...U2_DIAG, ...U3_DIAG, ...U4_DIAG, ...U5_DIAG],
  },
};
