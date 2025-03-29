/**
 * グラフ描画モジュール
 * Chart.jsを使用してデータを可視化します
 */

// グローバル変数
let charts = {
    timeDistribution: null,
    userTime: null,
    softwareUsage: null,
    integrationUsage: null,
    timeComparison: null
};

// グラフの色設定
const chartColors = {
    blue: 'rgba(54, 162, 235, 0.5)',
    blueBorder: 'rgba(54, 162, 235, 1)',
    red: 'rgba(255, 99, 132, 0.5)',
    redBorder: 'rgba(255, 99, 132, 1)',
    green: 'rgba(75, 192, 192, 0.5)',
    greenBorder: 'rgba(75, 192, 192, 1)',
    orange: 'rgba(255, 159, 64, 0.5)',
    orangeBorder: 'rgba(255, 159, 64, 1)',
    purple: 'rgba(153, 102, 255, 0.5)',
    purpleBorder: 'rgba(153, 102, 255, 1)',
    yellow: 'rgba(255, 206, 86, 0.5)',
    yellowBorder: 'rgba(255, 206, 86, 1)',
    grey: 'rgba(201, 203, 207, 0.5)',
    greyBorder: 'rgba(201, 203, 207, 1)'
};

// 業務時間分布グラフを描画
function renderTimeDistributionChart(data, beforeData, afterData, elementId) {
    console.log(`renderTimeDistributionChart 開始: ${elementId}`);
    
    const canvas = document.getElementById(elementId);
    if (!canvas) {
        console.error(`グラフ要素が見つかりません: ${elementId}`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error(`キャンバスコンテキストが取得できません: ${elementId}`);
        return;
    }
    
    // 既存のグラフがあれば破棄
    if (charts.timeDistribution) {
        charts.timeDistribution.destroy();
    }
    
    // 導入前後のデータを処理
    const beforeDistribution = generateTimeDistributionData(beforeData);
    const afterDistribution = generateTimeDistributionData(afterData);
    
    console.log("時間分布データ:", beforeDistribution, afterDistribution);
    
    try {
        charts.timeDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: beforeDistribution.labels,
                datasets: [
                    {
                        label: '導入前',
                        data: beforeDistribution.data,
                        backgroundColor: chartColors.red,
                        borderColor: chartColors.redBorder,
                        borderWidth: 1
                    },
                    {
                        label: '導入後',
                        data: afterDistribution.data,
                        backgroundColor: chartColors.green,
                        borderColor: chartColors.greenBorder,
                        borderWidth: 1
                    }
                ]
            },
            options: getTimeDistributionChartOptions()
        });
        
        console.log(`${elementId} グラフ描画完了`);
    } catch (error) {
        console.error(`${elementId} グラフ描画エラー:`, error);
    }
}

// 業務時間分布グラフのオプション
function getTimeDistributionChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: '業務時間分布',
                font: {
                    size: 16
                }
            },
            legend: {
                position: 'top'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw}件`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '件数'
                }
            },
            x: {
                title: {
                    display: true,
                    text: '業務時間（分）'
                }
            }
        }
    };
}

// 利用者数と業務時間の関係グラフを描画
function renderUserTimeChart(data, beforeData, afterData, type, elementId) {
    console.log(`renderUserTimeChart 開始: ${elementId}`);
    
    const canvas = document.getElementById(elementId);
    if (!canvas) {
        console.error(`グラフ要素が見つかりません: ${elementId}`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error(`キャンバスコンテキストが取得できません: ${elementId}`);
        return;
    }
    
    // 既存のグラフがあれば破棄
    if (charts.userTime) {
        charts.userTime.destroy();
    }
    
    try {
        // 導入前後のデータを処理
        const beforePoints = generateUserTimeData(beforeData, type);
        const afterPoints = generateUserTimeData(afterData, type);
        
        console.log("利用者数と業務時間データ:", beforePoints, afterPoints);
        
        // 回帰直線の計算
        const beforeRegression = calculateRegressionLine(beforePoints);
        const afterRegression = calculateRegressionLine(afterPoints);
        
        // 最大X値を取得
        const maxX = Math.max(
            ...beforePoints.map(p => p.x),
            ...afterPoints.map(p => p.x)
        );
        
        // 回帰直線のデータポイントを生成
        const beforeRegressionPoints = generateRegressionPoints(beforeRegression, maxX);
        const afterRegressionPoints = generateRegressionPoints(afterRegression, maxX);
        
        charts.userTime = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: '導入前 データ',
                        data: beforePoints,
                        backgroundColor: chartColors.red,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: '導入前 傾向線',
                        data: beforeRegressionPoints,
                        type: 'line',
                        borderColor: chartColors.redBorder,
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        tension: 0
                    },
                    {
                        label: '導入後 データ',
                        data: afterPoints,
                        backgroundColor: chartColors.green,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: '導入後 傾向線',
                        data: afterRegressionPoints,
                        type: 'line',
                        borderColor: chartColors.greenBorder,
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        tension: 0
                    }
                ]
            },
            options: getUserTimeChartOptions(type)
        });
        
        console.log(`${elementId} グラフ描画完了`);
    } catch (error) {
        console.error(`${elementId} グラフ描画エラー:`, error);
    }
}

// 利用者数と業務時間の関係グラフのオプション
function getUserTimeChartOptions(type) {
    const xAxisTitle = type === 'business' ? '利用者数' : '担当利用者数';
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: '利用者数と業務時間の関係',
                font: {
                    size: 16
                }
            },
            legend: {
                position: 'top'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        if (context.dataset.type === 'line') {
                            return '';
                        }
                        return `${xAxisTitle}: ${context.raw.x}人, 業務時間: ${context.raw.y}分`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: xAxisTitle
                }
            },
            y: {
                title: {
                    display: true,
                    text: '業務時間（分）'
                }
            }
        }
    };
}

// ソフトウェア使用状況グラフを描画
function renderSoftwareUsageChart(data, elementId) {
    const ctx = document.getElementById(elementId).getContext('2d');
    
    // 既存のグラフがあれば破棄
    if (charts.softwareUsage) {
        charts.softwareUsage.destroy();
    }
    
    const usageData = generateSoftwareUsageData(data);
    if (!usageData) return;
    
    // 色の配列を生成
    const backgroundColors = [
        chartColors.blue,
        chartColors.red,
        chartColors.green,
        chartColors.orange,
        chartColors.purple,
        chartColors.yellow,
        chartColors.grey
    ];
    
    const borderColors = [
        chartColors.blueBorder,
        chartColors.redBorder,
        chartColors.greenBorder,
        chartColors.orangeBorder,
        chartColors.purpleBorder,
        chartColors.yellowBorder,
        chartColors.greyBorder
    ];
    
    charts.softwareUsage = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: usageData.labels,
            datasets: [{
                data: usageData.counts,
                backgroundColor: backgroundColors.slice(0, usageData.labels.length),
                borderColor: borderColors.slice(0, usageData.labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '利用ソフトウェア分布',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value}件 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 連携機能使用状況グラフを描画
function renderIntegrationUsageChart(data, elementId) {
    const ctx = document.getElementById(elementId).getContext('2d');
    
    // 既存のグラフがあれば破棄
    if (charts.integrationUsage) {
        charts.integrationUsage.destroy();
    }
    
    const usageData = generateIntegrationUsageData(data);
    if (!usageData) return;
    
    charts.integrationUsage = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: usageData.labels,
            datasets: [{
                data: usageData.counts,
                backgroundColor: [chartColors.green, chartColors.red],
                borderColor: [chartColors.greenBorder, chartColors.redBorder],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'データ連携システム使用状況',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value}件 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 業務時間比較グラフを描画
function renderTimeComparisonChart(beforeData, afterData, type, elementId) {
    console.log(`renderTimeComparisonChart 開始: ${elementId}`);
    
    const canvas = document.getElementById(elementId);
    if (!canvas) {
        console.error(`グラフ要素が見つかりません: ${elementId}`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error(`キャンバスコンテキストが取得できません: ${elementId}`);
        return;
    }
    
    // 既存のグラフがあれば破棄
    if (charts.timeComparison) {
        charts.timeComparison.destroy();
    }
    
    try {
        // 比較データの生成
        const comparison = generateComparisonData(beforeData, afterData, type);
        console.log("業務時間比較データ:", comparison);
        
        charts.timeComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['平均業務時間'],
                datasets: [
                    {
                        label: '導入前',
                        data: [parseFloat(comparison.beforeAvg) || 0],
                        backgroundColor: chartColors.red,
                        borderColor: chartColors.redBorder,
                        borderWidth: 1
                    },
                    {
                        label: '導入後',
                        data: [parseFloat(comparison.afterAvg) || 0],
                        backgroundColor: chartColors.green,
                        borderColor: chartColors.greenBorder,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '導入前後の平均業務時間比較',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${value.toFixed(1)}分`;
                            },
                            afterLabel: function(context) {
                                if (context.datasetIndex === 1) { // 導入後のデータセット
                                    return `削減率: ${comparison.reductionRate}%`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '平均業務時間（分）'
                        }
                    }
                }
            }
        });
        
        console.log(`${elementId} グラフ描画完了`);
    } catch (error) {
        console.error(`${elementId} グラフ描画エラー:`, error);
    }
}

// 回帰直線を計算
function calculateRegressionLine(data) {
    if (data.length < 2) return { slope: 0, intercept: 0 };
    
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    const n = data.length;
    
    for (let i = 0; i < n; i++) {
        sumX += data[i].x;
        sumY += data[i].y;
        sumXY += data[i].x * data[i].y;
        sumX2 += data[i].x * data[i].x;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
}

// 回帰直線のデータポイントを生成
function generateRegressionPoints(regression, maxX) {
    const points = [];
    for (let x = 0; x <= maxX; x += Math.max(1, Math.floor(maxX / 10))) {
        points.push({
            x: x,
            y: regression.slope * x + regression.intercept
        });
    }
    // 最後のポイントを追加
    points.push({
        x: maxX,
        y: regression.slope * maxX + regression.intercept
    });
    
    return points;
}
