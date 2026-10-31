/*
 * jeexles.licham — Independent Vietnamese lunisolar calculation module.
 * Astronomical calculation (solar longitude and geocentric new moon), UTC+07.
 * Implemented for this project without importing any third-party calendar code.
 */
(() => {
  'use strict';
  const RAD = Math.PI / 180;
  const LOCAL_OFFSET_DAYS = 7 / 24;
  const BASE_JDN = 2440588; // Gregorian 1970-01-01
  const STEMS = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  const BRANCHES = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  const TERMS = ['Xuân phân','Thanh minh','Cốc vũ','Lập hạ','Tiểu mãn','Mang chủng','Hạ chí','Tiểu thử','Đại thử','Lập thu','Xử thử','Bạch lộ','Thu phân','Hàn lộ','Sương giáng','Lập đông','Tiểu tuyết','Đại tuyết','Đông chí','Tiểu hàn','Đại hàn','Lập xuân','Vũ thủy','Kinh trập'];
  const normalize = degrees => ((degrees % 360) + 360) % 360;
  const sine = x => Math.sin(x * RAD);
  const jdnOf = (day, month, year) => Math.floor(Date.UTC(year, month - 1, day) / 86400000) + BASE_JDN;
  const civilDate = jd => {
    const d = new Date((jd - BASE_JDN) * 86400000);
    return [d.getUTCDate(),d.getUTCMonth()+1,d.getUTCFullYear()];
  };
  // Polynomial approximation of TT–UT, in seconds; sufficient for civil-day lunisolar display.
  function deltaT(year) {
    if (year < 1920) {
      const u=(year-1900)/100;
      return -2.79+149.4119*u-598.939*u*u+6196.6*u*u*u-19700*u**4+25200*u**5;
    }
    if (year < 1941) {
      const t=year-1920;
      return 21.20+0.84493*t-0.076100*t*t+0.0020936*t*t*t;
    }
    if (year < 1961) {
      const t=year-1950;
      return 29.07+0.407*t-t*t/233+t*t*t/2547;
    }
    if (year < 1986) {
      const t=year-1975;
      return 45.45+1.067*t-t*t/260-t*t*t/718;
    }
    if (year < 2005) {
      const t=year-2000;
      return 63.86+0.3345*t-0.060374*t*t+0.0017275*t**3+0.000651814*t**4+0.00002373599*t**5;
    }
    if (year < 2050) {
      const t=year-2000;
      return 62.92+0.32217*t+0.005589*t*t;
    }
    const u=(year-1820)/100;
    return -20+32*u*u;
  }
  // Meeus-style analytical phase series, expressed independently for new moon JDE.
  // k=0 starts at 2000-01-06 UTC. The result is translated from TT to UTC.
  const newMoonUTC = k => {
    const t=k/1236.85, t2=t*t, t3=t2*t, t4=t3*t;
    const eccentricity=1-0.002516*t-0.0000074*t2;
    const solarAnomaly=2.5534+29.1053567*k-0.0000014*t2-0.00000011*t3;
    const lunarAnomaly=201.5643+385.81693528*k+0.0107582*t2+0.00001238*t3-0.000000058*t4;
    const argLatitude=160.7108+390.67050284*k-0.0016118*t2-0.00000227*t3+0.000000011*t4;
    const node=124.7746-1.56375588*k+0.0020672*t2+0.00000215*t3;
    const s=sine, M=solarAnomaly, P=lunarAnomaly, F=argLatitude, E=eccentricity;
    let jde=2451550.09766+29.530588861*k+0.00015437*t2-0.000000150*t3+0.00000000073*t4;
    jde+=-0.40720*s(P)+0.17241*E*s(M)+0.01608*s(2*P)+0.01039*s(2*F);
    jde+=0.00739*E*s(P-M)-0.00514*E*s(P+M)+0.00208*E*E*s(2*M);
    jde+=-0.00111*s(P-2*F)-0.00057*s(P+2*F)+0.00056*E*s(2*P+M);
    jde+=-0.00042*s(3*P)+0.00042*E*s(M+2*F)+0.00038*E*s(M-2*F);
    jde+=-0.00024*E*s(2*P-M)-0.00017*s(node)-0.00007*s(P+2*M);
    jde+=0.00004*s(2*P-2*F)+0.00004*s(3*M)+0.00003*s(P+M-2*F);
    jde+=0.00003*s(2*P+2*F)-0.00003*s(P+M+2*F)+0.00003*s(P-M+2*F);
    jde+=-0.00002*s(P-M-2*F)-0.00002*s(3*P+M)+0.00002*s(4*P);
    const A1=299.77+0.107408*k-0.009173*t2;
    jde+=0.000325*s(A1)+0.000165*s(251.88+0.016321*k);
    jde+=0.000164*s(251.83+26.651886*k)+0.000126*s(349.42+36.412478*k);
    jde+=0.000110*s(84.66+18.206239*k)+0.000062*s(141.74+53.303771*k);
    jde+=0.000060*s(207.14+2.453732*k)+0.000056*s(154.84+7.306860*k);
    jde+=0.000047*s(34.52+27.261239*k)+0.000042*s(207.19+0.121824*k);
    jde+=0.000040*s(291.34+1.844379*k)+0.000037*s(161.72+24.198154*k);
    jde+=0.000035*s(239.56+25.513099*k)+0.000023*s(331.55+3.592518*k);
    const approxYear=2000+(k*29.530588861)/365.2425;
    return jde-deltaT(approxYear)/86400;
  };
  // Apparent geocentric tropical longitude of the Sun, degrees [0, 360).
  const solarDegrees = jdUT => {
    const cent=(jdUT+deltaT(2000+(jdUT-2451545)/365.2425)/86400-2451545)/36525;
    const meanLong=280.46646+36000.76983*cent+0.0003032*cent*cent;
    const anomaly=357.52911+35999.05029*cent-0.0001537*cent*cent;
    const equation=(1.914602-0.004817*cent-0.000014*cent*cent)*sine(anomaly)
      +(0.019993-0.000101*cent)*sine(2*anomaly)+0.000289*sine(3*anomaly);
    return normalize(meanLong+equation-0.00569-0.00478*sine(125.04-1934.136*cent));
  };
  const vnDay = jd => Math.floor(jd + 0.5 + LOCAL_OFFSET_DAYS);
  const estimatedK = jd => (jd-2451550.09766)/29.530588861;
  const moonCache = new Map();
  const moon = k => {
    if (!moonCache.has(k)) {
      const instant=newMoonUTC(k);
      moonCache.set(k,{k,instant,jd:vnDay(instant)});
    }
    return moonCache.get(k);
  };
  // Find astronomical winter solstice by bisecting apparent solar longitude 270°.
  const winterSolstice = year => {
    const begin=jdnOf(18,12,year)-0.5, end=jdnOf(25,12,year)-0.5;
    let lo=begin,hi=end;
    for (let n=0;n<40;n++) {
      const mid=(lo+hi)/2;
      const diff=((solarDegrees(mid)-270+540)%360)-180;
      if (diff<0)lo=mid;else hi=mid;
    }
    return (lo+hi)/2;
  };
  const monthContainingLocalDate = jdn => {
    let k=Math.floor(estimatedK(jdn-0.5-LOCAL_OFFSET_DAYS));
    while(moon(k+1).jd<=jdn)k++;
    while(moon(k).jd>jdn)k--;
    return k;
  };
  const cycleCache = new Map();
  function cycle(solsticeYear) {
    if (cycleCache.has(solsticeYear)) return cycleCache.get(solsticeYear);
    const startK=monthContainingLocalDate(vnDay(winterSolstice(solsticeYear)));
    const endK=monthContainingLocalDate(vnDay(winterSolstice(solsticeYear+1)));
    const count=endK-startK;
    if(count!==12&&count!==13)throw new Error('Lunar year phase count inconsistent for '+solsticeYear);
    // If 13 months occur, the first interval without a major solar term is leap.
    let leapK=null;
    if(count===13){
      for(let k=startK+1;k<endK;k++){
        // Sectors at exact new moon instants (boundary convention).
        const a=solarDegrees(moon(k).jd-0.5-LOCAL_OFFSET_DAYS);
        const b=solarDegrees(moon(k+1).jd-0.5-LOCAL_OFFSET_DAYS);
        if(Math.floor(a/30)===Math.floor(b/30)) {leapK=k;break;}
      }
      if(leapK===null)throw new Error('Missing leap month '+solsticeYear);
    }
    const list=[];
    let number=11;
    for(let k=startK;k<endK;k++){
      const isLeap=k===leapK;
      if(k!==startK && !isLeap)number=number%12+1;
      list.push({year:number<=10?solsticeYear+1:solsticeYear,month:number,leap:isLeap?1:0,jd:moon(k).jd,k});
    }
    cycleCache.set(solsticeYear,list);
    return list;
  }
  const yearCache=new Map();
  function getYearInfo(year) {
    if(!yearCache.has(year)) {
      const entries=[...cycle(year-1),...cycle(year),...cycle(year+1)]
        .filter(x=>x.year===year)
        .sort((a,b)=>a.jd-b.jd);
      yearCache.set(year,entries);
    }
    return yearCache.get(year);
  }
  function getLunarDate(day,month,year) {
    const jd=jdnOf(day,month,year);
    const candidates=[...cycle(year-2),...cycle(year-1),...cycle(year)];
    let item=null;
    for(const entry of candidates)if(entry.jd<=jd && (!item||entry.jd>item.jd))item=entry;
    if(!item)throw new Error('Cannot calculate lunar date');
    return {day:jd-item.jd+1,month:item.month,year:item.year,leap:item.leap,jd};
  }
  const getYearCanChi = year => `${STEMS[(year+6)%10]} ${BRANCHES[(year+8)%12]}`;
  function getCanChi(ld) {
    const dayName=`${STEMS[(ld.jd+9)%10]} ${BRANCHES[(ld.jd+1)%12]}`;
    const monthName=`${STEMS[(ld.year*12+ld.month+3)%10]} ${BRANCHES[(ld.month+1)%12]}${ld.leap?' (nhuận)':''}`;
    return [dayName,monthName,getYearCanChi(ld.year)];
  }
  // Six auspicious two-hour branches per day, in traditional twelve-branch order.
  const goodHourBranchOffsets = [ [0,1,3,6,8,9], [2,3,5,8,10,11], [0,1,4,5,7,10], [0,2,3,6,7,9], [2,4,5,8,9,11], [1,4,6,7,10,11] ];
  const getGioHoangDao = jd => {
    const dayBranch=(jd+1)%12;
    return goodHourBranchOffsets[dayBranch%6].map(i=>{
      const start=(23+i*2)%24,end=(start+2)%24;
      return `${BRANCHES[i]} (${start}–${end}h)`;
    }).join(', ');
  };
  const getSunLongitude = (jd,tz=7) => Math.floor(solarDegrees(jd-0.5-tz/24)/15)%24;
  const firstDay=jdnOf(1,1,1901),lastDay=jdnOf(31,12,2098);
  window.JeexLunar=Object.freeze({getLunarDate,getYearInfo,getCanChi,getYearCanChi,getGioHoangDao,getSunLongitude,fromDayNumber:civilDate,getSolarDayNumber:jdnOf,solarTerms:TERMS,firstDay,lastDay});
})();
