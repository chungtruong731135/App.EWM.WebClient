export const getPieOptions = (dataBar) => {
  return {
    chart: {
      type: 'donut',
      height: 300,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      },
      pie: {
        donut: {
          size: '50%',
        },
      },
    },
    legend: {
      position: 'bottom',
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    labels: dataBar,
  };
};
export const getColumnOptions = (dataBar) => {
  return {
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: dataBar,
    },

    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (value) => {
          return value;
        },
      },
    },
  };
};
