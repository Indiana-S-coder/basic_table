import React, { useState, useEffect } from "react";
import { Table, Flex } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


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

interface JobTitleData {
  title: string;
  count: number;
}

const App: React.FC = () => {
  const [data, setData] = useState<SalaryData[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [jobTitleData, setJobTitleData] = useState<JobTitleData[]>([]);

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        const aggregated = aggregateData(data);
        setAggregatedData(aggregated);
      });
  }, []);

  const aggregateData = (data: SalaryData[]): AggregatedData[] => {
    const aggregated: Record<string, { total_jobs: number; total_salary: number }> = {};

    data.forEach((item) => {
      const year = item.work_year.toString();
      if (!aggregated[year]) {
        aggregated[year] = { total_jobs: 0, total_salary: 0 };
      }
      aggregated[year].total_jobs += 1;
      aggregated[year].total_salary += item.salary_in_usd;
    });

    return Object.keys(aggregated).map((year) => ({
      year: parseInt(year),
      total_jobs: aggregated[year].total_jobs,
      average_salary: Math.round(aggregated[year].total_salary / aggregated[year].total_jobs),
    }));
  };

  const handleRowClick = (record: AggregatedData) => {
    const filteredData = data.filter((item) => item.work_year === record.year);
    const jobTitleCount: Record<string, number> = {};

    filteredData.forEach((item) => {
      if (!jobTitleCount[item.job_title]) {
        jobTitleCount[item.job_title] = 0;
      }
      jobTitleCount[item.job_title] += 1;
    });

    const jobTitleData = Object.keys(jobTitleCount).map((title) => ({
      title,
      count: jobTitleCount[title],
    }));

    setSelectedYear(record.year);
    setJobTitleData(jobTitleData);
  };

  const columns = [
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      sorter: (a: AggregatedData, b: AggregatedData) => a.year - b.year,
    },
    {
      title: "Total Jobs",
      dataIndex: "total_jobs",
      key: "total_jobs",
      sorter: (a: AggregatedData, b: AggregatedData) => a.total_jobs - b.total_jobs,
    },
    {
      title: "Average Salary (USD)",
      dataIndex: "average_salary",
      key: "average_salary",
      sorter: (a: AggregatedData, b: AggregatedData) => a.average_salary - b.average_salary,
    },
  ];

  const jobTitleColumns = [
    {
      title: "Job Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Number of Jobs",
      dataIndex: "count",
      key: "count",
    },
  ];

  return (
    <Flex align="center" vertical>
      <Table
        columns={columns}
        dataSource={aggregatedData}
        rowKey="year"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
      />
      {selectedYear && (
        <>
          <h2>Job Titles for {selectedYear}</h2>
          <Table
            columns={jobTitleColumns}
            dataSource={jobTitleData}
            rowKey="title"
            // pagination={true}
          />
        </>
      )}
      <h2>Job Trends</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={aggregatedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total_jobs" stroke="#8884d8" />
          <Line type="monotone" dataKey="average_salary" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </Flex>
  );
};

export default App;
