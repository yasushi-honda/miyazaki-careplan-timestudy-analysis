// CSVデータをJSONとして提供するモジュール
import individualBeforeCsv from '../../public/data/individual_before.csv?raw';
import individualAfterCsv from '../../public/data/individual_after.csv?raw';
import businessBeforeCsv from '../../public/data/business_before.csv?raw';
import businessAfterCsv from '../../public/data/business_after.csv?raw';
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

// 各CSVファイルをパースしてエクスポート
export const individualBeforeData = parseCSV(individualBeforeCsv);
export const individualAfterData = parseCSV(individualAfterCsv);
export const businessBeforeData = parseCSV(businessBeforeCsv);
export const businessAfterData = parseCSV(businessAfterCsv);

// データを取得する関数
export function getCsvData(fileName) {
  switch(fileName) {
    case 'individual_before.csv':
      return individualBeforeData;
    case 'individual_after.csv':
      return individualAfterData;
    case 'business_before.csv':
      return businessBeforeData;
    case 'business_after.csv':
      return businessAfterData;
    default:
      console.error(`Unknown file name: ${fileName}`);
      return [];
  }
}
