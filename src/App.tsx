import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
// import 'antd/dist/antd.css';

interface SalaryData {
  work_year: number;
  experience_level: string;
  employment_type: string;
  job_title: string;
  salary: number;
  salary_currency: string;
  salary_in_usd: number;
  employee_residence: string;
  remote_ratio: number;
  company_location: string;
  company_size: string;
}

interface AggregatedData {
  year: number;
  total_jobs: number;
  average_salary: number;
}

const App: React.FC = () => {
  const [data, setData] = useState<SalaryData[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);

  useEffect(() => {
    fetch('/data.json')
      .then(response => response.json())
      .then(data => {
        setData(data);
        const aggregated = aggregateData(data);
        setAggregatedData(aggregated);
      });
  }, []);

  const aggregateData = (data: SalaryData[]): AggregatedData[] => {
    const aggregated: Record<string, { total_jobs: number; total_salary: number }> = {};
  
    data.forEach(item => {
      const year = item.work_year.toString();
      if (!aggregated[year]) {
        aggregated[year] = { total_jobs: 0, total_salary: 0 };
      }
      aggregated[year].total_jobs += 1;
      aggregated[year].total_salary += item.salary_in_usd;
    });

    return Object.keys(aggregated).map(year => ({
      year: parseInt(year),
      total_jobs: aggregated[year].total_jobs,
      average_salary: Math.round(aggregated[year].total_salary / aggregated[year].total_jobs),
    }));
  };

  const columns = [
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      sorter: (a: AggregatedData, b: AggregatedData) => a.year - b.year,
    },
    {
      title: 'Total Jobs',
      dataIndex: 'total_jobs',
      key: 'total_jobs',
      sorter: (a: AggregatedData, b: AggregatedData) => a.total_jobs - b.total_jobs,
    },
    {
      title: 'Average Salary (USD)',
      dataIndex: 'average_salary',
      key: 'average_salary',
      sorter: (a: AggregatedData, b: AggregatedData) => a.average_salary - b.average_salary,
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={aggregatedData}
        rowKey="year"
      />
    </div>
  );
};

export default App;
