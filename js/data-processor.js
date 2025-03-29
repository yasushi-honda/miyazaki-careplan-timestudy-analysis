/**
 * データ処理モジュール
 * CSVデータの読み込みと基本的な処理を行います
 */

// データ読み込み関数
function loadCsvData(filePath) {
    return new Promise((resolve, reject) => {
        console.log(`CSVファイル読み込み開始: ${filePath}`);
        
        // 絶対パスに変換
        const absolutePath = new URL(filePath, window.location.href).href;
        console.log(`絶対パス: ${absolutePath}`);
        
        Papa.parse(absolutePath, {
            download: true,
            header: true,
            encoding: "UTF-8",
            skipEmptyLines: true,
            transformHeader: function(header) {
                // ヘッダーの改行を空白に置き換え
                return header.replace(/\n/g, ' ');
            },
            complete: function(results) {
                console.log(`CSVファイル読み込み完了: ${results.data.length}行のデータを取得`);
                if (results.data.length > 0) {
                    console.log("サンプルデータ:", results.data[0]);
                    console.log("利用可能なカラム:", Object.keys(results.data[0]));
                }
                resolve(results.data);
            },
            error: function(error) {
                console.error(`CSVファイル読み込みエラー: ${error}`);
                reject(error);
            }
        });
    });
}

// データの基本統計を計算
function calculateBasicStats(data, type) {
    const stats = {};
    
    // データ数
    stats.count = data.length;
    
    // 利用者数の平均（カラム名は実際のデータに合わせて調整）
    let userCountColumn = '';
    if (type === 'business') {
        // 事業所データの場合
        const possibleColumns = [
            '給付管理またはサービス提供している要介護の利用者数を入力してください。',
            '利用者数を入力してください。'
        ];
        
        for (const col of possibleColumns) {
            if (data[0].hasOwnProperty(col)) {
                userCountColumn = col;
                break;
            }
        }
    } else if (type === 'individual') {
        // 個人データの場合
        const possibleColumns = [
            '担当利用者数を入力してください。',
            '担当している利用者数を入力してください。'
        ];
        
        for (const col of possibleColumns) {
            if (data[0].hasOwnProperty(col)) {
                userCountColumn = col;
                break;
            }
        }
    }
    
    if (userCountColumn) {
        const userCounts = data.map(item => parseInt(item[userCountColumn]) || 0);
        stats.avgUserCount = userCounts.reduce((sum, count) => sum + count, 0) / stats.count;
        stats.maxUserCount = Math.max(...userCounts);
        stats.minUserCount = Math.min(...userCounts);
    } else {
        console.warn("利用者数カラムが見つかりませんでした");
        stats.avgUserCount = 0;
        stats.maxUserCount = 0;
        stats.minUserCount = 0;
    }
    
    // 業務時間の統計
    let timeColumn = '';
    if (data[0].hasOwnProperty('業務時間を入力してください。')) {
        timeColumn = '業務時間を入力してください。';
    }
    
    if (timeColumn) {
        const times = data.map(item => parseInt(item[timeColumn]) || 0);
        stats.avgTime = times.reduce((sum, time) => sum + time, 0) / stats.count;
        stats.maxTime = Math.max(...times);
        stats.minTime = Math.min(...times);
        stats.totalTime = times.reduce((sum, time) => sum + time, 0);
    }
    
    // データ期間
    stats.dateRange = getDateRange(data);
    
    return stats;
}

// データの日付範囲を取得
function getDateRange(data) {
    let dateColumn = '';
    
    // タイムスタンプカラムを特定
    if (data[0].hasOwnProperty('タイムスタンプ')) {
        dateColumn = 'タイムスタンプ';
    }
    
    if (!dateColumn) {
        console.warn("日付カラムが見つかりませんでした");
        return { start: '', end: '' };
    }
    
    // 日付を抽出
    const dates = [];
    data.forEach(item => {
        if (item[dateColumn]) {
            // 日付部分のみを抽出（例: "2025/01/21 10:24:46 午前 GMT+9" → "2025/01/21"）
            const datePart = item[dateColumn].split(' ')[0];
            dates.push(datePart);
        }
    });
    
    if (dates.length === 0) {
        return { start: '', end: '' };
    }
    
    // 日付をソートして最初と最後を取得
    dates.sort();
    return {
        start: dates[0],
        end: dates[dates.length - 1]
    };
}

// 業務時間分布データを生成
function generateTimeDistributionData(data) {
    const timeRanges = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61+'];
    const timeCounts = Array(timeRanges.length).fill(0);
    
    if (!data || data.length === 0) {
        console.warn("データが空です");
        return { labels: timeRanges, data: timeCounts };
    }
    
    // 業務時間カラムを特定
    let timeColumn = '';
    const possibleTimeColumns = [
        '業務時間を入力してください。',
        '業務時間（分）',
        '業務にかかった時間（分）を入力してください。'
    ];
    
    for (const col of possibleTimeColumns) {
        if (data[0] && data[0].hasOwnProperty(col)) {
            timeColumn = col;
            break;
        }
    }
    
    if (timeColumn) {
        console.log(`業務時間カラムを検出: ${timeColumn}`);
        data.forEach(item => {
            const time = parseInt(item[timeColumn]) || 0;
            if (time <= 10) timeCounts[0]++;
            else if (time <= 20) timeCounts[1]++;
            else if (time <= 30) timeCounts[2]++;
            else if (time <= 40) timeCounts[3]++;
            else if (time <= 50) timeCounts[4]++;
            else if (time <= 60) timeCounts[5]++;
            else timeCounts[6]++;
        });
    } else {
        console.warn("業務時間カラムが見つかりませんでした");
        console.log("利用可能なカラム:", Object.keys(data[0]));
    }
    
    return { labels: timeRanges, data: timeCounts };
}

// 利用者数と業務時間の関係データを生成
function generateUserTimeData(data, type) {
    // カラム名を特定
    let userCountColumn = '';
    let timeColumn = '';
    
    if (type === 'business') {
        // 事業所データの場合
        const possibleUserCountColumns = [
            '給付管理またはサービス提供している要介護の利用者数を入力してください。',
            '利用者数を入力してください。'
        ];
        
        for (const col of possibleUserCountColumns) {
            if (data[0].hasOwnProperty(col)) {
                userCountColumn = col;
                break;
            }
        }
    } else if (type === 'individual') {
        // 個人データの場合
        const possibleUserCountColumns = [
            '担当利用者数を入力してください。',
            '担当している利用者数を入力してください。'
        ];
        
        for (const col of possibleUserCountColumns) {
            if (data[0].hasOwnProperty(col)) {
                userCountColumn = col;
                break;
            }
        }
    }
    
    const possibleTimeColumns = [
        '業務時間を入力してください。',
        '業務時間（分）',
        '業務にかかった時間（分）を入力してください。'
    ];
    
    for (const col of possibleTimeColumns) {
        if (data[0] && data[0].hasOwnProperty(col)) {
            timeColumn = col;
            break;
        }
    }
    
    if (!userCountColumn || !timeColumn) {
        console.error("必要なカラムが見つかりませんでした");
        return [];
    }
    
    // データポイントの作成
    return data.map(item => {
        return {
            x: parseInt(item[userCountColumn]) || 0,
            y: parseInt(item[timeColumn]) || 0
        };
    });
}

// 導入前後の比較データを生成
function generateComparisonData(beforeData, afterData, type) {
    console.log(`比較データ生成開始: ${type}`);
    
    if (!beforeData || !beforeData.length || !afterData || !afterData.length) {
        console.warn("データが不足しています");
        return {
            beforeAvg: 0,
            afterAvg: 0,
            reductionRate: 0,
            changeMinutes: 0,
            beforeCount: 0,
            afterCount: 0
        };
    }
    
    // カラム名を特定
    let timeColumnBefore = '';
    let timeColumnAfter = '';
    
    const possibleTimeColumns = [
        '業務時間を入力してください。',
        '業務時間（分）',
        '業務にかかった時間（分）を入力してください。'
    ];
    
    // 導入前データの業務時間カラムを特定
    for (const col of possibleTimeColumns) {
        if (beforeData[0] && beforeData[0].hasOwnProperty(col)) {
            timeColumnBefore = col;
            break;
        }
    }
    
    // 導入後データの業務時間カラムを特定
    for (const col of possibleTimeColumns) {
        if (afterData[0] && afterData[0].hasOwnProperty(col)) {
            timeColumnAfter = col;
            break;
        }
    }
    
    if (!timeColumnBefore || !timeColumnAfter) {
        console.error("業務時間カラムが見つかりませんでした");
        console.log("導入前データのカラム:", beforeData[0] ? Object.keys(beforeData[0]) : "データなし");
        console.log("導入後データのカラム:", afterData[0] ? Object.keys(afterData[0]) : "データなし");
        return {
            beforeAvg: 0,
            afterAvg: 0,
            reductionRate: 0,
            changeMinutes: 0,
            beforeCount: 0,
            afterCount: 0
        };
    }
    
    console.log(`業務時間カラムを検出: 導入前=${timeColumnBefore}, 導入後=${timeColumnAfter}`);
    
    // 平均業務時間の計算
    const beforeTimes = beforeData.map(item => parseInt(item[timeColumnBefore]) || 0);
    const afterTimes = afterData.map(item => parseInt(item[timeColumnAfter]) || 0);
    
    const beforeSum = beforeTimes.reduce((sum, time) => sum + time, 0);
    const afterSum = afterTimes.reduce((sum, time) => sum + time, 0);
    
    const beforeAvg = beforeSum / beforeTimes.length || 0;
    const afterAvg = afterSum / afterTimes.length || 0;
    
    // 変化の計算
    const changeMinutes = beforeAvg - afterAvg;
    const reductionRate = beforeAvg > 0 ? ((changeMinutes / beforeAvg) * 100).toFixed(1) : 0;
    
    console.log(`比較データ計算結果: 導入前平均=${beforeAvg.toFixed(1)}分, 導入後平均=${afterAvg.toFixed(1)}分, 削減率=${reductionRate}%`);
    
    return {
        beforeAvg: beforeAvg.toFixed(1),
        afterAvg: afterAvg.toFixed(1),
        reductionRate: reductionRate,
        changeMinutes: changeMinutes.toFixed(1),
        beforeCount: beforeTimes.length,
        afterCount: afterTimes.length
    };
}

// データテーブル用のデータを生成
function generateTableData(data, maxRows = 20) {
    if (!data || data.length === 0) {
        console.warn("データがありません");
        return { headers: [], rows: [] };
    }
    
    // 最大行数を制限
    const limitedData = data.slice(0, maxRows);
    
    // ヘッダーを取得
    const headers = Object.keys(data[0]);
    
    return {
        headers: headers,
        rows: limitedData
    };
}

// ソフトウェア使用状況データを生成
function generateSoftwareUsageData(data) {
    let softwareColumn = '';
    
    // ソフトウェアカラムを特定
    const possibleColumns = [
        'ご利用の介護ソフト',
        '利用している介護ソフト'
    ];
    
    for (const col of possibleColumns) {
        if (data[0] && data[0].hasOwnProperty(col)) {
            softwareColumn = col;
            break;
        }
    }
    
    if (!softwareColumn) {
        console.warn("ソフトウェアカラムが見つかりませんでした");
        return {
            labels: [],
            counts: []
        };
    }
    
    // ソフトウェアの使用状況をカウント
    const softwareCounts = {};
    
    data.forEach(item => {
        const software = item[softwareColumn] || '不明';
        softwareCounts[software] = (softwareCounts[software] || 0) + 1;
    });
    
    // ラベルと数値に分割
    const labels = Object.keys(softwareCounts);
    const counts = labels.map(label => softwareCounts[label]);
    
    return {
        labels: labels,
        counts: counts
    };
}

// 連携機能使用状況データを生成
function generateIntegrationUsageData(data) {
    let integrationColumn = '';
    
    // 連携機能カラムを特定
    const possibleColumns = [
        '国保中央会のケアプランデータ連携システムを利用していますか？',
        'ケアプランデータ連携システムを利用していますか？'
    ];
    
    for (const col of possibleColumns) {
        if (data[0] && data[0].hasOwnProperty(col)) {
            integrationColumn = col;
            break;
        }
    }
    
    if (!integrationColumn) {
        console.warn("連携機能カラムが見つかりませんでした");
        return {
            labels: ['はい', 'いいえ'],
            counts: [0, 0]
        };
    }
    
    // 連携機能の使用状況をカウント
    let yesCount = 0;
    let noCount = 0;
    
    data.forEach(item => {
        const answer = item[integrationColumn];
        if (answer === 'はい') {
            yesCount++;
        } else {
            noCount++;
        }
    });
    
    return {
        labels: ['はい', 'いいえ'],
        counts: [yesCount, noCount]
    };
}
