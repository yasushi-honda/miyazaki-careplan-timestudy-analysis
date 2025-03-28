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

// ダミーデータを生成する関数
function generateDummyData() {
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

// データを取得する関数（クライアントサイドでのみ実行）
export function getCsvData(fileName) {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    console.warn(`サーバーサイドでのCSVデータ取得: ${fileName} - ダミーデータを返します`);
    return generateDummyData();
  }
  
  // すでに読み込まれたデータがあればそれを返す
  if (window.__csvDataCache && window.__csvDataCache[fileName]) {
    return window.__csvDataCache[fileName];
  }
  
  // キャッシュを初期化
  if (!window.__csvDataCache) {
    window.__csvDataCache = {};
  }
  
  console.log(`CSVデータを読み込みます: ${fileName}`);
  
  // ダミーデータを返す（実際にはクライアントサイドでfetchする）
  window.__csvDataCache[fileName] = generateDummyData();
  
  // 非同期にデータを読み込む
  fetch(`/data/${fileName}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`ファイル読み込みエラー: ${fileName} (${response.status})`);
      }
      return response.text();
    })
    .then(csvText => {
      const data = parseCSV(csvText);
      window.__csvDataCache[fileName] = data;
      console.log(`CSVデータの読み込みが完了しました: ${fileName} (${data.length}件)`);
      
      // データが読み込まれたことをイベントとして発火
      window.dispatchEvent(new CustomEvent('csv-data-loaded', { 
        detail: { fileName, data } 
      }));
    })
    .catch(error => {
      console.error(`CSVファイル読み込み中にエラーが発生しました: ${fileName}`, error);
    });
  
  return window.__csvDataCache[fileName];
}
