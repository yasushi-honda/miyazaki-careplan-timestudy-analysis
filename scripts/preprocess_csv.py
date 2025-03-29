#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pandas as pd
import json
import os
import glob
import re

def clean_header(header):
    """ヘッダー名をクリーニングする関数"""
    # 改行を空白に置き換え
    header = re.sub(r'\n', ' ', header)
    # 余分な空白を削除
    header = re.sub(r'\s+', ' ', header).strip()
    return header

def preprocess_csv(csv_path, output_path=None):
    """CSVファイルを前処理してJSONに変換する関数"""
    print(f"処理開始: {csv_path}")
    
    try:
        # CSVファイルを読み込む（エンコーディングを自動検出）
        try:
            df = pd.read_csv(csv_path, encoding='utf-8')
        except UnicodeDecodeError:
            # UTF-8で読み込めない場合はShift-JISで試行
            df = pd.read_csv(csv_path, encoding='shift-jis')
        
        # ヘッダー名をクリーニング
        df.columns = [clean_header(col) for col in df.columns]
        
        # NaNを空文字列に変換
        df = df.fillna('')
        
        # データ型の変換（数値列を適切に処理）
        for col in df.columns:
            if '時間' in col or '分' in col or '数' in col:
                # 数値に変換できる列は変換する
                try:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
                except:
                    pass
        
        # JSONに変換
        json_data = df.to_dict(orient='records')
        
        # 出力パスが指定されていない場合は、元のファイル名をベースにする
        if output_path is None:
            base_name = os.path.splitext(os.path.basename(csv_path))[0]
            output_dir = os.path.join(os.path.dirname(csv_path), 'processed')
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, f"{base_name}.json")
        
        # JSONファイルに保存
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        print(f"処理完了: {output_path}")
        print(f"処理されたレコード数: {len(json_data)}")
        if len(json_data) > 0:
            print(f"利用可能なカラム: {list(json_data[0].keys())}")
        
        return output_path
    
    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")
        return None

def process_all_csvs(data_dir):
    """指定ディレクトリ内のすべてのCSVファイルを処理する関数"""
    csv_files = glob.glob(os.path.join(data_dir, '*.csv'))
    processed_files = []
    
    for csv_file in csv_files:
        output_path = preprocess_csv(csv_file)
        if output_path:
            processed_files.append(output_path)
    
    return processed_files

if __name__ == "__main__":
    # データディレクトリを指定
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    print(f"データディレクトリ: {data_dir}")
    
    # すべてのCSVファイルを処理
    processed_files = process_all_csvs(data_dir)
    
    print("\n処理されたファイル:")
    for file in processed_files:
        print(f"- {file}")
