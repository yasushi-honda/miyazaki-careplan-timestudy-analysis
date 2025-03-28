// CSVデータをJSONとして提供するモジュール
import Papa from 'papaparse';

// CSVテキストをJSONに変換する関数
function parseCSV(csvText) {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });
  
  // ヘッダーを正規化（改行や空白を削除）
  const headers = result.meta.fields;
  const normalizedHeaders = headers.map(header => 
    header.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  );
  
  // 正規化されたヘッダーを使用して新しいデータオブジェクトを作成
  const normalizedData = result.data.map(row => {
    const newRow = {};
    headers.forEach((header, index) => {
      newRow[normalizedHeaders[index]] = row[header];
    });
    return newRow;
  });
  
  return normalizedData;
}

// 個人用のダミーデータを生成する関数（導入前）
function generateIndividualBeforeDummyData() {
  return [
    {
      "ケアプラン共有方法": "FAX",
      "1ヶ月あたりの提供票作成時間（分）": "120",
      "1ヶ月あたりの実績確認時間（分）": "90",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "60"
    },
    {
      "ケアプラン共有方法": "FAX",
      "1ヶ月あたりの提供票作成時間（分）": "110",
      "1ヶ月あたりの実績確認時間（分）": "85",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "55"
    },
    {
      "ケアプラン共有方法": "メール",
      "1ヶ月あたりの提供票作成時間（分）": "100",
      "1ヶ月あたりの実績確認時間（分）": "80",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "50"
    }
  ];
}

// 個人用のダミーデータを生成する関数（導入後）
function generateIndividualAfterDummyData() {
  return [
    {
      "ケアプラン共有方法": "システム",
      "1ヶ月あたりの提供票作成時間（分）": "60",
      "1ヶ月あたりの実績確認時間（分）": "45",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "30"
    },
    {
      "ケアプラン共有方法": "システム",
      "1ヶ月あたりの提供票作成時間（分）": "55",
      "1ヶ月あたりの実績確認時間（分）": "40",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "25"
    },
    {
      "ケアプラン共有方法": "システム",
      "1ヶ月あたりの提供票作成時間（分）": "50",
      "1ヶ月あたりの実績確認時間（分）": "35",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "20"
    }
  ];
}

// 事業所用のダミーデータを生成する関数（導入前）
function generateBusinessBeforeDummyData() {
  return [
    {
      "事業所規模": "小規模",
      "1ヶ月あたりの提供票作成時間（分）": "300",
      "1ヶ月あたりの実績確認時間（分）": "240",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "180"
    },
    {
      "事業所規模": "中規模",
      "1ヶ月あたりの提供票作成時間（分）": "450",
      "1ヶ月あたりの実績確認時間（分）": "360",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "270"
    },
    {
      "事業所規模": "大規模",
      "1ヶ月あたりの提供票作成時間（分）": "600",
      "1ヶ月あたりの実績確認時間（分）": "480",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "360"
    }
  ];
}

// 事業所用のダミーデータを生成する関数（導入後）
function generateBusinessAfterDummyData() {
  return [
    {
      "事業所規模": "小規模",
      "1ヶ月あたりの提供票作成時間（分）": "150",
      "1ヶ月あたりの実績確認時間（分）": "120",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "90"
    },
    {
      "事業所規模": "中規模",
      "1ヶ月あたりの提供票作成時間（分）": "225",
      "1ヶ月あたりの実績確認時間（分）": "180",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "135"
    },
    {
      "事業所規模": "大規模",
      "1ヶ月あたりの提供票作成時間（分）": "300",
      "1ヶ月あたりの実績確認時間（分）": "240",
      "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "180"
    }
  ];
}

// データを取得する関数（クライアントサイドでのみ実行）
export function getCsvData(fileName) {
  // サーバーサイドでの実行時はダミーデータを返す
  if (typeof window === 'undefined') {
    console.warn(`サーバーサイドでのCSVデータ取得: ${fileName} - ダミーデータを返します`);
    
    // ファイル名に応じたダミーデータを返す
    if (fileName === 'individual_before.csv') {
      return generateIndividualBeforeDummyData();
    } else if (fileName === 'individual_after.csv') {
      return generateIndividualAfterDummyData();
    } else if (fileName === 'business_before.csv') {
      return generateBusinessBeforeDummyData();
    } else if (fileName === 'business_after.csv') {
      return generateBusinessAfterDummyData();
    } else {
      // デフォルトのダミーデータを返す
      return [
        {
          "ケアプラン共有方法": "FAX",
          "1ヶ月あたりの提供票作成時間（分）": "60",
          "1ヶ月あたりの実績確認時間（分）": "45",
          "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "30"
        },
        {
          "ケアプラン共有方法": "メール",
          "1ヶ月あたりの提供票作成時間（分）": "50",
          "1ヶ月あたりの実績確認時間（分）": "40",
          "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "25"
        },
        {
          "ケアプラン共有方法": "システム",
          "1ヶ月あたりの提供票作成時間（分）": "30",
          "1ヶ月あたりの実績確認時間（分）": "20",
          "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "15"
        }
      ];
    }
  }
  
  // すでに読み込まれたデータがあればそれを返す
  if (window.__csvDataCache && window.__csvDataCache[fileName]) {
    console.log(`キャッシュからCSVデータを返します: ${fileName}`);
    return window.__csvDataCache[fileName];
  }
  
  // キャッシュを初期化
  if (!window.__csvDataCache) {
    window.__csvDataCache = {};
    window.__csvDataLoading = {};
  }
  
  // 既に読み込み中の場合は再度リクエストしない
  if (window.__csvDataLoading && window.__csvDataLoading[fileName]) {
    console.log(`CSVデータ読み込み中: ${fileName}`);
    
    // 初期値としてファイル名に応じたダミーデータをキャッシュに設定
    if (!window.__csvDataCache[fileName]) {
      if (fileName === 'individual_before.csv') {
        window.__csvDataCache[fileName] = generateIndividualBeforeDummyData();
      } else if (fileName === 'individual_after.csv') {
        window.__csvDataCache[fileName] = generateIndividualAfterDummyData();
      } else if (fileName === 'business_before.csv') {
        window.__csvDataCache[fileName] = generateBusinessBeforeDummyData();
      } else if (fileName === 'business_after.csv') {
        window.__csvDataCache[fileName] = generateBusinessAfterDummyData();
      } else {
        // デフォルトのダミーデータをキャッシュに設定
        window.__csvDataCache[fileName] = [
          {
            "ケアプラン共有方法": "FAX",
            "1ヶ月あたりの提供票作成時間（分）": "60",
            "1ヶ月あたりの実績確認時間（分）": "45",
            "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "30"
          },
          {
            "ケアプラン共有方法": "メール",
            "1ヶ月あたりの提供票作成時間（分）": "50",
            "1ヶ月あたりの実績確認時間（分）": "40",
            "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "25"
          },
          {
            "ケアプラン共有方法": "システム",
            "1ヶ月あたりの提供票作成時間（分）": "30",
            "1ヶ月あたりの実績確認時間（分）": "20",
            "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "15"
          }
        ];
      }
    }
    
    return window.__csvDataCache[fileName];
  }
  
  console.log(`CSVデータを読み込みます: ${fileName}`);
  
  // 読み込み中フラグを設定
  window.__csvDataLoading = window.__csvDataLoading || {};
  window.__csvDataLoading[fileName] = true;
  
  // 初期値としてファイル名に応じたダミーデータをキャッシュに設定
  if (fileName === 'individual_before.csv') {
    window.__csvDataCache[fileName] = generateIndividualBeforeDummyData();
  } else if (fileName === 'individual_after.csv') {
    window.__csvDataCache[fileName] = generateIndividualAfterDummyData();
  } else if (fileName === 'business_before.csv') {
    window.__csvDataCache[fileName] = generateBusinessBeforeDummyData();
  } else if (fileName === 'business_after.csv') {
    window.__csvDataCache[fileName] = generateBusinessAfterDummyData();
  } else {
    // デフォルトのダミーデータをキャッシュに設定
    window.__csvDataCache[fileName] = [
      {
        "ケアプラン共有方法": "FAX",
        "1ヶ月あたりの提供票作成時間（分）": "60",
        "1ヶ月あたりの実績確認時間（分）": "45",
        "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "30"
      },
      {
        "ケアプラン共有方法": "メール",
        "1ヶ月あたりの提供票作成時間（分）": "50",
        "1ヶ月あたりの実績確認時間（分）": "40",
        "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "25"
      },
      {
        "ケアプラン共有方法": "システム",
        "1ヶ月あたりの提供票作成時間（分）": "30",
        "1ヶ月あたりの実績確認時間（分）": "20",
        "利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）": "15"
      }
    ];
  }
  
  // 非同期にデータを読み込む
  fetch(`/data/${fileName}`)
    .then(response => {
      if (!response.ok) {
        console.warn(`ファイル読み込みエラー: ${fileName} (${response.status} ${response.statusText})`);
        // エラーの詳細をログに出力
        response.text().then(text => {
          console.warn(`エラーレスポンス: ${text.substring(0, 200)}`);
        });
        // エラーが発生してもダミーデータを使用して処理を続行
        // 読み込み中フラグを解除
        window.__csvDataLoading[fileName] = false;
        
        // データが読み込まれたことをイベントとして発火（エラー時もイベントを発生させる）
        window.dispatchEvent(new CustomEvent('csv-data-loaded', { 
          detail: { fileName, error: true } 
        }));
        
        // index.htmlの統計データを更新
        if (window.updateStatistics) {
          window.updateStatistics();
        }
        
        return;
      }
      return response.text();
    })
    .then(csvText => {
      console.log(`CSVテキスト取得成功: ${fileName} (${csvText.length}バイト)`);
      console.log(`CSVサンプル: ${csvText.substring(0, 100)}...`);
      
      try {
        const data = parseCSV(csvText);
        console.log(`CSVパース成功: ${fileName} (${data.length}件)`);
        console.log(`最初のデータ:`, data.length > 0 ? data[0] : 'データなし');
        
        // キャッシュを更新
        window.__csvDataCache[fileName] = data;
        
        // 読み込み中フラグを解除
        window.__csvDataLoading[fileName] = false;
        
        // データが読み込まれたことをイベントとして発火
        window.dispatchEvent(new CustomEvent('csv-data-loaded', { 
          detail: { fileName, data } 
        }));
        
        // index.htmlの統計データを更新
        if (window.updateStatistics) {
          window.updateStatistics();
        }
      } catch (parseError) {
        console.error(`CSVパースエラー: ${fileName}`, parseError);
        console.error(`問題のCSVテキスト: ${csvText.substring(0, 200)}...`);
        // 読み込み中フラグを解除
        window.__csvDataLoading[fileName] = false;
      }
    })
    .catch(error => {
      console.error(`CSVファイル読み込み中にエラーが発生しました: ${fileName}`, error);
      // 読み込み中フラグを解除
      window.__csvDataLoading[fileName] = false;
    });
  
  return window.__csvDataCache[fileName];
}
