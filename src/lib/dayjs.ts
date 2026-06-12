   import dayjs from 'dayjs';
   import isBetween from 'dayjs/plugin/isBetween';

   // Extender dayjs con el plugin isBetween
   dayjs.extend(isBetween);

   export default dayjs;