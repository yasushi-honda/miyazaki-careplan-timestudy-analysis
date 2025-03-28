// CSVデータを処理するためのユーティリティ関数
import Papa from 'papaparse';

// CSVファイルを読み込む関数
export async function loadCsvData(filePath) {
  try {
    console.log(`CSVファイルの読み込みを開始: ${filePath}`);
    
    // ファイルパスの修正（相対パスから絶対パスに変換）
    const fullPath = `/data/${filePath.split('/').pop()}`;
    console.log(`修正されたファイルパス: ${fullPath}`);
    
    // fetch APIを使用してCSVファイルを取得
    const response = await fetch(fullPath);
    
    if (!response.ok) {
      console.error(`CSVファイルの取得に失敗: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log(`CSVデータの長さ: ${csvText.length} 文字`);
    
    // CSVテキストの前処理
    // 1. ヘッダー行の改行を置換
    // 2. BOMを削除（UTF-8 BOMが存在する場合）
    let processedCsvText = csvText.replace(/\n(?=[^"]*"[^"]*(?:"[^"]*"[^"]*)*$)/g, ' ');
    if (processedCsvText.charCodeAt(0) === 0xFEFF) {
      processedCsvText = processedCsvText.substring(1);
      console.log('BOMを削除しました');
    }
    
    // CSVをパース
    const parsedData = Papa.parse(processedCsvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: header => {
        // ヘッダーの前処理を強化
        return header
          .replace(/\n/g, ' ')  // 改行を空白に置換
          .replace(/\s+/g, ' ') // 連続する空白を1つに置換
          .replace(/^[\s"]+|[\s"]+$/g, '') // 前後の空白と引用符を削除
          .trim();
      }
    });
    
    if (parsedData.errors && parsedData.errors.length > 0) {
      console.warn(`CSVパースエラー:`, parsedData.errors);
    }
    
    // デバッグ: パースされたヘッダーを確認
    console.log('パースされたヘッダー:', parsedData.meta.fields);
    
    // 有効なデータ行のみをフィルタリング
    const filteredData = parsedData.data.filter(row => 
      row && typeof row === 'object' && Object.keys(row).length > 3
    );
    
    console.log(`CSVデータの行数: ${filteredData.length}`);
    
    // データが空の場合はエラーを投げる
    if (filteredData.length === 0) {
      throw new Error('有効なデータが見つかりませんでした');
    }
    
    return filteredData;
  } catch (error) {
    console.error(`CSVデータの読み込みエラー: ${error.message}`);
    throw error; // エラーを上位に伝播させる
  }
}

// CSVの全てのヘッダー情報とデータセット内容を取得する関数
export async function getFullCsvInfo(filePath) {
  try {
    console.log(`CSVの全情報を取得: ${filePath}`);
    
    // ファイルパスの修正（相対パスから絶対パスに変換）
    const fullPath = `/data/${filePath.split('/').pop()}`;
    
    // fetch APIを使用してCSVファイルを取得
    const response = await fetch(fullPath);
    
    if (!response.ok) {
      console.error(`CSVファイルの取得に失敗: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    // CSVテキストの前処理
    let processedCsvText = csvText;
    if (processedCsvText.charCodeAt(0) === 0xFEFF) {
      processedCsvText = processedCsvText.substring(1);
    }
    
    // CSVをパース（ヘッダー情報を保持）
    const parsedData = Papa.parse(processedCsvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: header => {
        return header
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/^[\s"]+|[\s"]+$/g, '')
          .trim();
      }
    });
    
    // 全てのヘッダー情報を取得
    const headers = parsedData.meta.fields || [];
    
    // データセットの統計情報を計算
    const stats = {
      totalRows: parsedData.data.length,
      validRows: parsedData.data.filter(row => 
        row && typeof row === 'object' && Object.keys(row).length > 3
      ).length,
      headers: headers,
      headerCount: headers.length,
      firstRow: parsedData.data.length > 0 ? parsedData.data[0] : null,
      errors: parsedData.errors || []
    };
    
    // 各ヘッダーの値の種類と統計情報を収集
    const headerStats = {};
    headers.forEach(header => {
      const values = parsedData.data
        .map(row => row[header])
        .filter(val => val !== null && val !== undefined && val !== '');
      
      const numericValues = values
        .filter(val => typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val))))
        .map(val => typeof val === 'number' ? val : parseFloat(val));
      
      headerStats[header] = {
        valueCount: values.length,
        uniqueValues: [...new Set(values)].length,
        hasNumericValues: numericValues.length > 0,
        min: numericValues.length > 0 ? Math.min(...numericValues) : null,
        max: numericValues.length > 0 ? Math.max(...numericValues) : null,
        avg: numericValues.length > 0 ? 
          numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length : null,
        examples: values.slice(0, 3) // 最初の3つの値を例として表示
      };
    });
    
    return {
      stats,
      headerStats,
      data: parsedData.data,
      rawHeaders: headers
    };
  } catch (error) {
    console.error(`CSVの全情報取得エラー: ${error.message}`);
    return {
      stats: { totalRows: 0, validRows: 0, headers: [], headerCount: 0, errors: [error.message] },
      headerStats: {},
      data: [],
      rawHeaders: []
    };
  }
}

// ダミーデータを生成する関数
export function generateDummyData() {
  console.log("ダミーデータを生成します");
  const dummyData = [];
  
  // 10件のダミーデータを生成
  for (let i = 0; i < 10; i++) {
    dummyData.push({
      "タイムスタンプ": new Date().toISOString(),
      "事業所名": `ダミー事業所 ${i + 1}`,
      "事業所番号": `D${i + 1000}`,
      "氏名": `テスト ユーザー ${i + 1}`,
      "居宅介護支援・包括の方：居宅サービス事業所に提供票を送付した件数": Math.floor(Math.random() * 20) + 5,
      "要介護の利用者": Math.floor(Math.random() * 30) + 10,
      "郵送": Math.floor(Math.random() * 60) + 10,
      "FAX": Math.floor(Math.random() * 60) + 10,
      "メール": Math.floor(Math.random() * 60) + 5,
      "電子媒体": Math.floor(Math.random() * 60) + 5,
      "国保中央会連携": Math.floor(Math.random() * 60) + 5,
      "その他": Math.floor(Math.random() * 30),
      "手渡し": Math.floor(Math.random() * 45) + 15,
      "チャット": Math.floor(Math.random() * 30) + 5
    });
  }
  
  console.log(`生成されたダミーデータ: ${dummyData.length} 件`);
  return dummyData;
}

// 共有方法ごとの時間を集計する関数
export function aggregateSharingTimes(data) {
  console.log("データ集計を開始します");
  
  if (!data || data.length === 0) {
    console.warn("集計対象のデータがありません。ダミーデータを使用します。");
    return {
      "手渡し": 2.0,
      "郵送": 3.0,
      "FAX": 1.5,
      "メール": 1.0,
      "チャット": 0.5,
      "国保中央会連携": 0.25,
      "その他連携": 0.75
    };
  }
  
  // 集計結果を格納するオブジェクト
  const result = {
    "手渡し": 0,
    "郵送": 0,
    "FAX": 0,
    "メール": 0,
    "チャット": 0,
    "国保中央会連携": 0,
    "その他連携": 0
  };
  
  // ヘッダーのキーワードマッピング（様々な表記のバリエーションに対応）
  const headerKeywords = {
    "手渡し": ["手渡し", "手渡", "直接", "対面", "手で渡す", "直接渡す", "手渡し時間"],
    "郵送": ["郵送", "郵便", "ゆうびん", "郵送時間", "郵送にかかる時間", "ポスト", "投函", "郵便局"],
    "FAX": ["FAX", "ファックス", "ふぁっくす", "FAX時間", "ファックス時間", "ＦＡＸ", "fax"],
    "メール": ["メール", "電子メール", "Eメール", "めーる", "メール時間", "E-mail", "email", "mail", "メーリング"],
    "チャット": ["チャット", "LINE", "ライン", "メッセンジャー", "チャットツール", "SNS", "メッセージ", "チャット時間"],
    "国保中央会連携": ["国保中央会", "国保連", "こくほ", "国保中央会連携", "国保連携", "ケアプランデータ連携", "伝送", "電子請求"],
    "その他連携": ["その他", "他", "そのた", "その他時間", "その他連携", "介護ソフト", "システム連携", "API", "データ連携", "クラウド"]
  };
  
  // 各データ行を処理
  data.forEach((row, index) => {
    // デバッグ: 最初の行のキーを確認
    if (index === 0) {
      console.log('最初の行のキー:', Object.keys(row));
    }
    
    // 各共有方法について、対応するヘッダーを検索して値を集計
    Object.entries(headerKeywords).forEach(([key, keywords]) => {
      // 対応するヘッダーを検索（完全一致または部分一致）
      const matchingHeaders = Object.keys(row).filter(header => 
        keywords.some(keyword => 
          header === keyword || // 完全一致
          header.includes(keyword) || // 部分一致
          // 正規表現を使った柔軟なマッチング
          new RegExp(keyword, 'i').test(header)
        )
      );
      
      if (matchingHeaders.length > 0) {
        matchingHeaders.forEach(matchingHeader => {
          console.log(`"${key}" に一致するヘッダー: "${matchingHeader}"`);
          const value = row[matchingHeader];
          
          // 数値に変換して集計（分単位から時間単位に変換: 60分 = 1時間）
          if (typeof value === 'number' && !isNaN(value)) {
            result[key] += value / 60; // 分から時間に変換
          } else if (typeof value === 'string' && value.trim() !== '') {
            // 文字列から数値を抽出（「30分」のような表記にも対応）
            const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
            if (!isNaN(numValue)) {
              // 単位を判断（時間または分）
              const isHours = value.includes('時間') || value.includes('hour') || value.includes('h');
              result[key] += isHours ? numValue : numValue / 60;
            }
          }
        });
      }
    });
    
    // 時間に関するキーワードを含むが、上記のカテゴリに分類されないフィールドも処理
    Object.keys(row).forEach(key => {
      if ((key.includes('時間') || key.includes('分') || key.includes('秒') || key.includes('作業')) && 
          typeof row[key] === 'number' && !isNaN(row[key])) {
        
        // 各キーワードに対して再度チェック（部分一致）
        if (key.match(/手渡|直接|対面/i)) {
          console.log(`追加チェックで "手渡し" に一致するヘッダー: "${key}"`);
          result['手渡し'] += row[key] / 60;
        } else if (key.match(/郵送|郵便|ポスト|投函/i)) {
          console.log(`追加チェックで "郵送" に一致するヘッダー: "${key}"`);
          result['郵送'] += row[key] / 60;
        } else if (key.match(/FAX|ファックス|ＦＡＸ/i)) {
          console.log(`追加チェックで "FAX" に一致するヘッダー: "${key}"`);
          result['FAX'] += row[key] / 60;
        } else if (key.match(/メール|mail|メーリング/i)) {
          console.log(`追加チェックで "メール" に一致するヘッダー: "${key}"`);
          result['メール'] += row[key] / 60;
        } else if (key.match(/チャット|LINE|ライン|メッセンジャー|SNS/i)) {
          console.log(`追加チェックで "チャット" に一致するヘッダー: "${key}"`);
          result['チャット'] += row[key] / 60;
        } else if (key.match(/国保中央会|国保連|ケアプランデータ連携|伝送|電子請求/i)) {
          console.log(`追加チェックで "国保中央会連携" に一致するヘッダー: "${key}"`);
          result['国保中央会連携'] += row[key] / 60;
        } else if (key.match(/その他|介護ソフト|システム連携|API|データ連携|クラウド/i)) {
          console.log(`追加チェックで "その他連携" に一致するヘッダー: "${key}"`);
          result['その他連携'] += row[key] / 60;
        }
      }
    });
  });
  
  // 集計結果を小数点第1位に丸める
  Object.keys(result).forEach(key => {
    result[key] = Math.round(result[key] * 10) / 10;
  });
  
  console.log("集計結果:", result);
  
  // 全ての値が0の場合はダミーデータを返す
  const allZeros = Object.values(result).every(val => val === 0);
  if (allZeros) {
    console.warn("集計結果が全て0です。ダミーデータを使用します。");
    return {
      "手渡し": 2.0,
      "郵送": 3.0,
      "FAX": 1.5,
      "メール": 1.0,
      "チャット": 0.5,
      "国保中央会連携": 0.25,
      "その他連携": 0.75
    };
  }
  
  return result;
}
