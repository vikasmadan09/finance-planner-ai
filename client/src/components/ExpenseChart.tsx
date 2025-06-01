import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ENV } from "@/core/config";

const COLORS = [
  "#a1582b",
  "#d49be0",
  "#5ba0e0",
  "#ac9c20",
  "#21ab8b",
  "#184e81",
  "#69e2c6",
  "#7e761b",
  "#188168",
  "#ca4e63",
  "#a9c43b",
  "#18b418",
  "#803ac5",
  "#b3323d",
  "#b036a1",
  "#f60919",
  "#08dd28",
  "#78659a",
];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (active && payload && payload.length) {
    const { category, display_amount } = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow">
        <p className="text-sm font-semibold">{category}</p>
        <p className="text-sm">{display_amount}</p>
      </div>
    );
  }
  return null;
};

export default function ExpenseChartWithFilter() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // if (startDate && endDate) {
    fetchData();
    // }
  }, []);

  const fetchData = async () => {
    const res = await axios.get(`${ENV.API_URL}/expenses/summary`, {
      withCredentials: true,
    });
    setData(res.data.by_category);
    setTotal(res.data.total_amount);
  };

  return (
    <div className="p-2 text-sm shadow">
      <div className="flex flex-col items-center p-4 ">
        <ResponsiveContainer width="100%" height={300} aspect={1}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              label={({ name }) => name}
              labelLine={false}
            >
              {data.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Centered Total Text */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xl font-semibold"
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
