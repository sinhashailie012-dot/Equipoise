export const weekLabels = [
  '14 Sep',
  '21 Sep',
  '28 Sep',
  '5 Oct',
  '12 Oct',
  '19 Oct',
  '26 Oct',
  '2 Nov'
];

export const overtimeData = [
  { week: '14 Sep', hours: 0 },
  { week: '21 Sep', hours: 0 },
  { week: '28 Sep', hours: 2 },
  { week: '5 Oct', hours: 4 },
  { week: '12 Oct', hours: 10 },
  { week: '19 Oct', hours: 16 },
  { week: '26 Oct', hours: 24 },
  { week: '2 Nov', hours: 24 },
];

export const demandCapacityData = [
  { week: '14 Sep', hours: 260 },
  { week: '21 Sep', hours: 268 },
  { week: '28 Sep', hours: 278 },
  { week: '5 Oct', hours: 292 },
  { week: '12 Oct', hours: 294 },
  { week: '19 Oct', hours: 298 },
  { week: '26 Oct', hours: 314 },
  { week: '2 Nov', hours: 306 },
];

export const riskTrendData = [
  { week: '14 Sep', score: 36 },
  { week: '21 Sep', score: 38 },
  { week: '28 Sep', score: 40 },
  { week: '5 Oct', score: 43 },
  { week: '12 Oct', score: 46 },
  { week: '19 Oct', score: 50 },
  { week: '26 Oct', score: 52 },
  { week: '2 Nov', score: 58 },
];

export const heatmapEmployees = [
  { name: 'Asha Patel', values: [34, 36, 38, 40, 44, 46, 50, 48] },
  { name: 'Daniel Kim', values: [32, 30, 34, 32, 30, 28, 30, 28] },
  { name: 'Sofia Rivera', values: [32, 34, 36, 38, 40, 42, 44, 44] },
  { name: 'James Okafor', values: [30, 32, 34, 36, 34, 36, 38, 36] },
  { name: 'Mei Tan', values: [36, 38, 36, 40, 38, 40, 40, 40] },
  { name: 'Marcus Reed', values: [36, 38, 42, 44, 46, 48, 50, 52] },
  { name: 'Olivia Brooks', values: [32, 30, 28, 30, 28, 26, 28, 26] },
  { name: 'Noah Williams', values: [28, 30, 30, 32, 34, 32, 34, 32] },
];

export function getHeatmapColor(value) {
  // <80% (<32): cyan/light blue
  // 80-100% (32-40): sage green
  // 101-110% (41-44): amber/ochre
  // 111-125% (45-50): terracotta
  // >125% (>50): wine/ruby
  if (value < 32) return 'bg-[#DEE8E6] text-[#2D6166]';
  if (value <= 40) return 'bg-[#E6EBDF] text-[#2E5E3B]';
  if (value <= 44) return 'bg-[#EFE4C9] text-[#7A5B1E]';
  if (value <= 50) return 'bg-[#F0DED5] text-[#8C3E23]';
  return 'bg-[#EADADF] text-[#832238]';
}

