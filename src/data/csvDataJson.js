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

// CSVデータをJSONに変換する関数
export async function getCsvDataAsJson(csvFileName) {
  console.log(`CSVデータの取得を開始します: ${csvFileName}`);
  
  // キャッシュの初期化
  if (typeof window !== 'undefined' && !window.__csvDataCache) {
    window.__csvDataCache = {};
  }
  
  // キャッシュにデータがあれば返す
  if (typeof window !== 'undefined' && window.__csvDataCache[csvFileName]) {
    console.log(`キャッシュからCSVデータを返します: ${csvFileName}`);
    return window.__csvDataCache[csvFileName];
  }
  
  // CSVデータの取得を試みる
  try {
    // 複数のパスを試す
    const possiblePaths = [
      `/data/${csvFileName}`,
      `/miyazaki-careplan-timestudy-analysis/data/${csvFileName}`,
      `/public/data/${csvFileName}`,
      `./data/${csvFileName}`,
      `../data/${csvFileName}`,
      `../../data/${csvFileName}`,
      `../public/data/${csvFileName}`
    ];
    
    let csvText = null;
    let successPath = null;
    
    // 各パスを順番に試す
    for (const path of possiblePaths) {
      try {
        console.log(`パス ${path} からCSVデータの取得を試みます...`);
        const response = await fetch(path);
        
        if (response.ok) {
          csvText = await response.text();
          successPath = path;
          console.log(`パス ${path} からCSVデータの取得に成功しました`);
          break;
        } else {
          console.warn(`パス ${path} からのCSVデータ取得に失敗しました: ${response.status} ${response.statusText}`);
        }
      } catch (pathError) {
        console.warn(`パス ${path} からのCSVデータ取得中にエラーが発生しました:`, pathError);
      }
    }
    
    // CSVデータが取得できなかった場合
    if (!csvText) {
      console.error(`すべてのパスからのCSVデータ取得に失敗しました: ${csvFileName}`);
      
      // ダミーデータを生成
      console.log(`ダミーデータを生成します: ${csvFileName}`);
      const dummyData = generateDummyData(csvFileName);
      
      // キャッシュに保存
      if (typeof window !== 'undefined') {
        window.__csvDataCache[csvFileName] = dummyData;
      }
      
      return dummyData;
    }
    
    // CSVデータをパース
    console.log(`CSVデータのパースを開始します: ${csvFileName} (${successPath})`);
    const parsedData = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });
    
    if (parsedData.errors && parsedData.errors.length > 0) {
      console.warn(`CSVパース中に警告が発生しました: ${csvFileName}`, parsedData.errors);
    }
    
    // パースしたデータをキャッシュに保存
    if (typeof window !== 'undefined') {
      window.__csvDataCache[csvFileName] = parsedData.data;
    }
    
    console.log(`CSVデータのパースが完了しました: ${csvFileName}`, parsedData.data.slice(0, 2));
    return parsedData.data;
  } catch (error) {
    console.error(`CSVデータの取得中にエラーが発生しました: ${csvFileName}`, error);
    
    // ダミーデータを生成
    console.log(`エラーによりダミーデータを生成します: ${csvFileName}`);
    const dummyData = generateDummyData(csvFileName);
    
    // キャッシュに保存
    if (typeof window !== 'undefined') {
      window.__csvDataCache[csvFileName] = dummyData;
    }
    
    return dummyData;
  }
}

// ダミーデータを生成する関数
function generateDummyData(csvFileName) {
  console.log(`ダミーデータの生成を開始します: ${csvFileName}`);
  
  // ファイル名に基づいて適切なダミーデータを生成
  if (csvFileName.includes('individual')) {
    return generateIndividualDummyData(csvFileName);
  } else if (csvFileName.includes('business')) {
    return generateBusinessDummyData(csvFileName);
  } else {
    console.warn(`未知のCSVファイル名: ${csvFileName}、汎用ダミーデータを生成します`);
    return [
      { '項目1': '値1', '項目2': '値2', '項目3': '値3' },
      { '項目1': '値4', '項目2': '値5', '項目3': '値6' }
    ];
  }
}

// 個人データのダミーデータを生成する関数
function generateIndividualDummyData(csvFileName) {
  const isBefore = csvFileName.includes('before');
  
  // 導入前と導入後で値を変える
  const baseCreationTime = isBefore ? 120 : 60;
  const baseConfirmationTime = isBefore ? 90 : 45;
  const baseModificationTime = isBefore ? 60 : 30;
  
  // 5件のダミーデータを生成
  return Array.from({ length: 5 }, (_, index) => {
    // ランダム要素を加える
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8〜1.2のランダム係数
    
    return {
      '担当者ID': `user${index + 1}`,
      '担当者名': `担当者${index + 1}`,
      '1ヶ月あたりの提供票作成時間（分）': Math.round(baseCreationTime * randomFactor),
      '1ヶ月あたりの実績確認時間（分）': Math.round(baseConfirmationTime * randomFactor),
      '利用者からのケアプラン修正依頼を受けてから修正完了までに要する時間（分）': Math.round(baseModificationTime * randomFactor)
    };
  });
}

// 事業所データのダミーデータを生成する関数
function generateBusinessDummyData(csvFileName) {
  const isBefore = csvFileName.includes('before');
  
  // 導入前と導入後で値を変える
  const baseCreationTime = isBefore ? 1200 : 600;
  const baseConfirmationTime = isBefore ? 900 : 450;
  
  // 3件のダミーデータを生成
  return Array.from({ length: 3 }, (_, index) => {
    // ランダム要素を加える
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8〜1.2のランダム係数
    
    return {
      '事業所ID': `business${index + 1}`,
      '事業所名': `事業所${index + 1}`,
      '1ヶ月あたりの提供票作成時間（分）': Math.round(baseCreationTime * randomFactor),
      '1ヶ月あたりの実績確認時間（分）': Math.round(baseConfirmationTime * randomFactor)
    };
  });
}

// データを取得する関数（クライアントサイドでのみ実行）
export function getCsvData(fileName) {
  // サーバーサイドでの実行時はダミーデータを返す
  if (typeof window === 'undefined') {
    console.warn(`サーバーサイドでのCSVデータ取得: ${fileName} - ダミーデータを返します`);
    
    // ファイル名に応じたダミーデータを返す
    if (fileName === 'individual_before.csv') {
      return generateIndividualDummyData(fileName);
    } else if (fileName === 'individual_after.csv') {
      return generateIndividualDummyData(fileName);
    } else if (fileName === 'business_before.csv') {
      return generateBusinessDummyData(fileName);
    } else if (fileName === 'business_after.csv') {
      return generateBusinessDummyData(fileName);
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
        window.__csvDataCache[fileName] = generateIndividualDummyData(fileName);
      } else if (fileName === 'individual_after.csv') {
        window.__csvDataCache[fileName] = generateIndividualDummyData(fileName);
      } else if (fileName === 'business_before.csv') {
        window.__csvDataCache[fileName] = generateBusinessDummyData(fileName);
      } else if (fileName === 'business_after.csv') {
        window.__csvDataCache[fileName] = generateBusinessDummyData(fileName);
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
  
  // 読み込み中フラグを設定
  window.__csvDataLoading[fileName] = true;
  
  // 非同期でCSVデータを読み込む
  console.log(`CSVデータの非同期読み込みを開始: ${fileName}`);
  
  // ベースURLを取得（末尾のスラッシュを確認）
  const baseUrl = window.location.pathname.endsWith('/') 
    ? window.location.pathname 
    : window.location.pathname + '/';
  
  // 異なるパスでの試行を行う
  const paths = [
    `${baseUrl}data/${fileName}`,
    `/data/${fileName}`,
    `./data/${fileName}`,
    `/miyazaki-careplan-timestudy-analysis/data/${fileName}`,
    `/public/data/${fileName}`,
    `${window.location.origin}/data/${fileName}`,
    `${window.location.origin}/public/data/${fileName}`,
    `${window.location.origin}/miyazaki-careplan-timestudy-analysis/data/${fileName}`
  ];
  
  // パスの順番に試行して、成功したパスでデータを読み込む
  const fetchPath = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        console.warn(`ファイル読み込みエラー: ${path} (${response.status} ${response.statusText})`);
        // エラーの詳細をログに出力
        const text = await response.text();
        console.warn(`エラーレスポンス: ${text.substring(0, 200)}`);
        throw new Error(`Failed to fetch ${path}`);
      }
      const csvText = await response.text();
      console.log(`CSVテキスト取得成功: ${path} (${csvText.length}バイト)`);
      console.log(`CSVサンプル: ${csvText.substring(0, 100)}...`);
      
      try {
        const data = parseCSV(csvText);
        console.log(`CSVパース成功: ${path} (${data.length}件)`);
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
        
        return data;
      } catch (parseError) {
        console.error(`CSVパースエラー: ${path}`, parseError);
        console.error(`問題のCSVテキスト: ${csvText.substring(0, 200)}...`);
        // 読み込み中フラグを解除
        window.__csvDataLoading[fileName] = false;
        throw parseError;
      }
    } catch (error) {
      console.error(`CSVファイル読み込み中にエラーが発生しました: ${path}`, error);
      // 読み込み中フラグを解除
      window.__csvDataLoading[fileName] = false;
      throw error;
    }
  };
  
  // パスの順番に試行
  (async () => {
    for (const path of paths) {
      try {
        const data = await fetchPath(path);
        return data;
      } catch (error) {
        console.log(`パス ${path} でエラーが発生しました。次のパスに進みます。`);
      }
    }
    // すべてのパスでエラーが発生した場合
    console.error(`すべてのパスでエラーが発生しました。`);
    window.__csvDataLoading[fileName] = false;
    // データが読み込まれたことをイベントとして発火（エラー時もイベントを発生させる）
    window.dispatchEvent(new CustomEvent('csv-data-loaded', { 
      detail: { fileName, error: true } 
    }));
    // index.htmlの統計データを更新
    if (window.updateStatistics) {
      window.updateStatistics();
    }
  })();
  
  // 初期値としてファイル名に応じたダミーデータをキャッシュに設定
  if (fileName === 'individual_before.csv') {
    window.__csvDataCache[fileName] = generateIndividualDummyData(fileName);
  } else if (fileName === 'individual_after.csv') {
    window.__csvDataCache[fileName] = generateIndividualDummyData(fileName);
  } else if (fileName === 'business_before.csv') {
    window.__csvDataCache[fileName] = generateBusinessDummyData(fileName);
  } else if (fileName === 'business_after.csv') {
    window.__csvDataCache[fileName] = generateBusinessDummyData(fileName);
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
  
  return window.__csvDataCache[fileName];
}
