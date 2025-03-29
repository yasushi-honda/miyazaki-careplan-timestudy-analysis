/**
 * 宮崎ケアプランタイムスタディ分析
 * メインアプリケーションロジック
 */

// グローバル変数
let currentDataType = 'business'; // 'business' または 'individual'
let currentData = {
    before: null,
    after: null
};

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', function() {
    // イベントリスナーの設定
    setupEventListeners();
    
    // 初期データの読み込み
    loadInitialData();
});

// イベントリスナーの設定
function setupEventListeners() {
    // データタイプ選択ボタンのクリックイベント
    const typeButtons = document.querySelectorAll('.btn-group button[data-type]');
    typeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // すでにアクティブなボタンの場合は何もしない
            if (this.classList.contains('active')) {
                return;
            }
            
            // 他のすべてのボタンからアクティブクラスを削除
            typeButtons.forEach(btn => {
                if (btn !== this && btn.classList.contains('active')) {
                    btn.classList.remove('active', 'btn-primary');
                    btn.classList.add('btn-outline-primary');
                }
            });
            
            // 新しいボタンをアクティブにする
            this.classList.remove('btn-outline-primary');
            this.classList.add('active', 'btn-primary');
            
            // データタイプを更新
            currentDataType = this.getAttribute('data-type');
            console.log(`データタイプ変更: ${currentDataType}`);
            
            // データを読み込む
            loadDataForCurrentType();
        });
    });
    
    // タブ切り替えイベント
    const tabs = document.querySelectorAll('.nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // タブコンテンツの表示/非表示を切り替え
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            document.querySelector(targetId).classList.add('show', 'active');
            
            // タブの選択状態を切り替え
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// 初期データの読み込み
function loadInitialData() {
    // ローディング表示
    showLoading(true);
    
    // 事業所データを読み込み
    loadDataForCurrentType();
}

// 現在のデータタイプに応じたデータを読み込む
function loadDataForCurrentType() {
    console.log(`${currentDataType}タイプのデータを読み込み中...`);
    
    // ローディング表示
    showLoading(true);
    
    // 前処理済みJSONファイルのパスを設定
    const beforeJsonPath = `data/processed/${currentDataType}_before.json`;
    const afterJsonPath = `data/processed/${currentDataType}_after.json`;
    
    // 前処理済みJSONファイルが存在する場合はそれを使用し、存在しない場合はCSVを使用
    checkFileExists(beforeJsonPath)
        .then(jsonExists => {
            if (jsonExists) {
                console.log(`前処理済みJSONファイルを使用: ${beforeJsonPath}`);
                return loadJsonData(beforeJsonPath);
            } else {
                console.log(`JSONファイルが見つからないため、CSVファイルを使用: ${currentDataType}_before.csv`);
                return loadCsvData(`data/${currentDataType}_before.csv`);
            }
        })
        .then(beforeData => {
            currentData.before = beforeData;
            console.log(`導入前データ読み込み完了: ${beforeData.length}件`);
            
            return checkFileExists(afterJsonPath)
                .then(jsonExists => {
                    if (jsonExists) {
                        console.log(`前処理済みJSONファイルを使用: ${afterJsonPath}`);
                        return loadJsonData(afterJsonPath);
                    } else {
                        console.log(`JSONファイルが見つからないため、CSVファイルを使用: ${currentDataType}_after.csv`);
                        return loadCsvData(`data/${currentDataType}_after.csv`);
                    }
                });
        })
        .then(afterData => {
            currentData.after = afterData;
            console.log(`導入後データ読み込み完了: ${afterData.length}件`);
            
            // データの表示
            displayData();
            
            // ローディング非表示
            showLoading(false);
        })
        .catch(error => {
            console.error(`データ読み込みエラー: ${error}`);
            alert("データの読み込みに失敗しました。詳細はコンソールを確認してください。");
            showLoading(false);
        });
}

// ファイルが存在するかチェック
function checkFileExists(url) {
    return fetch(url, { method: 'HEAD' })
        .then(response => response.ok)
        .catch(() => false);
}

// JSONファイルを読み込む
function loadJsonData(filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`JSONファイル読み込み完了: ${data.length}行のデータを取得`);
            if (data.length > 0) {
                console.log("サンプルデータ:", data[0]);
                console.log("利用可能なカラム:", Object.keys(data[0]));
            }
            return data;
        });
}

// ローディング表示の切り替え
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    const resultsElement = document.getElementById('results');
    
    if (show) {
        loadingElement.classList.remove('d-none');
        resultsElement.classList.add('d-none');
    } else {
        loadingElement.classList.add('d-none');
        resultsElement.classList.remove('d-none');
    }
}

// データを表示
function displayData() {
    if (!currentData.before || !currentData.after) {
        console.error("データが読み込まれていません");
        return;
    }
    
    console.log("データ表示処理開始");
    console.log("現在のデータ:", currentData);
    
    // タイトル更新
    updateTitle();
    
    // 基本統計の表示
    displayBasicStatsComparison();
    
    try {
        // グラフの表示
        console.log("グラフ描画開始");
        
        // 各グラフ要素が存在するか確認
        const timeDistCanvas = document.getElementById('timeDistributionChart');
        const userTimeCanvas = document.getElementById('userTimeChart');
        const timeCompCanvas = document.getElementById('timeComparisonChart');
        const softwareCanvas = document.getElementById('softwareUsageChart');
        const integrationCanvas = document.getElementById('integrationUsageChart');
        
        console.log("グラフ要素:", 
            timeDistCanvas ? "timeDistributionChart OK" : "timeDistributionChart 未検出", 
            userTimeCanvas ? "userTimeChart OK" : "userTimeChart 未検出",
            timeCompCanvas ? "timeComparisonChart OK" : "timeComparisonChart 未検出",
            softwareCanvas ? "softwareUsageChart OK" : "softwareUsageChart 未検出",
            integrationCanvas ? "integrationUsageChart OK" : "integrationUsageChart 未検出"
        );
        
        if (timeDistCanvas) renderTimeDistributionChart(null, currentData.before, currentData.after, 'timeDistributionChart');
        if (userTimeCanvas) renderUserTimeChart(null, currentData.before, currentData.after, currentDataType, 'userTimeChart');
        if (timeCompCanvas) renderTimeComparisonChart(currentData.before, currentData.after, currentDataType, 'timeComparisonChart');
        if (softwareCanvas) renderSoftwareUsageChart(currentData.after, 'softwareUsageChart');
        if (integrationCanvas) renderIntegrationUsageChart(currentData.after, 'integrationUsageChart');
        
        console.log("グラフ描画完了");
    } catch (error) {
        console.error("グラフ描画エラー:", error);
    }
    
    // データテーブルを表示
    displayDataTables();
}

// タイトルを更新
function updateTitle() {
    const titleElement = document.getElementById('analysisTitle');
    const subtitleElement = document.getElementById('analysisSubtitle');
    
    if (currentDataType === 'business') {
        titleElement.textContent = '事業所別タイムスタディ分析';
        subtitleElement.textContent = 'ケアプランデータ連携システム導入前後の業務効率比較';
    } else {
        titleElement.textContent = '個人別タイムスタディ分析';
        subtitleElement.textContent = 'ケアプランデータ連携システム導入前後の業務効率比較';
    }
}

// 基本統計比較を表示
function displayBasicStatsComparison() {
    const comparison = generateComparisonData(currentData.before, currentData.after, currentDataType);
    
    // 平均業務時間
    document.getElementById('beforeAvgTime').textContent = comparison.beforeAvg;
    document.getElementById('afterAvgTime').textContent = comparison.afterAvg;
    
    const timeChangeElement = document.getElementById('timeChange');
    const timeChangeValue = document.getElementById('timeChangeValue');
    const timeChangePercent = document.getElementById('timeChangePercent');
    
    timeChangeValue.textContent = Math.abs(comparison.changeMinutes);
    timeChangePercent.textContent = Math.abs(comparison.changePercent);
    
    if (parseFloat(comparison.changeMinutes) > 0) {
        // 減少（改善）
        timeChangeElement.classList.add('text-success');
        timeChangeElement.classList.remove('text-danger');
        document.getElementById('timeChangeIcon').innerHTML = '↓';
    } else {
        // 増加（悪化）
        timeChangeElement.classList.add('text-danger');
        timeChangeElement.classList.remove('text-success');
        document.getElementById('timeChangeIcon').innerHTML = '↑';
    }
    
    // 回答数
    document.getElementById('beforeCount').textContent = currentData.before.length;
    document.getElementById('afterCount').textContent = currentData.after.length;
    
    // 調査期間の取得
    let beforeDates = getDatesFromData(currentData.before);
    let afterDates = getDatesFromData(currentData.after);
    
    // 調査期間
    document.getElementById('beforePeriod').textContent = 
        `${beforeDates.start || '不明'} 〜 ${beforeDates.end || '不明'}`;
    document.getElementById('afterPeriod').textContent = 
        `${afterDates.start || '不明'} 〜 ${afterDates.end || '不明'}`;
    
    // 効率化の概要
    let summaryText = '';
    if (parseFloat(comparison.changeMinutes) > 0) {
        summaryText = `ケアプランデータ連携システムの導入により、平均業務時間が<strong>${comparison.changeMinutes}分</strong>（<strong>${comparison.changePercent}%</strong>）短縮されました。これにより、業務効率が向上し、より多くの時間を利用者との対話やケアの質の向上に充てることができるようになりました。`;
    } else {
        summaryText = `ケアプランデータ連携システムの導入後、平均業務時間が<strong>${Math.abs(comparison.changeMinutes)}分</strong>（<strong>${Math.abs(comparison.changePercent)}%</strong>）増加しました。これは導入初期の学習コストや、システムへのデータ入力の増加によるものかもしれません。長期的な効果を評価するためには、継続的なモニタリングが必要です。`;
    }
    
    document.getElementById('efficiencySummary').innerHTML = summaryText;
}

// データから日付範囲を取得する関数
function getDatesFromData(data) {
    if (!data || data.length === 0) {
        return { start: null, end: null };
    }
    
    // 日付カラムを特定
    let dateColumn = '';
    const possibleDateColumns = [
        '回答日時',
        'タイムスタンプ',
        '調査日'
    ];
    
    for (const col of possibleDateColumns) {
        if (data[0] && data[0].hasOwnProperty(col)) {
            dateColumn = col;
            break;
        }
    }
    
    if (!dateColumn) {
        console.warn("日付カラムが見つかりませんでした");
        return { start: null, end: null };
    }
    
    // 日付の抽出と整形
    let dates = data
        .map(item => item[dateColumn])
        .filter(date => date)
        .map(date => {
            try {
                // 様々な日付形式に対応
                if (date.includes('/')) {
                    // 2023/01/01 形式
                    const parts = date.split(' ')[0].split('/');
                    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                } else if (date.includes('-')) {
                    // 2023-01-01 形式
                    return date.split(' ')[0];
                }
                return null;
            } catch (e) {
                console.warn("日付の解析に失敗しました:", date);
                return null;
            }
        })
        .filter(date => date);
    
    if (dates.length === 0) {
        return { start: null, end: null };
    }
    
    // 日付のソート
    dates.sort();
    
    return {
        start: dates[0],
        end: dates[dates.length - 1]
    };
}

// データテーブルを表示
function displayDataTables() {
    try {
        console.log("データテーブル表示処理を開始");
        
        // 導入前データテーブル
        const beforeTableData = generateTableData(currentData.before, 5);
        console.log("導入前テーブルデータ:", beforeTableData);
        
        const beforeTableHeader = document.getElementById('beforeTableHeader');
        const beforeTableBody = document.getElementById('beforeTableBody');
        
        if (!beforeTableData || !beforeTableData.headers || !beforeTableData.rows) {
            console.error("導入前テーブルデータが不正です");
            beforeTableHeader.innerHTML = '<tr><th>データがありません</th></tr>';
            beforeTableBody.innerHTML = '<tr><td>表示するデータがありません</td></tr>';
        } else {
            let beforeHeaderRow = '<tr>';
            beforeTableData.headers.forEach(header => {
                beforeHeaderRow += `<th>${header}</th>`;
            });
            beforeHeaderRow += '</tr>';
            beforeTableHeader.innerHTML = beforeHeaderRow;
            
            let beforeRows = '';
            for (let i = 0; i < beforeTableData.rows.length; i++) {
                beforeRows += '<tr>';
                // rows[i]が配列であることを確認
                if (Array.isArray(beforeTableData.rows[i])) {
                    beforeTableData.rows[i].forEach(cell => {
                        beforeRows += `<td>${cell}</td>`;
                    });
                } else {
                    // オブジェクトの場合は値を取得
                    beforeTableData.headers.forEach(header => {
                        beforeRows += `<td>${beforeTableData.rows[i][header] || ''}</td>`;
                    });
                }
                beforeRows += '</tr>';
            }
            beforeTableBody.innerHTML = beforeRows;
        }
        
        // 導入後データテーブル
        const afterTableData = generateTableData(currentData.after, 5);
        console.log("導入後テーブルデータ:", afterTableData);
        
        const afterTableHeader = document.getElementById('afterTableHeader');
        const afterTableBody = document.getElementById('afterTableBody');
        
        if (!afterTableData || !afterTableData.headers || !afterTableData.rows) {
            console.error("導入後テーブルデータが不正です");
            afterTableHeader.innerHTML = '<tr><th>データがありません</th></tr>';
            afterTableBody.innerHTML = '<tr><td>表示するデータがありません</td></tr>';
        } else {
            let afterHeaderRow = '<tr>';
            afterTableData.headers.forEach(header => {
                afterHeaderRow += `<th>${header}</th>`;
            });
            afterHeaderRow += '</tr>';
            afterTableHeader.innerHTML = afterHeaderRow;
            
            let afterRows = '';
            for (let i = 0; i < afterTableData.rows.length; i++) {
                afterRows += '<tr>';
                // rows[i]が配列であることを確認
                if (Array.isArray(afterTableData.rows[i])) {
                    afterTableData.rows[i].forEach(cell => {
                        afterRows += `<td>${cell}</td>`;
                    });
                } else {
                    // オブジェクトの場合は値を取得
                    afterTableData.headers.forEach(header => {
                        afterRows += `<td>${afterTableData.rows[i][header] || ''}</td>`;
                    });
                }
                afterRows += '</tr>';
            }
            afterTableBody.innerHTML = afterRows;
        }
        
        console.log("データテーブル表示処理が完了しました");
    } catch (error) {
        console.error("データテーブル表示中にエラーが発生しました:", error);
    }
}
