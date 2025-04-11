// components/TransactionPieChart.jsx
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

const TransactionPieChart = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    axios.get('/api/dashboard/transaction-summary').then(res => {
      const labels = res.data.map(item => item._id);
      const values = res.data.map(item => item.totalAmount);

      setData({
        labels,
        datasets: [{
          label: 'Transaction Breakdown',
          data: values,
          backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384']
        }]
      });
    });
  }, []);

  return (
    <div className="w-96 mx-auto mt-8">
      <h2 className="text-xl font-semibold text-center">Transaction Breakdown</h2>
      <Pie data={data} />
    </div>
  );
};

export default TransactionPieChart;
