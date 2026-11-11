import apiClient, { USE_MOCK } from './api';

export const reportService = {
  async getReportData(params = {}) {
    if (!USE_MOCK) {
      const response = await apiClient.get('/reports', { params });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    return {
      dateRange: '14 September – 8 November 2026',
      kpis: {
        averageUtilization: { value: '90%', note: '2,310 / 2,560 available hours' },
        currentOvertime: { value: '24 hrs', note: 'Unchanged from last week' },
        currentAtRisk: { value: '3', note: 'Up from 1 four weeks ago' },
        teamRiskTrend: { value: '+22 pts', note: '36 → 58 over eight weeks' },
      },
      demandChart: [
        { week: '14 Sep', hours: 260, capacity: 320 },
        { week: '21 Sep', hours: 268, capacity: 320 },
        { week: '28 Sep', hours: 278, capacity: 320 },
        { week: '5 Oct', hours: 292, capacity: 320 },
        { week: '12 Oct', hours: 294, capacity: 320 },
        { week: '19 Oct', hours: 298, capacity: 320 },
        { week: '26 Oct', hours: 314, capacity: 320 },
        { week: '2 Nov', hours: 306, capacity: 320 },
      ],
      riskChart: [
        { week: '14 Sep', score: 36 },
        { week: '21 Sep', score: 38 },
        { week: '28 Sep', score: 40 },
        { week: '5 Oct', score: 43 },
        { week: '12 Oct', score: 46 },
        { week: '19 Oct', score: 50 },
        { week: '26 Oct', score: 52 },
        { week: '2 Nov', score: 58 },
      ],
      takeaway: {
        headline: "The team isn't short on hours.\nThe hours are unevenly shared.",
        body: "38 unallocated hours sit alongside 24 excess hours. Start with the proposed 6-hour Atlas transfer, then review Beacon's scope.",
        actionLabel: 'Open task rebalancer',
        actionRoute: '/rebalancer',
      },
      pressureTable: [
        {
          project: 'Atlas redesign',
          allocation: '112 / 120 hrs',
          allocated: 112,
          capacity: 120,
          utilization: '93%',
          utilizationVal: 93,
          overdue: '2 tasks',
          peopleAtRisk: '1 person',
          statusVariant: 'balanced',
        },
        {
          project: 'Beacon launch',
          allocation: '122 / 120 hrs',
          allocated: 122,
          capacity: 120,
          utilization: '102%',
          utilizationVal: 102,
          overdue: '3 tasks',
          peopleAtRisk: '2 people',
          statusVariant: 'overloaded',
        },
        {
          project: 'Core platform',
          allocation: '72 / 80 hrs',
          allocated: 72,
          capacity: 80,
          utilization: '90%',
          utilizationVal: 90,
          overdue: '0 tasks',
          peopleAtRisk: '0 people',
          statusVariant: 'balanced',
        },
      ],
    };
  },

  exportCsv(data) {
    if (!USE_MOCK) {
      return apiClient.get('/reports/export-csv', { responseType: 'blob' }).then((response) => {
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'equipoise-workload-report.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return { success: true };
      });
    }
    const csvContent =
      'Project,Allocation,Capacity,Utilization,Overdue Tasks,People At Risk\n' +
      'Atlas redesign,112,120,93%,2,1\n' +
      'Beacon launch,122,120,102%,3,2\n' +
      'Core platform,72,80,90%,0,0\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `equipoise-workload-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return Promise.resolve({ success: true });
  },
};

export default reportService;
