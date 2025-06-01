import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  parseISO,
  format,
  isBefore,
  isAfter,
  addDays,
  subDays,
  eachDayOfInterval,
} from "date-fns";

// Register necessary chart elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Define types for the data and grouped structure
type DataItem = {
  amount: number;
  category: string;
  timestamp: string;
};

type GroupedType = {
  [date: string]: {
    [category: string]: number;
  };
};

// Generate chart data grouped by date and category
const generateChartData = (
  data: DataItem[],
  startDate: string,
  endDate: string
) => {
  const grouped: GroupedType = data.reduce(
    (acc, { amount, category, timestamp }) => {
      const date = format(parseISO(timestamp), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = {};
      if (!acc[date][category]) acc[date][category] = 0;
      acc[date][category] += amount;
      return acc;
    },
    {} as GroupedType
  );

  // date-fns does not provide a direct range array function, so we use eachDayOfInterval
  const dateRange = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  }).map((date) => format(date, "yyyy-MM-dd"));

  const labels = dateRange.sort();
  const categories = Array.from(new Set(data.map((d) => d.category)));

  const datasets = categories.map((category) => ({
    label: category,
    data: labels.map((date) => grouped?.[date]?.[category] || 0),
    borderColor: getRandomColor(),
    backgroundColor: getRandomColor(),
    fill: false,
    tension: 0.2,
  }));

  return { labels, datasets };
};

const getRandomColor = () =>
  `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(
    Math.random() * 200
  )}, ${Math.floor(Math.random() * 200)}, 0.7)`;

interface ChartWithFilterProps {
  originalData: DataItem[];
}

const ChartWithFilter: React.FC<ChartWithFilterProps> = ({ originalData }) => {
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 5), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(subDays(new Date(), 1), "yyyy-MM-dd")
  );
  const [chartType, setChartType] = useState<"bar" | "line">("line");

  const filteredData = originalData.filter(({ timestamp }) => {
    const date = parseISO(timestamp);
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    return (
      (!startDate || !isBefore(date, start)) &&
      (!endDate || !isAfter(date, end))
    );
  });

  const chartData = generateChartData(filteredData, startDate, endDate);

  return (
    <div className="p-2 relative min-h-64 shadow">
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm">
          Start Date:
          <input
            type="date"
            max={format(new Date(), "yyyy-MM-dd")}
            value={startDate}
            onChange={(e) => {
              const newStart = e.target.value;
              setStartDate(newStart);

              const autoEnd = addDays(parseISO(newStart), 5);
              const today = new Date();

              // Set end date as min(autoEnd, today)
              const adjustedEnd = autoEnd > today ? today : autoEnd;
              setEndDate(format(adjustedEnd, "yyyy-MM-dd"));
            }}
            className="ml-2 border rounded px-2 py-1"
          />
        </label>
        <label className="text-sm">
          End Date:
          <input
            type="date"
            value={endDate}
            readOnly
            max={format(new Date(), "yyyy-MM-dd")}
            className="ml-2 border rounded px-2 py-1"
          />
        </label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as "bar" | "line")}
          className="ml-auto border rounded px-2 py-1 text-sm flex self-end"
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
        </select>
      </div>

      {filteredData.length ? (
        <div className="p-4 ">
          {chartType === "bar" ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
              height={300}
            />
          ) : (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
              height={300}
            />
          )}
        </div>
      ) : (
        <div className="absolute top-1/2 translate-x-1/2 font-bold">
          Please update the date filters
        </div>
      )}
    </div>
  );
};

export default ChartWithFilter;
